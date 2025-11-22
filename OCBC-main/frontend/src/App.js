import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Clock, 
  Video, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Upload, 
  ChevronRight, 
  User, 
  Phone,
  Lock,
  CreditCard,
  Siren,
  Eye,
  ArrowRight,
  X,
  Copy,
  Menu,
  Search,
  Bell
} from 'lucide-react';

// --- Constants ---
const ISSUE_TYPES = [
  { id: 'fraud', label: 'Fraud & Disputes', desc: 'Unauthorised transactions, scams', urgent: true, icon: <Siren className="w-6 h-6 text-[#ec1d23]" /> },
  { id: 'lost_card', label: 'Lost/Stolen Card', desc: 'Block card immediately', urgent: true, icon: <CreditCard className="w-6 h-6 text-[#ec1d23]" /> },
  { id: 'account_locked', label: 'Access Issues', desc: 'Unlock account, forgotten PIN', urgent: true, icon: <Lock className="w-6 h-6 text-[#ec1d23]" /> },
  { id: 'general', label: 'General Enquiry', desc: 'Products, fees, branches', urgent: false, icon: <MessageSquare className="w-6 h-6 text-gray-600" /> },
  { id: 'digital', label: 'Digital Banking', desc: 'App errors, token issues', urgent: false, icon: <User className="w-6 h-6 text-gray-600" /> },
  { id: 'other', label: 'Other Services', desc: 'Statements, updates', urgent: false, icon: <FileText className="w-6 h-6 text-gray-600" /> },
];

const TIME_SLOTS = [
  { id: 1, time: '09:00 - 10:00', status: 'Available' },
  { id: 2, time: '10:00 - 11:00', status: 'Full' },
  { id: 3, time: '11:00 - 12:00', status: 'Available' },
  { id: 4, time: '14:00 - 15:00', status: 'Available' },
];

// --- UI Components ---

const Header = () => (
  <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 w-full transition-all duration-300 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Brand Mark */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ec1d23] to-[#c91219] flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-red-500/30 transition-all duration-500 group-hover:scale-105">
             <div className="w-6 h-6 bg-white rounded-full transform group-hover:rotate-180 transition-transform duration-700"></div>
             <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col">
             <span className="font-black text-xl text-gray-900 leading-none tracking-tighter">OCBC</span>
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">Personal Banking</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-600">
           <span className="hover:text-[#ec1d23] cursor-pointer transition-all duration-300 hover:scale-105">Premier</span>
           <span className="hover:text-[#ec1d23] cursor-pointer transition-all duration-300 hover:scale-105">Frank by OCBC</span>
           <span className="hover:text-[#ec1d23] cursor-pointer transition-all duration-300 hover:scale-105">Help</span>
        </div>
        <div className="flex items-center gap-2 border-l border-gray-200/70 pl-6">
          <button className="p-2.5 hover:bg-gray-100/70 rounded-xl text-gray-500 hover:text-gray-900 transition-all duration-300 hover:scale-110">
             <Search className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-gray-100/70 rounded-xl text-gray-500 hover:text-gray-900 transition-all duration-300 hover:scale-110 relative">
             <Bell className="w-5 h-5" />
             <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ec1d23] rounded-full animate-pulse"></div>
          </button>
          <button className="p-2.5 hover:bg-gray-100/70 rounded-xl text-gray-500 hover:text-gray-900 transition-all duration-300 md:hidden">
             <Menu className="w-5 h-5" />
          </button>
          <button className="hidden md:flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-gray-900/20 ml-2">
            <User className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Login</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false }) => {
  const baseStyle = "relative overflow-hidden px-7 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-[0.97] group";
  const variants = {
    primary: "bg-gradient-to-r from-[#ec1d23] to-[#c91219] text-white shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-600/35 hover:from-[#d01015] hover:to-[#b01015] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:from-[#ec1d23] disabled:hover:to-[#c91219] transform hover:scale-[1.02]",
    outline: "bg-white border-2 border-[#ec1d23] text-[#ec1d23] hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/20",
    ghost: "bg-gray-50/80 text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg",
    urgent: "bg-gradient-to-r from-red-600 via-red-700 to-red-600 bg-[length:200%_100%] text-white animate-gradient shadow-2xl shadow-red-500/40 hover:shadow-red-600/50 hover:scale-[1.02]",
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </button>
  );
};

// --- Views ---

