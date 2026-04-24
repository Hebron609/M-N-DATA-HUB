"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Search, PlusCircle, Wrench, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  adminDemoMetrics,
  adminDemoProducts,
  adminDemoTransactions,
} from "@/lib/admin-demo-data";

type Tx = {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  reference: string | null;
  recipientNumber: string;
  createdAt: string;
  product: { name: string; category: string };
  user: { name: string | null; email: string };
};

type StreamPayload = {
  transactions: Tx[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    statusCounts: Record<string, number>;
  };
};

type ProductOption = {
  id: string;
  name: string;
  category: string;
  price: number;
};

const statusClass: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  PROCESSING: "bg-cyan-100 text-cyan-800 border-cyan-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  FAILED: "bg-rose-100 text-rose-800 border-rose-200",
};

function formatCurrency(value: number) {
  return `GHS ${Number(value || 0).toFixed(2)}`;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Tx[]>(adminDemoTransactions);
  const [products, setProducts] = useState<ProductOption[]>(adminDemoProducts);
  const [query, setQuery] = useState("");
  const [network, setNetwork] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [connection, setConnection] = useState("Connecting...");
  const [lastSynced, setLastSynced] = useState<string>("");
  const [dataSource, setDataSource] = useState<"demo" | "live">("demo");
  const [submittingManual, setSubmittingManual] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    [],
  );
  const [summary, setSummary] = useState<StreamPayload["summary"]>({
    totalRevenue: adminDemoMetrics.totalRevenue,
    totalOrders: adminDemoMetrics.totalOrders,
    statusCounts: {
      COMPLETED: adminDemoTransactions.filter((t) => t.status === "COMPLETED")
        .length,
      PROCESSING: adminDemoTransactions.filter((t) => t.status === "PROCESSING")
        .length,
      FAILED: adminDemoTransactions.filter((t) => t.status === "FAILED").length,
      PENDING: adminDemoTransactions.filter((t) => t.status === "PENDING")
        .length,
    },
  });
  const [manualForm, setManualForm] = useState({
    productId: "",
    recipientNumber: "",
    amount: "",
    customerEmail: "",
    customerName: "",
    reference: "",
  });

  const reloadSnapshot = useCallback(() => {
    setConnection("Syncing...");

    Promise.all([
      fetch("/api/admin/transactions?limit=200").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
    ])
      .then(([transactionsJson, productsJson]) => {
        if (transactionsJson?.success) {
          const tx = transactionsJson.transactions || [];
          if (tx.length > 0) {
            setTransactions(tx);
            setSummary(
              transactionsJson.summary || {
                totalRevenue: 0,
                totalOrders: tx.length,
                statusCounts: {},
              },
            );
            setDataSource("live");
          }
        }

        if (productsJson?.success) {
          const items = productsJson.products || [];
          if (items.length > 0) {
            setProducts(items);
            setDataSource("live");
          }
          if (items.length > 0) {
            setManualForm((prev) => ({
              ...prev,
              productId: prev.productId || items[0].id,
            }));
          }
        }

        setLastSynced(new Date().toLocaleTimeString());
        setConnection("Live");
      })
      .catch(() => setConnection("Reconnecting..."));
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      reloadSnapshot();
    }

    return () => {
      mounted = false;
    };
  }, [reloadSnapshot]);

  useEffect(() => {
    const source = new EventSource("/api/admin/transactions/stream");

    source.addEventListener("ready", () => setConnection("Live"));
    source.addEventListener("transactions", (evt) => {
      try {
        const payload = JSON.parse((evt as MessageEvent).data) as StreamPayload;
        setTransactions(payload.transactions || []);
        setSummary(payload.summary);
        setConnection("Live");
      } catch {
        setConnection("Parsing stream...");
      }
    });

    source.onerror = () => setConnection("Reconnecting...");

    return () => source.close();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const q = query.toLowerCase();
      const matchesQ =
        !q ||
        t.product.name.toLowerCase().includes(q) ||
        (t.reference || "").toLowerCase().includes(q) ||
        t.user.email.toLowerCase().includes(q) ||
        (t.user.name || "").toLowerCase().includes(q);

      const matchesNetwork =
        network === "ALL" || t.product.category === network;
      const matchesStatus = status === "ALL" || t.status === status;

      return matchesQ && matchesNetwork && matchesStatus;
    });
  }, [transactions, query, network, status]);

  const selectAllChecked =
    filtered.length > 0 && selectedTransactions.length === filtered.length;

  const toggleSelect = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectAllChecked) {
      setSelectedTransactions([]);
      return;
    }
    setSelectedTransactions(filtered.map((t) => t.id));
  };

  const totalRevenue = filtered
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);
  const commission = totalRevenue * 0.1;

  const revenueTrend = useMemo(() => {
    const daily = new Map<string, number>();
    filtered.forEach((tx) => {
      const key = new Date(tx.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      daily.set(key, (daily.get(key) || 0) + tx.amount);
    });

    return Array.from(daily.entries()).map(([day, amount]) => ({
      day,
      amount,
    }));
  }, [filtered]);

  const networkBreakdown = useMemo(() => {
    const counts = filtered.reduce<Record<string, number>>((acc, tx) => {
      const key = tx.product?.category || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const deleteSelected = async () => {
    if (selectedTransactions.length === 0) return;
    const confirmed = window.confirm(
      `Delete ${selectedTransactions.length} selected transaction(s)?`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedTransactions }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        alert(json?.message || "Failed to delete selected transactions.");
        return;
      }
      setTransactions((prev) =>
        prev.filter((tx) => !selectedTransactions.includes(tx.id)),
      );
      setSelectedTransactions([]);
    } catch {
      alert("Failed to delete selected transactions.");
    }
  };

  const clearAllTransactions = async () => {
    const confirmed = window.confirm(
      "Delete all visible transactions? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        alert(json?.message || "Failed to clear transactions.");
        return;
      }
      setTransactions([]);
      setSelectedTransactions([]);
    } catch {
      alert("Failed to clear transactions.");
    }
  };

  const exportCsv = () => {
    const rows = [
      [
        "Reference",
        "Product",
        "Network",
        "Amount",
        "Status",
        "Customer",
        "Phone",
        "Date",
      ],
      ...filtered.map((t) => [
        t.reference || t.id,
        t.product.name,
        t.product.category,
        `${t.amount}`,
        t.status,
        t.user.name || t.user.email,
        t.recipientNumber,
        new Date(t.createdAt).toISOString(),
      ]),
    ];

    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createManual = async () => {
    if (submittingManual) return;
    setSubmittingManual(true);

    try {
      const res = await fetch("/api/admin/transactions/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...manualForm,
          amount: Number(manualForm.amount),
          reference: manualForm.reference || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        alert(json?.message || "Failed to add manual transaction.");
        return;
      }

      setTransactions((prev) => [json.transaction, ...prev]);
      setManualForm((prev) => ({
        ...prev,
        recipientNumber: "",
        amount: "",
        customerEmail: "",
        customerName: "",
        reference: "",
      }));
    } catch {
      alert("Failed to add manual transaction.");
    } finally {
      setSubmittingManual(false);
    }
  };

  const resolveTransaction = async (transactionId: string) => {
    const confirmed = window.confirm(
      "Mark this transaction as manually resolved/completed?",
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/transactions/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        alert(json?.message || "Failed to resolve transaction.");
        return;
      }

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId ? { ...t, status: "COMPLETED" } : t,
        ),
      );
    } catch {
      alert("Failed to resolve transaction.");
    }
  };

  return (
    <div className="relative space-y-8 pb-12">
      <div className="pointer-events-none absolute -left-8 -top-4 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-52 w-52 rounded-full bg-amber-200/25 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-100/70" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#0ea5a8]">
              Live Transaction Hub
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0a2144] sm:text-4xl">
              Transactions
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5f7088]">
              Live data-service transactions via SSE stream, with manual
              entries, resolution controls, and quick export tools.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a2144]">
                {dataSource === "demo" ? "Demo data preview" : "Live data"}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${connection === "Live" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
              >
                {connection}
              </span>
              {lastSynced && (
                <span className="text-xs font-semibold text-[#6f819b]">
                  Last sync: {lastSynced}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl">
            <button
              onClick={reloadSnapshot}
              className="inline-flex items-center gap-2 rounded-xl border border-[#c9d9ec] bg-white px-4 py-2 text-sm font-semibold text-[#0a2144] transition hover:bg-[#f8fbff]"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0a2144] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#123a70]"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-[#d6e1f0] bg-[#f0fbff] p-4 shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[#6f819b] uppercase">
            Revenue
          </p>
          <p className="mt-1 text-2xl font-black text-[#0a2144]">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="rounded-3xl border border-[#d6e1f0] bg-[#f8fbff] p-4 shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[#6f819b] uppercase">
            Total Transactions
          </p>
          <p className="mt-1 text-2xl font-black text-[#0a2144]">
            {filtered.length}
          </p>
        </div>
        <div className="rounded-3xl border border-[#d6e1f0] bg-[#effcf8] p-4 shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[#6f819b] uppercase">
            Commission (10%)
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {formatCurrency(commission)}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white/90 p-5 shadow-sm backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#4f647f]">
          <PlusCircle className="h-4 w-4 text-[#0ea5a8]" />
          Manual Transaction Entry
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-5">
          <select
            title="Select product"
            aria-label="Select product"
            value={manualForm.productId}
            onChange={(e) =>
              setManualForm((prev) => ({ ...prev, productId: e.target.value }))
            }
            className="rounded-xl border border-[#c9d9ec] px-3 py-2 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.category})
              </option>
            ))}
          </select>

          <input
            type="text"
            value={manualForm.recipientNumber}
            onChange={(e) =>
              setManualForm((prev) => ({
                ...prev,
                recipientNumber: e.target.value,
              }))
            }
            placeholder="Recipient phone"
            className="rounded-xl border border-[#c9d9ec] px-3 py-2 text-sm"
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={manualForm.amount}
            onChange={(e) =>
              setManualForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            placeholder="Amount"
            className="rounded-xl border border-[#c9d9ec] px-3 py-2 text-sm"
          />

          <input
            type="email"
            value={manualForm.customerEmail}
            onChange={(e) =>
              setManualForm((prev) => ({
                ...prev,
                customerEmail: e.target.value,
              }))
            }
            placeholder="Customer email"
            className="rounded-xl border border-[#c9d9ec] px-3 py-2 text-sm"
          />

          <input
            type="text"
            value={manualForm.customerName}
            onChange={(e) =>
              setManualForm((prev) => ({
                ...prev,
                customerName: e.target.value,
              }))
            }
            placeholder="Customer name"
            className="rounded-xl border border-[#c9d9ec] px-3 py-2 text-sm"
          />

          <input
            type="text"
            value={manualForm.reference}
            onChange={(e) =>
              setManualForm((prev) => ({ ...prev, reference: e.target.value }))
            }
            placeholder="Reference (optional)"
            className="rounded-xl border border-[#c9d9ec] px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-5">
          <button
            onClick={createManual}
            disabled={submittingManual}
            className="rounded-xl bg-[#0a2144] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123a70] disabled:opacity-60"
          >
            {submittingManual ? "Saving..." : "Add Manual Transaction"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f819b]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, ref, user..."
              className="w-full rounded-xl py-2 pl-10 pr-4 text-sm border border-[#c9d9ec] focus:outline-none focus:ring-2 focus:ring-[#0ea5a8]/35"
            />
          </div>

          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            title="Filter by network"
            aria-label="Filter by network"
            className="rounded-xl border border-[#c9d9ec] px-3 py-2 text-sm"
          >
            <option value="ALL">All Networks</option>
            <option value="MTN">MTN</option>
            <option value="AirtelTigo">AirtelTigo</option>
            <option value="Telecel">Telecel</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            title="Filter by status"
            aria-label="Filter by status"
            className="rounded-xl border border-[#c9d9ec] px-3 py-2 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>

          <div className="rounded-xl border border-[#d6e1f0] bg-[#f8fbff] px-3 py-2 text-sm text-[#5f7088]">
            Total Orders:{" "}
            <span className="font-bold text-[#0a2144]">
              {summary.totalOrders}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {selectedTransactions.length > 0 && (
            <button
              onClick={deleteSelected}
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Delete Selected ({selectedTransactions.length})
            </button>
          )}
          <button
            onClick={clearAllTransactions}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-[#0a2144]">
            Revenue Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="amount" fill="#0a2144" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-[#0a2144]">
            Network Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={networkBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {networkBreakdown.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        ["#0ea5a8", "#0a2144", "#f59e0b", "#ef4444"][idx % 4]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#d6e1f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest text-[#6f819b] bg-[#f8fbff]">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={toggleSelectAll}
                    title="Select all"
                    aria-label="Select all"
                  />
                </th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Network</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebf1f8]">
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className={`hover:bg-[#f8fbff] transition-colors ${selectedTransactions.includes(order.id) ? "bg-[#eef7ff]" : ""}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      title="Select row"
                      aria-label="Select row"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-[#0a2144]">
                        {order.product.name}
                      </p>
                      <p className="text-[11px] font-mono text-[#6f819b]">
                        {order.reference || order.id}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#0a2144]">
                      {order.user.name || "Guest"}
                    </p>
                    <p className="text-xs text-[#6f819b]">{order.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f7088]">
                    {order.product.category}
                  </td>
                  <td className="px-6 py-4 font-black text-[#0a2144]">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${statusClass[order.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f7088]">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {(order.status === "FAILED" ||
                      order.status === "PROCESSING") && (
                      <button
                        onClick={() => resolveTransaction(order.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                      >
                        <Wrench className="h-3.5 w-3.5" /> Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-[#6f819b]"
                  >
                    No transactions found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
