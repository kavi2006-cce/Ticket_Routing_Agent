/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  Award, 
  Bot, 
  ShieldAlert, 
  RefreshCw,
  HelpCircle,
  FileText
} from "lucide-react";
import { Ticket, TicketStatus, Priority, Department } from "../types.js";

interface ManagerDashboardProps {
  tickets: Ticket[];
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function ManagerDashboard({ tickets, showToast }: ManagerDashboardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (res.ok) {
        setMetrics(data);
      }
    } catch (err) {
      showToast("Error aggregating analytics intelligence", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [tickets]);

  if (isLoading || !metrics) {
    return (
      <div className="flex-1 flex items-center justify-center p-16">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Aggregating enterprise support KPI models...</p>
        </div>
      </div>
    );
  }

  const { summary, departmentDistribution, priorityDistribution, agentPerformance } = metrics;

  // Custom high-precision SVG Chart Dimensions
  const departments = Object.keys(departmentDistribution);
  const deptCounts = Object.values(departmentDistribution) as number[];
  const maxCount = Math.max(...deptCounts, 1);

  // Donut chart parameters
  const priorities = Object.keys(priorityDistribution);
  const priorityCounts = Object.values(priorityDistribution) as number[];
  const totalPriorityCount = priorityCounts.reduce((a, b) => a + b, 0) || 1;

  // Construct color themes
  const priorityColors = {
    Critical: "stroke-rose-500",
    High: "stroke-orange-500",
    Medium: "stroke-amber-500",
    Low: "stroke-indigo-500"
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent font-sans scrollbar-none relative z-10 animate-fade-in">
      
      {/* Header */}
      <div className="mb-8 border-b border-indigo-500/10 pb-5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider text-glow-indigo">Executive Analytics Hub</h2>
          <p className="text-sm text-slate-400">Track SLA thresholds, agent workload metrics, and AI classification analytics</p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2.5 bg-slate-950/60 hover:bg-slate-900 border border-indigo-500/10 hover:border-indigo-500/30 rounded-xl text-slate-300 transition-all cursor-pointer backdrop-blur-md"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
        </button>
      </div>

      {/* KPI summaries cards row */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        
        {/* Total Tickets */}
        <div className="p-6 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 hover:scale-[1.03] flex items-center gap-5 shadow-lg">
          <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Enterprise Volume</p>
            <p className="text-2xl font-black text-white mt-1.5">{summary.total}</p>
            <p className="text-[10px] text-indigo-400 font-bold mt-1">Total routed tickets</p>
          </div>
        </div>

        {/* Resolved SLA */}
        <div className="p-6 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 hover:scale-[1.03] flex items-center gap-5 shadow-lg">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
            <Clock className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Avg Resolution Time</p>
            <p className="text-2xl font-black text-white mt-1.5">{summary.avgResolutionTime}</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-1">SLA compliant window</p>
          </div>
        </div>

        {/* Pending Load */}
        <div className="p-6 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 hover:scale-[1.03] flex items-center gap-5 shadow-lg">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Active Queue Load</p>
            <p className="text-2xl font-black text-white mt-1.5">{summary.pending}</p>
            <p className="text-[10px] text-amber-400 font-bold mt-1">Open & Claimed tickets</p>
          </div>
        </div>

        {/* AI Routing Precision */}
        <div className="p-6 rounded-2xl glass-card border border-indigo-500/15 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.03] flex items-center gap-5 shadow-lg bg-indigo-950/20">
          <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
            <Bot className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">AI Router Accuracy</p>
            <p className="text-2xl font-black text-cyan-400 mt-1.5 text-glow-cyan">{summary.aiAccuracy}%</p>
            <p className="text-[10px] text-indigo-300 font-bold mt-1">Cognitive classification match</p>
          </div>
        </div>

      </div>

      {/* Main analytical charts layouts */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        
        {/* Department Volume Horizontal Chart (SVG Custom Vector) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl col-span-2 space-y-4">
          <div className="border-b border-slate-800/40 pb-3 mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ticket Allocation by Corporate Departments</h3>
            <span className="text-[10px] text-slate-500 font-semibold">Active queue size</span>
          </div>

          <div className="space-y-4">
            {departments.slice(0, 6).map((dept, i) => {
              const count = deptCounts[i];
              const pct = (count / maxCount) * 100;
              return (
                <div key={dept} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-medium">
                    <span>{dept}</span>
                    <span className="font-bold text-white">{count} tickets</span>
                  </div>
                  <div className="h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-850 flex">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500/80 to-emerald-400 rounded-full transition-all duration-500" 
                      style={{ width: `${pct || 4}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority concentric Donut (SVG Vector) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-800/40 pb-3 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Priority Distribution Metric</h3>
          </div>

          {/* Circle Vector construct */}
          <div className="relative flex items-center justify-center h-44">
            <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
              <circle cx="75" cy="75" r="55" className="fill-none stroke-slate-950 stroke-[14]" />
              {/* Dynamic segmented arches construct */}
              {(() => {
                let accumulatedPct = 0;
                return priorities.map((p, i) => {
                  const count = priorityCounts[i];
                  const pct = count / totalPriorityCount;
                  const strokeDash = pct * 345.5; // circumference is 2 * pi * r (2 * 3.1415 * 55 = ~345.5)
                  const strokeOffset = 345.5 - strokeDash;
                  const rotateOffset = accumulatedPct * 360;
                  accumulatedPct += pct;
                  
                  return (
                    <circle
                      key={p}
                      cx="75"
                      cy="75"
                      r="55"
                      className={`fill-none ${priorityColors[p as keyof typeof priorityColors] || "stroke-slate-700"} stroke-[14] transition-all duration-300`}
                      strokeDasharray="345.5"
                      strokeDashoffset={strokeOffset}
                      transform={`rotate(${rotateOffset} 75 75)`}
                    />
                  );
                });
              })()}
            </svg>

            {/* Core textual indicator */}
            <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total SLA</span>
              <span className="text-xl font-extrabold text-white mt-1">{totalPriorityCount}</span>
            </div>
          </div>

          {/* Legand identifiers */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400">
            {priorities.map((p, i) => (
              <div key={p} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${p === "Critical" ? "bg-rose-500" : p === "High" ? "bg-orange-500" : p === "Medium" ? "bg-amber-500" : "bg-indigo-500"}`}></div>
                <span>{p}: {priorityCounts[i]}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Staff work-load telemetry grids */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl space-y-4">
        <div className="border-b border-slate-800/40 pb-3 mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-indigo-400" />
            Support Agent Allocation & Diagnostics
          </h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Agent Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 font-bold tracking-wider uppercase">
                <th className="py-3 px-4">Support Specialist</th>
                <th className="py-3 px-4">Allocated Dept</th>
                <th className="py-3 px-4">Active Tickets</th>
                <th className="py-3 px-4">Resolution Count</th>
                <th className="py-3 px-4 text-right">CSAT Customer Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
              {agentPerformance.map((item: any) => (
                <tr key={item.agentId} className="hover:bg-slate-950/25 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(item.name)}`} 
                      alt="" 
                      className="w-7 h-7 rounded-full border border-slate-800 bg-slate-900"
                    />
                    <span className="font-bold text-white">{item.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                      {item.department || "Technical Support"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{item.assignedCount} Active</td>
                  <td className="py-3 px-4">{item.resolvedCount} Resolved</td>
                  <td className="py-3 px-4 text-right font-mono text-indigo-400 font-bold">★ {item.rating} / 5.0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
