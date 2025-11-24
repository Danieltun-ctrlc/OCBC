import { useState, useEffect } from "react";
import { submitIssue, fetchQueues, bookSlot, fetchSlotsAvailability } from "./api.js";
import Toast from "./Toast.jsx";
import { 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    FileText, 
    ShieldAlert, 
    Calendar, 
    ChevronRight, 
    Activity,
    CreditCard,
    DollarSign,
    Lock,
    Smartphone,
    HelpCircle,
    User,
    Phone,
    Search
} from "lucide-react";

const ISSUE_TYPES = [
    { id: "Lost card", label: "Lost Card", icon: <CreditCard size={20}/> },
    { id: "Stolen card", label: "Stolen Card", icon: <CreditCard size={20} className="text-red-500"/> },
    { id: "Money missing", label: "Money Missing", icon: <DollarSign size={20}/> },
    { id: "Unauthorized / fraud transaction", label: "Fraud/Scam", icon: <ShieldAlert size={20}/> },
    { id: "Account locked", label: "Account Locked", icon: <Lock size={20}/> },
    { id: "Digital banking issue", label: "App/Web Issue", icon: <Smartphone size={20}/> },
    { id: "Others", label: "Other Issues", icon: <HelpCircle size={20}/> },
];

function CustomerView({ isActive }) {
    const [form, setForm] = useState({
        name: "",
        contact: "",
        issueType: "Digital banking issue",
        description: "",
        isUrgent: false
    });

    const [result, setResult] = useState(null);
    const [queueStatus, setQueueStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const [bookingDate, setBookingDate] = useState("");
    const [bookingSlot, setBookingSlot] = useState("");
    const [bookingSaved, setBookingSaved] = useState(false);
    const [toast, setToast] = useState(null);
    const [availableSlots, setAvailableSlots] = useState({});
    const [maxBookings, setMaxBookings] = useState(2);

    const slots = [
        "09:00–10:00",
        "10:00–11:00",
        "11:00–12:00",
        "13:00–14:00",
        "14:00–15:00",
        "15:00–16:00",
        "16:00–17:00"
    ];

    useEffect(() => {
        async function checkAvailability() {
            if (bookingDate) {
                try {
                    const res = await fetchSlotsAvailability(bookingDate);
                    setAvailableSlots(res.availability || {});
                    setMaxBookings(res.max || 2);
                } catch (e) {
                    console.error("Failed to fetch availability", e);
                }
            }
        }
        checkAvailability();
    }, [bookingDate]);

    const handleChange = (e) => {
        const target = e.target;
        const name = target.name;
        const value = target.type === "checkbox" ? target.checked : target.value;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const selectIssueType = (type) => {
        setForm(prev => ({ ...prev, issueType: type }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setBookingSaved(false);

        try {
            const data = await submitIssue(form);
            setResult(data);

            const queues = await fetchQueues();
            const issue = data.issue;
            let position = null;

            if (issue.path === "critical") {
                const index = queues.urgentQueue.findIndex((i) => i.id === issue.id);
                position = index === -1 ? null : index + 1;
            } else {
                const index = queues.normalQueue.findIndex((i) => i.id === issue.id);
                position = index === -1 ? null : index + 1;
            }

            setQueueStatus({
                path: issue.path,
                riskLevel: issue.riskLevel,
                position: position
            });
            
            setToast({ message: "Issue submitted successfully. We are routing you now.", type: "success" });

        } catch (err) {
            console.error(err);
            setToast({ message: "Submission failed. Please try again.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const confirmBooking = async () => {
        if (!bookingDate) {
            setToast({ message: "Please choose a date", type: "error" });
            return;
        }
        if (!bookingSlot) {
            setToast({ message: "Please choose a time slot", type: "error" });
            return;
        }

        const id = result.issue.id;

        try {
            const res = await bookSlot({
                id: id,
                bookingDate: bookingDate,
                bookingSlot: bookingSlot
            });

            if (res.success) {
                setBookingSaved(true);
                setToast({ message: "Booking confirmed! A confirmation email has been sent.", type: "success" });
                // Refresh availability immediately after booking
                try {
                    const availabilityRes = await fetchSlotsAvailability(bookingDate);
                    setAvailableSlots(availabilityRes.availability || {});
                } catch (e) {
                    console.error("Failed to refresh availability", e);
                }
            } else {
                setToast({ message: res.message || "Booking failed.", type: "error" });
            }
        } catch (e) {
            setToast({ message: "Network error during booking.", type: "error" });
        }
    };

    const resetView = () => {
        setForm({
            name: "",
            contact: "",
            issueType: "Digital banking issue",
            description: "",
            isUrgent: false
        });
        setResult(null);
        setQueueStatus(null);
        setBookingDate("");
        setBookingSlot("");
        setBookingSaved(false);
        setAvailableSlots({});
    };

    useEffect(() => {
        if (isActive && bookingSaved) {
            resetView();
        }
    }, [isActive]);

    const currentStep = !result ? 1 : result.queueInfo.path === "critical" ? 2 : 3;

    return (
        <div className="w-full max-w-7xl mx-auto relative px-4 md:px-0">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
            
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden my-6">
                {/* Header / branding bar */}
                <header className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-200">
                            <span className="text-white font-bold text-lg tracking-tight">OC</span>
                        </div>
                        <div>
                            <div className="text-slate-900 font-bold text-xl tracking-tight">Consultation Portal</div>
                            <div className="text-slate-500 text-sm font-medium">Smart Triage & Routing</div>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-3 text-sm font-medium bg-slate-50/50 p-2 rounded-full border border-slate-100">
                        <Step index={1} label="Details" active={currentStep === 1} done={currentStep > 1} />
                        <div className="w-6 h-px bg-slate-200"></div>
                        <Step index={2} label="Analysis" active={currentStep === 2} done={currentStep > 2} />
                        <div className="w-6 h-px bg-slate-200"></div>
                        <Step index={3} label="Schedule" active={currentStep === 3} done={false} />
                    </div>
                </header>

                <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* LEFT: FORM */}
                    <section className="lg:col-span-7 space-y-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">How can we help?</h2>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                Provide a few details. Our AI will analyze urgency and route you to the fastest path.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Alex Tan"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Contact</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                                        <input
                                            name="contact"
                                            value={form.contact}
                                            onChange={handleChange}
                                            placeholder="Mobile or Email"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 ml-1">What's the issue?</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {ISSUE_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => selectIssueType(type.id)}
                                            className={`
                                                flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-center transition-all duration-200
                                                ${form.issueType === type.id
                                                    ? "bg-red-50 border-red-500 text-red-700 shadow-md transform scale-[1.02]"
                                                    : "bg-white border-slate-200 text-slate-600 hover:border-red-200 hover:bg-slate-50"
                                                }
                                            `}
                                        >
                                            {type.icon}
                                            <span className="text-xs font-bold">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe what happened..."
                                    rows={4}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-sm resize-none"
                                />
                            </div>

                            <div 
                                onClick={() => setForm(p => ({...p, isUrgent: !p.isUrgent}))}
                                className={`
                                    flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group
                                    ${form.isUrgent 
                                        ? "bg-red-50 border-red-500 shadow-lg shadow-red-100" 
                                        : "bg-white border-slate-200 hover:border-red-200"
                                    }
                                `}
                            >
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center transition-colors
                                    ${form.isUrgent ? "bg-red-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-400"}
                                `}>
                                    <AlertTriangle size={24} fill={form.isUrgent ? "currentColor" : "none"} />
                                </div>
                                <div>
                                    <div className={`font-bold text-base ${form.isUrgent ? "text-red-800" : "text-slate-700"}`}>Mark as Urgent / Emergency</div>
                                    <div className="text-xs text-slate-500 mt-0.5">Select this if money is at risk or you are locked out.</div>
                                </div>
                                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${form.isUrgent ? "border-red-600 bg-red-600 text-white" : "border-slate-300"}`}>
                                    {form.isUrgent && <CheckCircle size={14} />}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`
                                        w-full md:w-auto px-10 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1
                                        ${loading
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                                    }
                                    `}
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin">⏳</span> Analyzing...
                                        </>
                                    ) : (
                                        <>Analyze & Submit <ChevronRight size={18} /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* RIGHT: RESULT / CHECKLIST / BOOKING */}
                    <section className="lg:col-span-5 space-y-6">
                        {/* Routing result */}
                        {result ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className={`p-6 rounded-3xl border shadow-xl ${result.queueInfo.path === "critical" ? "bg-gradient-to-br from-white to-red-50 border-red-200 shadow-red-100" : "bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-blue-100"}`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${result.queueInfo.path === "critical" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                                                {result.queueInfo.path === "critical" ? <ShieldAlert size={24} /> : <Activity size={24} />}
                                            </div>
                                            Routing Result
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${result.queueInfo.path === "critical" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}>
                                            {result.queueInfo.path}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-white/60 rounded-2xl p-4 space-y-3 border border-white/50">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                                            <span className="text-sm font-medium text-slate-500">Risk Level</span>
                                            <span className={`text-sm font-bold capitalize ${result.issue.riskLevel === 'high' ? 'text-red-600' : 'text-blue-600'}`}>{result.issue.riskLevel}</span>
                                        </div>

                                        {queueStatus && (
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                                                <span className="text-sm font-medium text-slate-500">Queue Position</span>
                                                <span className="text-2xl font-black text-slate-900">
                                                    {queueStatus.position != null ? `#${queueStatus.position}` : "Calculating..."}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-4 text-sm text-slate-600 leading-relaxed font-medium">
                                        {result.queueInfo.message}
                                    </p>

                                    {result.queueInfo.path === "critical" && (
                                        <button 
                                            onClick={resetView}
                                            className="w-full mt-6 py-3 rounded-xl text-sm font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                                        >
                                            Start New Consultation
                                        </button>
                                    )}
                                </div>

                                {/* Pre-diagnosis */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <FileText size={20} className="text-slate-400" />
                                        Preparation Checklist
                                    </h3>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Actions</h4>
                                            <ul className="space-y-3">
                                                {result.preDiagnosis.checklist.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                                            <CheckCircle size={12} />
                                                        </div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Documents</h4>
                                            <ul className="space-y-3">
                                                {result.preDiagnosis.docsNeeded.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                            <FileText size={12} />
                                                        </div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking section only for Normal Path */}
                                {result.queueInfo.path === "normal" && (
                                    <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-3xl border border-blue-100 shadow-xl shadow-blue-100/50">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                                            <Clock size={20} className="text-blue-600" />
                                            Book Consultation
                                        </h3>
                                        <p className="text-xs text-blue-600/80 font-medium mb-6">
                                            Choose a 1-hour window.
                                        </p>

                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Select Date</label>
                                                <div className="relative group">
                                                    <Calendar size={18} className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                    <input
                                                        type="date"
                                                        value={bookingDate}
                                                        onChange={(e) => {
                                                            setBookingDate(e.target.value);
                                                            setBookingSlot(""); // reset slot on date change
                                                        }}
                                                        className="w-full pl-12 pr-4 py-3 bg-white border border-blue-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none shadow-sm cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Select Time Slot</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {slots.map((slot) => {
                                                        const count = availableSlots[slot] || 0;
                                                        const isFull = count >= maxBookings;
                                                        const isSelected = bookingSlot === slot;

                                                        return (
                                                            <button
                                                                key={slot}
                                                                type="button"
                                                                disabled={isFull || !bookingDate}
                                                                onClick={() => setBookingSlot(slot)}
                                                                className={`
                                                                    py-2.5 px-2 rounded-lg text-xs font-bold border transition-all duration-200 relative overflow-hidden
                                                                    ${isSelected
                                                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-300 transform scale-[1.02]"
                                                                        : isFull
                                                                            ? "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed opacity-60"
                                                                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                                                                    }
                                                                    ${!bookingDate && "opacity-50 cursor-not-allowed"}
                                                                `}
                                                            >
                                                                <span className="relative z-10">{slot}</span>
                                                                {isFull && (
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 font-bold text-[10px] text-red-500 uppercase tracking-wider">
                                                                        Full
                                                                    </div>
                                                                )}
                                                                {!isFull && bookingDate && count > 0 && (
                                                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-sm" title="Filling fast"></span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {!bookingDate && (
                                                    <p className="text-[10px] text-slate-400 italic ml-1">Please select a date first.</p>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                disabled={bookingSaved}
                                                onClick={confirmBooking}
                                                className={`
                                                    w-full mt-2 py-4 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5
                                                    ${bookingSaved
                                                        ? "bg-green-600 text-white hover:bg-green-700 cursor-default shadow-green-200"
                                                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-200"
                                                    }
                                                `}
                                            >
                                                {bookingSaved ? (
                                                    <> <CheckCircle size={18} /> Booking Confirmed </>
                                                ) : (
                                                    "Confirm Booking"
                                                )}
                                            </button>

                                            {bookingSaved && (
                                                <div className="text-xs text-green-800 bg-green-100/50 p-4 rounded-xl border border-green-100 text-center font-medium animate-in zoom-in-95">
                                                    Your consultation is scheduled. A confirmation has been sent to your contact details.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-white/50 text-slate-400">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                                    <Search size={36} />
                                </div>
                                <h3 className="text-slate-900 font-bold text-lg mb-2">Ready to Analyze</h3>
                                <p className="text-sm max-w-xs mx-auto leading-relaxed">
                                    Submit your issue on the left. We'll calculate the risk and find the best slot for you.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

// Small step component for the header stepper
function Step({ index, label, active, done }) {
    return (
        <div className={`flex items-center gap-2 px-2 transition-colors ${active ? "text-red-700 font-bold" : done ? "text-green-600 font-bold" : "text-slate-400 font-medium"}`}>
            <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs border
                ${active
                    ? "border-red-600 bg-red-600 text-white"
                    : done
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-slate-300 bg-white text-slate-500"
                }
            `}>
                {done ? "✓" : index}
            </div>
            <span className="hidden sm:inline">{label}</span>
        </div>
    );
}

export default CustomerView;