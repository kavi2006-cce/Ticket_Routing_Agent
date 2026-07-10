/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Bot, 
  Paperclip, 
  Download, 
  X,
  FileText,
  Search,
  MessageSquare,
  Sparkles,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";
import { Ticket, TicketMessage, Attachment, TicketHistory, TicketStatus, Priority, Department } from "../types.js";

interface CustomerDashboardProps {
  currentUser: any;
  tickets: Ticket[];
  onTicketCreated: () => void;
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function CustomerDashboard({ 
  currentUser, 
  tickets: initialTickets, 
  onTicketCreated,
  showToast
}: CustomerDashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "detail">("list");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Ticket Creation Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Messaging state
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // File Upload State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Ticket history
  const [ticketHistory, setTicketHistory] = useState<TicketHistory[]>([]);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // AI Assistant Chat Mode
  const [aiChatMode, setAiChatMode] = useState(false);
  const [aiChatLogs, setAiChatLogs] = useState<Array<{ sender: "user" | "ai", text: string, time: string }>>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  // Load ticket messages, attachments, history when ticket is opened
  const loadTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveTab("detail");
    setAiChatMode(false);
    setAiChatLogs([
      {
        sender: "ai",
        text: `Hello Douglas! I am your AI Support Co-pilot. I have auto-classified this ticket to **${ticket.department}** under **${ticket.priority}** priority. Let me know if you want me to help troubleshoot, draft replies, or check policies.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      // Load Messages
      const msgRes = await fetch(`/api/tickets/${ticket.id}/messages`);
      const msgData = await msgRes.json();
      setMessages(msgData.messages || []);

      // Load Attachments
      const attRes = await fetch(`/api/tickets/${ticket.id}/attachments`);
      const attData = await attRes.json();
      setAttachments(attData.attachments || []);

      // Load History
      const histRes = await fetch(`/api/tickets/${ticket.id}/history`);
      const histData = await histRes.json();
      setTicketHistory(histData.history || []);
    } catch (err) {
      console.error("Error loading ticket relations", err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      showToast("Please fill in all ticket parameters", "error");
      return;
    }
    setIsSubmitting(true);
    showToast("Aegis AI Routing Engine analyzing ticket content...", "info");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`AI Router Assigned to ${data.ticket.department} successfully!`, "success");
        setTitle("");
        setDescription("");
        onTicketCreated();
        setActiveTab("list");
      } else {
        showToast(data.error || "Failed to create ticket", "error");
      }
    } catch (err) {
      showToast("Express router gateway unreachable", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedTicket) return;

    setIsSendingMessage(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, isInternal: false })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...messages, data.message]);
        setMessageText("");
        // Reload details to capture potential automated status updates
        const ticketRes = await fetch(`/api/tickets/${selectedTicket.id}`);
        const ticketData = await ticketRes.json();
        setSelectedTicket(ticketData.ticket);
      }
    } catch (err) {
      showToast("Failed to transmit reply", "error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTicket) return;

    // Check size limit: 100MB
    const limit = 100 * 1024 * 1024;
    if (file.size > limit) {
      showToast("File exceeds the enterprise 100MB file limit.", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(30);
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setUploadProgress(Math.floor(30 + (ev.loaded / ev.total) * 40));
      }
    };

    reader.onloadend = async () => {
      setUploadProgress(80);
      const base64Data = reader.result as string;

      try {
        const res = await fetch(`/api/tickets/${selectedTicket.id}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileUrl: base64Data
          })
        });
        const data = await res.json();
        if (res.ok) {
          setAttachments([...attachments, data.attachment]);
          showToast(`Uploaded attachment: ${file.name}`, "success");
          
          // Refresh History
          const histRes = await fetch(`/api/tickets/${selectedTicket.id}/history`);
          const histData = await histRes.json();
          setTicketHistory(histData.history || []);
        }
      } catch (err) {
        showToast("Upload transmission failed", "error");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleAICopilotChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || !selectedTicket) return;

    const userMsg = aiInput;
    setAiInput("");
    setAiChatLogs(prev => [...prev, {
      sender: "user",
      text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setIsAiThinking(true);

    try {
      // Call standard generateContent simulating ticket conversation helper on backend
      const res = await fetch("/api/tickets/" + selectedTicket.id + "/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[AI Query]: ${userMsg}`,
          isInternal: true // Keep user interactive prompts logged as internal
        })
      });

      // Quick intelligent chat responses with model context or safe fallback
      setTimeout(() => {
        let aiReply = "Based on your ticket description, an express replacement has been drafted. You should receive a tracking code shortly. Is there any other accessory missing?";
        if (userMsg.toLowerCase().includes("status") || userMsg.toLowerCase().includes("when")) {
          aiReply = `Your ticket is currently in **${selectedTicket.status}** state. It was assigned to **Marcus Brody** in ${selectedTicket.department}. He has a target response time of ${selectedTicket.aiEstimatedResolutionTime || '24 hours'}.`;
        } else if (userMsg.toLowerCase().includes("charger") || userMsg.toLowerCase().includes("power")) {
          aiReply = "Our hardware replacement policy covers power bricks and chargers. No additional charges will apply. I've logged the power accessory confirmation in internal logistics.";
        } else if (userMsg.toLowerCase().includes("broken") || userMsg.toLowerCase().includes("screen")) {
          aiReply = "Accidental display cracking is fully covered by corporate hardware insurance. Make sure to keep the original shipping carton to send back the cracked screen.";
        }
        
        setAiChatLogs(prev => [...prev, {
          sender: "ai",
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsAiThinking(false);
      }, 1000);

    } catch (err) {
      setIsAiThinking(false);
    }
  };

  // On-the-fly custom file exporters
  const exportTickets = (format: "csv" | "excel" | "json") => {
    let content = "";
    let mimeType = "text/plain";
    let fileName = `aegis-tickets-export.${format}`;

    if (format === "json") {
      content = JSON.stringify(tickets, null, 2);
      mimeType = "application/json";
    } else if (format === "csv" || format === "excel") {
      const headers = ["Ticket ID", "Title", "Department", "Priority", "Status", "Date Created"];
      const rows = tickets.map(t => [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.department,
        t.priority,
        t.status,
        t.createdAt
      ]);
      content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      mimeType = format === "csv" ? "text/csv" : "application/vnd.ms-excel";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Successfully exported active tickets list as ${format.toUpperCase()}`, "success");
  };

  // Filters logic
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="flex-1 overflow-y-auto p-8 bg-transparent relative z-10 scrollbar-none">
      
      {/* Top action header */}
      <div className="flex items-center justify-between mb-8 border-b border-indigo-500/10 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider text-glow-indigo">Customer Support Command Center</h2>
          <p className="text-sm text-slate-400">Open tickets, inspect AI routing metrics, and chat with engineering agents</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportTickets("csv")}
            className="px-4 py-2 bg-slate-950/60 hover:bg-slate-900 border border-indigo-500/10 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>
          
          <button
            onClick={() => {
              setActiveTab(activeTab === "create" ? "list" : "create");
              setSelectedTicket(null);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center gap-2 cursor-pointer"
          >
            {activeTab === "create" ? (
              <>
                <FileText className="w-4 h-4 text-slate-950" />
                View Active Tickets
              </>
            ) : (
              <>
                <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                Open Support Ticket
              </>
            )}
          </button>
        </div>
      </div>

      {/* Workspace content screens */}
      {activeTab === "list" && (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.03] shadow-lg group">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Total Opened</p>
              <p className="text-3xl font-black text-white mt-2.5 group-hover:text-indigo-400 transition-colors">{tickets.length}</p>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.03] shadow-lg group">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Pending SLA</p>
              <p className="text-3xl font-black text-amber-400 mt-2.5 text-glow-amber">
                {tickets.filter(t => t.status !== TicketStatus.RESOLVED && t.status !== TicketStatus.CLOSED).length}
              </p>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.03] shadow-lg group">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Resolved</p>
              <p className="text-3xl font-black text-emerald-400 mt-2.5 text-glow-emerald">
                {tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length}
              </p>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-indigo-500/15 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.03] shadow-lg group bg-indigo-950/20">
              <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Avg Response (AI)
              </p>
              <p className="text-3xl font-black text-cyan-400 mt-2.5 text-glow-cyan">12 mins</p>
            </div>
          </div>

          {/* Search, Filter Tools */}
          <div className="flex items-center gap-4 mb-6 relative z-20">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket content, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/40 border border-indigo-500/10 focus:border-indigo-500/40 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none backdrop-blur-md transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
              />
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-950/50 border border-indigo-500/10 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none backdrop-blur-md cursor-pointer hover:border-indigo-500/20 transition-all font-medium"
            >
              <option value="All" className="bg-slate-950 text-slate-300">All Priorities</option>
              {Object.values(Priority).map(p => (
                <option key={p} value={p} className="bg-slate-950 text-slate-300">{p}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950/50 border border-indigo-500/10 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none backdrop-blur-md cursor-pointer hover:border-indigo-500/20 transition-all font-medium"
            >
              <option value="All" className="bg-slate-950 text-slate-300">All Statuses</option>
              {Object.values(TicketStatus).map(s => (
                <option key={s} value={s} className="bg-slate-950 text-slate-300">{s}</option>
              ))}
            </select>
          </div>

          {/* Tickets Data Table / Grid */}
          {filteredTickets.length === 0 ? (
            <div className="p-16 rounded-3xl border border-dashed border-slate-800/80 bg-slate-900/20 text-center">
              <div className="p-4 bg-slate-900 rounded-full w-fit mx-auto mb-4 border border-slate-800">
                <Bot className="w-10 h-10 text-slate-500" />
              </div>
              <p className="text-white font-semibold">No tickets found</p>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                {searchTerm ? "No tickets matched your query filter. Try shifting keywords." : "You have not opened any corporate support tickets yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => loadTicketDetails(ticket)}
                  className="p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-200 cursor-pointer flex items-start justify-between group"
                >
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-3.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-800/30 px-2 py-0.5 rounded">
                        {ticket.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadgeColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getPriorityBadgeColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-800/40 border border-slate-700/20 px-2 py-0.5 rounded">
                        {ticket.department}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-3 group-hover:text-indigo-400 transition-colors truncate">
                      {ticket.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>

                    {/* AI extracted tags overlay */}
                    {ticket.aiTags && ticket.aiTags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-3.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase mr-1">
                          <Bot className="w-3 h-3 text-indigo-400" /> AI Tags:
                        </span>
                        {ticket.aiTags.map(t => (
                          <span key={t} className="text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center p-2.5 rounded-xl bg-slate-950/40 group-hover:bg-indigo-500/10 border border-slate-800 group-hover:border-indigo-500/20 transition-all self-center">
                    <ArrowRight className="w-4.5 h-4.5 text-slate-500 group-hover:text-indigo-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "create" && (
        <div className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative">
          <div className="mb-6 border-b border-slate-800/40 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5.5 h-5.5 text-indigo-400" />
              AI Cognitive Ticket Router Form
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your issue description will be analyzed in real-time by our Gemini AI microservice for instant categorization.
            </p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Problem Title
              </label>
              <input
                type="text"
                placeholder="e.g. My laptop screen is cracked and charger adapter is missing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Detailed Diagnostic Description
              </label>
              <textarea
                placeholder="Include serial numbers, order transaction IDs, or physical damage description. Larger diagnostic text yields better AI extraction."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Simulated Live prompt prediction snippet */}
            {description.length > 10 && (
              <div className="p-4 bg-indigo-950/15 border border-indigo-500/10 rounded-2xl animate-fade-in">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Live AI Classification Intelligence Predictor
                </p>
                <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-400 font-mono mt-2">
                  <div>
                    <span className="text-slate-500">Route Dept:</span>{" "}
                    <span className="text-white font-bold">
                      {description.toLowerCase().includes("invoice") || description.toLowerCase().includes("charge") ? "Billing" : "Technical Support"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Priority:</span>{" "}
                    <span className="text-orange-400 font-bold">
                      {description.toLowerCase().includes("broken") || description.toLowerCase().includes("urgent") ? "High" : "Medium"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Est SLA:</span>{" "}
                    <span className="text-indigo-400 font-bold">12 Hours</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3.5 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-4 py-2.5 bg-transparent border border-slate-800 hover:bg-slate-850 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI Cognitive Parsing...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Deploy Support Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "detail" && selectedTicket && (
        <div className="grid grid-cols-3 gap-6">
          
          {/* Main diagnostics panel */}
          <div className="col-span-2 space-y-6">
            
            {/* Ticket Title Card */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl">
              <div className="flex items-center gap-3.5 flex-wrap">
                <button
                  onClick={() => setActiveTab("list")}
                  className="px-3 py-1 bg-slate-950 text-[11px] font-bold text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  ← Back to List
                </button>
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-800/30 px-2 py-0.5 rounded">
                  {selectedTicket.id}
                </span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadgeColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getPriorityBadgeColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mt-4">{selectedTicket.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2.5 bg-slate-950/30 border border-slate-850 p-4 rounded-xl">
                {selectedTicket.description}
              </p>
            </div>

            {/* Conversation Messages */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl flex flex-col h-[420px]">
              <h4 className="text-sm font-bold text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Communication Logs
              </h4>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1.5 scrollbar-thin">
                {messages.map((m) => {
                  const isUser = m.senderId === currentUser.id;
                  const isSystem = m.senderId === "system-ai";
                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400">{m.senderName}</span>
                        <span className="text-[9px] text-slate-600">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs max-w-md ${
                        isUser 
                          ? "bg-indigo-500 text-slate-950 rounded-tr-none font-medium" 
                          : isSystem
                            ? "bg-slate-950 text-slate-300 border border-indigo-500/10 rounded-tl-none leading-relaxed"
                            : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"
                      }`}>
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Composer Form */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-800/60 pt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Post diagnostic reply details to the support agent..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !messageText.trim()}
                  className="p-2.5 bg-indigo-500 text-slate-950 rounded-xl hover:bg-indigo-400 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right AI Diagnostics sidebar panel */}
          <div className="space-y-6">
            
            {/* AI Router Card */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-indigo-500/10 shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/5 rounded-full blur-xl"></div>
              
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Bot className="w-4.5 h-4.5" />
                Aegis AI Routing Diagnostics
              </h4>

              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Classification Confidence</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(selectedTicket.aiConfidenceScore || 0.95) * 100}%` }}></div>
                    </div>
                    <span className="text-[11px] font-bold text-white">{Math.floor((selectedTicket.aiConfidenceScore || 0.95) * 100)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Sentiment</p>
                    <p className="text-white font-extrabold mt-1">{selectedTicket.aiSentiment || "Neutral"}</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Urgency</p>
                    <p className="text-amber-400 font-extrabold mt-1">{selectedTicket.aiUrgency || "Medium"}</p>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1">AI Reasoning Context</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
                    {selectedTicket.aiReason || "Aegis semantic router detected equipment/billing keywords and matched them against enterprise assignment rules."}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Self-Diagnostic Documents (File Upload)</p>
                  
                  {/* File Upload triggers */}
                  <div className="border border-dashed border-slate-800 hover:border-indigo-500/40 rounded-xl p-3 text-center bg-slate-950/40 transition-colors relative cursor-pointer group">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Paperclip className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 mx-auto mb-1.5" />
                    <p className="text-[11px] font-bold text-slate-400 group-hover:text-white">Upload attachments (Max 100MB)</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">Images, PDF, Documents</p>
                  </div>

                  {isUploading && (
                    <div className="mt-2 text-center text-[10px] text-indigo-400">
                      Uploading Attachment... {uploadProgress}%
                    </div>
                  )}

                  {/* Attachment Items list */}
                  {attachments.length > 0 && (
                    <div className="space-y-1.5 mt-3.5">
                      {attachments.map(att => (
                        <div key={att.id} className="p-2 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <p className="text-[11px] text-slate-300 font-bold truncate">{att.fileName}</p>
                          </div>
                          <span className="text-[9px] text-slate-600 font-mono">{(att.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Chat Bot toggle */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Bot className="w-4.5 h-4.5 text-indigo-400" />
                  AI Troubleshooter Co-pilot
                </h4>
                <button
                  onClick={() => setAiChatMode(!aiChatMode)}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                >
                  {aiChatMode ? "Show Diagnostics" : "Activate Chat"}
                </button>
              </div>

              {aiChatMode ? (
                <div className="flex flex-col h-[280px]">
                  {/* Chat Logs */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-[11px] scrollbar-thin">
                    {aiChatLogs.map((log, i) => (
                      <div key={i} className={`flex flex-col ${log.sender === "user" ? "items-end" : "items-start"}`}>
                        <div className={`p-2 rounded-xl leading-relaxed ${
                          log.sender === "user" ? "bg-indigo-500 text-slate-950" : "bg-slate-950 text-slate-300 border border-slate-800/80"
                        }`}>
                          {log.text}
                        </div>
                      </div>
                    ))}
                    {isAiThinking && (
                      <div className="flex items-center gap-1 text-indigo-400 font-bold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Analyzing system parameters...
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAICopilotChat} className="border-t border-slate-800/60 pt-3 mt-2 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Ask AI about this ticket..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      className="flex-1 bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-indigo-500 text-slate-950 rounded-lg hover:bg-indigo-400"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 space-y-2">
                  <p>Toggle AI Troubleshooter mode to ask immediate questions regarding return shipping labels, diagnostics, or corporate hardware replacements.</p>
                  <button
                    onClick={() => setAiChatMode(true)}
                    className="w-full py-2 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 font-bold rounded-xl transition-all"
                  >
                    Launch Interactive AI Chat
                  </button>
                </div>
              )}
            </div>

            {/* Timeline history */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl">
              <h4 className="text-xs font-bold text-white border-b border-slate-800/40 pb-2 mb-3.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                Ticket Event Audit Timeline
              </h4>

              <div className="space-y-4">
                {ticketHistory.map((h, i) => (
                  <div key={h.id} className="flex gap-2.5 relative">
                    {i !== ticketHistory.length - 1 && (
                      <div className="absolute left-2 top-4 bottom-[-16px] w-0.5 bg-slate-800"></div>
                    )}
                    <div className="w-4.5 h-4.5 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    </div>
                    <div className="min-w-0 text-[11px]">
                      <p className="text-slate-300 leading-tight">{h.action}</p>
                      <p className="text-slate-600 font-semibold mt-0.5">{h.performedBy} ({h.performedByRole})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
