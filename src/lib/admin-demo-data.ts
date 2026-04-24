export type AdminDemoTransaction = {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  reference: string | null;
  createdAt: string;
  recipientNumber: string;
  product: { name: string; category: string };
  user: { name: string | null; email: string };
};

export type AdminDemoDeposit = {
  id: string;
  method: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  reference: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
};

export type AdminDemoMetrics = {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  totalDeposits: number;
  estimatedProfit: number;
  networkCounts: Record<string, number>;
  daily: Array<{
    day: string;
    revenue: number;
    orders: number;
    profit: number;
  }>;
};

export const adminDemoMetrics: AdminDemoMetrics = {
  totalRevenue: 8420.5,
  totalOrders: 128,
  activeUsers: 94,
  totalDeposits: 12650,
  estimatedProfit: 842.05,
  networkCounts: {
    MTN: 56,
    AirtelTigo: 39,
    Telecel: 33,
  },
  daily: [
    { day: "Mon", revenue: 920, orders: 14, profit: 92 },
    { day: "Tue", revenue: 1180, orders: 19, profit: 118 },
    { day: "Wed", revenue: 960, orders: 15, profit: 96 },
    { day: "Thu", revenue: 1440, orders: 21, profit: 144 },
    { day: "Fri", revenue: 1320, orders: 22, profit: 132 },
    { day: "Sat", revenue: 1530, orders: 25, profit: 153 },
    { day: "Sun", revenue: 1070, orders: 12, profit: 107 },
  ],
};

export const adminDemoTransactions: AdminDemoTransaction[] = [
  {
    id: "txn_demo_001",
    amount: 45,
    status: "COMPLETED",
    reference: "MN-APR-2201",
    createdAt: "2026-04-17T08:12:00.000Z",
    recipientNumber: "0241234567",
    product: { name: "MTN Bundle", category: "MTN" },
    user: { name: "Ama Mensah", email: "ama@example.com" },
  },
  {
    id: "txn_demo_002",
    amount: 60,
    status: "PROCESSING",
    reference: "MN-APR-2202",
    createdAt: "2026-04-17T09:05:00.000Z",
    recipientNumber: "0207654321",
    product: { name: "AirtelTigo iShare", category: "AirtelTigo" },
    user: { name: "Kojo Mensah", email: "kojo@example.com" },
  },
  {
    id: "txn_demo_003",
    amount: 120,
    status: "COMPLETED",
    reference: "MN-APR-2203",
    createdAt: "2026-04-17T10:18:00.000Z",
    recipientNumber: "0557788990",
    product: { name: "Telecel Non-Expiry", category: "Telecel" },
    user: { name: "Efya Boateng", email: "efya@example.com" },
  },
  {
    id: "txn_demo_004",
    amount: 80,
    status: "FAILED",
    reference: "MN-APR-2204",
    createdAt: "2026-04-17T10:42:00.000Z",
    recipientNumber: "0271112233",
    product: { name: "MTN Bundle", category: "MTN" },
    user: { name: null, email: "samuel@example.com" },
  },
];

export const adminDemoDeposits: AdminDemoDeposit[] = [
  {
    id: "dep_demo_001",
    method: "Mobile Money",
    amount: 4000,
    status: "COMPLETED",
    reference: "DEP-APR-1001",
    createdAt: "2026-04-16T12:10:00.000Z",
    user: { name: "Treasury Team", email: "treasury@example.com" },
  },
  {
    id: "dep_demo_002",
    method: "Bank Transfer",
    amount: 2500,
    status: "COMPLETED",
    reference: "DEP-APR-1002",
    createdAt: "2026-04-17T07:30:00.000Z",
    user: { name: "Treasury Team", email: "treasury@example.com" },
  },
  {
    id: "dep_demo_003",
    method: "Mobile Money",
    amount: 1250,
    status: "PENDING",
    reference: "DEP-APR-1003",
    createdAt: "2026-04-17T11:15:00.000Z",
    user: { name: "Treasury Team", email: "treasury@example.com" },
  },
];

export const adminDemoProducts = [
  {
    id: "mtn1",
    name: "MTN Bundle",
    category: "MTN",
    price: 4.3,
    description: "Reliable MTN data plans for daily browsing.",
    inStock: true,
    createdAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "airteltigo1",
    name: "AirtelTigo iShare",
    category: "AirtelTigo",
    price: 3.8,
    description: "Instant iShare delivery with flexible sizes.",
    inStock: true,
    createdAt: "2026-04-11T09:00:00.000Z",
  },
  {
    id: "telecel1",
    name: "Telecel Non-Expiry",
    category: "Telecel",
    price: 41,
    description: "Telecel plans that never expire.",
    inStock: true,
    createdAt: "2026-04-12T09:00:00.000Z",
  },
];
