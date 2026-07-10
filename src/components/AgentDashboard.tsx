/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Clock, 
  Send, 
  Bot, 
  MessageSquare, 
  Sliders, 
  AlertTriangle, 
  UserPlus, 
  Share2, 
  RefreshCw, 
  BookOpen, 
  HelpCircle,
  FileText,
  Paperclip,
  Check,
  Zap,
  Info
} from "lucide-react";
import { Ticket, TicketMessage, TicketStatus, Priority, Department, Role, Attachment } from "../types.js";

interface AgentDashboardProps {
  currentUser: any;
  tickets: Ticket[];
  onTicketUpdated: () => void;
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function AgentDashboard({ 
  currentUser, 
  tickets: initialTickets, 
  onTicketUpdated,
  showToast 
}: AgentDashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Chat & Messaging
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Quick action states
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showTransferDrawer, setShowTransferDrawer] = useState(false);
  const [reassignDept, setReassignDept] = useState<Department | "">("");

  // Re-analyze trigger
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  useEffect(() => {
    setTickets(initialTickets);
    // Maintain active detail focus on refresh
    if (selectedTicket) {
      const updated = initialTickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [initialTickets]);

  const loadTicketMessages = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to load conversation log", err);
    }
  };

  const handleUpdateStatus = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Ticket status updated to ${status}`, "success");
        onTicketUpdated();
      }
    } catch (err) {
      showToast("Error updating ticket properties", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClaimTicket = async () => {
    if (!selectedTicket) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          assignedAgentId: currentUser.id,
          assignedAgentName: currentUser.name,
          status: TicketStatus.ASSIGNED
        })
      });
      if (res.ok) {
        showToast("Ticket successfully claimed and assigned to your work queue.", "success");
        onTicketUpdated();
      }
    } catch (err) {
      showToast("Error claiming ticket", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTransferDepartment = async () => {
    if (!selectedTicket || !reassignDept) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          department: reassignDept,
          assignedAgentId: "", // Unassign when transferred
          assignedAgentName: "",
          status: TicketStatus.OPEN
        })
      });
      if (res.ok) {
        // Record automated message explaining transfer
        await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `🔄 Ticket reassigned from ${selectedTicket.department} to ${reassignDept}. Unassigned from agent.`,
            isInternal: true
          })
        });

        showToast(`Ticket successfully transferred to ${reassignDept} department.`, "success");
        setShowTransferDrawer(false);
        setReassignDept("");
        onTicketUpdated();
      }
    } catch (err) {
      showToast("Transfer operation failed", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsSendingMessage(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText, isInternal: isInternalNote })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...messages, data.message]);
        setReplyText("");
        setIsInternalNote(false);
        onTicketUpdated();
      }
    } catch (err) {
      showToast("Failed to post response", "error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Live trigger prompt-recalibration
  const handleAIReanalyze = async () => {
    if (!selectedTicket) return;
    setIsReanalyzing(true);
    showToast("Re-indexing customer ticket details against AI cognitive routing guidelines...", "info");
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSelectedTicket(data.ticket);
        showToast("Cognitive parameters successfully updated by Gemini!", "success");
        onTicketUpdated();
      }
    } catch (err) {
      showToast("Prompt recalibration error", "error");
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Single-click loads AI Suggested response draft into active text-area
  const loadSuggestedAIDraft = () => {
    if (selectedTicket?.aiSuggestedResponse) {
      setReplyText(selectedTicket.aiSuggestedResponse);
      showToast("AI reply draft loaded into composer window. Feel free to refine before hitting send.", "success");
    } else {
      showToast("No AI Suggested reply found for this ticket.", "error");
    }
  };

  // Filters logic
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "All" || t.priority === filterPriority;
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getStatusBadgeColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case TicketStatus.ASSIGNED: return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case TicketStatus.IN_PROGRESS: return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case TicketStatus.WAITING_FOR_CUSTOMER: return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case TicketStatus.RESOLVED: return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case TicketStatus.CLOSED: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getPriorityBadgeColor = (p: Priority) => {
    switch (p) {
      case Priority.CRITICAL: return "text-rose-400 border-rose-500/20 bg-rose-500/5";
      case Priority.HIGH: return "text-orange-400 border-orange-500/20 bg-orange-500/5";
      case Priority.MEDIUM: return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case Priority.LOW: return "text-indigo-400 border-indigo-500/20 bg-indigo-500/5";
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex bg-transparent relative z-10">
      
      {/* Left Column: Tickets list */}
      <div className="w-1/3 border-r border-indigo-500/10 h-full flex flex-col p-6 overflow-y-auto shrink-0 scrollbar-none backdrop-blur-md">
        <div className="mb-5">
          <h2 className="text-xl font-black text-white tracking-wider text-glow-indigo">Department Queue</h2>
          <p className="text-xs text-slate-400 mt-1">Review tickets allocated to your department queue</p>
        </div>

        {/* Global Filters */}
        <div className="space-y-3 mb-5 border-b border-indigo-500/10 pb-5">
          <input
            type="text"
            placeholder="Search tickets, IDs, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/40 border border-indigo-500/10 focus:border-indigo-500/40 rounded-xl py-2.5 px-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none backdrop-blur-md transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-950/50 border border-indigo-500/10 rounded-xl py-2.5 px-3 text-[11px] font-bold text-slate-400 focus:outline-none cursor-pointer backdrop-blur-md"
            >
              <option value="All" className="bg-slate-950 text-slate-300">All Priorities</option>
              {Object.values(Priority).map(p => (
                <option key={p} value={p} className="bg-slate-950 text-slate-300">{p}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950/50 border border-indigo-500/10 rounded-xl py-2.5 px-3 text-[11px] font-bold text-slate-400 focus:outline-none cursor-pointer backdrop-blur-md"
            >
              <option value="All" className="bg-slate-950 text-slate-300">All Statuses</option>
              {Object.values(TicketStatus).map(s => (
                <option key={s} value={s} className="bg-slate-950 text-slate-300">{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic ticket elements list */}
        <div className="flex-1 space-y-3 pr-1 overflow-y-auto scrollbar-none">
          {filteredTickets.map(ticket => {
            const isSelected = selectedTicket?.id === ticket.id;
            return (
              <div
                key={ticket.id}
                onClick={() => loadTicketMessages(ticket)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative ${
                  isSelected 
                    ? "glass-card-indigo border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                    : "bg-slate-950/20 hover:bg-slate-950/40 border-indigo-500/5 hover:border-indigo-500/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{ticket.id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadgeColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mt-2 truncate leading-snug">
                  {ticket.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal mt-0.5">
                  {ticket.customerName}
                </p>

                <div className="flex items-center justify-between gap-1 mt-3">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityBadgeColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs font-semibold">
              No tickets matched active diagnostic filters.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Ticket details workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedTicket ? (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Conversation Flow Column */}
            <div className="flex-1 flex flex-col h-full p-6 border-r border-slate-800/60 overflow-hidden">
              {/* Header diagnostic */}
              <div className="border-b border-slate-800/60 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white truncate max-w-md">{selectedTicket.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <span className="font-bold text-slate-300">Customer:</span> {selectedTicket.customerName} • {selectedTicket.customerEmail}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.assignedAgentId !== currentUser.id ? (
                    <button
                      onClick={handleClaimTicket}
                      disabled={isActionLoading}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      Claim Ticket
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
                        className="bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs font-semibold text-slate-300 focus:outline-none"
                      >
                        {Object.values(TicketStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => setShowTransferDrawer(true)}
                        className="px-3 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Transfer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description overview */}
              <div className="p-4 bg-slate-950/45 rounded-xl border border-slate-850 mb-4 text-xs text-slate-300 leading-relaxed">
                <p className="font-bold text-indigo-400 uppercase text-[9px] tracking-wider mb-1">Issue Context</p>
                {selectedTicket.description}
              </div>

              {/* Chat log stream */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin py-2">
                {messages.map((m) => {
                  const isUser = m.senderId === currentUser.id;
                  const isSystem = m.senderId === "system-ai";
                  const isNote = m.isInternal;
                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400">{m.senderName}</span>
                        {isNote && (
                          <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-bold">
                            INTERNAL NOTE
                          </span>
                        )}
                        <span className="text-[9px] text-slate-600">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs max-w-md ${
                        isUser 
                          ? "bg-indigo-500 text-slate-950 rounded-tr-none font-medium" 
                          : isNote
                            ? "bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-tl-none font-mono leading-relaxed"
                            : isSystem
                              ? "bg-slate-950 text-slate-300 border border-indigo-500/10 rounded-tl-none font-sans"
                              : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"
                      }`}>
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Composer block */}
              {selectedTicket.assignedAgentId === currentUser.id ? (
                <form onSubmit={handleSendMessage} className="border-t border-slate-800/60 pt-4 space-y-3">
                  
                  {/* Public Reply vs Internal Note toggle tabs */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(false)}
                        className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                          !isInternalNote 
                            ? "bg-slate-950 text-indigo-400 border-indigo-500/20" 
                            : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
                        }`}
                      >
                        Public Response
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(true)}
                        className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                          isInternalNote 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                            : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
                        }`}
                      >
                        Internal Note
                      </button>
                    </div>

                    {/* Loader button suggestion trigger */}
                    <button
                      type="button"
                      onClick={loadSuggestedAIDraft}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 px-2.5 py-1 rounded-lg"
                    >
                      <Bot className="w-3.5 h-3.5 animate-bounce" />
                      Insert AI Suggested Draft
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <textarea
                      placeholder={isInternalNote ? "Compose secure internal diagnostic note (only team visible)..." : "Draft customer reply..."}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="flex-1 bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                    />
                    <button
                      type="submit"
                      disabled={isSendingMessage || !replyText.trim()}
                      className="px-4 bg-indigo-500 hover:bg-indigo-400 text-slate-950 rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="border-t border-slate-800/60 pt-4 text-center">
                  <p className="text-xs text-slate-500 font-semibold mb-2">Claim this ticket to activate response editors and chat utilities.</p>
                  <button
                    onClick={handleClaimTicket}
                    className="py-2.5 px-5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all"
                  >
                    Claim Ticket Operations
                  </button>
                </div>
              )}
            </div>

            {/* AI Assistance Metrics Column */}
            <div className="w-80 h-full p-6 overflow-y-auto shrink-0 space-y-6 bg-slate-950/30">
              
              {/* Cognitive Analysis Card */}
              <div className="p-5 rounded-xl bg-slate-900/40 border border-indigo-500/10 shadow-xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
                
                <div className="flex items-center justify-between mb-4 border-b border-slate-800/40 pb-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    Aegis Co-pilot
                  </h4>
                  <button
                    onClick={handleAIReanalyze}
                    disabled={isReanalyzing}
                    className="text-slate-500 hover:text-indigo-400 p-1 rounded-lg border border-transparent hover:border-slate-800 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? "animate-spin text-indigo-400" : ""}`} />
                  </button>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Confidence Meter</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(selectedTicket.aiConfidenceScore || 0.95) * 100}%` }}></div>
                      </div>
                      <span className="text-[11px] font-bold text-white font-mono">{Math.floor((selectedTicket.aiConfidenceScore || 0.95) * 100)}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Customer Sentiment</p>
                      <p className="text-white font-extrabold mt-1 text-[11px]">{selectedTicket.aiSentiment || "Neutral"}</p>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Urgency Rating</p>
                      <p className="text-amber-400 font-extrabold mt-1 text-[11px]">{selectedTicket.aiUrgency || "Medium"}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Target Response SLA</p>
                    <p className="text-white font-bold text-xs">{selectedTicket.aiSlaHours || 24} hours window</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Est. Resolution: {selectedTicket.aiEstimatedResolutionTime || "1 day"}</p>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 text-[11px] text-slate-400 leading-relaxed">
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Info className="w-3 h-3 text-indigo-400" />
                      Automatic Summary
                    </p>
                    {selectedTicket.aiSummary || "No cognitive summary drafted."}
                  </div>
                </div>
              </div>

              {/* AI Draft Suggestion Box */}
              <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/60 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-white border-b border-slate-800/40 pb-2 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  SSO Draft Suggestion
                </h4>
                {selectedTicket.aiSuggestedResponse ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-slate-950 text-[10px] font-mono leading-relaxed text-slate-300 max-h-36 overflow-y-auto scrollbar-thin border border-slate-850">
                      {selectedTicket.aiSuggestedResponse}
                    </div>
                    <button
                      onClick={loadSuggestedAIDraft}
                      className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow"
                    >
                      Load into Composer
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">No prompt-based draft reply generated.</p>
                )}
              </div>

              {/* Policy/Knowledge base advice */}
              <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/60 shadow-xl">
                <h4 className="text-xs font-bold text-white border-b border-slate-800/40 pb-2 mb-3.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  Recommended Manuals
                </h4>
                <div className="space-y-2">
                  {selectedTicket.aiKnowledgeBaseSuggestions && selectedTicket.aiKnowledgeBaseSuggestions.length > 0 ? (
                    selectedTicket.aiKnowledgeBaseSuggestions.map(title => (
                      <div key={title} className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-lg cursor-pointer transition-colors">
                        <p className="text-[11px] font-bold text-slate-300 leading-snug hover:text-indigo-400 transition-colors">{title}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 bg-slate-950 rounded text-[10px] text-slate-500">
                      No matching articles recommended by AI.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-16">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-full mb-4">
              <Bot className="w-12 h-12 text-slate-600 animate-pulse" />
            </div>
            <p className="text-white font-bold text-lg">Diagnostics Panel Inactive</p>
            <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
              Select any corporate ticket from the left queue to open details, chat stream, claims management, and suggested AI drafts.
            </p>
          </div>
        )}
      </div>

      {/* Slide-out Transfer Department Drawer Overlay */}
      {showTransferDrawer && selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowTransferDrawer(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Transfer Corporate Ticket</h3>
            <p className="text-xs text-slate-400 mb-5">
              Re-route ticket {selectedTicket.id} to another enterprise queue. This will release agent assignment.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Target Department
                </label>
                <select
                  value={reassignDept}
                  onChange={(e) => setReassignDept(e.target.value as Department)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none"
                >
                  <option value="">Choose department...</option>
                  {Object.values(Department).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setShowTransferDrawer(false)}
                  className="px-4 py-2 bg-transparent border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTransferDepartment}
                  disabled={isActionLoading || !reassignDept}
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow cursor-pointer disabled:opacity-40"
                >
                  {isActionLoading ? "Transferring..." : "Complete Transfer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const X = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
