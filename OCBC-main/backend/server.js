import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";

const app = express();
const PORT = 4000;

// In-memory queues
const urgentQueue = [];
const normalQueue = [];
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
        normalQueue.push(issue);
    }

    const position =
        path === "critical"
            ? urgentQueue.length
            : normalQueue.length;

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
                    : "You have been placed in the Normal Path (1-hour block) queue."
        },
        preDiagnosis: {
            checklist,
            docsNeeded
        }
    });
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

    // Helper to find issue in a queue and update it
    function updateIssueInQueue(queue) {
        const idx = queue.findIndex((item) => item.id === id);
        if (idx === -1) return null;
        queue[idx].bookingDate = bookingDate;
        queue[idx].bookingSlot = bookingSlot;
        return queue[idx];
    }

    let updated = null;

    // Typically only normalQueue should have bookings,
    // but we search both to be safe for demo.
    updated = updateIssueInQueue(normalQueue) || updated;
    updated = updateIssueInQueue(urgentQueue) || updated;

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
        "urgent",
        "no money",
        "cannot login"
    ];

    let path = "normal";
    let riskLevel = "low";

    if (isUrgent) {
        path = "critical";
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
            break;
        }
    }

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
        currentUrgent = urgentQueue.shift() || null;
        return res.json({
            success: true,
            current: currentUrgent,
            queue: "urgent"
        });
    }

    if (queue === "normal") {
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
    currentUrgent = null;
    currentNormal = null;
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
