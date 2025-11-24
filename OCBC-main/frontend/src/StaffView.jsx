import { useEffect, useState } from "react";
import { fetchQueues, serveNext, resetSystem } from "./api.js";
import Toast from "./Toast.jsx";
import {
    Users,
    AlertCircle,
    Clock,
    Video,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    RefreshCw,
    Play,
    BrainCircuit,
    ShieldAlert,
    UserCheck,
    CheckCircle,
    Activity,
    X,
    List,
    History,
    AlertOctagon
} from "lucide-react";

// ---------- AI suggestion helpers (demo only) ----------
function getAiSuggestion(issue) {
    const type = issue.issueType || "Others";
    if (type === "Lost card" || type === "Stolen card") {
        return {
            title: "Lost / stolen card handling",
            steps: [
                "Immediately block all card channels (ATM, POS, online).",
                "Verify last 5 transactions with the customer.",
                "Check for any active digital wallets linked to the card.",
                "Offer instant digital replacement card if available.",
                "If theft is suspected, advise customer to file a police report."
            ]
        };
    }
    if (type === "Money missing" || type === "Unauthorized / fraud transaction") {
        return {
            title: "Possible fraud / missing funds",
            steps: [
                "Identify and list all disputed transactions.",
                "Ask if customer received any OTP / suspicious calls.",
                "Temporarily lock affected channels while investigating.",
                "Raise an internal dispute case.",
                "Educate customer on scam patterns relevant to the case."
            ]
        };
    }
    if (type === "Account locked") {
        return {
            title: "Account lockout recovery",
            steps: [
                "Verify customer identity using standard KYC checks.",
                "Confirm reason for lockout (too many attempts / system flag).",
                "Guide customer through secure password reset.",
                "Confirm customer can log in successfully.",
                "Recommend enabling 2FA."
            ]
        };
    }
    if (type === "Digital banking issue") {
        return {
            title: "Digital banking troubleshooting",
            steps: [
                "Clarify whether the issue is with mobile app or web banking.",
                "Check version of app / browser and device OS.",
                "Ask customer to reproduce the problem.",
                "If known issue, guide through workaround.",
                "Log technical details for engineering team."
            ]
        };
    }
    return {
        title: "General consultation support",
        steps: [
            "Start by getting a concise summary of the problem.",
            "Clarify what the customer has already tried.",
            "Check if any time-sensitive money risk is involved.",
            "Provide 1–2 clear next actions.",
            "Summarise the agreed plan and send a recap."
        ]
    };
}

// group issues by topic / issueType
function groupByIssueType(items) {
    const map = new Map();
    items.forEach((item) => {
        const key = item.issueType || "Others";
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key).push(item);
    });

    return Array.from(map.entries()).map((entry) => ({ type: entry[0], items: entry[1] }));
}

function TopicBadge({ type }) {
    return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
            {type}
        </span>
    );
}

function BookingInfo({ issue, isNormalPath }) {
    if (!isNormalPath) {
        return (
            <span className="text-[10px] font-medium text-red-700 flex items-center gap-1">
                <AlertCircle size={10} />
                Critical Path • Immediate
            </span>
        );
    }

    if (!issue.bookingDate || !issue.bookingSlot) {
        return (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                No booking yet
            </span>
        );
    }

    return (
        <span className="text-[10px] font-medium text-green-700 flex items-center gap-1">
            <Clock size={10} />
            Booked: {issue.bookingDate} @ {issue.bookingSlot}
        </span>
    );
}

