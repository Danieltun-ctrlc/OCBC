import { useState } from "react";
import CustomerView from "./CustomerView.jsx";
import StaffView from "./StaffView.jsx";
import { LayoutDashboard, User } from "lucide-react";

function App() {
    const [tab, setTab] = useState("customer");

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header with OCBC Red Theme */}
            <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg border-b-4 border-red-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md transform transition-transform hover:scale-105">
                            <span className="text-red-600 font-bold text-xl tracking-tight">OCBC</span>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                                Smart Consultation & Escalation
                            </h1>
                            <p className="text-red-100 text-sm md:text-base font-medium mt-1 flex items-center gap-2">
                                <span className="bg-red-800/50 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Beta</span>
                                🚨 Critical Path &bull; 📋 Normal Path
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex gap-1">
                        <button
                            onClick={() => setTab("customer")}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out
                                ${tab === "customer"
                                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }
                            `}
                        >
                            <User size={18} />
                            Customer View
                        </button>
                        <button
                            onClick={() => setTab("staff")}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out
                                ${tab === "staff"
                                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }
                            `}
                        >
                            <LayoutDashboard size={18} />
                            Staff View
                        </button>
                    </div>
                </div>

                {/* Content Area with Fade Transition */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                    <div style={{ display: tab === 'customer' ? 'block' : 'none' }}>
                        <CustomerView isActive={tab === 'customer'} />
                    </div>
                    <div style={{ display: tab === 'staff' ? 'block' : 'none' }}>
                        <StaffView />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;