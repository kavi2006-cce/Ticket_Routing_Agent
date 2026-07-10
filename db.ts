/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { 
  Role, 
  Department, 
  Priority, 
  TicketStatus, 
  User, 
  Ticket, 
  TicketMessage, 
  Attachment, 
  TicketHistory, 
  Notification, 
  KnowledgeBaseArticle, 
  ActivityLog,
  Store,
  Order,
  InventoryItem,
  WebhookLog
} from "./src/types.js";

const DB_FILE = path.join(process.cwd(), "db.json");

interface DatabaseSchema {
  users: User[];
  tickets: Ticket[];
  messages: TicketMessage[];
  attachments: Attachment[];
  history: TicketHistory[];
  notifications: Notification[];
  knowledgeBase: KnowledgeBaseArticle[];
  activityLogs: ActivityLog[];
  aiPromptTemplate: string;
  stores: Store[];
  orders: Order[];
  inventory: InventoryItem[];
  webhooks: WebhookLog[];
}

const DEFAULT_AI_PROMPT = `You are an expert Enterprise AI Support Engineer.
Analyze the customer's support ticket and classify it into a structured JSON response.

Ticket Title: {{title}}
Ticket Description: {{description}}

You must reply with ONLY a valid raw JSON object. Do not wrap in markdown blocks like \`\`\`json.
Ensure the output matches this exact JSON schema:
{
  "department": "One of the valid departments: Technical Support, Billing, Payments, Delivery, Returns, Refunds, Replacement, Accounts, Sales, Network Team, IT Team, HR, Security, Maintenance",
  "priority": "One of: Critical, High, Medium, Low",
  "urgency": "One of: High, Medium, Low",
  "sentiment": "One of: Positive, Neutral, Negative, Frustrated, Angry",
  "entities": ["array of key entities extracted, e.g. laptop, screen, charger"],
  "product": "Name of the product or service detected",
  "slaHours": 4 (Critical) or 12 (High) or 24 (Medium) or 48 (Low),
  "estimatedResolutionTime": "e.g. '2 hours', '1 day', etc.",
  "summary": "Concise 1-sentence summary of the user issue",
  "suggestedResponse": "Professional, polite, and empathetic reply draft that a support agent can send to the customer",
  "knowledgeBaseSuggestions": ["Title of 2 recommended help articles based on the issue"],
  "tags": ["2-4 short tags, e.g. 'hardware', 'payment-failed'"],
  "isSpam": false,
  "spamReason": "",
  "isDuplicate": false,
  "detectedLanguage": "e.g. English, Spanish, Hindi",
  "translatedText": "If the ticket is in a non-English language, translate it to English. Otherwise, leave empty."
}

Analyze carefully. If the ticket indicates catastrophic failure or security breach (e.g., server down, database wiped, cyber attack, main power failure), set priority to Critical and department to IT Team or Security or Network Team. If billing dispute, Payments or Billing. If return request, Returns or Refunds.`;

const DEFAULT_USERS: User[] = [
  {
    id: "u-admin",
    name: "Alex Vanguard",
    email: "admin@enterprise.com",
    role: Role.ADMIN,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    phone: "+1 (555) 019-2831",
    joinedDate: "2025-01-10",
    status: "Active"
  },
  {
    id: "u-manager",
    name: "Samantha Vance",
    email: "manager@enterprise.com",
    role: Role.MANAGER,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    phone: "+1 (555) 018-9921",
    joinedDate: "2025-02-15",
    status: "Active"
  },
  {
    id: "u-agent1",
    name: "Marcus Brody",
    email: "agent@enterprise.com",
    role: Role.SUPPORT_AGENT,
    department: Department.TECHNICAL_SUPPORT,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    phone: "+1 (555) 017-1188",
    joinedDate: "2025-03-01",
    status: "Active"
  },
  {
    id: "u-agent2",
    name: "Elena Rostova",
    email: "elena@enterprise.com",
    role: Role.SUPPORT_AGENT,
    department: Department.BILLING,
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    phone: "+1 (555) 014-4422",
    joinedDate: "2025-04-12",
    status: "Active"
  },
  {
    id: "u-customer",
    name: "Douglas Mercer",
    email: "customer@enterprise.com",
    role: Role.CUSTOMER,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    phone: "+1 (555) 011-3322",
    joinedDate: "2025-05-18",
    status: "Active"
  }
];

