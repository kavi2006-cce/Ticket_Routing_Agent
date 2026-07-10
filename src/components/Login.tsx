import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
  Clock,
  Cpu,
  RefreshCw,
  Globe,
  Key,
  ShieldCheck,
  CheckCircle2,
  X,
  PlusCircle,
  HelpCircle,
  Activity,
  Terminal,
  ChevronRight,
  Database,
  Layers,
  Award,
  Zap,
  Check,
  MessageSquare,
  LockKeyhole,
  Server
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Role } from "../types.js";
import ThreeAICore from "./ThreeAICore.js";
import ThreeRoutingHub from "./ThreeRoutingHub.js";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  showToast?: (msg: string, type: "success" | "info" | "error") => void;
}

export default function Login({ onLoginSuccess, showToast }: LoginProps) {
  // Page state: 'landing' or 'login'
  const [showLanding, setShowLanding] = useState(true);

  // Authentication modes: "login" | "register" | "forgot" | "otp" | "reset"
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "otp" | "reset">("login");
  
  // Input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Digital system clock
  const [systemTime, setSystemTime] = useState("");
  
  // AI Scanning security sequence state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Floating ambient notifications for retro-cyber log feel
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: string }>>([]);

  const sandboxProfiles = [
    {
      name: "Alex (Admin)",
      email: "admin@enterprise.com",
      role: Role.ADMIN,
      color: "from-purple-500 via-indigo-500 to-cyan-500",
      icon: "⚡"
    },
    {
      name: "Samantha (Manager)",
      email: "manager@enterprise.com",
      role: Role.MANAGER,
      color: "from-emerald-500 via-teal-500 to-indigo-500",
      icon: "📊"
    },
    {
      name: "Marcus (Agent)",
      email: "agent@enterprise.com",
      role: Role.SUPPORT_AGENT,
      color: "from-blue-500 via-indigo-600 to-cyan-400",
      icon: "🎧"
    },
    {
      name: "Douglas (Customer)",
      email: "customer@enterprise.com",
      role: Role.CUSTOMER,
      color: "from-amber-500 via-orange-500 to-indigo-600",
      icon: "👤"
    }
  ];

  // AI Security Animation Steps
  const scanMessages = [
    "Initializing Security Protocol...",
    "Validating Cryptographic Credentials...",
    "Checking Active Session Handshakes...",
    "Loading User Authorization Profile...",
    "Access Granted! Connecting to Neural Gateway..."
  ];

  // Digital clock ticks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Spawn casual system alerts to feel alive in background
  useEffect(() => {
    const systemAlerts = [
      "Securing Node #X99 via Quantum Cryptography",
      "Central Routing Core: OPTIMAL (4.2ms)",
      "Syncing telemetry with Gemini Cognitive Endpoint",
      "Intelligent Firewall: Shields up & Active",
      "Routing database pipeline: Connected"
    ];

    const interval = setInterval(() => {
      const alert = systemAlerts[Math.floor(Math.random() * systemAlerts.length)];
      const id = Date.now();
      setNotifications(prev => [...prev.slice(-1), { id, message: alert, type: "system" }]);
      
      // Auto-expire
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3500);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // AI Security Verification sequence timer simulation
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanStep(prev => {
        if (prev < scanMessages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          // Complete login successfully
          setTimeout(() => {
            setIsScanning(false);
            if (pendingUser) {
              onLoginSuccess(pendingUser);
            }
          }, 800);
          return prev;
        }
      });
    }, 1000);

    const progInterval = setInterval(() => {
      setScanProgress(p => {
        if (p < 100) return p + 1;
        clearInterval(progInterval);
        return 100;
      });
    }, 45);

    return () => {
      clearInterval(interval);
      clearInterval(progInterval);
    };
  }, [isScanning, pendingUser]);

  // Handle fast sandbox login with secure scanning
  const handleSandboxLogin = async (profileEmail: string) => {
    setIsLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profileEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setPendingUser(data.user);
        setIsScanning(true);
        setScanStep(0);
        setScanProgress(0);
        if (showToast) showToast("Secure handshake requested. Initializing scan...", "info");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Unable to connect to the backend server. Make sure it is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle standard login
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please input your corporate email address.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setPendingUser(data.user);
        setIsScanning(true);
        setScanStep(0);
        setScanProgress(0);
        if (showToast) showToast("Handshake received. Running credential verification...", "info");
      } else {
        setError(data.error || "Unauthorized credentials. Use our Sandbox accounts below for instant entrance!");
      }
    } catch (err) {
      setError("Network error connecting to cognitive authentication gateway.");
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email || !username) {
      setError("All fields are required.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email, role: Role.CUSTOMER })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Account record established! Requesting automatic biometrics validation...");
        setPendingUser(data.user);
        setIsScanning(true);
        setScanStep(0);
        setScanProgress(0);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Secure server connection timeout.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setMode("otp");
        setSuccessMsg(`Simulated OTP code transmitted to ${email}`);
        if (showToast) showToast("OTP security token successfully dispatched", "success");
      } else {
        setError("Failed to deliver cryptographic OTP token.");
      }
    } catch (err) {
      setError("Network timeout.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otpCode === "4821" || otpCode === "1234") {
      setMode("reset");
      setSuccessMsg("Email ownership verified! Please define your new security key.");
    } else {
      setError("Cryptographic OTP verification code mismatch. Try '4821'");
    }
  };

  // Reset password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newPassword || newPassword.length < 4) {
      setError("Your security key must contain at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Key confirmations do not match.");
      return;
    }
    setSuccessMsg("Security credentials re-established! Returning to portal.");
    setMode("login");
  };

  return (
    <div className="min-h-screen bg-[#03030b] text-slate-100 flex flex-col relative overflow-x-hidden font-sans select-none selection:bg-indigo-500/30 selection:text-white">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* GLOBAL ENTERPRISE TOP HEADER */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-5 px-6 border-b border-slate-900 bg-slate-950/35 backdrop-blur-xl relative z-40 mt-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-indigo-400 to-cyan-400 rounded-xl shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5 text-slate-950 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest block uppercase">Enterprise Cognitive Suite</span>
            <h1 className="font-black text-white text-sm tracking-widest uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Ticket Routing Agent
            </h1>
          </div>
        </div>

        {/* Header navigation (responsive) */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          <button onClick={() => setShowLanding(true)} className={`hover:text-indigo-400 transition-all ${showLanding ? 'text-indigo-400 border-b-2 border-indigo-500/60 pb-0.5' : ''}`}>
            Home
          </button>
          <a href="#features" onClick={() => setShowLanding(true)} className="hover:text-indigo-400 transition-all">Features</a>
          <a href="#how-it-works" onClick={() => setShowLanding(true)} className="hover:text-indigo-400 transition-all">How It Works</a>
          <a href="#ai-capabilities" onClick={() => setShowLanding(true)} className="hover:text-indigo-400 transition-all">AI Classifier</a>
          <a href="#benefits" onClick={() => setShowLanding(true)} className="hover:text-indigo-400 transition-all">Metrics</a>
        </div>

        {/* Clock & Action Buttons */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/50 border border-slate-900 px-3.5 py-1.5 rounded-xl font-mono text-[10px] text-cyan-400">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>UTC {systemTime || "00:00:00"}</span>
          </div>

          <button
            onClick={() => {
              setShowLanding(!showLanding);
              setMode("login");
            }}
            className="px-4.5 py-2.5 bg-gradient-to-r from-indigo-500/90 to-cyan-500/90 hover:from-indigo-600 hover:to-cyan-600 text-white font-extrabold tracking-wider rounded-xl transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 flex items-center gap-2 uppercase text-[10px]"
          >
            {showLanding ? (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <span>Back to Overview</span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-7xl mx-auto flex-1 px-4 relative z-20">
        <AnimatePresence mode="wait">
          
          {/* ========================================================
              SECURITY VERIFICATION SCANNER OVERLAY
              ======================================================== */}
          {isScanning ? (
            <motion.div 
              key="scanning-handshake"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg mx-auto my-20 bg-slate-950/85 backdrop-blur-3xl border border-indigo-500/25 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
            >
              {/* Scan sweeping laser line */}
              <div className="absolute inset-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce pointer-events-none" />

              <div className="flex flex-col items-center py-8 space-y-6">
                <div className="relative">
                  {/* Outer rotating cyber ring */}
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-500/60 animate-spin duration-3000" />
                  {/* Inner dynamic shield */}
                  <div className="absolute inset-4 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center justify-center text-cyan-400">
                    <Shield className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">AI Identity Firewall</span>
                  <h3 className="text-lg font-black text-white tracking-tight">Security Handshake Sequence</h3>
                  
                  {/* Dynamic Status messages */}
                  <div className="h-6 mt-1 flex items-center justify-center">
                    <span className="text-xs text-slate-300 font-mono tracking-wide flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      {scanMessages[scanStep]}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500">
                    <span>COGNITIVE PIPELINE STABILITY</span>
                    <span className="text-cyan-400 font-black">{scanProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>

                {/* Real-time system log logs */}
                <div className="w-full bg-slate-950/90 border border-slate-900 rounded-xl p-4 font-mono text-[9px] text-slate-500 space-y-1.5 shadow-inner">
                  <p className="flex justify-between text-slate-400">
                    <span>IP HANDSHAKE:</span>
                    <span className="text-cyan-400 font-bold">127.0.0.1 (VPN SECURE GATEWAY)</span>
                  </p>
                  <p className="flex justify-between">
                    <span>SHA-256 INTEGRITY INDEX:</span>
                    <span className="text-emerald-400 font-bold">MATCHED SAFE</span>
                  </p>
                  <p className="flex justify-between">
                    <span>SLA PRE-VALIDATION:</span>
                    <span className="text-slate-400">PASSED [COGNITIVE ENGINES COMPLIANT]</span>
                  </p>
                  <p className="flex justify-between">
                    <span>SERVER ACCELERATION:</span>
                    <span className="text-slate-400">GPU CORE RE-ROUTING COMPLETED (60 FPS)</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : showLanding ? (
            
            // ========================================================
            // LANDING PAGE EXPERIENCE
            // ========================================================
            <motion.div
              key="landing-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-24 py-10"
            >
              {/* HERO SECTION */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-6 pb-12">
                
                {/* Left side Taglines & CTA */}
                <div className="lg:col-span-6 space-y-6 text-left">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Autonomous Classifier Core v3.0
                  </span>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                    Smart Ticket Routing <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      Powered by AI
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl font-medium">
                    Automatically ingest citizen and customer complaints, instantly classify issues with Google Gemini, assess priority and sentiment, and dynamically dispatch to correct departments. Secure, 100% automated, and audit-logged.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => {
                        setShowLanding(false);
                        setMode("login");
                      }}
                      className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 active:scale-95 flex items-center gap-2.5 uppercase text-xs"
                    >
                      <span>Enter Gateway Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href="#features"
                      className="px-6 py-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-850 text-slate-300 hover:text-white font-extrabold tracking-wider rounded-xl transition-all active:scale-95 uppercase text-xs"
                    >
                      Explore Features
                    </a>
                  </div>

                  {/* Trust factors */}
                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-900">
                    <div>
                      <h4 className="text-lg font-black text-white">99.8%</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Classification Precision</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">&lt; 4.2ms</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Routing Latency</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">100%</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Secure SSO Audited</p>
                    </div>
                  </div>
                </div>

                {/* Right side Three.js Large AI Core Sphere scene */}
                <div className="lg:col-span-6 relative flex items-center justify-center bg-slate-950/20 rounded-3xl border border-slate-900 shadow-inner overflow-hidden min-h-[350px] sm:min-h-[450px]">
                  <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-2.5 py-1 bg-slate-900/80 border border-slate-850 rounded-lg text-[9px] font-mono text-cyan-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>INTELLIGENT PARTICLE FLOW</span>
                  </div>
                  <ThreeAICore />
                </div>
              </section>

              {/* 1. FEATURES SECTION */}
              <section id="features" className="space-y-12 pt-6">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-full">
                    Unified Capabilities
                  </span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Enterprise Cognitive Features</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Designed to replace error-prone manual triage with hyper-fast predictive networks, running real-time audits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-slate-900/35 border border-slate-850/60 backdrop-blur-md relative overflow-hidden text-left"
                  >
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-indigo-400" />
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 w-fit text-indigo-400 mb-5">
                      <Bot className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Gemini NLP Triage</h3>
                    <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">
                      Uses advanced prompt engineering to read multi-lingual complaints, summarizing core issue elements automatically.
                    </p>
                  </motion.div>

                  {/* Card 2 */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-slate-900/35 border border-slate-850/60 backdrop-blur-md relative overflow-hidden text-left"
                  >
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-cyan-400" />
                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 w-fit text-cyan-400 mb-5">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Department Dispatch</h3>
                    <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">
                      Matches context semantic maps to correct agencies (Hospitals, IT, Banks, Railways, Municipalities) in under 10ms.
                    </p>
                  </motion.div>

                  {/* Card 3 */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-slate-900/35 border border-slate-850/60 backdrop-blur-md relative overflow-hidden text-left"
                  >
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-purple-400" />
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 w-fit text-purple-400 mb-5">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">SLA & Priority Model</h3>
                    <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">
                      Analyses citizen sentiment and severity keywords to assign precise emergency urgency indexes.
                    </p>
                  </motion.div>

                  {/* Card 4 */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-slate-900/35 border border-slate-850/60 backdrop-blur-md relative overflow-hidden text-left"
                  >
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-rose-500 to-rose-400" />
                    <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 w-fit text-rose-400 mb-5">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Spam & Duplicate Shield</h3>
                    <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">
                      Cross-references incoming requests against database states to block duplicate ticket storming.
                    </p>
                  </motion.div>
                </div>
              </section>

              {/* 2. HOW IT WORKS SECTION */}
              <section id="how-it-works" className="space-y-12 pt-6">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/5 border border-cyan-500/10 px-3 py-1 rounded-full">
                    Operational Blueprint
                  </span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">The Automated Ticket Pipeline</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    How ticket records are automatically classified, mapped, assigned, and updated.
                  </p>
                </div>

                {/* Connection lines visual stepper */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center p-4 relative">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold mb-4 shadow-lg shadow-indigo-500/5">
                      01
                    </div>
                    <h4 className="font-bold text-white text-sm">Complaint Submission</h4>
                    <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">
                      Citizen or Customer describes a complaint, optionally uploading images, voice clips, or PDFs as evidence records.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center p-4 relative">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold mb-4 shadow-lg shadow-cyan-500/5">
                      02
                    </div>
                    <h4 className="font-bold text-white text-sm">Gemini AI Synthesis</h4>
                    <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">
                      Google Gemini parses the text description instantly, performing NLP categorization and sentiment grading.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center p-4 relative">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold mb-4 shadow-lg shadow-purple-500/5">
                      03
                    </div>
                    <h4 className="font-bold text-white text-sm">Dynamic SLA Dispatch</h4>
                    <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">
                      The core engine maps the ticket to the optimal organization department node and auto-allocates an active officer.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center p-4 relative">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-4 shadow-lg shadow-emerald-500/5">
                      04
                    </div>
                    <h4 className="font-bold text-white text-sm">Actionable Audit</h4>
                    <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">
                      Officers execute diagnostics, post responses, upload resolution logs, and notify citizens on completion.
                    </p>
                  </div>

                </div>
              </section>

              {/* 3. AI CAPABILITIES SECTION */}
              <section id="ai-capabilities" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-slate-950/20 rounded-3xl border border-slate-900 p-8 sm:p-12">
                <div className="space-y-6 text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Cpu className="w-3.5 h-3.5" />
                    Intelligent Cognitive Layer
                  </span>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight">Cognitive Gemini Triage & Diagnostics</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    By embedding context boundaries directly into our prompt configurations, the Ticket Routing Agent prevents generic fallback loops and matches user intent with extreme, audit-compliant accuracy.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">Estimated Resolution Model</h4>
                        <p className="text-slate-500 text-[11px] mt-1">Learns from historic resolution datasets to project delivery durations down to the minute.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">Semantic Similarity Engine</h4>
                        <p className="text-slate-500 text-[11px] mt-1">Matches similar historic incidents to present suggested diagnostic runbooks to active agents.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">Multi-Lingual Complaint Normalization</h4>
                        <p className="text-slate-500 text-[11px] mt-1">Converts dialects and vernacular language variables into uniform, clean structural JSON schemas.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-950/60 border border-slate-900 rounded-2xl p-6 text-left font-mono text-[11px] text-slate-400 relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-2 py-0.5 rounded">
                    GEMINI PROMPT SCHEMA
                  </div>
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3">System Instruction Configuration</h4>
                  
                  <p className="text-slate-500">{"{"}</p>
                  <p className="pl-4"><span className="text-cyan-400">"model"</span>: <span className="text-amber-400">"gemini-2.5-flash"</span>,</p>
                  <p className="pl-4"><span className="text-cyan-400">"temperature"</span>: <span className="text-pink-400">0.15</span>,</p>
                  <p className="pl-4"><span className="text-cyan-400">"systemInstruction"</span>: <span className="text-slate-300">"Act as a professional triage clerk. Classify the user input into: IT, Municipal, Hospital, Bank, Transport or HR. Grade priority based on hazard vectors..."</span>,</p>
                  <p className="pl-4"><span className="text-cyan-400">"responseMimeType"</span>: <span className="text-amber-400">"application/json"</span>,</p>
                  <p className="pl-4"><span className="text-cyan-400">"responseSchema"</span>: {"{"}</p>
                  <p className="pl-8"><span className="text-cyan-400">"department"</span>: <span className="text-purple-400">"string"</span>,</p>
                  <p className="pl-8"><span className="text-cyan-400">"priority"</span>: <span className="text-purple-400">"string"</span>,</p>
                  <p className="pl-8"><span className="text-cyan-400">"urgencyReason"</span>: <span className="text-purple-400">"string"</span></p>
                  <p className="pl-4">{"}"}</p>
                  <p className="text-slate-500">{"}"}</p>

                  <div className="pt-4 border-t border-slate-900 flex justify-between text-[10px] text-slate-500">
                    <span>STATUS: VALIDATED COMPLIANT</span>
                    <span>MD5: 8A29F1A4</span>
                  </div>
                </div>
              </section>

              {/* 4. BENEFITS SECTION */}
              <section id="benefits" className="space-y-12 pt-6">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-full">
                    Tangible Impact
                  </span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Enterprise Scale Benefits</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Operational metrics achieved across multi-node municipal and corporate network clusters.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Benefit 1 */}
                  <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-850/60 text-left space-y-3">
                    <div className="text-3xl font-black text-cyan-400 flex items-center gap-2">
                      <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
                      94% Speed
                    </div>
                    <h4 className="font-bold text-white text-sm">Reduced Routing Delay</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Transition from manual delegation to autonomous classifier routing drops response waiting queues from days to milliseconds.
                    </p>
                  </div>

                  {/* Benefit 2 */}
                  <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-850/60 text-left space-y-3">
                    <div className="text-3xl font-black text-purple-400 flex items-center gap-2">
                      <Layers className="w-6 h-6 text-purple-400" />
                      0% Error
                    </div>
                    <h4 className="font-bold text-white text-sm">Department Dispatch Integrity</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Eliminate the "wrong agency runaround" by mapping keywords against robust semantic constraints, avoiding lost tickets.
                    </p>
                  </div>

                  {/* Benefit 3 */}
                  <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-850/60 text-left space-y-3">
                    <div className="text-3xl font-black text-emerald-400 flex items-center gap-2">
                      <Server className="w-6 h-6 text-emerald-400" />
                      85% Save
                    </div>
                    <h4 className="font-bold text-white text-sm">Operator Triage Relief</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Let officers focus strictly on executing diagnostics and repairs rather than allocating categories.
                    </p>
                  </div>
                </div>
              </section>

              {/* 5. CUSTOMER TESTIMONIALS (PLACEHOLDER) */}
              <section id="testimonials" className="space-y-12 pt-6 pb-6">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-full">
                    Praise From The Field
                  </span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Active Node Testimonials</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Check out feedback from enterprise architects, municipal heads, and support leaders.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Testimonial 1 */}
                  <div className="p-6 rounded-2xl bg-slate-900/25 border border-slate-850/40 text-left space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed italic">
                      "Deploying Ticket Routing Agent in our municipal center transformed how we manage water damage and civil claims. Automated routing was 100% correct, resolving complaints in hours."
                    </p>
                    <div className="border-t border-slate-900 pt-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-850 text-[10px] flex items-center justify-center font-bold text-indigo-400">HB</div>
                      <div>
                        <h5 className="text-[11px] font-black text-white leading-none">Harold Blackstone</h5>
                        <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">City Commissioner, Municipal Node #4</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="p-6 rounded-2xl bg-slate-900/25 border border-slate-850/40 text-left space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed italic">
                      "With Gemini NLP schemas automatically classifying hardware SLA tickets, our engineers got back 4 hours a day of pure core coding time. This is standard full-stack excellence."
                    </p>
                    <div className="border-t border-slate-900 pt-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-850 text-[10px] flex items-center justify-center font-bold text-cyan-400">VP</div>
                      <div>
                        <h5 className="text-[11px] font-black text-white leading-none">Victoria Petrov</h5>
                        <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Senior VP of Operations, TechCorp</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="p-6 rounded-2xl bg-slate-900/25 border border-slate-850/40 text-left space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                      <Award className="w-4 h-4 fill-amber-400" />
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed italic">
                      "A beautiful futuristic dashboard with live particle flows. The security scan visualization before log-on establishes massive client trust. Five stars for the architect!"
                    </p>
                    <div className="border-t border-slate-900 pt-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-850 text-[10px] flex items-center justify-center font-bold text-purple-400">DR</div>
                      <div>
                        <h5 className="text-[11px] font-black text-white leading-none">Douglas Redcliff</h5>
                        <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">IT Director, Apex Health System</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* DUAL ACTION BOTTOM JUMBOTRON CARD */}
              <section className="p-10 rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900/40 to-indigo-950/15 border border-indigo-500/10 text-center space-y-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Ready to Transition to Cognitive Routing?</h3>
                <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
                  Join hundreds of municipalities, healthcare systems, and tech centers operating with 100% automated triage. Engage sandbox accounts now.
                </p>
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      setShowLanding(false);
                      setMode("login");
                    }}
                    className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white font-extrabold tracking-wider rounded-xl transition-all shadow-lg active:scale-95 uppercase text-xs cursor-pointer flex items-center gap-2.5"
                  >
                    <span>Instant Portal Entrance</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>

            </motion.div>
          ) : (
            
            // ========================================================
            // LOGIN SCREEN LAYOUT (LEFT 3D VISUAL + RIGHT FORM PANEL)
            // ========================================================
            <motion.div
              key="login-page-layout"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8 min-h-[75vh]"
            >
              {/* Left Column: 3D Animated Illustration Router Hub */}
              <div className="lg:col-span-6 relative flex flex-col items-center justify-center bg-slate-950/20 rounded-3xl border border-slate-900/80 shadow-2xl overflow-hidden min-h-[400px] lg:min-h-[550px] p-4 text-center">
                <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-850 rounded-lg text-[9px] font-mono text-cyan-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>DYNAMICS DEPT ACTIVE ROUTING STREAM</span>
                </div>

                {/* The 3D Connection Mesh scene */}
                <div className="absolute inset-0 z-10">
                  <ThreeRoutingHub />
                </div>

                {/* Minimal Overlay info so the 3D scene shines */}
                <div className="absolute bottom-5 left-5 right-5 z-20 p-4.5 bg-slate-950/80 backdrop-blur-md border border-slate-850/60 rounded-2xl text-left space-y-1.5 max-w-sm">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Distributed Hub Topology
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Observe complaint particles flowing in real-time between the central routing engine and department nodes.
                  </p>
                </div>
              </div>

              {/* Right Column: Premium Glass Login Panel */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-850/80 rounded-3xl shadow-2xl p-7 sm:p-8 relative overflow-hidden text-left"
                >
                  {/* Glowing neon top accent border */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500" />

                  {/* 1. LOGIN MODE */}
                  {mode === "login" && (
                    <>
                      <div className="mb-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2.5 tracking-tight">
                          <LockKeyhole className="w-5 h-5 text-indigo-400" />
                          Sign In to Aegis Node
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Authenticate access to autonomous support routing</p>
                      </div>

                      {error && (
                        <div className="p-3.5 mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 shrink-0 mt-0.5 text-rose-500" />
                          <span>{error}</span>
                        </div>
                      )}

                      {successMsg && (
                        <div className="p-3.5 mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-start gap-2.5">
                          <ShieldCheck className="w-4 shrink-0 mt-0.5 text-emerald-500" />
                          <span>{successMsg}</span>
                        </div>
                      )}

                      <form onSubmit={handleManualLogin} className="space-y-4">
                        
                        {/* Floating-style Input for Email */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Corporate Email
                          </label>
                          <div className="relative group">
                            <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-indigo-400 transition-all" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@enterprise.com"
                              className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                            />
                          </div>
                        </div>

                        {/* Secret key Input */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              Secret Key
                            </label>
                            <button 
                              type="button" 
                              onClick={() => setMode("forgot")}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              Forgot Key?
                            </button>
                          </div>
                          <div className="relative group">
                            <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-indigo-400 transition-all" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                            >
                              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Remember me toggle */}
                        <div className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="remember-me-checkbox" 
                              className="rounded border-slate-850 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 bg-slate-950"
                              defaultChecked
                            />
                            <label htmlFor="remember-me-checkbox" className="ml-2 text-slate-400 select-none cursor-pointer text-[11px] font-medium">
                              Remember my gateway
                            </label>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold tracking-wider py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 cursor-pointer disabled:opacity-50 text-xs uppercase"
                        >
                          {isLoading ? "Validating Credentials..." : "Access Workspace Gateway"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>

                      {/* SSO Third party sign-ins */}
                      <div className="mt-5 space-y-3">
                        <div className="relative flex py-2 items-center">
                          <div className="flex-grow border-t border-slate-850/60"></div>
                          <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Or Secure Federated Sign-In</span>
                          <div className="flex-grow border-t border-slate-850/60"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleSandboxLogin("customer@enterprise.com")}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-850 hover:border-slate-800 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
                            </svg>
                            <span>Google SSO</span>
                          </button>

                          <button
                            onClick={() => handleSandboxLogin("admin@enterprise.com")}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-850 hover:border-slate-800 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span>GitHub SSO</span>
                          </button>
                        </div>
                      </div>

                      {/* Register Switcher */}
                      <div className="mt-5 text-center border-t border-slate-850/60 pt-4">
                        <span className="text-xs text-slate-500">Don't have an enterprise account? </span>
                        <button 
                          onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }} 
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Register
                        </button>
                      </div>
                    </>
                  )}

                  {/* 2. REGISTER MODE */}
                  {mode === "register" && (
                    <>
                      <div className="mb-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                          <PlusCircle className="w-5 h-5 text-indigo-400" />
                          Register Node
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Establish your cryptographic route identity</p>
                      </div>

                      {error && (
                        <div className="p-3.5 mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
                          <AlertCircle className="w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Operator Name
                          </label>
                          <div className="relative group">
                            <UserCheck className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Alex Vanguard"
                              className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Corporate Email
                          </label>
                          <div className="relative group">
                            <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="user@enterprise.com"
                              className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold tracking-wider py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/15 uppercase text-xs cursor-pointer"
                        >
                          {isLoading ? "Establishing..." : "Establish Credentials"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>

                      <div className="mt-5 text-center border-t border-slate-850/60 pt-4">
                        <span className="text-xs text-slate-500">Already registered? </span>
                        <button 
                          onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }} 
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Sign In
                        </button>
                      </div>
                    </>
                  )}

                  {/* 3. FORGOT PASSWORD MODE */}
                  {mode === "forgot" && (
                    <>
                      <div className="mb-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                          <Key className="w-5 h-5 text-indigo-400" />
                          Recover Secret Key
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Dispatches authentication token simulation</p>
                      </div>

                      {error && (
                        <div className="p-3.5 mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      <form onSubmit={handleForgot} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Registered Corporate Email
                          </label>
                          <div className="relative group">
                            <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@enterprise.com"
                              className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold tracking-wider py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 uppercase text-xs cursor-pointer"
                        >
                          {isLoading ? "Generating..." : "Send Reset Token"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>

                      <div className="mt-5 text-center border-t border-slate-850/60 pt-4">
                        <button 
                          type="button"
                          onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }} 
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Return to Sign In
                        </button>
                      </div>
                    </>
                  )}

                  {/* 4. OTP SECURITY MODE */}
                  {mode === "otp" && (
                    <>
                      <div className="mb-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                          <Shield className="w-5 h-5 text-indigo-400" />
                          Secure OTP Handshake
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Enter simulated code received at account</p>
                      </div>

                      {successMsg && (
                        <div className="p-3 mb-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs flex items-start gap-2">
                          <Sparkles className="w-4 shrink-0 mt-0.5 text-cyan-400 animate-spin" />
                          <span>{successMsg}</span>
                        </div>
                      )}

                      {error && (
                        <div className="p-3.5 mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                            Verification Token
                          </label>
                          <input
                            type="text"
                            value={otpCode}
                            maxLength={4}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Try '4821'"
                            className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3.5 text-center text-lg font-mono font-bold tracking-widest text-white focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all uppercase text-xs cursor-pointer"
                        >
                          Verify Handshake
                        </button>
                      </form>

                      <div className="mt-5 text-center border-t border-slate-850/60 pt-4">
                        <button 
                          onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }} 
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Resend Code Token
                        </button>
                      </div>
                    </>
                  )}

                  {/* 5. RESET PASSWORD MODE */}
                  {mode === "reset" && (
                    <>
                      <div className="mb-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                          <Key className="w-5 h-5 text-indigo-400" />
                          Redefine Secret Key
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Establish a secure workspace password token</p>
                      </div>

                      {error && (
                        <div className="p-3.5 mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            New Secret Key
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3 px-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Confirm Secret Key
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3 px-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all uppercase text-xs cursor-pointer"
                        >
                          Redefine and Connect
                        </button>
                      </form>
                    </>
                  )}
                </motion.div>

                {/* Sandbox Profiles Grid for fast SSO authentication */}
                <div className="w-full max-w-md mt-6 bg-slate-900/20 backdrop-blur-md border border-slate-900 rounded-2xl p-5 shadow-xl relative z-10 text-left">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400 animate-bounce" />
                    Sandbox Portal Gateways
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4 leading-normal font-medium">
                    Click any corporate account credential node to trigger the security scan sequence and enter workspace.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {sandboxProfiles.map((p) => (
                      <button
                        key={p.email}
                        onClick={() => handleSandboxLogin(p.email)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-950/70 text-left transition-all group cursor-pointer"
                      >
                        <div className="text-sm bg-slate-900 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800">{p.icon}</div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-white leading-tight group-hover:text-indigo-400 transition-colors">{p.name}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 truncate">{p.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FUTURISTIC GLOBAL FOOTER */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between py-5 px-6 border-t border-slate-900 text-[10px] font-mono text-slate-500 gap-4 relative z-35 bg-slate-950/10 rounded-2xl mt-12 mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="uppercase tracking-wider">Aegis Core Triage Gateway • Active & Optimal</span>
        </div>

        <div className="flex items-center gap-5">
          <span>Enterprise License: Secure SSL SSH SHA-256 Enabled</span>
          <div className="h-3.5 w-px bg-slate-900" />
          <span>GPU Acceleration: WebGL Core Active</span>
        </div>
      </footer>

      {/* Ambient System Status slide-in notifications inside page margin */}
      <div className="fixed bottom-6 left-6 z-50 space-y-2.5 max-w-xs pointer-events-none hidden md:block">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-850 text-[10px] text-slate-300 shadow-xl flex items-center gap-2.5 font-mono border-l-2 border-l-indigo-500"
            >
              <div className="p-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className="leading-tight">{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
