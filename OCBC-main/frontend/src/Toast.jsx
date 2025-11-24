import { useEffect } from "react";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const bgColors = {
        success: "bg-white border-green-500",
        error: "bg-white border-red-500",
        info: "bg-white border-blue-500"
    };

    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />
    };

    return (
        <div className={`fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-300`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border-l-4 ${bgColors[type]} min-w-[300px]`}>
                <div className="shrink-0">
                    {icons[type]}
                </div>
                <div className="flex-1 mr-2">
                    <p className={`text-sm font-medium ${type === 'error' ? 'text-red-800' : 'text-slate-800'}`}>
                        {message}
                    </p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

export default Toast;