const DEFAULT_KNOWLEDGE_BASE: KnowledgeBaseArticle[] = [
  {
    id: "kb-001",
    title: "How to troubleshoot missing power adapter or charging issues",
    content: "If you receive a laptop with a missing power adapter, please contact support immediately with your order ID. In case of charging issues, try hard-resetting the laptop by holding the power button for 15 seconds while unplugged, or verify if the outlet works with other electronics. Always use original enterprise-certified type-C or pin-chargers.",
    category: "Technical Support",
    tags: ["charger", "power", "battery"],
    views: 142,
    helpfulCount: 98,
    createdAt: "2025-03-10"
  },
  {
    id: "kb-002",
    title: "Fixing cracked screen and display glitching policies",
    content: "Cracked screen issues are covered under Enterprise accidental damage protection. Support agents should request high-resolution images of the screen and prompt the user to upload a damage receipt. Replacements are routed directly via our hardware replacement centers with pre-paid shipping labels.",
    category: "Replacement",
    tags: ["display", "screen", "hardware"],
    views: 210,
    helpfulCount: 156,
    createdAt: "2025-03-15"
  },
  {
    id: "kb-003",
    title: "Understanding enterprise billing discrepancies",
    content: "When a customer reports an double-charge or billing error: 1. Verify the Stripe invoice ID in the billing dashboard. 2. Cross-reference the payment status (Refunded vs. Settled). 3. If duplicate payments occurred, process a refund from the Returns & Refund section immediately. Refunds take 5-10 business days to settle.",
    category: "Billing",
    tags: ["billing", "invoice", "refund"],
    views: 88,
    helpfulCount: 45,
    createdAt: "2025-03-20"
  }
];

const DEFAULT_TICKETS: Ticket[] = [
  {
    id: "TCK-1001",
    customerId: "u-customer",
    customerName: "Douglas Mercer",
    customerEmail: "customer@enterprise.com",
    title: "My laptop screen is broken and the charger is missing",
    description: "I received my corporate package today but when I unboxed the laptop, the screen had a severe crack down the center. Also, I searched the entire box and there is no charger adapter included. I cannot turn on the device or get any work done. Please send a replacement ASAP.",
    department: Department.TECHNICAL_SUPPORT,
    priority: Priority.HIGH,
    status: TicketStatus.ASSIGNED,
    assignedAgentId: "u-agent1",
    assignedAgentName: "Marcus Brody",
    createdAt: "2026-07-08T10:30:00Z",
    updatedAt: "2026-07-08T11:00:00Z",
    aiSummary: "The user received a damaged laptop with a cracked screen and a missing power adapter, preventing work setup.",
    aiSentiment: "Frustrated",
    aiUrgency: "High",
    aiProduct: "Corporate Laptop Bundle",
    aiEntities: ["laptop", "screen", "charger", "corporate package"],
    aiSlaHours: 12,
    aiEstimatedResolutionTime: "1 day",
    aiSuggestedResponse: "Dear Douglas,\n\nWe are extremely sorry to hear that your corporate laptop arrived damaged and is missing its charger. We have flagged this ticket for immediate priority. An agent has been assigned to initiate an express replacement order. We will email you a pre-paid return label to send the cracked unit back. Our apologies for the setback.\n\nWarm regards,\nAI Automated Agent Support",
    aiConfidenceScore: 0.98,
    aiReason: "Identified 'screen broken' as a hardware damage issue and 'charger missing' as an incomplete delivery, placing it squarely in Technical Support with high urgency.",
    aiKnowledgeBaseSuggestions: ["Fixing cracked screen and display glitching policies", "How to troubleshoot missing power adapter or charging issues"],
    aiTags: ["hardware", "broken-screen", "missing-charger"],
    aiIsSpam: false,
    aiIsDuplicate: false,
    aiDetectedLanguage: "English"
  },
  {
    id: "TCK-1002",
    customerId: "u-customer",
    customerName: "Douglas Mercer",
    customerEmail: "customer@enterprise.com",
    title: "Double invoice charge for June software subscription",
    description: "Hi team, I noticed on my credit card statement that I was billed $249.00 twice on June 28th. The transaction references are INV-9012 and INV-9013. I only have one active subscription. Please issue a refund for one of these charges.",
    department: Department.BILLING,
    priority: Priority.MEDIUM,
    status: TicketStatus.OPEN,
    createdAt: "2026-07-08T15:20:00Z",
    updatedAt: "2026-07-08T15:20:00Z",
    aiSummary: "The customer is reporting a duplicate billing charge of $249.00 for their software subscription with transaction reference IDs.",
    aiSentiment: "Neutral",
    aiUrgency: "Medium",
    aiProduct: "Software Subscription",
    aiEntities: ["invoice", "credit card", "subscription", "double charge", "June billing"],
    aiSlaHours: 24,
    aiEstimatedResolutionTime: "2 days",
    aiSuggestedResponse: "Hello Douglas,\n\nThank you for reaching out. We apologize for the duplicate subscription charges on your card. I will forward this invoice detail to our Accounts team to cross-reference transactions INV-9012 and INV-9013. Once confirmed, we will issue a direct refund to your credit card immediately. Expect the refund to reflect in 5-10 business days.\n\nBest regards,\nAI Support Specialist",
    aiConfidenceScore: 0.96,
    aiReason: "Detected keywords 'charge', 'invoice', 'billed twice', which mapped perfectly to Billing and Payments.",
    aiKnowledgeBaseSuggestions: ["Understanding enterprise billing discrepancies"],
    aiTags: ["billing", "duplicate-charge", "invoice-discrepancy"],
    aiIsSpam: false,
    aiIsDuplicate: false,
    aiDetectedLanguage: "English"
  }
];

