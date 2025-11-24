import { useState } from "react";
import CustomerView from "./CustomerView.jsx";
import StaffView from "./StaffView.jsx";

function App() {
    const [tab, setTab] = useState("customer");

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
        }}>
            {/* Header with OCBC Red Theme */}
            <header style={{
                padding: "24px 32px",
                background: "linear-gradient(135deg, #E32526 0%, #C41E1F 100%)",
                color: "white",
                boxShadow: "0 4px 6px rgba(227, 37, 38, 0.2)",
                borderBottom: "3px solid #B01A1B"
            }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            background: "white",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            color: "#E32526",
                            fontSize: "20px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}>
                            OCBC
                        </div>
                        <div>
                            <h1 style={{
                                margin: 0,
                                fontSize: "26px",
                                fontWeight: "700",
                                letterSpacing: "-0.5px"
                            }}>
                                Smart Consultation &amp; Escalation System
                            </h1>
                            <p style={{
                                margin: "4px 0 0 0",
                                fontSize: "14px",
                                opacity: 0.95,
                                fontWeight: "400"
                            }}>
                                🚨 Critical Path for urgent issues • 📋 Normal Path for structured 1-hour consultations
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div style={{ padding: "32px 24px", maxWidth: "1400px", margin: "0 auto" }}>
                {/* Tab Navigation */}
                <div style={{
                    marginBottom: "24px",
                    display: "flex",
                    gap: "12px",
                    background: "white",
                    padding: "8px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    width: "fit-content"
                }}>
                    <button
                        onClick={() => setTab("customer")}
                        style={{
                            padding: "12px 24px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            background: tab === "customer"
                                ? "linear-gradient(135deg, #E32526 0%, #C41E1F 100%)"
                                : "transparent",
                            color: tab === "customer" ? "white" : "#4b5563",
                            fontWeight: tab === "customer" ? 600 : 500,
                            fontSize: "15px",
                            transition: "all 0.3s ease",
                            boxShadow: tab === "customer"
                                ? "0 4px 12px rgba(227, 37, 38, 0.3)"
                                : "none",
                            transform: tab === "customer" ? "translateY(-1px)" : "none"
                        }}
                        onMouseEnter={(e) => {
                            if (tab !== "customer") {
                                e.target.style.background = "#f3f4f6";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (tab !== "customer") {
                                e.target.style.background = "transparent";
                            }
                        }}
                    >
                        👤 Customer View
                    </button>
                    <button
                        onClick={() => setTab("staff")}
                        style={{
                            padding: "12px 24px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            background: tab === "staff"
                                ? "linear-gradient(135deg, #E32526 0%, #C41E1F 100%)"
                                : "transparent",
                            color: tab === "staff" ? "white" : "#4b5563",
                            fontWeight: tab === "staff" ? 600 : 500,
                            fontSize: "15px",
                            transition: "all 0.3s ease",
                            boxShadow: tab === "staff"
                                ? "0 4px 12px rgba(227, 37, 38, 0.3)"
                                : "none",
                            transform: tab === "staff" ? "translateY(-1px)" : "none"
                        }}
                        onMouseEnter={(e) => {
                            if (tab !== "staff") {
                                e.target.style.background = "#f3f4f6";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (tab !== "staff") {
                                e.target.style.background = "transparent";
                            }
                        }}
                    >
                        👨‍💼 Staff View
                    </button>
                </div>

                {/* Content Area with Smooth Transition */}
                <div style={{
                    animation: "fadeIn 0.4s ease-in-out"
                }}>
                    {tab === "customer" ? <CustomerView /> : <StaffView />}
                </div>
            </div>

            {/* Add CSS Animation */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                * {
                    box-sizing: border-box;
                }
            `}</style>
        </div>
    );
}

export default App;