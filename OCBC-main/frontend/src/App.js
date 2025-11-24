import { useState } from "react";
import CustomerView from "./CustomerView.jsx";
import StaffView from "./StaffView.jsx";

function App() {
    const [tab, setTab] = useState("customer");

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f3f4f6" }}>
            <header style={{ padding: "16px 24px", background: "#111827", color: "white" }}>
                <h1 style={{ margin: 0, fontSize: "20px" }}>
                    Smart Consultation &amp; Escalation System (Prototype)
                </h1>
                <p style={{ margin: 0, fontSize: "13px", opacity: 0.8 }}>
                    Critical Path for urgent issues • Normal Path for structured 1-hour consultations
                </p>
            </header>

            <div style={{ padding: "16px 24px" }}>
                <div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => setTab("customer")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "999px",
                            border: "none",
                            cursor: "pointer",
                            background: tab === "customer" ? "#2563eb" : "#e5e7eb",
                            color: tab === "customer" ? "white" : "#111827",
                            fontWeight: tab === "customer" ? 600 : 400
                        }}
                    >
                        Customer View
                    </button>
                    <button
                        onClick={() => setTab("staff")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "999px",
                            border: "none",
                            cursor: "pointer",
                            background: tab === "staff" ? "#2563eb" : "#e5e7eb",
                            color: tab === "staff" ? "white" : "#111827",
                            fontWeight: tab === "staff" ? 600 : 400
                        }}
                    >
                        Staff View
                    </button>
                </div>

                {tab === "customer" ? <CustomerView /> : <StaffView />}
            </div>
        </div>
    );
}

export default App;
