/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  ADMIN = "Admin",
  SUPPORT_AGENT = "Support Agent",
  MANAGER = "Manager",
  CUSTOMER = "Customer"
}

export enum Department {
  TECHNICAL_SUPPORT = "Technical Support",
  BILLING = "Billing",
  PAYMENTS = "Payments",
  DELIVERY = "Delivery",
  RETURNS = "Returns",
  REFUNDS = "Refunds",
  REPLACEMENT = "Replacement",
  ACCOUNTS = "Accounts",
  SALES = "Sales",
  NETWORK_TEAM = "Network Team",
  IT_TEAM = "IT Team",
  HR = "HR",
  SECURITY = "Security",
  MAINTENANCE = "Maintenance"
}

export enum Priority {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low"
}

export enum TicketStatus {
  OPEN = "Open",
  ASSIGNED = "Assigned",
  IN_PROGRESS = "In Progress",
  WAITING_FOR_CUSTOMER = "Waiting for Customer",
  ESCALATED = "Escalated",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
  REJECTED = "Rejected"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: Department;
  avatarUrl?: string;
  phone?: string;
  joinedDate: string;
  status: "Active" | "Inactive";
}

export interface Ticket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  title: string;
  description: string;
  department: Department;
  priority: Priority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  
  // AI Extracted Metadata
  aiSummary?: string;
  aiSentiment?: "Positive" | "Neutral" | "Negative" | "Frustrated" | "Angry";
  aiUrgency?: "High" | "Medium" | "Low";
  aiProduct?: string;
  aiEntities?: string[];
  aiSlaHours?: number;
  aiEstimatedResolutionTime?: string;
  aiSuggestedResponse?: string;
  aiConfidenceScore?: number;
  aiReason?: string;
  aiKnowledgeBaseSuggestions?: string[];
  aiTags?: string[];
  aiIsSpam?: boolean;
  aiSpamReason?: string;
  aiIsDuplicate?: boolean;
  aiDetectedLanguage?: string;
  aiTranslatedText?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  message: string;
  createdAt: string;
  isInternal: boolean; // Only agents/managers/admins see internal notes
}

export interface Attachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // mime
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  action: string; // e.g. "Status changed from Open to Assigned", "Assigned to Agent John"
  performedBy: string;
  performedByRole: Role;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "Email" | "SMS" | "WhatsApp" | "System";
  channel: string; // Target email or phone or "In-App"
  isRead: boolean;
  createdAt: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpfulCount: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  dbConnectionPool: {
    active: number;
    idle: number;
    max: number;
  };
  apiLatencyMs: number;
  totalRequests: number;
  errorRate: number;
}

export interface Store {
  id: string;
  name: string;
  platform: "Shopify" | "WooCommerce" | "Magento" | "BigCommerce" | "Custom";
  status: "Connected" | "Disconnected";
  syncedAt: string;
  apiKey: string;
}

export interface OrderProduct {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  storePlatform: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: OrderProduct[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded";
  orderStatus: "Unfulfilled" | "Fulfilled" | "Cancelled" | "Returned";
  deliveryStatus: "Pending" | "In Transit" | "Out for Delivery" | "Delivered" | "Delayed" | "Failed Attempt";
  courierName: string;
  trackingNumber: string;
  invoiceUrl: string;
  purchaseDate: string;
  expectedDeliveryDate: string;
  aiDelayRisk: boolean;
  aiDelayReason: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  location: string;
  price: number;
  barcode: string;
  qrCode: string;
}

export interface WebhookLog {
  id: string;
  storeName: string;
  platform: string;
  event: string;
  payload: string;
  processedAt: string;
  aiSummary: string;
}

