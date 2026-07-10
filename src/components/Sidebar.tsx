/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Ticket, 
  LayoutDashboard, 
  Bot, 
  Settings, 
  Activity, 
  LogOut, 
  UserCheck, 
  Users, 
  ShieldAlert,
  Brain,
  FileCode,
  ShoppingCart
} from "lucide-react";
import { Role, User } from "../types.js";

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onRoleSwitch: (role: Role) => void;
  notificationCount: number;
}

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  onRoleSwitch,
  notificationCount
}: SidebarProps) {
  
  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ];

    if (currentUser.role === Role.CUSTOMER) {
      baseItems.push(
        { id: "my-tickets", label: "My Tickets", icon: Ticket },
        { id: "kb", label: "Knowledge Base", icon: Brain }
      );
    }

    if (currentUser.role === Role.SUPPORT_AGENT) {
      baseItems.push(
        { id: "agent-tickets", label: "My Assigned", icon: Ticket },
        { id: "kb", label: "Knowledge Base", icon: Brain }
      );
    }

    if (currentUser.role === Role.MANAGER) {
      baseItems.push(
        { id: "manager-analytics", label: "Analytics Hub", icon: Activity },
        { id: "agent-workload", label: "Workload Tracker", icon: Users }
      );
    }

    if (currentUser.role === Role.ADMIN) {
      baseItems.push(
        { id: "admin-users", label: "User Accounts", icon: Users },
        { id: "admin-prompt", label: "Prompt Engineering", icon: Sliders },
        { id: "admin-logs", label: "Audit & Logs", icon: ShieldAlert },
        { id: "admin-metrics", label: "System Latency", icon: Activity }
      );
    }

    // Always include commerce integration for operational roles
    if (currentUser.role === Role.ADMIN || currentUser.role === Role.MANAGER || currentUser.role === Role.SUPPORT_AGENT) {
      baseItems.push(
        { id: "commerce-sync", label: "Unified Commerce", icon: ShoppingCart }
      );
    }

    // Always include developer deliverables
    baseItems.push({ id: "deliverables", label: "Export Enterprise Code", icon: FileCode });

    return baseItems;
  };

  const Sliders = Settings; // Fallback alias

  return (
    <aside className="w-80 h-screen bg-slate-950/30 backdrop-blur-xl text-slate-200 flex flex-col border-r border-indigo-500/10 shrink-0 relative z-30 shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
      {/* Brand Logo */}
      <div className="p-6 border-b border-indigo-500/10 flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse">
          <Bot className="w-6 h-6 text-indigo-400 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wider text-white">
            AEGIS <span className="text-cyan-400 font-normal text-glow-cyan">AI</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">
            Cognitive Router
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-5 border-b border-indigo-500/10 bg-slate-950/20 flex items-center gap-4">
        <img 
          src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200"} 
          alt={currentUser.name} 
          className="w-12 h-12 rounded-full border border-indigo-500/30 object-cover shadow-[0_0_15px_rgba(99,102,241,0.25)]"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
          <p className="text-[10px] font-semibold text-slate-400 truncate">{currentUser.email}</p>
          <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
            {currentUser.role}
          </span>
          {currentUser.department && (
            <span className="inline-flex items-center ml-1.5 mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider">
              {currentUser.department}
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5 scrollbar-none">
        <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3.5">
          Routing Modules
        </p>
        {getMenuItems().map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 group text-left border cursor-pointer ${
                isActive 
                  ? "bg-indigo-500/15 text-indigo-300 font-bold border-indigo-500/25 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                  : "text-slate-400 hover:text-white hover:bg-indigo-500/5 border-transparent hover:border-indigo-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                }`} />
                <span className="text-sm tracking-wide font-medium">{item.label}</span>
              </div>
              {item.id === "my-tickets" && notificationCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sandbox Role Switcher */}
      <div className="p-4 border-t border-indigo-500/10 bg-slate-950/40">
        <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-1 mb-2.5 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          SSO COGNITIVE ROLE SWAP
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.values(Role).map((r) => (
            <button
              key={r}
              onClick={() => onRoleSwitch(r)}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate text-center cursor-pointer ${
                currentUser.role === r
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : "bg-slate-950/40 hover:bg-indigo-500/5 text-slate-400 border-indigo-500/5 hover:border-indigo-500/15"
              }`}
            >
              {r.replace(" Support", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-indigo-500/10 flex items-center justify-between bg-slate-950/60">
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 w-full transition-all duration-200 cursor-pointer font-bold tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          <span>EXIT SANDBOX SSO</span>
        </button>
      </div>
    </aside>
  );
}