const HomeView = ({ setView }) => (
  <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-white to-red-50/30">
    {/* Hero Section */}
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-white pb-20 pt-16 sm:pt-32 border-b border-gray-200/50">
       {/* Decorative Elements */}
       <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-red-100 via-red-50 to-transparent rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse"></div>
       <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-blue-50 via-purple-50 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none"></div>
       
       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-red-100/80 border border-red-200/60 text-[#ec1d23] text-xs font-black uppercase tracking-wider mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-lg shadow-red-500/10 backdrop-blur-sm">
             <Shield className="w-3.5 h-3.5" />
             Smart Support 2.0
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
             Banking support, <br/>
             <span className="bg-gradient-to-r from-[#ec1d23] via-[#ff2a31] to-[#ec1d23] bg-clip-text text-transparent animate-gradient bg-[length:200%_100%]">reimagined.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 leading-relaxed font-medium">
             Experience our new AI-assisted triage system. Whether it's a lost card or a simple enquiry, we connect you to the right expert, instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
             <Button onClick={() => setView('triage')} className="text-lg px-12 py-5 shadow-red-500/30">
               Start Consultation
               <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
       </div>
    </div>

    {/* Features Grid */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
             { icon: Shield, title: "Bank-Grade Security", desc: "Every session is encrypted and verified via SingPass.", gradient: "from-blue-500 to-cyan-500" },
             { icon: Clock, title: "Zero Wasted Time", desc: "Our rolling queue system respects your time.", gradient: "from-purple-500 to-pink-500" },
             { icon: CheckCircle2, title: "AI Triage", desc: "Smart routing ensures you speak to the right specialist.", gradient: "from-green-500 to-emerald-500" }
          ].map((item, i) => (
             <div key={i} className="relative group bg-white p-10 rounded-3xl border border-gray-200/60 shadow-lg shadow-gray-900/5 hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-500 text-center hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`relative w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-gray-900/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                   <item.icon className="w-8 h-8" />
                </div>
                <h3 className="relative font-black text-gray-900 mb-3 text-lg">{item.title}</h3>
                <p className="relative text-sm text-gray-600 leading-relaxed">{item.desc}</p>
             </div>
          ))}
       </div>
    </div>
  </div>
);

