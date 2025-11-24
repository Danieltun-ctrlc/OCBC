import { useEffect, useState } from "react";
import { fetchQueues, serveNext, resetSystem } from "./api.js";

// ---------- AI suggestion helpers (demo only) ----------

function getAiSuggestion(issue) {
    const type = issue.issueType || "Others";

    if (type === "Lost card" || type === "Stolen card") {
        return {
            title: "AI suggestion: Lost / stolen card handling",
            steps: [
                "Immediately block all card channels (ATM, POS, online).",
                "Verify last 5 transactions with the customer.",
                "Check for any active digital wallets (Apple Pay / Google Pay) linked to the card.",
                "Offer instant digital replacement card if available; arrange physical card replacement.",
                "If theft is suspected, advise customer to file a police report and attach reference number."
            ]
        };
    }

    if (type === "Money missing" || type === "Unauthorized / fraud transaction") {
        return {
            title: "AI suggestion: Possible fraud / missing funds",
            steps: [
                "Identify and list all disputed transactions with date, amount and channel.",
                "Ask if customer received any OTP / suspicious calls / messages.",
                "Temporarily lock affected channels (e.g. online banking, card usage) while investigating.",
                "Raise an internal dispute case and provide reference ID to customer.",
                "Educate customer on scam patterns relevant to the case (phishing, fake bank officer, etc.)."
            ]
        };
    }

    if (type === "Account locked") {
        return {
            title: "AI suggestion: Account lockout recovery",
            steps: [
                "Verify customer identity using standard KYC checks.",
                "Confirm reason for lockout (too many attempts / suspicious login / system flag).",
                "Guide customer through secure password reset or unlock flow.",
                "Confirm customer can log in successfully before ending the call.",
                "Recommend enabling 2FA and updating contact details."
            ]
        };
    }

    if (type === "Digital banking issue") {
        return {
            title: "AI suggestion: Digital banking troubleshooting",
            steps: [
                "Clarify whether the issue is with mobile app or web banking.",
                "Check version of app / browser and device OS; ask customer to update if outdated.",
                "Ask customer to reproduce the problem and note the exact error message.",
                "If it is a known issue, guide through the workaround or status update.",
                "Log technical details (device, OS, steps, error) for engineering team."
            ]
        };
    }

    return {
        title: "AI suggestion: General consultation support",
        steps: [
            "Start by getting a concise summary: 'In one sentence, what is the main problem?'",
            "Clarify what the customer has already tried to avoid repeating steps.",
            "Check if any time-sensitive money risk is involved; escalate if needed.",
            "Provide 1–2 clear next actions and confirm understanding.",
            "Summarise the agreed plan and send a recap via SMS/email."
        ]
    };
}

// group issues by topic / issueType
function groupByIssueType(items) {
    const map = new Map();
    items.forEach(function (item) {
        const key = item.issueType || "Others";
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key).push(item);
    });

    return Array.from(map.entries()).map(function (entry) {
        return { type: entry[0], items: entry[1] };
    });
}

function TopicBadge({ type }) {
    return (
        <span
            style={{
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                background: "#0f172a",
                color: "white"
            }}
        >
      {type}
    </span>
    );
}

function BookingInfo({ issue, isNormalPath }) {
    if (!isNormalPath) {
        return (
            <span style={{ fontSize: "11px", color: "#991b1b" }}>
        Critical Path • Immediate consultation
      </span>
        );
    }

    if (!issue.bookingDate || !issue.bookingSlot) {
        return (
            <span style={{ fontSize: "11px", color: "#6b7280" }}>
        No booking selected yet
      </span>
        );
    }

    return (
        <span style={{ fontSize: "11px", color: "#065f46" }}>
      Booked: <strong>{issue.bookingDate}</strong> •{" "}
            <strong>{issue.bookingSlot}</strong>
    </span>
    );
}

// ---------- Fake video call with AI co-pilot panel ----------

