/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  LogOut, 
  User as UserIcon, 
  BookOpen, 
  Sparkles, 
  Bot, 
  ShieldAlert, 
  Layers,
  Search,
  CheckCircle,
  Clock,
  HelpCircle
} from "lucide-react";
import Login from "./components/Login.js";
import Sidebar from "./components/Sidebar.js";
import CustomerDashboard from "./components/CustomerDashboard.js";
import AgentDashboard from "./components/AgentDashboard.js";
import ManagerDashboard from "./components/ManagerDashboard.js";
import AdminDashboard from "./components/AdminDashboard.js";
import DeliverablesViewer from "./components/DeliverablesViewer.js";
import CommerceSyncDashboard from "./components/CommerceSyncDashboard.js";
import { User, Ticket, Role, Notification } from "./types.js";

interface ToastState {
  message: string;
  type: "success" | "info" | "error";
  id: number;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Knowledge base list
  const [kbArticles, setKbArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [kbSearch, setKbSearch] = useState("");

  const mainBgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mainMouse, setMainMouse] = useState({ x: 0, y: 0 });
  const [mainTargetMouse, setMainTargetMouse] = useState({ x: 0, y: 0 });
  const [cursorHovering, setCursorHovering] = useState(false);

  // Custom cursor smooth spring interpolation
  useEffect(() => {
    let animId: number;
    const updateMainCursor = () => {
      setMainMouse(prev => {
        const dx = mainTargetMouse.x - prev.x;
        const dy = mainTargetMouse.y - prev.y;
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15
        };
      });
      animId = requestAnimationFrame(updateMainCursor);
    };
    animId = requestAnimationFrame(updateMainCursor);
    return () => cancelAnimationFrame(animId);
  }, [mainTargetMouse]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMainTargetMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Main backdrop 3D canvas stars & digital routing streams effect
  useEffect(() => {
    if (!currentUser) return;
    const canvas = mainBgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize 80 cosmic space particles
    const particles: Array<{ x: number; y: number; z: number; size: number; speed: number; opacity: number; color: string }> = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 200 + 1,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.5 + 0.2,
        color: i % 3 === 0 ? "99, 102, 241" : i % 3 === 1 ? "6, 182, 212" : "168, 85, 247"
      });
    }

    // Active digital routing data packet streams
    const dataStreams: Array<{ x: number; y: number; length: number; speed: number; width: number; opacity: number; color: string }> = [];
    for (let i = 0; i < 8; i++) {
      dataStreams.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.85,
        length: Math.random() * 120 + 80,
        speed: Math.random() * 1.5 + 0.8,
        width: Math.random() * 1.2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        color: i % 2 === 0 ? "rgba(6, 182, 212, " : "rgba(99, 102, 241, "
      });
    }

    let rx = 0, ry = 0;
    const trackLocalMouse = (e: MouseEvent) => {
      rx = (e.clientX - width / 2) * 0.05;
      ry = (e.clientY - height / 2) * 0.05;
    };
    window.addEventListener("mousemove", trackLocalMouse);

    let animationId: number;
    const render = () => {
      ctx.fillStyle = "rgba(7, 10, 18, 0.4)"; // Subtle trail
      ctx.fillRect(0, 0, width, height);

      // Render 3D Perspective Grid
      ctx.strokeStyle = "rgba(99, 102, 241, 0.02)";
      ctx.lineWidth = 0.8;
      const gridHorizon = height * 0.4;
      const perspectiveLines = 16;
      for (let i = 0; i <= perspectiveLines; i++) {
        const ratio = i / perspectiveLines;
        const xStart = width * 0.05 + (width * 0.9) * ratio;
        ctx.beginPath();
        ctx.moveTo(xStart + rx * 0.2, height);
        ctx.lineTo(width / 2 + rx * 0.1, gridHorizon + ry * 0.1);
        ctx.stroke();
      }

      // Stars
      for (let p of particles) {
        p.y += p.speed;
        if (p.y > height) {
          p.y = 0;
          p.x = Math.random() * width;
        }

        // Apply slight mouse lag perspective shifts
        const drawX = p.x + rx * (p.size * 0.05);
        const drawY = p.y + ry * (p.size * 0.05);

        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw horizontal digital scanning lasers
      for (let stream of dataStreams) {
        stream.x += stream.speed;
        if (stream.x - stream.length > width) {
          stream.x = -stream.length;
          stream.y = Math.random() * height * 0.85;
        }

        const grad = ctx.createLinearGradient(stream.x, stream.y, stream.x + stream.length, stream.y);
        grad.addColorStop(0, `${stream.color}0)`);
        grad.addColorStop(0.5, `${stream.color}${stream.opacity})`);
        grad.addColorStop(1, `${stream.color}0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = stream.width;
        ctx.beginPath();
        ctx.moveTo(stream.x + rx * 0.08, stream.y + ry * 0.08);
        ctx.lineTo(stream.x + stream.length + rx * 0.08, stream.y + ry * 0.08);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", trackLocalMouse);
      cancelAnimationFrame(animationId);
    };
  }, [currentUser]);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const fetchKbArticles = async () => {
    try {
      const res = await fetch("/api/kb");
      const data = await res.json();
      if (res.ok) {
        setKbArticles(data.articles || []);
      }
    } catch (err) {
      console.error("Failed to load Knowledge Base articles", err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {}
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Successfully authenticated as ${user.name}!`, "success");
    fetchTickets();
    fetchNotifications();
    fetchKbArticles();
    setActiveMenu("dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setTickets([]);
      setNotifications([]);
      showToast("Safely logged out of SSO session", "info");
    } catch (err) {
      setCurrentUser(null);
    }
  };

  // Poll tickets and notifications occasionally for reactive live interface updates
  useEffect(() => {
    if (currentUser) {
      fetchTickets();
      fetchNotifications();
      fetchKbArticles();

      const handle = setInterval(() => {
        fetchTickets();
        fetchNotifications();
      }, 10000);

      return () => clearInterval(handle);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Animated background highlights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Main logo block */}
        <div className="mb-6 text-center z-10 animate-fade-in font-sans">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl w-fit mx-auto border border-indigo-500/20 shadow-xl shadow-indigo-500/5 mb-4">
            <Bot className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AEGIS COGNITIVE AGENT</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">Enterprise Support Routing & Intelligent Diagnostics Platform</p>
        </div>

        <Login onLoginSuccess={handleLoginSuccess} showToast={showToast} />

        {/* Global Toast render */}
        <div className="fixed bottom-6 right-6 z-50 space-y-2 font-sans">
          {toasts.map(t => (
            <div 
              key={t.id} 
              className={`p-4 rounded-xl text-xs font-bold border shadow-xl flex items-center gap-2 animate-slide-in ${
                t.type === "success" 
                  ? "bg-slate-900 border-emerald-500/20 text-emerald-400" 
                  : t.type === "error"
                    ? "bg-slate-900 border-rose-500/20 text-rose-400"
                    : "bg-slate-900 border-indigo-500/20 text-indigo-400"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${t.type === "success" ? "bg-emerald-400 animate-ping" : t.type === "error" ? "bg-rose-400 animate-ping" : "bg-indigo-400"}`}></div>
              {t.message}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Knowledge Base articles filter
  const filteredKb = kbArticles.filter(art => 
    art.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
    art.content.toLowerCase().includes(kbSearch.toLowerCase()) ||
    art.tags.some((tg: string) => tg.toLowerCase().includes(kbSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#04050d] text-slate-100 flex overflow-hidden select-none font-sans relative">
      
      {/* Immersive 3D Starfield & Data Routing Stream Canvas Background */}
      <canvas 
        ref={mainBgCanvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Cybernetic Glowing Spring Target Cursor */}
      <div 
        className="fixed pointer-events-none z-50 rounded-full border border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-75 ease-out flex items-center justify-center hidden md:flex"
        style={{
          left: `${mainMouse.x}px`,
          top: `${mainMouse.y}px`,
          width: "22px",
          height: "22px",
          transform: `translate(-50%, -50%) scale(${cursorHovering ? 1.4 : 1})`,
          backgroundColor: "rgba(99, 102, 241, 0.12)"
        }}
      >
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
      </div>
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentUser={currentUser}
        activeTab={activeMenu}
        setActiveTab={(m) => {
          setActiveMenu(m);
          setSelectedArticle(null);
        }}
        onLogout={handleLogout}
        onRoleSwitch={(newRole) => {
          const updatedUser = { ...currentUser, role: newRole };
          setCurrentUser(updatedUser);
          showToast(`SSO Overrode Role to ${newRole}`, "info");
          setActiveMenu("dashboard");
        }}
        notificationCount={notifications.filter(n => !n.isRead).length}
      />

      {/* Main portal window wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Global Header */}
        <header className="h-16 border-b border-indigo-500/10 flex items-center justify-between px-8 bg-slate-950/20 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 bg-slate-950/60 border border-slate-850 px-2.5 py-1 rounded-lg tracking-wider">
              SSO SECURE DOMAIN
            </span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3 animate-spin" />
              AEGIS AI SHIELD ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* Notification triggers */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all relative cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              )}
            </button>

            {/* Notification Logs Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-14 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-3.5">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    Notification Logs
                  </h4>
                  <span className="text-[10px] text-slate-500">{notifications.filter(n => !n.isRead).length} new</span>
                </div>

                <div className="space-y-3.5 max-h-64 overflow-y-auto scrollbar-none">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        n.isRead 
                          ? "bg-slate-950/20 border-transparent text-slate-500" 
                          : "bg-slate-950/60 border-slate-850 text-slate-200 hover:border-indigo-500/30"
                      }`}
                    >
                      <p className="font-bold">{n.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[8px] text-slate-600 font-mono mt-1.5 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-center text-slate-500 p-4 font-semibold">No notifications active.</p>
                  )}
                </div>
              </div>
            )}

            {/* User profile identifier widget */}
            <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-850 rounded-xl py-1.5 pl-3 pr-2">
              <div className="text-right">
                <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{currentUser.role}</p>
              </div>
              <img 
                src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin"} 
                alt="" 
                className="w-8 h-8 rounded-full border border-slate-800 object-cover bg-slate-950"
              />
            </div>

            {/* SSO Logout trigger */}
            <button
              onClick={handleLogout}
              className="p-2.5 bg-slate-900/60 hover:bg-slate-900 hover:text-rose-400 border border-slate-850 hover:border-slate-800 rounded-xl text-slate-400 transition-all cursor-pointer"
              title="Logout SSO Session"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>

          </div>
        </header>

        {/* Dynamic Inner Portal Screens router */}
        {activeMenu === "dashboard" && (
          <>
            {currentUser.role === Role.CUSTOMER && (
              <CustomerDashboard 
                currentUser={currentUser} 
                tickets={tickets} 
                onTicketCreated={fetchTickets}
                showToast={showToast}
              />
            )}
            {currentUser.role === Role.SUPPORT_AGENT && (
              <AgentDashboard 
                currentUser={currentUser} 
                tickets={tickets} 
                onTicketUpdated={fetchTickets}
                showToast={showToast}
              />
            )}
            {currentUser.role === Role.MANAGER && (
              <ManagerDashboard 
                tickets={tickets} 
                showToast={showToast}
              />
            )}
            {currentUser.role === Role.ADMIN && (
              <AdminDashboard 
                showToast={showToast}
              />
            )}
          </>
        )}

        {activeMenu === "commerce-sync" && (
          <CommerceSyncDashboard 
            currentUser={currentUser}
            showToast={showToast}
          />
        )}

        {/* Unified Knowledge Base Portal */}
        {activeMenu === "kb" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 overflow-y-auto p-8 flex gap-6 z-10"
          >
            
            {/* List Column */}
            <div className="w-1/3 border-r border-indigo-500/10 pr-6 space-y-4 h-full overflow-y-auto shrink-0 flex flex-col">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400 animate-pulse" />
                  Knowledge Base
                </h2>
                <p className="text-xs text-slate-400 mt-1">Explore troubleshooting procedures and hardware SLA manuals</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search articles or tags..."
                  value={kbSearch}
                  onChange={(e) => setKbSearch(e.target.value)}
                  className="w-full bg-slate-950/40 border border-indigo-500/10 focus:border-indigo-500/40 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none backdrop-blur-md transition-all"
                />
              </div>

              <div className="flex-1 space-y-3.5 pr-1.5 overflow-y-auto scrollbar-none py-1">
                {filteredKb.map(art => (
                  <motion.div
                    whileHover={{ scale: 1.02, x: 2 }}
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      selectedArticle?.id === art.id 
                        ? "glass-card-indigo border-indigo-500/40 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                        : "bg-slate-950/20 hover:bg-slate-950/40 border-indigo-500/5 hover:border-indigo-500/20 text-slate-300"
                    }`}
                  >
                    <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded uppercase tracking-wider">
                      {art.category}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-2.5 leading-snug">{art.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{art.content}</p>
                    <div className="flex gap-1.5 mt-3.5 flex-wrap">
                      {art.tags.map((t: string) => (
                        <span key={t} className="text-[9px] text-slate-500 font-semibold bg-slate-950/60 px-2 py-0.5 rounded border border-indigo-500/5">#{t}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Read Article Details column */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <AnimatePresence mode="wait">
                {selectedArticle ? (
                  <motion.div 
                    key={selectedArticle.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-8 rounded-2xl glass-card-indigo border border-indigo-500/20 shadow-2xl space-y-5 max-w-3xl leading-relaxed animate-float-slow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded uppercase tracking-wider">
                          {selectedArticle.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Views: {selectedArticle.views || 0}</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">ID: KB-{selectedArticle.id.slice(0, 6)}</span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-white tracking-tight text-glow-indigo">{selectedArticle.title}</h3>
                    <div className="border-t border-indigo-500/10 pt-5 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans max-h-[50vh] overflow-y-auto pr-2">
                      {selectedArticle.content}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-16">
                    <motion.div 
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-5 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                    >
                      <BookOpen className="w-10 h-10 text-indigo-400/80" />
                    </motion.div>
                    <p className="text-white font-extrabold text-base tracking-wide">Knowledge Base Reader Standby</p>
                    <p className="text-slate-400 text-xs mt-2.5 max-w-xs leading-relaxed">
                      Select any corporate policy or hardware replacement guide on the left side to review standard SLA operational manuals.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}

        {/* Deliverables Code Exporter */}
        {activeMenu === "deliverables" && (
          <DeliverablesViewer />
        )}

        {/* Custom Toast Container list */}
        <div className="fixed bottom-6 right-6 z-50 space-y-2 font-sans">
          {toasts.map(t => (
            <div 
              key={t.id} 
              className={`p-4 rounded-xl text-xs font-bold border shadow-xl flex items-center gap-2 animate-slide-in ${
                t.type === "success" 
                  ? "bg-slate-900 border-emerald-500/20 text-emerald-400" 
                  : t.type === "error"
                    ? "bg-slate-900 border-rose-500/20 text-rose-400"
                    : "bg-slate-900 border-indigo-500/20 text-indigo-400"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${t.type === "success" ? "bg-emerald-400 animate-ping" : t.type === "error" ? "bg-rose-400 animate-ping" : "bg-indigo-400"}`}></div>
              {t.message}
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
