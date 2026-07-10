import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  RefreshCw, 
  Layers, 
  Sliders, 
  Box, 
  AlertTriangle, 
  Play, 
  CheckCircle, 
  Clock, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  Database, 
  Search, 
  PlusCircle, 
  Globe, 
  FileText, 
  Truck, 
  AlertCircle,
  Sparkles,
  Barcode,
  Terminal,
  Activity
} from "lucide-react";
import { Store, Order, InventoryItem, WebhookLog, Role, User } from "../types.js";

interface CommerceSyncDashboardProps {
  currentUser: User;
  showToast: (msg: string, type?: "success" | "info" | "error") => void;
}

export default function CommerceSyncDashboard({ currentUser, showToast }: CommerceSyncDashboardProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "stores" | "inventory" | "webhooks">("orders");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: "", platform: "Shopify" as any, apiKey: "" });
  
  // Webhook Simulator states
  const [selectedEvent, setSelectedEvent] = useState<string>("order/delayed");
  const [simulating, setSimulating] = useState(false);
  
  // Filters and searches
  const [orderFilter, setOrderFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);

  // Sync state
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null);

  // Default payloads for simulator
  const getPayloadTemplate = (event: string) => {
    switch (event) {
      case "order/delayed":
        return JSON.stringify({
          id: "ORD-5001",
          carrier: "FedEx",
          trackingNumber: "TRK-982182012",
          reason: "Winter blizzard closed regional transit runway. Package held in Chicago sorting facility."
        }, null, 2);
      case "order/failed_payment":
        return JSON.stringify({
          id: "ORD-5002",
          reason: "Card declined by bank. Error Code: LIMIT_EXCEEDED. Attempted subtotal $191.98."
        }, null, 2);
      case "order/refund_requested":
        return JSON.stringify({
          id: "ORD-5001",
          reason: "Screen cracked during transit. Customer requested immediate complete financial refund."
        }, null, 2);
      case "inventory/low_stock":
        return JSON.stringify({
          sku: "PRM-ERG-DSK",
          quantity: 1,
          reason: "Sales volume spike during holiday weekend campaign."
        }, null, 2);
      default:
        return "{}";
    }
  };

  const [simulatePayload, setSimulatePayload] = useState(getPayloadTemplate("order/delayed"));

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [resStores, resOrders, resInventory, resWebhooks] = await Promise.all([
        fetch("/api/stores"),
        fetch("/api/orders"),
        fetch("/api/inventory"),
        fetch("/api/webhooks/logs")
      ]);
      
      if (resStores.ok) {
        const d = await resStores.json();
        setStores(d.stores || []);
      }
      if (resOrders.ok) {
        const d = await resOrders.json();
        setOrders(d.orders || []);
      }
      if (resInventory.ok) {
        const d = await resInventory.json();
        setInventory(d.inventory || []);
      }
      if (resWebhooks.ok) {
        const d = await resWebhooks.json();
        setWebhookLogs(d.logs || []);
      }
    } catch (err) {
      console.error("Error loading commerce synchronization data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update payload when selected event changes
  useEffect(() => {
    setSimulatePayload(getPayloadTemplate(selectedEvent));
  }, [selectedEvent]);

  // Connect Store Handler
  const handleConnectStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.name) {
      showToast("Please specify a store name", "error");
      return;
    }
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStore)
      });
      if (res.ok) {
        const data = await res.json();
        setStores(prev => [...prev, data.store]);
        setShowConnectModal(false);
        setNewStore({ name: "", platform: "Shopify", apiKey: "" });
        showToast(`Store connected successfully!`, "success");
        fetchData();
      } else {
        showToast("Failed to connect store", "error");
      }
    } catch (err) {
      showToast("Failed to communicate with authorization server", "error");
    }
  };

  // Sync Store Handler
  const handleSyncStore = async (id: string) => {
    setSyncingStoreId(id);
    try {
      const res = await fetch(`/api/stores/${id}/sync`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores);
        showToast("Synchronized API orders and warehouse inventory data!", "success");
        fetchData();
      }
    } catch (err) {
      showToast("Store sync failed", "error");
    } finally {
      setSyncingStoreId(null);
    }
  };

  // Update Inventory Handler
  const handleUpdateInventory = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: editQuantity })
      });
      if (res.ok) {
        setEditingItem(null);
        showToast("Inventory quantity updated in centralized catalog", "success");
        fetchData();
      }
    } catch (err) {
      showToast("Failed to update stock", "error");
    }
  };

  // Webhook Simulation Handler
  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
      // Find associated store metadata based on selected event
      const store = selectedEvent === "order/failed_payment" 
        ? stores.find(s => s.platform === "WooCommerce") || stores[1] || stores[0]
        : stores[0];

      const res = await fetch("/api/webhooks/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: store?.name || "Shopify US Flagship",
          platform: store?.platform || "Shopify",
          event: selectedEvent,
          payload: simulatePayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setWebhookLogs(prev => [data.log, ...prev]);
        showToast(`Processed webhook and auto-routed support logic!`, "success");
        fetchData(); // reload orders, tickets, and logs
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to process simulated webhook", "error");
      }
    } catch (err) {
      showToast("Failed to communicate with webhook controller", "error");
    } finally {
      setSimulating(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete order ${id}?`)) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Order entry deleted from centralized operations ledger", "info");
        fetchData();
        if (selectedOrder?.id === id) setSelectedOrder(null);
      }
    } catch (err) {}
  };

  // Filtered lists
  const filteredOrders = orders.filter(o => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      o.id.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.customerEmail.toLowerCase().includes(query) ||
      o.storeName.toLowerCase().includes(query);

    if (orderFilter === "all") return matchesSearch;
    if (orderFilter === "delayed") return matchesSearch && (o.deliveryStatus === "Delayed" || o.aiDelayRisk);
    if (orderFilter === "failed") return matchesSearch && o.paymentStatus === "Failed";
    if (orderFilter === "returned") return matchesSearch && o.orderStatus === "Returned";
    if (orderFilter === "unfulfilled") return matchesSearch && o.orderStatus === "Unfulfilled";
    return matchesSearch;
  });

  const filteredInventory = inventory.filter(i => {
    const query = searchQuery.toLowerCase();
    return i.name.toLowerCase().includes(query) || i.sku.toLowerCase().includes(query) || i.location.toLowerCase().includes(query);
  });

  // Color mappings for UI Elegance
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Failed":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse";
      case "Pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Refunded":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "In Transit":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Out for Delivery":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Delayed":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent space-y-8 font-sans scrollbar-none relative z-10 animate-fade-in">
      
      {/* Top Header Row with dynamic KPI widgets */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/10 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5 text-glow-indigo">
            <ShoppingCart className="w-6 h-6 text-indigo-400" />
            Unified Commerce Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage e-commerce platforms, track low-stock inventory, and monitor AI-driven webhooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchData();
              showToast("Forced central API & Webhook synchronization updates", "info");
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/60 hover:bg-slate-900 text-xs font-bold text-slate-200 hover:text-white border border-indigo-500/10 hover:border-indigo-500/30 rounded-xl transition-all cursor-pointer backdrop-blur-md"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            Sync All Stores
          </button>
          
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 text-xs font-black rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            Connect Store
          </button>
        </div>
      </div>

      {/* KPI Stats Panel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 hover:scale-[1.03] flex items-center gap-4">
          <div className="p-3 bg-indigo-500/15 border border-indigo-500/20 rounded-xl text-indigo-300">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Sync Orders Ledger</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{orders.length} Total</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 hover:scale-[1.03] flex items-center gap-4">
          <div className="p-3 bg-indigo-500/15 border border-indigo-500/20 rounded-xl text-indigo-300">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Connected Stores</p>
            <h3 className="text-2xl font-black text-white mt-0.5 text-glow-cyan">
              {stores.filter(s => s.status === "Connected").length} / {stores.length} Ready
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 hover:scale-[1.03] flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Low Stock Alerts</p>
            <h3 className="text-2xl font-black text-rose-400 mt-0.5 text-glow-rose">
              {inventory.filter(i => i.quantity < 10).length} Items Low
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 hover:scale-[1.03] flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-300">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">AI Webhooks Tracked</p>
            <h3 className="text-2xl font-black text-cyan-400 mt-0.5 text-glow-cyan">{webhookLogs.length} Processed</h3>
          </div>
        </div>
      </div>

      {/* Sub Navigation and Search Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
        {/* Navigation tabs */}
        <div className="flex items-center gap-2 bg-slate-950/40 p-1 rounded-xl border border-slate-850/60 self-start">
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "orders" 
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Orders Ledger
          </button>
          
          <button
            onClick={() => setActiveSubTab("stores")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "stores" 
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Authorized Connections
          </button>

          <button
            onClick={() => setActiveSubTab("inventory")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "inventory" 
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Inventory Matrix
          </button>

          <button
            onClick={() => setActiveSubTab("webhooks")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "webhooks" 
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Webhook Simulator
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          {activeSubTab === "orders" && (
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="bg-slate-950/60 border border-slate-850 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/60 cursor-pointer"
            >
              <option value="all">All Orders</option>
              <option value="delayed">Carrier Delayed / At Risk</option>
              <option value="failed">Failed Checkout Payments</option>
              <option value="returned">Returned / Refund Requests</option>
              <option value="unfulfilled">Unfulfilled Orders</option>
            </select>
          )}

          {activeSubTab !== "webhooks" && (
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={activeSubTab === "inventory" ? "Search SKU or location..." : "Search ID, customer name..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/60 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Panels */}
      
      {/* 1. ORDERS LEDGER PANEL */}
      {activeSubTab === "orders" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Main Table Column */}
          <div className="xl:col-span-2 space-y-4">
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Order Reference</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Authorized Store</th>
                    <th className="py-4 px-6 text-right">Invoice Sum</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Delivery Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {filteredOrders.map(order => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <tr 
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`hover:bg-slate-900/30 transition-colors cursor-pointer ${
                          isSelected ? "bg-indigo-500/5 text-white" : "text-slate-300"
                        }`}
                      >
                        <td className="py-4.5 px-6 font-semibold">
                          <div className="flex items-center gap-1.5 font-mono text-indigo-400">
                            {order.id}
                            {order.aiDelayRisk && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="AI Predicted Delivery Delay" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {new Date(order.purchaseDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <p className="font-bold text-white">{order.customerName}</p>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">{order.customerEmail}</span>
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded">
                              {order.storePlatform}
                            </span>
                            <span className="text-[11px] font-medium text-slate-300">{order.storeName}</span>
                          </div>
                        </td>
                        <td className="py-4.5 px-6 text-right font-mono font-bold text-slate-100">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getPaymentBadge(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getDeliveryBadge(order.deliveryStatus)}`}>
                            {order.deliveryStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">
                        No e-commerce orders found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed side panel */}
          <div className="space-y-6">
            {selectedOrder ? (
              <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl p-6 space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
                  <div>
                    <h4 className="font-extrabold text-white flex items-center gap-2 text-base">
                      <FileText className="w-4.5 h-4.5 text-indigo-400" />
                      Order Details: {selectedOrder.id}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1">Platform: {selectedOrder.storePlatform} ({selectedOrder.storeName})</p>
                  </div>
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="p-1.5 hover:bg-rose-950/30 hover:text-rose-400 border border-transparent hover:border-rose-900/30 rounded-lg text-slate-500 transition-all cursor-pointer"
                    title="Delete order record"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* AI Predictive delay analysis warning card */}
                {selectedOrder.aiDelayRisk && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <AlertCircle className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
                      AI Predicted Shipment Delay Warning
                    </div>
                    <p className="text-[11px] text-rose-300/90 leading-relaxed font-semibold">
                      {selectedOrder.aiDelayReason || "Transit delay predicted based on logistical patterns."}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1 bg-slate-950/40 p-2 rounded border border-slate-800/50">
                      <span className="font-bold text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Proactive AI Ticket Generated
                      </span>
                      Auto-created support ticket inside Delivery Department under Critical status.
                    </div>
                  </div>
                )}

                {/* Shipping Details */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Courier & Fulfillment Track</h5>
                  <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Carrier Partner:</span>
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-indigo-400" /> {selectedOrder.courierName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tracking Reference:</span>
                      <span className="font-mono text-indigo-400 font-semibold">{selectedOrder.trackingNumber || "Not dispatched"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fulfillment Status:</span>
                      <span className="font-bold text-slate-200">{selectedOrder.orderStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scheduled Arrival:</span>
                      <span className="font-semibold text-slate-300">
                        {selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString([], { month: "short", day: "numeric" }) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Invoice line items list */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ordered Line Items</h5>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {selectedOrder.products.map((p, idx) => (
                      <div key={idx} className="flex justify-between p-2.5 bg-slate-950/20 border border-slate-850/40 rounded-lg text-xs">
                        <div>
                          <p className="font-bold text-white">{p.name}</p>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {p.sku} x {p.quantity}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-300">${(p.price * p.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotal summary */}
                <div className="border-t border-slate-800/40 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="font-mono text-slate-200">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Campaign Discount:</span>
                      <span className="font-mono text-emerald-400">-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax Index:</span>
                    <span className="font-mono text-slate-200">${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/40 pt-2 font-bold text-sm">
                    <span className="text-white">Central Net Total:</span>
                    <span className="font-mono text-indigo-400">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Customer CRM info */}
                <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl space-y-2 text-xs">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Shipping Destination</h5>
                  <p className="font-bold text-white">{selectedOrder.customerName}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{selectedOrder.shippingAddress}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-2">{selectedOrder.customerPhone}</p>
                </div>

              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl p-8 text-center flex flex-col items-center justify-center py-20">
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-full mb-3.5 text-slate-600">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-sm">No Ledger Selected</h4>
                <p className="text-slate-500 text-xs mt-1 max-w-xs leading-normal">
                  Select an e-commerce order from the left table to load comprehensive tracking details, invoice item lines, and AI delay predictions.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. AUTHORIZED CONNECTIONS PANEL */}
      {activeSubTab === "stores" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => (
            <div key={store.id} className="rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {store.platform}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${store.status === "Connected" ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                    <span className={`text-[10px] font-bold ${store.status === "Connected" ? "text-emerald-400" : "text-slate-500"}`}>
                      {store.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-white text-base leading-tight">{store.name}</h4>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">API Key: {store.apiKey ? `••••••••${store.apiKey.substr(-6)}` : "Inactive"}</p>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">API Gateway URL:</span>
                    <span className="text-slate-300 font-mono text-[10px]">https://api.{store.platform.toLowerCase()}.com/v3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Synced:</span>
                    <span className="text-slate-300 font-mono text-[10px]">
                      {store.syncedAt === "Never" ? "Never" : new Date(store.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/40 flex justify-end">
                <button
                  onClick={() => handleSyncStore(store.id)}
                  disabled={syncingStoreId === store.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-[11px] font-bold text-slate-300 hover:text-white border border-slate-850 hover:border-slate-800 rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${syncingStoreId === store.id ? "animate-spin" : ""}`} />
                  {syncingStoreId === store.id ? "Syncing API..." : "Sync Webhooks"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. INVENTORY MATRIX PANEL */}
      {activeSubTab === "inventory" && (
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Product & SKU Code</th>
                <th className="py-4 px-6">Physical Bin Location</th>
                <th className="py-4 px-6 text-right">Selling Price</th>
                <th className="py-4 px-6 text-right">In-Stock Quantity</th>
                <th className="py-4 px-6">Reorder Health Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filteredInventory.map(item => {
                const isLow = item.quantity < 10;
                const isCritical = item.quantity < 5;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-500">
                          <Box className="w-4.5 h-4.5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white leading-snug">{item.name}</p>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1.5">
                            <Barcode className="w-3 h-3" /> SKU: {item.sku}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-slate-300">
                      {item.location}
                    </td>
                    <td className="py-4.5 px-6 text-right font-mono font-bold text-slate-200">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-4.5 px-6 text-right font-mono font-black text-white">
                      {item.quantity} units
                    </td>
                    <td className="py-4.5 px-6">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-500" /> Low Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded">
                          <AlertCircle className="w-3 h-3 text-amber-500" /> Reorder Soon
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" /> Standard OK
                        </span>
                      )}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      {editingItem?.id === item.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(Number(e.target.value))}
                            className="w-16 bg-slate-950 border border-slate-800 text-center font-mono py-1 rounded text-white"
                          />
                          <button
                            onClick={() => handleUpdateInventory(item.id)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-2.5 py-1 rounded cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setEditQuantity(item.quantity);
                          }}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-lg text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        >
                          Replenish Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. WEBHOOK EVENT SIMULATION PANEL */}
      {activeSubTab === "webhooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Simulator configurations */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 space-y-6">
            <div>
              <h4 className="font-extrabold text-white flex items-center gap-2 text-base">
                <Terminal className="w-5 h-5 text-indigo-400" />
                Live Webhook Emulator
              </h4>
              <p className="text-xs text-slate-400 mt-1">Select an event category to simulate external e-commerce notification webhooks.</p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Choose Event Alert Trigger</label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: "order/delayed", title: "Order Delayed (FedEx Alert)", icon: Truck, color: "text-rose-400" },
                  { id: "order/failed_payment", title: "Declined Payment (Stripe Checkout)", icon: AlertCircle, color: "text-amber-400" },
                  { id: "order/refund_requested", title: "Refund Complaint (WooCommerce Return)", icon: Trash2, color: "text-indigo-400" },
                  { id: "inventory/low_stock", title: "Low Stock Alert (Warehouse Sensor)", icon: Box, color: "text-red-400" }
                ].map(evt => {
                  const Icon = evt.icon;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt.id)}
                      className={`w-full flex items-center justify-between p-3.5 border rounded-xl text-left transition-all text-xs cursor-pointer ${
                        selectedEvent === evt.id 
                          ? "bg-indigo-500/10 border-indigo-500/40 text-white shadow-md shadow-indigo-500/5" 
                          : "bg-slate-950/40 border-slate-850 hover:bg-slate-900 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4.5 h-4.5 ${evt.color}`} />
                        <span className="font-bold">{evt.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable payload visualizer */}
            <div className="space-y-3.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Simulated Event Payload (JSON)</label>
              <textarea
                value={simulatePayload}
                onChange={(e) => setSimulatePayload(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 text-slate-300 border border-slate-850 rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <button
              onClick={handleSimulateWebhook}
              disabled={simulating}
              className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {simulating ? "Executing Gemini AI Engine..." : "Simulate Live Webhook Target"}
            </button>
          </div>

          {/* Webhook logs stream with Gemini summaries */}
          <div className="lg:col-span-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 flex flex-col justify-between h-[600px]">
            <div className="space-y-4 overflow-hidden flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                <h4 className="font-extrabold text-white flex items-center gap-2 text-sm">
                  <Database className="w-4.5 h-4.5 text-indigo-400" />
                  Processed Webhook Sync Pipeline
                </h4>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Historical Logs</span>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-1.5 scrollbar-thin">
                {webhookLogs.map(log => (
                  <div key={log.id} className="p-4 rounded-xl border border-slate-850 bg-slate-950/60 space-y-3.5 text-xs">
                    
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
                          {log.platform}
                        </span>
                        <span className="font-extrabold text-indigo-400 font-mono text-[11px]">{log.event}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-600">{new Date(log.processedAt).toLocaleTimeString()}</span>
                    </div>

                    {/* Gemini auto analysis output */}
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Aegis Classifier AI Summary & Auto-Routing Outcome:
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        {log.aiSummary}
                      </p>
                    </div>

                    {/* Collapsible raw data representation */}
                    <details className="text-[10px]">
                      <summary className="text-slate-500 hover:text-slate-300 cursor-pointer font-bold select-none">
                        View Raw JSON Payload
                      </summary>
                      <pre className="mt-2 bg-slate-950 border border-slate-900 p-3 rounded-lg overflow-x-auto text-[9px] leading-relaxed text-slate-400 font-mono">
                        {log.payload}
                      </pre>
                    </details>
                  </div>
                ))}

                {webhookLogs.length === 0 && (
                  <div className="text-center text-slate-500 font-semibold py-24">
                    No webhook simulation logs logged yet. Use the simulator panel on the left to fire mock alerts.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Authorized Stores Integration Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-extrabold text-white flex items-center gap-2 text-base">
                <Globe className="w-4.5 h-4.5 text-indigo-400" />
                Connect E-Commerce Authorized Store
              </h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-500 hover:text-slate-300 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConnectStore} className="space-y-4 text-xs text-slate-300">
              <div className="space-y-2">
                <label className="font-bold text-slate-400">Authorized E-Commerce Platform</label>
                <select
                  value={newStore.platform}
                  onChange={(e) => setNewStore(prev => ({ ...prev, platform: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-white focus:outline-none"
                >
                  <option value="Shopify">Shopify</option>
                  <option value="WooCommerce">WooCommerce</option>
                  <option value="Magento">Magento</option>
                  <option value="BigCommerce">BigCommerce</option>
                  <option value="Custom">Custom ERP / CRM Integration</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-400">Custom Store Name Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. Shopify US Flagship, Magento Wholesales"
                  value={newStore.name}
                  onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-400">Private API Token / Access Key</label>
                <input
                  type="text"
                  placeholder="shpat_••••••••••••••••••••"
                  value={newStore.apiKey}
                  onChange={(e) => setNewStore(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-indigo-500/10"
                >
                  Authorize & Link API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