function VideoCallPanel({ call, onEnd }) {
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    if (!call) return null;

    const suggestion = getAiSuggestion(call);

    return (
        <div
            style={{
                marginTop: "16px",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                padding: "12px 14px",
                background: "#020617",
                color: "white"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px"
                }}
            >
                <div>
                    <h3 style={{ margin: 0, fontSize: "15px" }}>
                        Live Video Consultation (Demo)
                    </h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                        Human staff leads, AI co-pilot suggests next best actions.
                    </p>
                </div>
                <span
                    style={{
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        background: "#22c55e",
                        color: "white",
                        fontWeight: 600
                    }}
                >
          In call
        </span>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "3fr 2fr",
                    gap: "10px",
                    marginBottom: "8px"
                }}
            >
                {/* video area */}
                <div
                    style={{
                        borderRadius: "12px",
                        background:
                            "radial-gradient(circle at top left, #1f2937, #020617)",
                        border: "1px solid #334155",
                        height: "190px",
                        position: "relative",
                        overflow: "hidden"
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: camOn ? 0.8 : 0.2,
                            backgroundImage:
                                "linear-gradient(120deg, rgba(96,165,250,0.3), rgba(94,234,212,0.3))",
                            mixBlendMode: "screen"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column"
                        }}
                    >
                        <div
                            style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "999px",
                                background: "#0f172a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid #60a5fa",
                                marginBottom: "6px",
                                fontWeight: 700,
                                fontSize: "20px"
                            }}
                        >
                            {call.name && call.name[0]
                                ? call.name[0].toUpperCase()
                                : "C"}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>
                            {call.name || "Customer"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                            {call.issueType}
                        </div>
                    </div>
                    {!camOn && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: "6px",
                                left: "8px",
                                fontSize: "11px",
                                color: "#f97316"
                            }}
                        >
                            Camera off (demo)
                        </div>
                    )}
                </div>

                {/* AI co-pilot panel */}
                <div
                    style={{
                        borderRadius: "12px",
                        background: "#020617",
                        border: "1px solid #1e293b",
                        padding: "8px 10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                    }}
                >
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>
                        AI Co-Pilot Suggestions
                    </div>
                    <div
                        style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                            marginBottom: "2px"
                        }}
                    >
                        {suggestion.title}
                    </div>
                    <ul
                        style={{
                            margin: 0,
                            paddingLeft: "16px",
                            fontSize: "11px",
                            color: "#e5e7eb",
                            maxHeight: "120px",
                            overflowY: "auto"
                        }}
                    >
                        {suggestion.steps.map(function (s, idx) {
                            return <li key={idx}>{s}</li>;
                        })}
                    </ul>
                </div>
            </div>

            {/* controls */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginTop: "6px"
                }}
            >
                <button
                    onClick={function () {
                        setMicOn(!micOn);
                    }}
                    style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        border: "none",
                        fontSize: "12px",
                        cursor: "pointer",
                        background: micOn ? "#e5e7eb" : "#f97316",
                        color: micOn ? "#111827" : "white"
                    }}
                >
                    {micOn ? "Mute mic" : "Unmute mic"}
                </button>
                <button
                    onClick={function () {
                        setCamOn(!camOn);
                    }}
                    style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        border: "none",
                        fontSize: "12px",
                        cursor: "pointer",
                        background: camOn ? "#e5e7eb" : "#f97316",
                        color: camOn ? "#111827" : "white"
                    }}
                >
                    {camOn ? "Stop video" : "Start video"}
                </button>
                <button
                    onClick={onEnd}
                    style={{
                        padding: "6px 14px",
                        borderRadius: "999px",
                        border: "none",
                        fontSize: "12px",
                        cursor: "pointer",
                        background: "#ef4444",
                        color: "white",
                        fontWeight: 600
                    }}
                >
                    End call
                </button>
            </div>
        </div>
    );
}

// ---------- Main StaffView ----------

