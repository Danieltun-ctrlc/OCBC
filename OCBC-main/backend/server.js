import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";

const app = express();
const PORT = 4000;

// In-memory queues
const urgentQueue = [];
const normalQueue = [];
const completedQueue = []; // Store completed sessions
const pendingBookings = []; // Store normal path issues waiting for booking
let currentUrgent = null;
let currentNormal = null;

app.use(cors());
app.use(express.json());

// Submit issue (can optionally include bookingDate & bookingSlot)
app.post("/api/issues", (req, res) => {
    console.log("📥 /api/issues body:", req.body);

    const {
        name,
        contact,
        issueType,
        description,
        isUrgent,
        bookingDate,   // optional
        bookingSlot    // optional
    } = req.body;

    const { path, riskLevel, checklist, docsNeeded } =
        triageIssue(issueType, description, Boolean(isUrgent));

    const issue = {
        id: nanoid(),
        name: name || "Anonymous",
        contact: contact || "",
        issueType: issueType || "Others",
        description: description || "",
        summary: makeSummary(description),
        isUrgent: Boolean(isUrgent),
        path,
        riskLevel,
        createdAt: new Date().toISOString(),
        // booking info (may be null initially)
        bookingDate: bookingDate || null,
        bookingSlot: bookingSlot || null
    };

    if (path === "critical") {
        urgentQueue.push(issue);
    } else {
        // For normal path, we wait for booking before adding to visible queue
        pendingBookings.push(issue);
    }

    const position =
        path === "critical"
            ? urgentQueue.length
            : normalQueue.length; // Note: this position might be "theoretical" for normal path until booked

    res.json({
        success: true,
        issue,
        queueInfo: {
            path,
            riskLevel,
            position,
            message:
                path === "critical"
                    ? "You have been placed in the Critical Path queue."
                    : riskLevel === "high"
                        ? "You have been placed in the Normal Path (High Priority). Please select a time slot."
                        : "You have been placed in the Normal Path. Please select a time slot."
        },
        preDiagnosis: {
            checklist,
            docsNeeded
        }
    });
});

const MAX_BOOKINGS_PER_SLOT = 3;

// Helper: count bookings for a specific date/slot
function getBookingCount(date, slot) {
    let count = 0;
    // Check all sources: waiting queues, active sessions, and completed history
    const allItems = [...urgentQueue, ...normalQueue, ...completedQueue];
    if (currentUrgent) allItems.push(currentUrgent);
    if (currentNormal) allItems.push(currentNormal);

    for (const item of allItems) {
        if (item.bookingDate === date && item.bookingSlot === slot) {
            count++;
        }
    }
    return count;
}

app.post("/api/slots-availability", (req, res) => {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: "Date required" });

    // Standard slots as defined in frontend (could be shared, but hardcoded here for prototype)
    const slots = [
        "09:00–10:00",
        "10:00–11:00",
        "11:00–12:00",
        "13:00–14:00",
        "14:00–15:00",
        "15:00–16:00",
        "16:00–17:00"
    ];

    const availability = {};
    for (const slot of slots) {
        availability[slot] = getBookingCount(date, slot);
    }

    res.json({ date, availability, max: MAX_BOOKINGS_PER_SLOT });
});

// 🔁 Update booking time & slot for an existing issue (Normal Path)
app.post("/api/book", (req, res) => {
    const { id, bookingDate, bookingSlot } = req.body;
    console.log("📥 /api/book body:", req.body);

    if (!id || !bookingDate || !bookingSlot) {
        return res.status(400).json({
            success: false,
            message: "id, bookingDate and bookingSlot are required"
        });
    }

    // Check capacity
    const currentCount = getBookingCount(bookingDate, bookingSlot);
    console.log(`🔎 Checking availability for ${bookingDate} ${bookingSlot}: count=${currentCount}/${MAX_BOOKINGS_PER_SLOT}`);

    if (currentCount >= MAX_BOOKINGS_PER_SLOT) {
         return res.status(400).json({
            success: false,
            message: "This time slot is fully booked. Please choose another."
        });
    }

    let updated = null;

    // 1. Check pending bookings first (New bookings)
    const pendingIdx = pendingBookings.findIndex(i => i.id === id);
    if (pendingIdx !== -1) {
        const issue = pendingBookings[pendingIdx];
        issue.bookingDate = bookingDate;
        issue.bookingSlot = bookingSlot;
        
        // Move to real queue
        normalQueue.push(issue);
        pendingBookings.splice(pendingIdx, 1);
        updated = issue;
    }

    // 2. Helper to find issue in a queue and update it (Rescheduling)
    function updateIssueInQueue(queue) {
        const idx = queue.findIndex((item) => item.id === id);
        if (idx === -1) return null;
        queue[idx].bookingDate = bookingDate;
        queue[idx].bookingSlot = bookingSlot;
        return queue[idx];
    }

    // Typically only normalQueue should have bookings,
    // but we search both to be safe for demo.
    if (!updated) updated = updateIssueInQueue(normalQueue);
    if (!updated) updated = updateIssueInQueue(urgentQueue);

    // Also check current sessions (in case you book someone already being served)
    if (!updated && currentNormal && currentNormal.id === id) {
        currentNormal.bookingDate = bookingDate;
        currentNormal.bookingSlot = bookingSlot;
        updated = currentNormal;
    }
    if (!updated && currentUrgent && currentUrgent.id === id) {
        currentUrgent.bookingDate = bookingDate;
        currentUrgent.bookingSlot = bookingSlot;
        updated = currentUrgent;
    }

    if (!updated) {
        return res.status(404).json({
            success: false,
            message: "Issue not found in queues or current sessions"
        });
    }

    return res.json({
        success: true,
        issue: updated
    });
});