const DEFAULT_MESSAGES: TicketMessage[] = [
  {
    id: "msg-001",
    ticketId: "TCK-1001",
    senderId: "u-customer",
    senderName: "Douglas Mercer",
    senderRole: Role.CUSTOMER,
    message: "Here is the exact description of the issue. I am unable to boot up the machine because I don't have a charger.",
    createdAt: "2026-07-08T10:30:00Z",
    isInternal: false
  },
  {
    id: "msg-002",
    ticketId: "TCK-1001",
    senderId: "u-agent1",
    senderName: "Marcus Brody",
    senderRole: Role.SUPPORT_AGENT,
    message: "Hello Douglas, I have received the ticket. I am processing an emergency replacement package which will include the charger and a brand new corporate laptop. I'll provide the tracking number shortly.",
    createdAt: "2026-07-08T11:00:00Z",
    isInternal: false
  },
  {
    id: "msg-003",
    ticketId: "TCK-1001",
    senderId: "u-agent1",
    senderName: "Marcus Brody",
    senderRole: Role.SUPPORT_AGENT,
    message: "Internal Note: Initiated warehouse hardware request WH-LPT-9021. Hardware approved under accidental coverage plan. Shipping department notified.",
    createdAt: "2026-07-08T11:01:00Z",
    isInternal: true
  }
];

const DEFAULT_HISTORY: TicketHistory[] = [
  {
    id: "hist-001",
    ticketId: "TCK-1001",
    action: "Ticket created and auto-classified by AI Routing Agent",
    performedBy: "AI Router",
    performedByRole: Role.ADMIN,
    createdAt: "2026-07-08T10:30:00Z"
  },
  {
    id: "hist-002",
    ticketId: "TCK-1001",
    action: "Assigned to Support Agent Marcus Brody in Technical Support department",
    performedBy: "System Router",
    performedByRole: Role.ADMIN,
    createdAt: "2026-07-08T10:35:00Z"
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    userId: "u-agent1",
    title: "New Assigned Ticket - High Priority",
    message: "Ticket TCK-1001 has been automatically assigned to you in Technical Support.",
    type: "System",
    channel: "In-App",
    isRead: false,
    createdAt: "2026-07-08T10:35:00Z"
  },
  {
    id: "notif-002",
    userId: "u-customer",
    title: "Ticket Auto-Created Successfully",
    message: "Your support ticket 'My laptop screen is broken and the charger is missing' has been routed to Technical Support.",
    type: "Email",
    channel: "customer@enterprise.com",
    isRead: true,
    createdAt: "2026-07-08T10:30:00Z"
  }
];

