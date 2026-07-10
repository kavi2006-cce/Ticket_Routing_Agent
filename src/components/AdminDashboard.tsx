/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Sliders, 
  ShieldAlert, 
  Activity, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Database, 
  Cpu, 
  Zap, 
  Check, 
  Code,
  Globe,
  Lock,
  Search,
  Bot
} from "lucide-react";
import { User, Role, Department, ActivityLog, SystemMetrics } from "../types.js";

interface AdminDashboardProps {
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function AdminDashboard({ showToast }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  
  // Prompt State
  const [prompt, setPrompt] = useState("");
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  // User Form
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<Role>(Role.SUPPORT_AGENT);
  const [newUserDept, setNewUserDept] = useState<Department | "">("");

  // Search Logs
  const [logSearch, setLogSearch] = useState("");

  const loadAdminData = async () => {
    try {
      // Load Users
      const userRes = await fetch("/api/admin/users");
      const userData = await userRes.json();
      setUsers(userData.users || []);

      // Load Prompt
      const promptRes = await fetch("/api/admin/prompt");
      const promptData = await promptRes.json();
      setPrompt(promptData.prompt || "");

      // Load Logs
      const logsRes = await fetch("/api/admin/logs");
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);

      // Load Metrics
      const metricsRes = await fetch("/api/admin/metrics");
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);
    } catch (err) {
      console.error("Admin data loading error", err);
    }
  };

  useEffect(() => {
    loadAdminData();

    // Set up rapid telemetry polling interval (every 3 seconds) for responsive metrics heartbeat
    const handle = setInterval(async () => {
      try {
        const metricsRes = await fetch("/api/admin/metrics");
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      } catch (err) {}
    }, 3000);

    return () => clearInterval(handle);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      showToast("All user profile parameters are required.", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          department: newUserDept || undefined
        })
      });
      if (res.ok) {
        showToast(`User ${newUserName} successfully provisioned!`, "success");
        setNewUserName("");
        setNewUserEmail("");
        setNewUserDept("");
        setShowAddUser(false);
        loadAdminData();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to create user", "error");
      }
    } catch (err) {
      showToast("Server connection error", "error");
    }
  };

  const handleUpdateUserStatus = async (id: string, status: "Active" | "Inactive") => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`User status modified to ${status}`, "success");
        loadAdminData();
      }
    } catch (err) {
      showToast("Failed to modify user parameters", "error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to de-provision this user account?")) {
      try {
        const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("User successfully deleted from SSO index.", "success");
          loadAdminData();
        }
      } catch (err) {
        showToast("Error deleting user profile", "error");
      }
    }
  };

  const handleSavePrompt = async () => {
    if (!prompt.trim()) return;
    setIsPromptLoading(true);
    try {
      const res = await fetch("/api/admin/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) {
        showToast("Active System prompt rules updated on Express router database.", "success");
        loadAdminData();
      }
    } catch (err) {
      showToast("Error saving prompt template", "error");
    } finally {
      setIsPromptLoading(false);
    }
  };

  // Spectacular prompt recalibrator looping through all system tickets on backend
  const handleSystemRecalibrate = async () => {
    setIsRecalibrating(true);
    showToast("Commencing live system recalibration across all enterprise database records...", "info");
    try {
      // Loop through all active tickets on server-side and trigger re-analyze API
      const ticketsRes = await fetch("/api/tickets");
      const ticketsData = await ticketsRes.json();
      const list = ticketsData.tickets || [];

      for (const t of list) {
        await fetch(`/api/tickets/${t.id}/analyze`, { method: "POST" });
      }

      showToast(`Prompt Recalibration complete! Processed ${list.length} corporate tickets.`, "success");
      loadAdminData();
    } catch (err) {
      showToast("System-wide recalibration error.", "error");
    } finally {
      setIsRecalibrating(false);
    }
  };

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.details.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent font-sans space-y-8 scrollbar-none relative z-10 animate-fade-in">
      
      {/* Top Banner */}
      <div className="border-b border-indigo-500/10 pb-5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider text-glow-indigo">System Administration Command</h2>
          <p className="text-sm text-slate-400">Manage user authorization privileges, configure AI prompt pipelines, and monitor telemetry</p>
        </div>
        <button
          onClick={loadAdminData}
          className="p-2.5 bg-slate-950/60 hover:bg-slate-900 border border-indigo-500/10 hover:border-indigo-500/30 rounded-xl text-slate-300 transition-all cursor-pointer backdrop-blur-md"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin-slow" />
        </button>
      </div>

      {/* Telemetry dials panel */}
      {metrics && (
        <div className="grid grid-cols-4 gap-5">
          
          <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.03] shadow-lg space-y-3">
            <div className="flex justify-between items-center text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">
              <span>Server Processor (CPU)</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <p className="text-3xl font-black text-white">{metrics.cpuUsage}%</p>
              <span className="text-[10px] text-indigo-400 font-extrabold tracking-wider">WORKLOAD</span>
            </div>
            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${metrics.cpuUsage}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.03] shadow-lg space-y-3">
            <div className="flex justify-between items-center text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">
              <span>Memory Buffers (RAM)</span>
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <p className="text-3xl font-black text-white">{metrics.memoryUsage}%</p>
              <span className="text-[10px] text-emerald-400 font-extrabold tracking-wider">CACHE ALLOC</span>
            </div>
            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${metrics.memoryUsage}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.03] shadow-lg space-y-3">
            <div className="flex justify-between items-center text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">
              <span>Database Connection Pool</span>
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <p className="text-3xl font-black text-white">{metrics.dbConnectionPool.active} / {metrics.dbConnectionPool.max}</p>
              <span className="text-[10px] text-indigo-400 font-extrabold tracking-wider">ACTIVE SOCKETS</span>
            </div>
            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${(metrics.dbConnectionPool.active / metrics.dbConnectionPool.max) * 100}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.03] shadow-lg space-y-3">
            <div className="flex justify-between items-center text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">
              <span>API Request Latency</span>
              <Globe className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <p className="text-3xl font-black text-white">{metrics.apiLatencyMs}ms</p>
              <span className="text-[10px] text-amber-400 font-extrabold tracking-wider">AVG PING</span>
            </div>
            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: "25%" }}></div>
            </div>
          </div>

        </div>
      )}

      {/* User accounts list & AI Prompt editor side by side */}
      <div className="grid grid-cols-2 gap-6 relative z-10">
        
        {/* User Account Controls */}
        <div className="p-6 rounded-2xl glass-card border border-indigo-500/10 shadow-2xl flex flex-col h-[480px]">
          <div className="border-b border-indigo-500/10 pb-3.5 mb-4 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-indigo-400" />
                SSO Identity Privileges
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Authorizations & Department indexes</p>
            </div>

            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="p-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(99,102,241,0.2)]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Add User
            </button>
          </div>

          {/* Add User collapsible form */}
          {showAddUser && (
            <form onSubmit={handleCreateUser} className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/10 space-y-3 mb-4 shrink-0 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="bg-slate-900 border border-indigo-500/10 focus:border-indigo-500/30 text-xs text-white p-2 rounded-lg focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="name@enterprise.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="bg-slate-900 border border-indigo-500/10 focus:border-indigo-500/30 text-xs text-white p-2 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="bg-slate-900 border border-indigo-500/10 text-xs text-slate-300 p-2 rounded-lg focus:outline-none cursor-pointer"
                >
                  {Object.values(Role).map(r => (
                    <option key={r} value={r} className="bg-slate-950 text-slate-300">{r}</option>
                  ))}
                </select>

                <select
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value as Department)}
                  className="bg-slate-900 border border-indigo-500/10 text-xs text-slate-300 p-2 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-950 text-slate-300">No Department</option>
                  {Object.values(Department).map(d => (
                    <option key={d} value={d} className="bg-slate-950 text-slate-300">{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-1">
                <button type="button" onClick={() => setShowAddUser(false)} className="text-slate-500 hover:text-white px-2 py-1">Cancel</button>
                <button type="submit" className="bg-indigo-500 text-slate-950 font-bold px-3 py-1 rounded">Create</button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 scrollbar-none">
            {users.map(u => (
              <div key={u.id} className="p-3 bg-slate-950/40 rounded-xl border border-indigo-500/5 hover:border-indigo-500/15 flex items-center justify-between transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={u.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin"} alt="" className="w-8 h-8 rounded-full border border-indigo-500/20 object-cover bg-slate-900" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-tight">{u.name}</p>
                    <p className="text-[10px] font-semibold text-slate-500 tracking-wider truncate uppercase mt-0.5">{u.role} {u.department ? `• ${u.department}` : ""}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateUserStatus(u.id, u.status === "Active" ? "Inactive" : "Active")}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer ${u.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-slate-800 text-slate-500"}`}
                  >
                    {u.status}
                  </button>
                  {u.id !== "u-admin" && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1 text-slate-600 hover:text-rose-400 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Engineering editor */}
        <div className="p-6 rounded-2xl glass-card border border-indigo-500/10 shadow-2xl flex flex-col h-[480px]">
          <div className="border-b border-indigo-500/10 pb-3.5 mb-4 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-indigo-400" />
                AI Prompt Engineering Console
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Customize active Gemini-3.5 cognitive pipelines</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSavePrompt}
                disabled={isPromptLoading}
                className="px-3 py-1.5 bg-slate-950 border border-indigo-500/10 hover:border-indigo-500/30 text-indigo-400 hover:text-indigo-300 font-bold text-[11px] rounded-lg transition-all cursor-pointer backdrop-blur-md"
              >
                {isPromptLoading ? "Saving..." : "Save Rules"}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-slate-950/80 font-mono text-[10px] p-4 rounded-xl border border-indigo-500/10 focus:border-indigo-500/30 leading-relaxed text-slate-300 focus:outline-none focus:ring-0 resize-none scrollbar-none"
            />

            <button
              onClick={handleSystemRecalibrate}
              disabled={isRecalibrating}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)] cursor-pointer disabled:opacity-50 transition-all uppercase tracking-wider"
            >
              {isRecalibrating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Recalibrating Enterprise Records...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 animate-bounce" />
                  Trigger System-Wide Prompt Recalibration
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Audit Logs list */}
      <div className="p-6 rounded-2xl glass-card border border-indigo-500/10 shadow-2xl flex flex-col h-[320px] relative z-10">
        <div className="border-b border-indigo-500/10 pb-3.5 mb-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
              SSO Security Audit Trail
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Audit log records for network logins, routing edits, and API triggers</p>
          </div>

          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit actions, IP, user name..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full bg-slate-950/60 border border-indigo-500/10 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none backdrop-blur-md transition-all focus:border-indigo-500/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
          {filteredLogs.map(l => (
            <div key={l.id} className="p-2.5 bg-slate-950/40 text-[10px] rounded-lg border border-indigo-500/5 flex items-center justify-between hover:border-indigo-500/15 transition-all">
              <div className="flex items-center gap-4">
                <span className="font-mono text-slate-600 font-bold">{new Date(l.createdAt).toLocaleTimeString()}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                  l.action.includes("LOGIN") ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-slate-900 text-slate-400 border border-slate-850"
                }`}>
                  {l.action}
                </span>
                <span className="text-slate-300 font-bold">{l.userName} ({l.userRole})</span>
                <span className="text-slate-400">{l.details}</span>
              </div>
              <span className="font-mono text-slate-600">{l.ipAddress}</span>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="text-center text-slate-500 text-xs p-6">No matching logs found.</div>
          )}
        </div>
      </div>

    </div>
  );
}