// Simple helper: decide path, risk, checklist, docsNeeded
function triageIssue(issueType, description, isUrgent) {
    const criticalTypes = [
        "Lost card",
        "Money missing",
        "Unauthorized / fraud transaction",
        "Account locked",
        "Stolen card"
    ];

    const text = (description || "").toLowerCase();
    const urgentWords = [
        "lost",
        "stolen",
        "fraud",
        "scam",
        "missing",
        "locked",
        "blocked",
        // "urgent", // Removed to prevent false positives
        "no money",
        "cannot login"
    ];

    let path = "normal";
    let riskLevel = "low";

    // If user marks as urgent, we acknowledge high risk, 
    // but we only route to Critical Path if the issue category validates it.
    if (isUrgent) {
        riskLevel = "high";
    }

    if (criticalTypes.includes(issueType)) {
        path = "critical";
        riskLevel = "high";
    }

    for (const word of urgentWords) {
        if (text.includes(word)) {
            path = "critical";
            riskLevel = "high";
            console.log(`[Triage] Keyword match: "${word}" triggered Critical Path`);
            break;
        }
    }

    console.log(`[Triage] Type: ${issueType}, Urgent: ${isUrgent} -> Path: ${path}, Risk: ${riskLevel}`);

    // Simple pre-diagnosis: checklist + docs
    let checklist = [];
    let docsNeeded = [];

    if (issueType === "Lost card" || issueType === "Stolen card") {
        checklist = [
            "Confirm last 3 transactions",
            "Check if card is still in your possession",
            "Verify mobile number for alerts"
        ];
        docsNeeded = [
            "NRIC / passport copy",
            "Police report (if stolen)",
            "Recent bank statement (last month)"
        ];
    } else if (issueType === "Money missing" || issueType === "Unauthorized / fraud transaction") {
        checklist = [
            "Identify suspicious transaction(s)",
            "Check if any OTP was received",
            "Confirm devices you used recently"
        ];
        docsNeeded = [
            "Screenshot of transaction history",
            "Police report (if fraud suspected)",
            "Email or SMS evidence (if any)"
        ];
    } else if (issueType === "Account locked") {
        checklist = [
            "Verify that bank app is updated",
            "Check if you recently changed devices",
            "Prepare last successful login time"
        ];
        docsNeeded = [
            "NRIC / passport copy",
            "Screenshot of error message",
            "Registered phone with you during call"
        ];
    } else if (issueType === "Digital banking issue") {
        checklist = [
            "Check internet connection",
            "Check app / browser version",
            "Note down exact steps to reproduce"
        ];
        docsNeeded = [
            "Screenshot of the issue",
            "Device model and OS version"
        ];
    } else {
        checklist = [
            "Write down your main problem in 1–2 lines",
            "List any attempts you already tried",
            "Prepare any related account or card numbers"
        ];
        docsNeeded = [
            "Relevant screenshots or photos",
            "Any reference numbers from emails or SMS"
        ];
    }

    return { path, riskLevel, checklist, docsNeeded };
}

function makeSummary(description) {
    if (!description) return "No description provided.";
    if (description.length <= 140) return description;
    return description.slice(0, 137) + "...";
}

// Get queues and current sessions (for staff + user status)
app.get("/api/queues", (req, res) => {
    res.json({
        urgentQueue,
        normalQueue,
        currentUrgent,
        currentNormal
    });
});

// Staff serves next user from a queue
app.post("/api/serve", (req, res) => {
    const { queue } = req.body; // "urgent" | "normal"

    if (queue === "urgent") {
        if (currentUrgent) completedQueue.push(currentUrgent); // Archive previous
        currentUrgent = urgentQueue.shift() || null;
        return res.json({
            success: true,
            current: currentUrgent,
            queue: "urgent"
        });
    }

    if (queue === "normal") {
        if (currentNormal) completedQueue.push(currentNormal); // Archive previous
        currentNormal = normalQueue.shift() || null;
        return res.json({
            success: true,
            current: currentNormal,
            queue: "normal"
        });
    }

    res.status(400).json({ success: false, message: "Invalid queue type" });
});

// Simple reset for demo
app.post("/api/reset", (req, res) => {
    urgentQueue.length = 0;
    normalQueue.length = 0;
    completedQueue.length = 0;
    currentUrgent = null;
    currentNormal = null;
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