function QueueBoard({ urgentQueue, normalQueue, handleServe, handleReset, handleViewHistory }) {
    const urgentGroups = groupByIssueType(urgentQueue);
    const normalGroups = groupByIssueType(normalQueue);

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Users className="text-slate-500" size={20} />
                            Live Queues
                        </h2>
                        <p className="text-sm text-slate-500">Real-time customer triage and management</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleViewHistory}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-1.5"
                        >
                            <History size={12} /> History
                        </button>
                        <button
                            onClick={handleReset}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-1.5"
                        >
                            <RefreshCw size={12} /> Reset Demo
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* URGENT QUEUE */}
                    <div className="bg-white rounded-xl shadow-lg border-t-4 border-red-600 overflow-hidden flex flex-col h-[600px] transform transition-all hover:shadow-xl">
                        <div className="bg-gradient-to-r from-red-50 to-white px-4 py-4 border-b border-red-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-extrabold text-red-900 flex items-center gap-2 text-xl uppercase tracking-tight">
                                    <div className="p-1.5 bg-red-100 rounded-full">
                                        <ShieldAlert size={20} className="text-red-600" />
                                    </div>
                                    Critical Path
                                </h3>
                                <p className="text-sm text-red-700 font-medium mt-1 ml-1 flex items-center gap-1">
                                    <AlertOctagon size={14} />
                                    {urgentQueue.length} cases waiting • Immediate Action
                                </p>
                            </div>
                            <button
                                onClick={() => handleServe("urgent")}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md shadow-red-200 flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
                            >
                                <Play size={12} fill="currentColor" /> Serve Next
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-slate-50/50">
                            {urgentGroups.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                                    <UserCheck size={48} strokeWidth={1.5} />
                                    <p className="text-sm mt-2 font-medium">No urgent cases</p>
                                </div>
                            )}

                            {urgentGroups.map((group) => (
                                <div key={group.type} className="space-y-2">
                                    <div className="flex items-center justify-between px-1 py-1 bg-red-100/50 rounded-lg">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-red-800 uppercase tracking-wider">
                                            {group.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-red-600 px-2">{group.items.length} case(s)</span>
                                    </div>

                                    {group.items.map((i, idx) => {
                                        const suggestion = getAiSuggestion(i);
                                        return (
                                            <div key={i.id} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:border-red-300 transition-all group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                                <div className="flex justify-between items-start mb-1 pl-2">
                                                    <span className="font-bold text-slate-800 text-sm">#{idx + 1} {i.name}</span>
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-[10px] font-bold uppercase border border-red-100">High Risk</span>
                                                </div>
                                                <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed pl-2">{i.summary}</p>
                                                
                                                {/* AI Hint */}
                                                <div className="bg-amber-50/80 border border-amber-100 rounded p-2 mb-2 mx-2">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 mb-1">
                                                        <BrainCircuit size={10} /> AI Insight
                                                    </div>
                                                    <p className="text-[10px] text-amber-900/80 leading-tight">{suggestion.steps[0]}</p>
                                                </div>

                                                <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2 pl-2">
                                                    <BookingInfo issue={i} isNormalPath={false} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NORMAL QUEUE */}
                    <div className="bg-white rounded-xl shadow-lg border-t-4 border-blue-600 overflow-hidden flex flex-col h-[600px] transform transition-all hover:shadow-xl">
                        <div className="bg-gradient-to-r from-blue-50 to-white px-4 py-4 border-b border-blue-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-extrabold text-blue-900 flex items-center gap-2 text-xl uppercase tracking-tight">
                                    <div className="p-1.5 bg-blue-100 rounded-full">
                                        <Clock size={20} className="text-blue-600" />
                                    </div>
                                    Normal Path
                                </h3>
                                <p className="text-sm text-blue-700 font-medium mt-1 ml-1 flex items-center gap-1">
                                    <Activity size={14} />
                                    {normalQueue.length} cases waiting • Scheduled
                                </p>
                            </div>
                            <button
                                onClick={() => handleServe("normal")}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md shadow-blue-200 flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
                            >
                                <Play size={12} fill="currentColor" /> Serve Next
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-slate-50/50">
                            {normalGroups.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                                    <UserCheck size={48} strokeWidth={1.5} />
                                    <p className="text-sm mt-2 font-medium">No cases in queue</p>
                                </div>
                            )}

                            {normalGroups.map((group) => (
                                <div key={group.type} className="space-y-2">
                                    <div className="flex items-center justify-between px-1 py-1 bg-blue-100/50 rounded-lg">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                                            {group.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-blue-600 px-2">{group.items.length} case(s)</span>
                                    </div>

                                    {group.items.map((i, idx) => {
                                        const suggestion = getAiSuggestion(i);
                                        return (
                                            <div key={i.id} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:border-blue-300 transition-all group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                                <div className="flex justify-between items-start mb-1 pl-2">
                                                    <span className="font-bold text-slate-800 text-sm">#{idx + 1} {i.name}</span>
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase border border-blue-100">Normal</span>
                                                </div>
                                                <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed pl-2">{i.summary}</p>

                                                {/* AI Hint */}
                                                <div className="bg-indigo-50/80 border border-indigo-100 rounded p-2 mb-2 mx-2">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 mb-1">
                                                        <BrainCircuit size={10} /> AI Insight
                                                    </div>
                                                    <p className="text-[10px] text-indigo-900/80 leading-tight">{suggestion.steps[0]}</p>
                                                </div>

                                                <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2 pl-2">
                                                    <BookingInfo issue={i} isNormalPath={true} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
        </div>
    )
}

// ---------- Main StaffView ----------

function StaffView() {
    const [data, setData] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [lastCompletedCall, setLastCompletedCall] = useState(null);
    const [callStartTime, setCallStartTime] = useState(null); 
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showQueue, setShowQueue] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const loadQueues = async function () {
            try {
                const res = await fetchQueues();
                setData(res);
            } catch (err) {
                console.error(err);
            }
        };

        loadQueues();
        const timer = setInterval(loadQueues, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let interval;
        if (activeCall) {
            const start = Date.now();
            setCallStartTime(start);
            setElapsedTime(0);
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        } else {
            setCallStartTime(null);
            setElapsedTime(0);
        }

        return () => clearInterval(interval);
    }, [activeCall]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const [hasGeneratedSummary, setHasGeneratedSummary] = useState(false);

    const handleGenerateSummary = () => {
        setHasGeneratedSummary(true);
        setToast({ message: "AI Session Summary generated successfully!", type: "success" });
    };

    const handleServe = async (queue) => {
        const res = await serveNext(queue);
        try {
            const updatedData = await fetchQueues();
            setData(updatedData);
        } catch (err) {
            console.error(err);
        }

        if (res.current) {
            setActiveCall(res.current);
            setLastCompletedCall(null);
            setHasGeneratedSummary(false); 
            setShowQueue(false);
            setShowHistory(false);
        } else {
            setActiveCall(null);
        }
    };

    const handleEndCall = () => {
        if (activeCall) {
            const summaryText = hasGeneratedSummary
                ? `AI-generated summary for ${activeCall.issueType} with ${activeCall.name}: The customer's main concern was ${activeCall.summary}. The suggested workflow steps were followed, and the issue was resolved.`
                : `No AI summary was generated for ${activeCall.issueType} with ${activeCall.name}.`;

            const completedCall = { ...activeCall, sessionSummary: summaryText, duration: formatTime(elapsedTime), completedAt: new Date().toLocaleTimeString() };
            setLastCompletedCall(completedCall);
            setHistory(prev => [completedCall, ...prev]);
        }
        setActiveCall(null);
        setCallStartTime(null);
        setHasGeneratedSummary(false);
    };

    const handleReset = async () => {
        if (window.confirm("Are you sure you want to reset the entire demo system?")) {
            await resetSystem();
            setActiveCall(null);
            setLastCompletedCall(null);
            setHistory([]);
            try {
                const res = await fetchQueues();
                setData(res);
                setToast({ message: "System reset successfully", type: "info" });
            } catch (e) { console.error(e); }
        }
    };

    if (!data) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400">
                <RefreshCw className="animate-spin mb-2" size={24} />
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    const { urgentQueue, normalQueue } = data;

    if (activeCall) {
        const suggestion = getAiSuggestion(activeCall);

        return (
            <div className="animate-in fade-in zoom-in-95 duration-300 relative">
                <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
                
                {/* Queue Overlay */}
                {showQueue && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10">
                        <div className="bg-white w-full max-w-6xl max-h-full rounded-2xl shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <Users className="text-slate-500" size={20} />
                                    Queue Overview
                                </h2>
                                <button 
                                    onClick={() => setShowQueue(false)} 
                                    className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={24}/>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                                <QueueBoard 
                                    urgentQueue={urgentQueue} 
                                    normalQueue={normalQueue} 
                                    handleServe={handleServe} 
                                    handleReset={handleReset}
                                    handleViewHistory={() => setShowHistory(true)} // Not strictly needed here but for completeness
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Call Header */}
                <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${activeCall.path === 'critical' ? 'bg-red-900 border-red-500' : 'bg-blue-900 border-blue-500'}`}>
                            {activeCall.name[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{activeCall.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${activeCall.path === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {activeCall.issueType}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Activity size={14} className="text-green-400" />
                                    Live Consultation
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="text-right hidden md:block">
                            <div className="text-xs text-slate-400">Session Duration</div>
                            <div className="font-mono font-bold text-lg">{formatTime(elapsedTime)}</div>
                        </div>
                        <button
                            onClick={() => setShowQueue(true)}
                            className="ml-4 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-slate-600 flex items-center gap-2"
                        >
                            <List size={18} /> View Queue
                        </button>
                        <button
                            onClick={handleEndCall}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-red-900/30 flex items-center gap-2"
                        >
                            <PhoneOff size={18} /> End Session
                        </button>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="bg-slate-800 p-6 rounded-b-2xl shadow-2xl min-h-[600px] grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Video & Context */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Feed */}
                        <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl border border-slate-700 group">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400 mb-4 border-4 border-slate-700">
                                    {activeCall.name[0]}
                                </div>
                                <p className="text-lg font-medium text-slate-400">Video Feed Active</p>
                            </div>
                            
                            {/* Fake Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700"><Mic size={20} /></button>
                                <button className="p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700"><Video size={20} /></button>
                                <button className="p-3 rounded-full bg-red-600/80 text-white hover:bg-red-600"><PhoneOff size={20} /></button>
                            </div>

                            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-xs font-medium backdrop-blur-sm flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                {activeCall.name}'s Camera
                            </div>
                        </div>

                        {/* Context Card */}
                        <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
                            <h3 className="text-white font-bold flex items-center gap-2 mb-2">
                                <UserCheck size={18} className="text-slate-400" />
                                Customer Context
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-3">
                                {activeCall.summary}
                            </p>
                            <div className="flex gap-4 text-xs">
                                <div className="px-3 py-1.5 rounded bg-slate-800 border border-slate-600 text-slate-400">
                                    <span className="block text-[10px] uppercase font-bold mb-0.5 text-slate-500">Risk Level</span>
                                    <span className="text-white font-semibold capitalize">{activeCall.riskLevel}</span>
                                </div>
                                <div className="px-3 py-1.5 rounded bg-slate-800 border border-slate-600 text-slate-400">
                                    <span className="block text-[10px] uppercase font-bold mb-0.5 text-slate-500">Queue Path</span>
                                    <span className="text-white font-semibold capitalize">{activeCall.path} Path</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Co-Pilot */}
                    <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-800 bg-slate-950">
                            <div className="flex items-center gap-2 text-purple-400 text-sm font-bold uppercase tracking-wider mb-1">
                                <BrainCircuit size={18} />
                                AI Co-Pilot
                            </div>
                            <p className="text-xs text-slate-500">Real-time assistance based on conversation</p>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-4">
                            <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-lg">
                                <h4 className="text-purple-200 font-bold text-sm mb-1">Suggested Workflow</h4>
                                <p className="text-purple-300/70 text-xs">{suggestion.title}</p>
                            </div>

                            <div className="space-y-3">
                                {suggestion.steps.map((step, idx) => (
                                    <label key={idx} className="flex gap-3 items-start p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700">
                                        <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-offset-slate-900" />
                                        <span className="text-sm text-slate-300 leading-snug select-none">{step}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-950">
                            <button
                                onClick={handleGenerateSummary}
                                disabled={hasGeneratedSummary}
                                className={`w-full py-2 text-sm font-medium rounded border transition-colors flex items-center justify-center gap-2
                                ${hasGeneratedSummary
                                    ? 'bg-green-600/20 border-green-500/30 text-green-400 cursor-not-allowed'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                }`}
                            >
                                {hasGeneratedSummary ? (
                                    <> <CheckCircle size={16} /> Summary Generated!</>
                                ) : (
                                    <> <BrainCircuit size={16} /> Generate Session Summary</>
                                )}
                            </button>
                            {hasGeneratedSummary && (
                                <p className="mt-2 text-xs text-green-500 text-center">Summary generated for post-call review.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
             <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

             {/* HISTORY MODAL */}
            {showHistory && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10">
                    <div className="bg-white w-full max-w-4xl max-h-full rounded-2xl shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <History className="text-slate-500" size={20} />
                                Session History
                            </h2>
                            <button 
                                onClick={() => setShowHistory(false)} 
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                            >
                                <X size={24}/>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                           {history.length === 0 ? (
                               <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                   <History size={48} strokeWidth={1.5} />
                                   <p className="mt-2 font-medium">No completed calls yet</p>
                               </div>
                           ) : (
                               <div className="space-y-4">
                                   {history.map((call, idx) => (
                                       <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                           <div className="flex justify-between items-start mb-2">
                                               <div>
                                                    <h3 className="font-bold text-slate-900">{call.name}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium uppercase">{call.issueType}</span>
                                                        <span>•</span>
                                                        <span>{call.completedAt}</span>
                                                        <span>•</span>
                                                        <span>Duration: {call.duration}</span>
                                                    </div>
                                               </div>
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${call.path === 'critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {call.path} Path
                                                </span>
                                           </div>
                                           <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 leading-relaxed border border-slate-100">
                                               <span className="font-bold block mb-1 text-slate-500 uppercase text-[10px]">Session Summary</span>
                                               {call.sessionSummary}
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* LEFT: queues */}
                <div className="lg:col-span-3">
                    <QueueBoard 
                        urgentQueue={urgentQueue} 
                        normalQueue={normalQueue} 
                        handleServe={handleServe} 
                        handleReset={handleReset} 
                        handleViewHistory={() => setShowHistory(true)}
                    />
                </div>

                                    {/* RIGHT: ACTIVE SESSION */}
                                    <div className="lg:col-span-1">
                                        <div className="sticky top-6 space-y-6">
                                            <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50">
                                                <h2 className="text-xl font-black text-slate-900 mb-1">Session Status</h2>
                                                <p className="text-xs font-medium text-slate-500">
                                                    Staff workspace for current consultation.
                                                </p>
                
                                                {/* Status Card */}
                                                {!lastCompletedCall && (
                                                    <div className="mt-6 p-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-center transition-all hover:bg-slate-50">
                                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                                                            <Users size={32} />
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-400">Ready to serve next customer</p>
                                                    </div>
                                                )}
                
                                                {/* POST CALL SUMMARY */}
                                                {lastCompletedCall && (
                                                    <div className="mt-6 p-5 bg-purple-50/80 rounded-2xl border border-purple-100 shadow-sm animate-in fade-in zoom-in-95 relative">
                                                        <button 
                                                            onClick={() => setLastCompletedCall(null)} 
                                                            className="absolute top-3 right-3 text-purple-400 hover:text-purple-700 transition-colors p-1 rounded-full hover:bg-purple-100"
                                                            title="Clear summary"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                        <div className="flex items-center gap-2 mb-2 text-purple-800 font-bold text-sm">
                                                            <CheckCircle size={18} /> Session Completed
                                                        </div>
                                                        <p className="text-xs text-purple-700 mb-3 font-medium leading-relaxed">
                                                            Session with <strong>{lastCompletedCall.name}</strong> ended successfully.
                                                        </p>
                                                        <div className="text-[10px] text-purple-600 bg-purple-100/50 p-3 rounded-xl border border-purple-100 mb-3">
                                                            Prototype Note: A secure recording and AI-generated summary have been sent to the customer.
                                                        </div>
                                                        <button 
                                                            onClick={() => setShowHistory(true)}
                                                            className="w-full py-2.5 text-xs font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5"
                                                        >
                                                            View in History
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>            </div>
        </div>
    );
}

export default StaffView;