const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "act-001",
    userId: "u-customer",
    userName: "Douglas Mercer",
    userRole: Role.CUSTOMER,
    action: "CREATE_TICKET",
    details: "Created ticket TCK-1001: 'My laptop screen is broken...'",
    ipAddress: "192.168.1.144",
    createdAt: "2026-07-08T10:30:00Z"
  },
  {
    id: "act-002",
    userId: "u-admin",
    userName: "Alex Vanguard",
    userRole: Role.ADMIN,
    action: "SYSTEM_ACCESS",
    details: "Logged into Admin portal",
    ipAddress: "10.0.4.21",
    createdAt: "2026-07-09T01:00:00Z"
  }
];

const DEFAULT_STORES: Store[] = [
  { id: "store-shopify", name: "Shopify US Flagship", platform: "Shopify", status: "Connected", syncedAt: "2026-07-09T01:30:00Z", apiKey: "shpat_a3b2c1d4e5f6g7h8i9j0" },
  { id: "store-woo", name: "WooCommerce EU Outlet", platform: "WooCommerce", status: "Connected", syncedAt: "2026-07-09T01:45:00Z", apiKey: "ck_f6g7h8i9j0a3b2c1d4e5" },
  { id: "store-magento", name: "Magento Global Wholesale", platform: "Magento", status: "Connected", syncedAt: "2026-07-09T01:15:00Z", apiKey: "mag_key_9j0a3b2c1d4e5f6g7h8i" },
  { id: "store-bigcommerce", name: "BigCommerce APAC Retail", platform: "BigCommerce", status: "Disconnected", syncedAt: "Never", apiKey: "" }
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: "inv-001", name: "Aegis Sentinel Laptop Bundle", sku: "AEG-SEN-LPT", quantity: 45, location: "Aisle 1-A", price: 1299.00, barcode: "123456789012", qrCode: "AEG-SEN-LPT-QR" },
  { id: "inv-002", name: "Titanium Security Key Pro", sku: "TIT-SEC-KEY", quantity: 210, location: "Aisle 2-C", price: 79.99, barcode: "987654321098", qrCode: "TIT-SEC-KEY-QR" },
  { id: "inv-003", name: "Enterprise Core Router Rack", sku: "ENT-RTR-RCK", quantity: 12, location: "Aisle 5-F", price: 2499.00, barcode: "456789123456", qrCode: "ENT-RTR-RCK-QR" },
  { id: "inv-004", name: "Ultra-Wide Developer Screen", sku: "DEV-WDE-SCRN", quantity: 28, location: "Aisle 3-B", price: 649.99, barcode: "789123456789", qrCode: "DEV-WDE-SCRN-QR" },
  { id: "inv-005", name: "Premium Ergo Desk", sku: "PRM-ERG-DSK", quantity: 8, location: "Aisle 8-D", price: 499.00, barcode: "321654987321", qrCode: "PRM-ERG-DSK-QR" }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-5001",
    storeId: "store-shopify",
    storeName: "Shopify US Flagship",
    storePlatform: "Shopify",
    customerName: "Douglas Mercer",
    customerEmail: "customer@enterprise.com",
    customerPhone: "+1 (555) 011-3322",
    products: [
      { name: "Aegis Sentinel Laptop Bundle", sku: "AEG-SEN-LPT", quantity: 1, price: 1299.00 }
    ],
    subtotal: 1299.00,
    discount: 50.00,
    tax: 100.00,
    total: 1349.00,
    shippingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    billingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    paymentMethod: "Credit Card (Visa)",
    paymentStatus: "Paid",
    orderStatus: "Fulfilled",
    deliveryStatus: "Delayed",
    courierName: "FedEx",
    trackingNumber: "TRK-982182012",
    invoiceUrl: "/api/orders/ORD-5001/invoice",
    purchaseDate: "2026-07-07T10:15:00Z",
    expectedDeliveryDate: "2026-07-08T18:00:00Z",
    aiDelayRisk: true,
    aiDelayReason: "Heavy storms near Chicago FedEx logistics hub delayed outgoing container truck dispatch."
  },
  {
    id: "ORD-5002",
    storeId: "store-woo",
    storeName: "WooCommerce EU Outlet",
    storePlatform: "WooCommerce",
    customerName: "Douglas Mercer",
    customerEmail: "customer@enterprise.com",
    customerPhone: "+1 (555) 011-3322",
    products: [
      { name: "Titanium Security Key Pro", sku: "TIT-SEC-KEY", quantity: 2, price: 79.99 }
    ],
    subtotal: 159.98,
    discount: 0,
    tax: 32.00,
    total: 191.98,
    shippingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    billingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    paymentMethod: "Stripe Checkout",
    paymentStatus: "Failed",
    orderStatus: "Unfulfilled",
    deliveryStatus: "Pending",
    courierName: "DHL Express",
    trackingNumber: "",
    invoiceUrl: "/api/orders/ORD-5002/invoice",
    purchaseDate: "2026-07-08T15:20:00Z",
    expectedDeliveryDate: "2026-07-12T18:00:00Z",
    aiDelayRisk: false,
    aiDelayReason: ""
  },
  {
    id: "ORD-5003",
    storeId: "store-magento",
    storeName: "Magento Global Wholesale",
    storePlatform: "Magento",
    customerName: "Sarah Jenkins",
    customerEmail: "sjenkins@enterprise-partner.net",
    customerPhone: "+1 (555) 044-8899",
    products: [
      { name: "Enterprise Core Router Rack", sku: "ENT-RTR-RCK", quantity: 1, price: 2499.00 }
    ],
    subtotal: 2499.00,
    discount: 250.00,
    tax: 224.90,
    total: 2473.90,
    shippingAddress: "100 Technology Drive, Suite 400, San Jose, CA 95110",
    billingAddress: "100 Technology Drive, Suite 400, San Jose, CA 95110",
    paymentMethod: "Corporate Wire Transfer",
    paymentStatus: "Paid",
    orderStatus: "Fulfilled",
    deliveryStatus: "In Transit",
    courierName: "DHL Express",
    trackingNumber: "TRK-4429819",
    invoiceUrl: "/api/orders/ORD-5003/invoice",
    purchaseDate: "2026-07-08T08:00:00Z",
    expectedDeliveryDate: "2026-07-10T15:00:00Z",
    aiDelayRisk: false,
    aiDelayReason: ""
  },
  {
    id: "ORD-5004",
    storeId: "store-shopify",
    storeName: "Shopify US Flagship",
    storePlatform: "Shopify",
    customerName: "Michael Chen",
    customerEmail: "mchen@corp-dev.org",
    customerPhone: "+1 (555) 022-7711",
    products: [
      { name: "Ultra-Wide Developer Screen", sku: "DEV-WDE-SCRN", quantity: 1, price: 649.99 }
    ],
    subtotal: 649.99,
    discount: 0,
    tax: 52.00,
    total: 701.99,
    shippingAddress: "500 Madison Avenue, Floor 12, New York, NY 10022",
    billingAddress: "500 Madison Avenue, Floor 12, New York, NY 10022",
    paymentMethod: "Apple Pay",
    paymentStatus: "Paid",
    orderStatus: "Fulfilled",
    deliveryStatus: "Delivered",
    courierName: "UPS",
    trackingNumber: "1Z999AA10123456784",
    invoiceUrl: "/api/orders/ORD-5004/invoice",
    purchaseDate: "2026-07-06T14:30:00Z",
    expectedDeliveryDate: "2026-07-09T17:00:00Z",
    aiDelayRisk: false,
    aiDelayReason: ""
  }
];