const TriageView = ({ formData, setFormData, handleTriageSubmit }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <button className="text-sm font-bold text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1.5 transition-all hover:gap-2">
             <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">What can we help with?</h2>
          <p className="text-gray-600 font-medium">Select a topic below to help us route your request faster.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Issue Type */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl shadow-gray-900/5 p-8">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 block">Select Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ISSUE_TYPES.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setFormData(prev => ({...prev, issueType: type}))}
                    className={`relative group cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 ${
                      formData.issueType?.id === type.id 
                        ? 'border-[#ec1d23] bg-gradient-to-br from-red-50 to-red-100/30 shadow-lg shadow-red-500/10' 
                        : 'border-transparent bg-gradient-to-br from-gray-50 to-gray-100/50 hover:from-white hover:to-gray-50 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-900/5 hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 transition-all duration-300 ${
                        formData.issueType?.id === type.id ? 'bg-red-100 text-[#ec1d23] scale-110' : 'bg-white text-gray-500 group-hover:text-[#ec1d23] shadow-md'
                      }`}>
                        {type.icon}
                      </div>
                      <div>
                         <span className={`block font-bold text-sm mb-1 ${formData.issueType?.id === type.id ? 'text-[#ec1d23]' : 'text-gray-900'}`}>
                           {type.label}
                         </span>
                         <span className="text-xs text-gray-600 leading-tight block">{type.desc}</span>
                      </div>
                    </div>
                    {formData.issueType?.id === type.id && (
                      <div className="absolute top-4 right-4 text-[#ec1d23]">
                        <CheckCircle2 className="w-5 h-5 animate-in zoom-in duration-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

             <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl shadow-gray-900/5 p-8">
              <div className="flex items-center justify-between mb-5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Supporting Documents</label>
                <span className="text-[10px] px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black rounded-full shadow-lg shadow-blue-500/30">AI SCAN ENABLED</span>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />

              {!formData.file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-[#ec1d23] rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group bg-gradient-to-br from-gray-50 to-gray-100/50 hover:from-red-50 hover:to-red-100/30 hover:shadow-xl hover:shadow-red-500/10"
                >
                  <div className="p-4 bg-white rounded-2xl shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-gray-400 group-hover:text-[#ec1d23]">
                     <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Click to upload evidence</p>
                  <p className="text-xs text-gray-500">Screenshots, PDFs, or Photos</p>
                </div>
              ) : (
                <div className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{formData.file.name}</p>
                      <p className="text-xs text-gray-600">Ready for analysis</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({...prev, file: null}));
                    }}
                    className="p-2.5 hover:bg-red-100 hover:text-red-600 rounded-xl text-gray-400 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Description & Urgency */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl shadow-gray-900/5 p-8 h-full flex flex-col">
              <div className="mb-6">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">
                  Situation Details <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed font-medium">
                  Our AI will analyze this text to summarize your case for the banking specialist.
                </p>
                <textarea 
                  className="w-full p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#ec1d23] focus:border-[#ec1d23] focus:bg-white transition-all text-sm min-h-[240px] resize-none text-gray-900 placeholder-gray-400 leading-relaxed font-medium shadow-inner"
                  placeholder={formData.issueType?.id === 'other' ? "Please describe your specific issue here..." : "Example: I noticed a transaction of $50 from 'Unknown Vendor' that I didn't authorize..."}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                ></textarea>
              </div>
              
              <div className="mt-auto pt-6 border-t border-gray-200">
                <div 
                  className={`flex items-center gap-4 mb-6 p-4 rounded-2xl transition-all duration-300 cursor-pointer border-2 ${formData.isUrgent ? 'bg-gradient-to-r from-red-50 to-red-100/50 border-red-200 shadow-lg shadow-red-500/10' : 'bg-transparent border-transparent hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 hover:border-gray-200'}`}
                  onClick={() => setFormData(prev => ({...prev, isUrgent: !prev.isUrgent}))}
                >
                  <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${formData.isUrgent ? 'border-[#ec1d23] bg-gradient-to-br from-[#ec1d23] to-[#c91219] scale-110' : 'border-gray-300 bg-white'}`}>
                    {formData.isUrgent && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                     <span className="block text-sm font-bold text-gray-900">Mark as High Priority</span>
                     <span className="text-xs text-gray-600 font-medium">Select if funds or security are at immediate risk</span>
                  </div>
                </div>

                <Button 
                  onClick={handleTriageSubmit}
                  disabled={!formData.issueType || !formData.description}
                  className="w-full text-base"
                >
                  Submit & Analyze
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyzingView = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8 text-center relative overflow-hidden">
    {/* Background decoration */}
    <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-red-100 to-red-50 rounded-full blur-3xl opacity-20 animate-pulse"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-100 to-purple-50 rounded-full blur-3xl opacity-20 animate-pulse"></div>
    
    <div className="max-w-md w-full bg-white p-14 rounded-[2rem] shadow-2xl border border-gray-200/60 relative overflow-hidden z-10">
      {/* Animated Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-[#ec1d23] to-red-500 bg-[length:200%_100%] animate-gradient"></div>
      
      <div className="relative w-36 h-36 mb-12 mx-auto">
        <div className="absolute inset-0 border-[8px] border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-[8px] border-t-[#ec1d23] border-r-[#ec1d23] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 m-auto w-16 h-16 bg-gradient-to-br from-[#ec1d23] to-[#c91219] rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 animate-pulse">
          <Shield className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Analyzing Request</h2>
      <p className="text-gray-600 mb-10 text-sm font-medium">Please wait while our secure AI triages your issue.</p>
      
      <div className="space-y-3 text-left">
        {[
            "Scanning for urgency keywords...",
            "Matching with banking policies...",
            "Generating secure summary for staff...",
            "Routing to priority queue..."
        ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200 animate-in fade-in slide-in-from-bottom-2 fill-mode-forwards shadow-sm" style={{animationDelay: `${i * 500}ms`}}>
                <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700">{step}</span>
            </div>
        ))}
      </div>
    </div>
  </div>
);

const CriticalPathView = ({ setView, analysisResult }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const hotline = "1800-363-3333";

  const handleCall = () => {
    if (window.innerWidth < 768) {
      window.location.href = `tel:${hotline.replace(/-/g, '')}`;
    } else {
      setShowPhoneModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hotline);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-red-50/20 p-4 md:p-8 overflow-y-auto relative">
      <div className="max-w-4xl mx-auto">
        {/* Alert Banner */}
        <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-600 bg-[length:200%_100%] animate-gradient text-white p-8 rounded-[2rem] mb-8 flex flex-col md:flex-row md:items-center gap-6 shadow-2xl shadow-red-500/30 border-4 border-red-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <div className="relative p-4 bg-white/20 rounded-2xl backdrop-blur-sm self-start md:self-center shadow-xl">
            <AlertTriangle className="w-9 h-9 text-white animate-pulse" />
          </div>
          <div className="relative flex-1">
            <h3 className="font-black text-2xl tracking-tight mb-2">CRITICAL PRIORITY DETECTED</h3>
            <p className="text-red-100 text-sm leading-relaxed font-medium">
              Our AI has flagged your issue as high-risk. We have bypassed the standard booking system and routed you to the <span className="font-black underline decoration-2 underline-offset-2 bg-white/20 px-2 py-0.5 rounded">Emergency Response Team</span>.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Action Card */}
          <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-gray-900/10 border-2 border-red-100 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-50 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="relative mb-8">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-red-100 text-[#ec1d23] text-xs font-black uppercase tracking-wide mb-5 shadow-lg shadow-red-500/10">
                  <Video className="w-3.5 h-3.5" />
                  Recommended
               </div>
               <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Connect Immediately</h2>
               <p className="text-gray-600 text-sm font-medium">Speak face-to-face with a fraud specialist to secure your account.</p>
            </div>
            
            <div className="relative mt-auto space-y-5">
              <Button variant="urgent" className="w-full justify-between group text-lg shadow-red-600/40" onClick={() => setView('queue')}>
                <span>Start Video Call</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-normal opacity-90">Wait: &lt; 2m</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
              
              <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 py-1 text-gray-500 font-black rounded-full">Or use fail-safe</span>
                  </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full justify-between shadow-md"
                onClick={handleCall}
              >
                <span className="font-bold text-gray-700">Call Emergency Hotline</span>
                <Phone className="w-5 h-5 text-gray-400" />
              </Button>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-[2rem] p-10 border-2 border-gray-200/60 flex flex-col h-full shadow-xl shadow-gray-900/5">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-white shadow-xl">
                    <Shield className="w-5 h-5" />
                 </div>
                 <span className="font-black text-gray-900 text-lg">AI Case File</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200/60 mb-8 shadow-lg">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-3">Auto-Generated Summary</label>
                <p className="text-sm text-gray-700 italic leading-relaxed font-medium">
                  "{analysisResult?.summary || "User reported urgent issue. Pending AI detailed summary."}"
                </p>
              </div>
              
              <h3 className="font-black text-gray-900 text-sm mb-5 uppercase tracking-wider">Required for Verification</h3>
              <ul className="space-y-3">
              {(analysisResult?.checklist || []).map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-white p-4 rounded-xl border-2 border-gray-200/60 shadow-sm font-medium">
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Phone Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-10 animate-in fade-in zoom-in duration-300 border-2 border-gray-200">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-gray-900">Emergency Hotline</h3>
              <button onClick={() => setShowPhoneModal(false)} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:rotate-90">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-8 ring-8 ring-red-50/70 shadow-xl shadow-red-500/20">
                <Phone className="w-12 h-12 text-[#ec1d23]" />
              </div>
              <p className="text-gray-600 leading-relaxed font-medium">
                Please dial this number on your mobile phone to reach our fraud team immediately.
              </p>
            </div>

             <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 transition-all mb-3 shadow-lg" onClick={copyToClipboard}>
                <span className="text-2xl font-black text-gray-900 tracking-wider font-mono">{hotline}</span>
                <div className="p-3 bg-white rounded-xl shadow-md border border-gray-200 group-hover:scale-110 transition-transform">
                  <Copy className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mb-10 font-bold">Tap box to copy number</p>

            <Button onClick={() => setShowPhoneModal(false)} variant="primary" className="w-full shadow-red-500/30">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingView = ({ setView }) => (
  <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 p-4 md:p-8 overflow-y-auto">
    <div className="max-w-5xl mx-auto">
      <div className="relative bg-gradient-to-r from-white to-blue-50/50 border-2 border-blue-200/60 p-10 rounded-[2rem] mb-10 flex items-center gap-8 shadow-xl shadow-blue-500/10 overflow-hidden">
        <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="relative p-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl hidden sm:block text-white shadow-xl shadow-blue-500/30">
            <Clock className="w-9 h-9" />
        </div>
        <div className="relative">
          <h3 className="font-black text-2xl text-gray-900 mb-3">Standard Support Path</h3>
          <p className="text-gray-600 max-w-2xl font-medium leading-relaxed">
            Good news: Your issue is not critical. To save you time, we have allocated a 1-hour consultation block. You can join the queue anytime during this hour.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Select a Time Block</h2>
            <div className="grid grid-cols-1 gap-5">
              {TIME_SLOTS.map((slot) => (
                <div 
                  key={slot.id}
                  onClick={() => slot.status === 'Available' && setView('queue')}
                  className={`relative p-7 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${
                    slot.status === 'Available' 
                      ? 'bg-white border-gray-200/60 hover:border-[#ec1d23] cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-gray-900/10 hover:-translate-y-1' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200/60 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 font-black text-xl border-2 ${
                      slot.status === 'Available' 
                        ? 'bg-gradient-to-br from-red-50 to-red-100 text-[#ec1d23] border-red-200 group-hover:from-[#ec1d23] group-hover:to-[#c91219] group-hover:text-white group-hover:scale-110 group-hover:rotate-6 shadow-lg' 
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                      {slot.time.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-xl mb-1">{slot.time}</p>
                      <div className="flex items-center gap-2">
                         <span className={`w-2.5 h-2.5 rounded-full ${slot.status === 'Available' ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/50' : 'bg-red-500'} animate-pulse`}></span>
                         <p className="text-sm font-bold text-gray-600">{slot.status}</p>
                      </div>
                    </div>
                  </div>
                  {slot.status === 'Available' && (
                     <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:from-red-50 group-hover:to-red-100 group-hover:text-[#ec1d23] transition-all duration-300 border-2 border-gray-200 group-hover:border-red-200 shadow-md">
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-[2rem] shadow-2xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-3xl"></div>
              <div className="relative mb-8">
                 <div className="w-12 h-12 bg-gradient-to-br from-[#ec1d23] to-[#c91219] rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 mb-6">
                    <Eye className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="font-black text-2xl mb-2">Why book a slot?</h3>
              </div>
              
              <div className="relative space-y-10">
                <div className="relative pl-7 border-l-2 border-gray-700">
                  <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-gradient-to-br from-[#ec1d23] to-[#c91219] shadow-lg shadow-red-500/50"></div>
                  <h4 className="font-black text-base mb-2">Rolling Queue Technology</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">Join anytime during your hour. The line moves constantly, ensuring fairness.</p>
                </div>
                <div className="relative pl-7 border-l-2 border-gray-700">
                  <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-gray-600"></div>
                  <h4 className="font-black text-base mb-2">Staff Preparation</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">Our staff reviews your AI summary before you connect, saving 5-10 mins.</p>
                </div>
              </div>

              <div className="relative mt-auto pt-10 text-center border-t-2 border-gray-700/50">
                 <p className="text-xs text-gray-500 font-bold tracking-wider">Trusted by 1M+ Customers</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
);

const QueueView = ({ setView }) => {
  const [queuePosition, setQueuePosition] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setQueuePosition((prev) => (prev > 1 ? prev - 1 : 1));
    }, 2500); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-100 to-red-50 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tl from-blue-100 to-purple-50 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
        
        <div className="bg-white p-16 rounded-[3rem] shadow-2xl border-2 border-gray-200/60 max-w-lg w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ec1d23] via-red-500 to-[#ec1d23] bg-[length:200%_100%] animate-gradient"></div>
          
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-10">Live Queue Status</h2>
          
          <div className="relative w-72 h-72 mx-auto mb-12 flex items-center justify-center">
            {/* Ripples */}
            <div className="absolute inset-0 rounded-full border-2 border-red-200 animate-ping opacity-40"></div>
            <div className="absolute inset-8 rounded-full border-2 border-red-100 animate-ping opacity-40 delay-75"></div>
            <div className="absolute inset-16 rounded-full border border-red-50 animate-ping opacity-40 delay-150"></div>
            
            <div className="relative w-full h-full rounded-full border-8 border-gray-100 flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 shadow-2xl shadow-gray-900/10">
               <span className="text-9xl font-black text-transparent bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text tracking-tighter">{queuePosition}</span>
               <span className="text-sm font-black text-gray-400 mt-3 uppercase tracking-widest">Pax Ahead</span>
            </div>
          </div>

          <div className="space-y-2 mb-10">
             <p className="text-3xl font-black text-gray-900 tracking-tight">Almost there.</p>
             <p className="text-gray-500 font-medium">Please keep this window open.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-100 flex items-center justify-between mb-10">
             <span className="text-sm font-bold text-gray-500">Estimated Wait</span>
             <span className="text-xl font-black text-[#ec1d23]">{queuePosition * 2} mins</span>
          </div>

          <Button 
            onClick={() => setView('session')}
            className="w-full shadow-lg"
            disabled={queuePosition > 1}
          >
            {queuePosition > 1 ? 'Waiting for your turn...' : 'Enter Private Room'}
          </Button>
        </div>
        
        <div className="mt-10 flex items-center gap-3 text-sm font-bold text-gray-500 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-gray-200">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          Staff is reviewing your case details...
        </div>
      </div>
    </div>
  );
};

const SessionView = ({ setView }) => (
  <div className="flex-1 flex flex-col bg-[#0f1115] relative overflow-hidden">
    {/* Top Bar */}
    <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
       <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3 pointer-events-auto">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div>
             <p className="text-white text-sm font-bold">Private Session</p>
             <p className="text-white/50 text-[10px]">Encrypted • ID: #88291-X</p>
          </div>
       </div>
    </div>

    {/* Video Area */}
    <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute inset-0">
           <img 
             src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1600&q=80" 
             alt="Bank Staff" 
             className="w-full h-full object-cover opacity-80"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        </div>

        {/* AI Assistant (Floating Panel) */}
        <div className="absolute top-24 right-8 w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl hidden md:block transform transition-all hover:bg-black/70">
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
            <div className="w-6 h-6 rounded bg-[#ec1d23] flex items-center justify-center">
               <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-white">OCBC Co-Pilot</span>
          </div>
          
          <div className="space-y-4">
             <div className="bg-white/5 rounded-lg p-3 border border-white/5">
               <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Current Status</p>
               <p className="text-xs text-gray-200">Staff has received your summary and evidence files.</p>
             </div>
             
             <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">Next Step</p>
                <div className="flex items-center gap-3 text-xs text-white bg-[#ec1d23]/20 p-3 rounded-lg border border-[#ec1d23]/50">
                   <User className="w-4 h-4 shrink-0" />
                   Verify Identity (Have ID Ready)
                </div>
             </div>
          </div>
        </div>
    </div>

    {/* Bottom Controls */}
    <div className="h-24 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-6 px-8 z-20">
        <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
           <MessageSquare className="w-5 h-5" />
        </button>
        <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
           <Video className="w-5 h-5" />
        </button>
        
        <button 
           className="h-14 w-14 bg-[#ec1d23] hover:bg-red-600 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 mx-4" 
           onClick={() => setView('home')}
        >
           <Phone className="w-6 h-6 rotate-[135deg]" />
        </button>
        
        <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
           <User className="w-5 h-5" />
        </button>
        <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
           <Copy className="w-5 h-5" />
        </button>
    </div>
  </div>
);

// --- Main Application ---

export default function App() {
  const [view, setView] = useState('home'); 
  const [formData, setFormData] = useState({
    issueType: null,
    description: '',
    isUrgent: false,
    file: null 
  });
  const [analysisResult, setAnalysisResult] = useState(null);

  const mockBackendService = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 2500)); // Slightly longer for effect
    const isCritical = data.isUrgent || (data.issueType && data.issueType.urgent);
    return {
      path: isCritical ? 'CRITICAL' : 'NORMAL',
      riskLevel: isCritical ? 'High' : 'Low',
      summary: isCritical 
        ? "System flagged urgency based on keywords 'unauthorized' and 'transaction'. Potential fraud vector." 
        : "Customer inquiry regarding account products. Standard routing applied.",
      checklist: isCritical 
        ? ['Prepare NRIC/Passport', 'Review recent transaction history'] 
        : ['Prepare NRIC/Passport', 'Have account details ready']
    };
  };

  const handleTriageSubmit = async () => {
    if (!formData.description || !formData.issueType) return;
    setView('analyzing');
    const result = await mockBackendService(formData);
    setAnalysisResult(result);
    setView(result.path === 'CRITICAL' ? 'critical' : 'booking');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans w-full flex flex-col overflow-hidden text-gray-900">
      <Header />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'triage' && (
          <TriageView 
            formData={formData} 
            setFormData={setFormData} 
            handleTriageSubmit={handleTriageSubmit}
          />
        )}
        {view === 'analyzing' && <AnalyzingView />}
        {view === 'critical' && (
          <CriticalPathView 
            setView={setView} 
            analysisResult={analysisResult} 
          />
        )}
        {view === 'booking' && <BookingView setView={setView} />}
        {view === 'queue' && <QueueView setView={setView} />}
        {view === 'session' && <SessionView setView={setView} />}
      </div>
    </div>
  );
}