function StaffView() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [servingMessage, setServingMessage] = useState("");
    const [activeCall, setActiveCall] = useState(null); // current "video call" issue
    const [lastCompletedCall, setLastCompletedCall] = useState(null); // for post-call summary card

    const loadQueues = async function () {
        setLoading(true);
        try {
            const res = await fetchQueues();
            setData(res);
        } catch (err) {
            console.error(err);
            alert("Failed to load queues");
        } finally {
            setLoading(false);
        }
    };

    useEffect(function () {
        loadQueues();
        const timer = setInterval(loadQueues, 5000);
        return function () {
            clearInterval(timer);
        };
    }, []);

    const handleServe = async function (queue) {
        const res = await serveNext(queue);
        await loadQueues();

        if (res.current) {
            const msg =
                "Now serving (" +
                queue +
                "): " +
                res.current.name +
                " – " +
                res.current.issueType;
            setServingMessage(msg);
            setActiveCall(res.current);
            setLastCompletedCall(null);
        } else {
            setServingMessage("No one in " + queue + " queue right now.");
            setActiveCall(null);
        }
    };

    const handleEndCall = function () {
        if (activeCall) {
            setLastCompletedCall(activeCall);
        }
        setActiveCall(null);
        setServingMessage(""); // clear "Now serving..."
    };

    const handleReset = async function () {
        await resetSystem();
        setServingMessage("");
        setActiveCall(null);
        setLastCompletedCall(null);
        loadQueues();
    };

    if (!data) {
        return <p>Loading staff dashboard...</p>;
    }

    const urgentQueue = data.urgentQueue;
    const normalQueue = data.normalQueue;
    const currentUrgent = data.currentUrgent;
    const currentNormal = data.currentNormal;

    const urgentGroups = groupByIssueType(urgentQueue);
    const normalGroups = groupByIssueType(normalQueue);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1.2fr", gap: "24px" }}>
            {/* LEFT: queues with AI suggestions per card */}
            <div
                style={{
                    background: "white",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.04)"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <div>
                        <h2 style={{ marginTop: 0, marginBottom: "4px" }}>Live Queues</h2>
                        <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                            Each request includes AI-supported suggested actions for staff.
                        </p>
                    </div>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: "6px 10px",
                            borderRadius: "999px",
                            border: "1px solid #e5e7eb",
                            background: "white",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Reset demo
                    </button>
                </div>

                {loading && (
                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                        Refreshing queues...
                    </p>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        marginTop: "16px"
                    }}
                >
                    {/* URGENT QUEUE */}
                    <div
                        style={{
                            borderRadius: "10px",
                            border: "1px solid #fecaca",
                            padding: "10px 12px",
                            background: "#fef2f2"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, fontSize: "14px" }}>Critical Path – Urgent</h3>
                                <p style={{ margin: 0, fontSize: "11px", color: "#991b1b" }}>
                                    {urgentQueue.length} in queue • Immediate handling
                                </p>
                            </div>
                            <button
                                onClick={function () {
                                    handleServe("urgent");
                                }}
                                style={{
                                    padding: "4px 8px",
                                    borderRadius: "999px",
                                    border: "none",
                                    background: "#b91c1c",
                                    color: "white",
                                    fontSize: "12px",
                                    cursor: "pointer"
                                }}
                            >
                                Serve next
                            </button>
                        </div>

                        <div
                            style={{
                                maxHeight: "260px",
                                overflowY: "auto",
                                marginTop: "10px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px"
                            }}
                        >
                            {urgentGroups.length === 0 && (
                                <p style={{ fontSize: "12px", color: "#6b7280" }}>No urgent cases waiting.</p>
                            )}

                            {urgentGroups.map(function (group) {
                                return (
                                    <div key={group.type}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "4px"
                                            }}
                                        >
                                            <TopicBadge type={group.type} />
                                            <span style={{ fontSize: "11px", color: "#991b1b" }}>
                        {group.items.length} case(s)
                      </span>
                                        </div>

                                        {group.items.map(function (i, idx) {
                                            const suggestion = getAiSuggestion(i);
                                            return (
                                                <div
                                                    key={i.id}
                                                    style={{
                                                        background: "white",
                                                        borderRadius: "8px",
                                                        padding: "6px 8px",
                                                        fontSize: "12px",
                                                        border: "1px solid #fee2e2",
                                                        marginBottom: "6px"
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center"
                                                        }}
                                                    >
                                                        <strong>
                                                            #{idx + 1} {i.name}
                                                        </strong>
                                                        <span
                                                            style={{
                                                                padding: "1px 6px",
                                                                borderRadius: "999px",
                                                                fontSize: "10px",
                                                                background: "#f97316",
                                                                color: "white"
                                                            }}
                                                        >
                              High risk
                            </span>
                                                    </div>
                                                    <div style={{ marginTop: "4px" }}>{i.summary}</div>
                                                    <div
                                                        style={{
                                                            marginTop: "4px",
                                                            fontSize: "11px",
                                                            color: "#6b7280"
                                                        }}
                                                    >
                                                        Risk: {i.riskLevel} • Urgent: {i.isUrgent ? "Yes" : "No"}
                                                    </div>
                                                    {/* AI mini-suggestion */}
                                                    <div
                                                        style={{
                                                            marginTop: "6px",
                                                            padding: "6px 8px",
                                                            borderRadius: "6px",
                                                            background: "#fefce8",
                                                            border: "1px dashed #facc15",
                                                            fontSize: "11px",
                                                            color: "#854d0e"
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                                marginBottom: "2px"
                                                            }}
                                                        >
                                                            AI suggested first action
                                                        </div>
                                                        <div>{suggestion.steps[0]}</div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            marginTop: "4px",
                                                            fontSize: "11px",
                                                            color: "#6b7280"
                                                        }}
                                                    >
                                                        <BookingInfo issue={i} isNormalPath={false} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* NORMAL QUEUE */}
                    <div
                        style={{
                            borderRadius: "10px",
                            border: "1px solid #bfdbfe",
                            padding: "10px 12px",
                            background: "#eff6ff"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, fontSize: "14px" }}>
                                    Normal Path – 1-Hour Blocks
                                </h3>
                                <p style={{ margin: 0, fontSize: "11px", color: "#1d4ed8" }}>
                                    {normalQueue.length} in queue • Rolling consultation slots
                                </p>
                            </div>
                            <button
                                onClick={function () {
                                    handleServe("normal");
                                }}
                                style={{
                                    padding: "4px 8px",
                                    borderRadius: "999px",
                                    border: "none",
                                    background: "#1d4ed8",
                                    color: "white",
                                    fontSize: "12px",
                                    cursor: "pointer"
                                }}
                            >
                                Serve next
                            </button>
                        </div>

                        <div
                            style={{
                                maxHeight: "260px",
                                overflowY: "auto",
                                marginTop: "10px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px"
                            }}
                        >
                            {normalGroups.length === 0 && (
                                <p style={{ fontSize: "12px", color: "#6b7280" }}>No normal cases waiting.</p>
                            )}

                            {normalGroups.map(function (group) {
                                return (
                                    <div key={group.type}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "4px"
                                            }}
                                        >
                                            <TopicBadge type={group.type} />
                                            <span style={{ fontSize: "11px", color: "#1d4ed8" }}>
                        {group.items.length} case(s)
                      </span>
                                        </div>

                                        {group.items.map(function (i, idx) {
                                            const suggestion = getAiSuggestion(i);
                                            return (
                                                <div
                                                    key={i.id}
                                                    style={{
                                                        background: "white",
                                                        borderRadius: "8px",
                                                        padding: "6px 8px",
                                                        fontSize: "12px",
                                                        border: "1px solid #dbeafe",
                                                        marginBottom: "6px"
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center"
                                                        }}
                                                    >
                                                        <strong>
                                                            #{idx + 1} {i.name}
                                                        </strong>
                                                        <span
                                                            style={{
                                                                padding: "1px 6px",
                                                                borderRadius: "999px",
                                                                fontSize: "10px",
                                                                background: "#22c55e",
                                                                color: "white"
                                                            }}
                                                        >
                              Normal
                            </span>
                                                    </div>
                                                    <div style={{ marginTop: "4px" }}>{i.summary}</div>
                                                    <div
                                                        style={{
                                                            marginTop: "4px",
                                                            fontSize: "11px",
                                                            color: "#6b7280"
                                                        }}
                                                    >
                                                        Risk: {i.riskLevel} • Urgent: {i.isUrgent ? "Yes" : "No"}
                                                    </div>

                                                    {/* AI mini-suggestion */}
                                                    <div
                                                        style={{
                                                            marginTop: "6px",
                                                            padding: "6px 8px",
                                                            borderRadius: "6px",
                                                            background: "#eff6ff",
                                                            border: "1px dashed #60a5fa",
                                                            fontSize: "11px",
                                                            color: "#1e3a8a"
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                                marginBottom: "2px"
                                                            }}
                                                        >
                                                            AI suggested first action
                                                        </div>
                                                        <div>{suggestion.steps[0]}</div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            marginTop: "4px",
                                                            fontSize: "11px",
                                                            color: "#6b7280"
                                                        }}
                                                    >
                                                        <BookingInfo issue={i} isNormalPath={true} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: current consultations + video/AI co-pilot */}
            <div
                style={{
                    background: "white",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.04)"
                }}
            >
                <h2 style={{ marginTop: 0 }}>Current Consultations</h2>
                <p style={{ fontSize: "13px", color: "#4b5563", marginTop: 0 }}>
                    When you serve a case, it appears here and opens a simulated
                    video room with AI co-pilot.
                </p>

                <div
                    style={{
                        marginTop: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}
                >
                    <div
                        style={{
                            borderRadius: "10px",
                            padding: "10px 12px",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            fontSize: "13px"
                        }}
                    >
                        <strong>Critical Path</strong>
                        {currentUrgent ? (
                            <>
                                <p style={{ marginBottom: "4px" }}>
                                    Serving: {currentUrgent.name} –{" "}
                                    <span style={{ fontWeight: 600 }}>
                    {currentUrgent.issueType}
                  </span>
                                </p>
                                <p style={{ margin: 0, color: "#6b7280" }}>
                                    {currentUrgent.summary}
                                </p>
                            </>
                        ) : (
                            <p style={{ margin: 0, color: "#6b7280" }}>
                                No urgent consultation in progress.
                            </p>
                        )}
                    </div>

                    <div
                        style={{
                            borderRadius: "10px",
                            padding: "10px 12px",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            fontSize: "13px"
                        }}
                    >
                        <strong>Normal Path (1-hour block)</strong>
                        {currentNormal ? (
                            <>
                                <p style={{ marginBottom: "4px" }}>
                                    Serving: {currentNormal.name} –{" "}
                                    <span style={{ fontWeight: 600 }}>
                    {currentNormal.issueType}
                  </span>
                                </p>
                                <p style={{ margin: 0, color: "#6b7280" }}>
                                    {currentNormal.summary}
                                </p>
                                {currentNormal.bookingDate && currentNormal.bookingSlot && (
                                    <p
                                        style={{
                                            marginTop: "4px",
                                            color: "#16a34a",
                                            fontSize: "12px"
                                        }}
                                    >
                                        Slot: {currentNormal.bookingDate} •{" "}
                                        {currentNormal.bookingSlot}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p style={{ margin: 0, color: "#6b7280" }}>
                                No normal consultation in progress.
                            </p>
                        )}
                    </div>

                    {servingMessage && (
                        <div
                            style={{
                                marginTop: "4px",
                                fontSize: "12px",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                background: "#ecfeff",
                                border: "1px solid #bae6fd",
                                color: "#0369a1"
                            }}
                        >
                            {servingMessage}
                        </div>
                    )}

                    {lastCompletedCall && (
                        <div
                            style={{
                                marginTop: "4px",
                                fontSize: "12px",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                background: "#f5f3ff",
                                border: "1px solid #ddd6fe",
                                color: "#4c1d95"
                            }}
                        >
                            <p style={{ marginTop: 0, marginBottom: "4px" }}>
                                Session with <strong>{lastCompletedCall.name}</strong> (
                                {lastCompletedCall.issueType}) has ended.
                            </p>
                            <p style={{ margin: 0 }}>
                                For this prototype, we simulate that a{" "}
                                <strong>secure recording of the session</strong> and an{" "}
                                <strong>AI-generated summary of the transcript</strong> have
                                been sent to the customer&apos;s preferred contact channel
                                for their reference.
                            </p>
                        </div>
                    )}
                </div>

                {/* Video + AI co-pilot demo */}
                <VideoCallPanel call={activeCall} onEnd={handleEndCall} />
            </div>
        </div>
    );
}

export default StaffView;