const DEFAULT_WEBHOOKS: WebhookLog[] = [
  {
    id: "wh-001",
    storeName: "Shopify US Flagship",
    platform: "Shopify",
    event: "orders/create",
    payload: JSON.stringify({ id: "ORD-5001", total: 1349.00, customer: "Douglas Mercer" }, null, 2),
    processedAt: "2026-07-07T10:15:05Z",
    aiSummary: "Processed Shopify order ORD-5001. Customer matches. Generated invoice and notified warehouse staff."
  }
];

class DB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        let updated = false;
        if (!parsed.stores) { parsed.stores = DEFAULT_STORES; updated = true; }
        if (!parsed.orders) { parsed.orders = DEFAULT_ORDERS; updated = true; }
        if (!parsed.inventory) { parsed.inventory = DEFAULT_INVENTORY; updated = true; }
        if (!parsed.webhooks) { parsed.webhooks = DEFAULT_WEBHOOKS; updated = true; }
        if (updated) {
          this.save(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.error("Error loading db.json, falling back to defaults", err);
    }

    const initial: DatabaseSchema = {
      users: DEFAULT_USERS,
      tickets: DEFAULT_TICKETS,
      messages: DEFAULT_MESSAGES,
      attachments: [],
      history: DEFAULT_HISTORY,
      notifications: DEFAULT_NOTIFICATIONS,
      knowledgeBase: DEFAULT_KNOWLEDGE_BASE,
      activityLogs: DEFAULT_ACTIVITY_LOGS,
      aiPromptTemplate: DEFAULT_AI_PROMPT,
      stores: DEFAULT_STORES,
      orders: DEFAULT_ORDERS,
      inventory: DEFAULT_INVENTORY,
      webhooks: DEFAULT_WEBHOOKS
    };

    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema): void {
    try {
      const payload = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving db.json", err);
    }
  }

  // --- CRUD Users ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUser(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, "id" | "joinedDate">): User {
    const newUser: User = {
      ...user,
      id: "u-" + Math.random().toString(36).substr(2, 9),
      joinedDate: new Date().toISOString().split("T")[0]
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUser(id);
    if (user) {
      Object.assign(user, updates);
      this.save();
    }
    return user;
  }

  deleteUser(id: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- CRUD Tickets ---
  getTickets(): Ticket[] {
    return this.data.tickets;
  }

  getTicket(id: string): Ticket | undefined {
    return this.data.tickets.find(t => t.id === id);
  }

  createTicket(ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">): Ticket {
    const newTicket: Ticket = {
      ...ticket,
      id: "TCK-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.tickets.push(newTicket);
    this.save();

    // Trigger history log
    this.addHistory(newTicket.id, "Ticket created by customer", newTicket.customerName, Role.CUSTOMER);

    return newTicket;
  }

  updateTicket(id: string, updates: Partial<Ticket>, performerName: string, performerRole: Role): Ticket | undefined {
    const ticket = this.getTicket(id);
    if (ticket) {
      const oldStatus = ticket.status;
      const oldPriority = ticket.priority;
      const oldDept = ticket.department;
      const oldAgent = ticket.assignedAgentName;

      Object.assign(ticket, updates);
      ticket.updatedAt = new Date().toISOString();
      this.save();

      // Audit history
      if (updates.status && updates.status !== oldStatus) {
        this.addHistory(id, `Status updated from '${oldStatus}' to '${updates.status}'`, performerName, performerRole);
      }
      if (updates.priority && updates.priority !== oldPriority) {
        this.addHistory(id, `Priority updated from '${oldPriority}' to '${updates.priority}'`, performerName, performerRole);
      }
      if (updates.department && updates.department !== oldDept) {
        this.addHistory(id, `Department changed from '${oldDept}' to '${updates.department}'`, performerName, performerRole);
      }
      if (updates.assignedAgentId && updates.assignedAgentName !== oldAgent) {
        this.addHistory(id, `Assigned to Agent: ${updates.assignedAgentName}`, performerName, performerRole);
      }
    }
    return ticket;
  }

  // --- Messages ---
  getMessages(ticketId: string): TicketMessage[] {
    return this.data.messages.filter(m => m.ticketId === ticketId);
  }

  addMessage(message: Omit<TicketMessage, "id" | "createdAt">): TicketMessage {
    const newMessage: TicketMessage = {
      ...message,
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.data.messages.push(newMessage);
    this.save();

    // Update ticket modified timestamp
    const t = this.getTicket(message.ticketId);
    if (t) {
      t.updatedAt = new Date().toISOString();
      this.save();
    }

    return newMessage;
  }

  // --- Attachments ---
  getAttachments(ticketId: string): Attachment[] {
    return this.data.attachments.filter(a => a.ticketId === ticketId);
  }

  addAttachment(attachment: Omit<Attachment, "id" | "uploadedAt">): Attachment {
    const newAttachment: Attachment = {
      ...attachment,
      id: "att-" + Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date().toISOString()
    };
    this.data.attachments.push(newAttachment);
    this.save();
    return newAttachment;
  }

  // --- History ---
  getHistory(ticketId: string): TicketHistory[] {
    return this.data.history.filter(h => h.ticketId === ticketId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }

  addHistory(ticketId: string, action: string, performedBy: string, performedByRole: Role): TicketHistory {
    const newHist: TicketHistory = {
      id: "hist-" + Math.random().toString(36).substr(2, 9),
      ticketId,
      action,
      performedBy,
      performedByRole,
      createdAt: new Date().toISOString()
    };
    this.data.history.push(newHist);
    this.save();
    return newHist;
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }

  addNotification(notification: Omit<Notification, "id" | "isRead" | "createdAt">): Notification {
    const newNotif: Notification = {
      ...notification,
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationAsRead(id: string): void {
    const n = this.data.notifications.find(notif => notif.id === id);
    if (n) {
      n.isRead = true;
      this.save();
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.save();
  }

  // --- Knowledge Base ---
  getKBArticles(): KnowledgeBaseArticle[] {
    return this.data.knowledgeBase;
  }

  createKBArticle(article: Omit<KnowledgeBaseArticle, "id" | "views" | "helpfulCount" | "createdAt">): KnowledgeBaseArticle {
    const newArt: KnowledgeBaseArticle = {
      ...article,
      id: "kb-" + Math.floor(100 + Math.random() * 900),
      views: 0,
      helpfulCount: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };
    this.data.knowledgeBase.push(newArt);
    this.save();
    return newArt;
  }

  helpfulArticle(id: string): void {
    const art = this.data.knowledgeBase.find(a => a.id === id);
    if (art) {
      art.helpfulCount++;
      art.views++;
      this.save();
    }
  }

  incrementKBViews(id: string): void {
    const art = this.data.knowledgeBase.find(a => a.id === id);
    if (art) {
      art.views++;
      this.save();
    }
  }

  // --- Audit Logs ---
  getActivityLogs(): ActivityLog[] {
    return this.data.activityLogs.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }

  addActivityLog(log: Omit<ActivityLog, "id" | "createdAt">): ActivityLog {
    const newLog: ActivityLog = {
      ...log,
      id: "act-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.data.activityLogs.push(newLog);
    this.save();
    return newLog;
  }

  // --- Prompt Management ---
  getAIPromptTemplate(): string {
    return this.data.aiPromptTemplate;
  }

  setAIPromptTemplate(template: string): void {
    this.data.aiPromptTemplate = template;
    this.save();
  }

  // --- E-Commerce Stores CRUD ---
  getStores(): Store[] {
    return this.data.stores || [];
  }

  getStore(id: string): Store | undefined {
    return this.getStores().find(s => s.id === id);
  }

  createStore(store: Omit<Store, "id" | "syncedAt">): Store {
    const newStore: Store = {
      ...store,
      id: "store-" + Math.random().toString(36).substr(2, 9),
      syncedAt: "Never"
    };
    if (!this.data.stores) this.data.stores = [];
    this.data.stores.push(newStore);
    this.save();
    return newStore;
  }

  updateStore(id: string, updates: Partial<Store>): Store | undefined {
    const store = this.getStore(id);
    if (store) {
      Object.assign(store, updates);
      this.save();
    }
    return store;
  }

  // --- E-Commerce Orders CRUD ---
  getOrders(): Order[] {
    return this.data.orders || [];
  }

  getOrder(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  createOrder(order: Omit<Order, "id">): Order {
    const newOrder: Order = {
      ...order,
      id: "ORD-" + Math.floor(5000 + Math.random() * 5000)
    };
    if (!this.data.orders) this.data.orders = [];
    this.data.orders.push(newOrder);
    this.save();
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const order = this.getOrder(id);
    if (order) {
      Object.assign(order, updates);
      this.save();
    }
    return order;
  }

  deleteOrder(id: string): boolean {
    if (!this.data.orders) return false;
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.data.orders.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Warehouse Inventory Management ---
  getInventory(): InventoryItem[] {
    return this.data.inventory || [];
  }

  getInventoryItem(id: string): InventoryItem | undefined {
    return this.getInventory().find(i => i.id === id);
  }

  updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | undefined {
    const item = this.getInventoryItem(id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  }

  updateInventoryQuantity(id: string, quantity: number): InventoryItem | undefined {
    const item = this.getInventoryItem(id);
    if (item) {
      item.quantity = quantity;
      this.save();
    }
    return item;
  }

  // --- AI Webhooks System ---
  getWebhookLogs(): WebhookLog[] {
    return this.data.webhooks || [];
  }

  addWebhookLog(log: Omit<WebhookLog, "id" | "processedAt">): WebhookLog {
    const newLog: WebhookLog = {
      ...log,
      id: "wh-" + Math.random().toString(36).substr(2, 9),
      processedAt: new Date().toISOString()
    };
    if (!this.data.webhooks) this.data.webhooks = [];
    this.data.webhooks.push(newLog);
    this.save();
    return newLog;
  }
}

export const db = new DB();
