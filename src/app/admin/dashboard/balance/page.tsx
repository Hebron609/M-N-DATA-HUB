"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Wallet, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { adminDemoMetrics, adminDemoTransactions } from "@/lib/admin-demo-data";

type Metrics = {
  totalRevenue: number;
  totalDeposits: number;
  networkCounts: Record<string, number>;
};

type Tx = {
  id: string;
  reference?: string | null;
  amount: number;
  status: string;
  createdAt: string;
  recipientNumber: string;
  product: { name: string; category: string };
  user: { name: string | null; email: string };
};

function formatCurrency(value: number) {
  return `GHS ${Number(value || 0).toFixed(2)}`;
}

export default function BalancePage() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalRevenue: adminDemoMetrics.totalRevenue,
    totalDeposits: adminDemoMetrics.totalDeposits,
    networkCounts: adminDemoMetrics.networkCounts,
  });
  const [recentOrders, setRecentOrders] = useState<Tx[]>(adminDemoTransactions);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataSource, setDataSource] = useState<"demo" | "live">("demo");
  const [loading, setLoading] = useState(false);

  const minBalance = 50;
  const lowBalanceThreshold = 20;

  const loadMetrics = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/metrics").then((r) => r.json()),
      fetch("/api/admin/transactions?limit=10").then((r) => r.json()),
    ])
      .then(([m, t]) => {
        if (m?.success) {
          setMetrics(m.metrics);
          setDataSource("live");
        }
        if (t?.success && (t.transactions || []).length > 0) {
          setRecentOrders(t.transactions || []);
          setDataSource("live");
        }
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const first = setTimeout(loadMetrics, 0);
    const timer = setInterval(loadMetrics, 20000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const networkRows = Object.entries(metrics.networkCounts);
  const currentBalance = Math.max(
    0,
    metrics.totalDeposits - metrics.totalRevenue,
  );

  const balanceStatus =
    currentBalance <= 0
      ? "Critical"
      : currentBalance < lowBalanceThreshold
        ? "Low"
        : currentBalance < minBalance
          ? "Warning"
          : "Healthy";

  const serviceActive = currentBalance >= minBalance;

  const alerts = [
    currentBalance <= 0
      ? {
          title: "Critical balance",
          message:
            "Funding is exhausted. New orders should be paused immediately.",
          className: "border border-rose-200 bg-rose-50 text-rose-800",
          icon: <AlertTriangle className="h-5 w-5" />,
        }
      : null,
    currentBalance > 0 && currentBalance < lowBalanceThreshold
      ? {
          title: "Low balance alert",
          message: "Top up soon to avoid fulfillment interruptions.",
          className: "border border-amber-200 bg-amber-50 text-amber-800",
          icon: <AlertTriangle className="h-5 w-5" />,
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    message: string;
    className: string;
    icon: ReactNode;
  }>;

  const completedDepositsOnly = recentOrders.filter(
    (t) => t.status === "COMPLETED",
  );
  const lastTopUpAmount = completedDepositsOnly[0]?.amount || 0;
  const lastTopUpDate = completedDepositsOnly[0]?.createdAt || null;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0a2144]">
            InstantData Balance
          </h1>
          <p className="text-sm text-[#5f7088]">
            Track system balance and data provisioning
          </p>
          <p className="mt-2 inline-flex rounded-full bg-[#eef7ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a2144]">
            {dataSource === "demo" ? "Demo data preview" : "Live data"}
          </p>
        </div>
        <button
          onClick={loadMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0a2144] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123a70] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <section className="rounded-3xl border border-[#d6e1f0] bg-linear-to-br from-[#eef7ff] to-[#f4fffb] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0a2144]">
            Current Balance
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              balanceStatus === "Healthy"
                ? "bg-emerald-100 text-emerald-700"
                : balanceStatus === "Warning"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
            }`}
          >
            {balanceStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm text-[#6f819b]">Current Balance</p>
            <p className="mt-2 text-4xl font-black text-[#0a2144]">
              GH₵{currentBalance.toFixed(2)}
            </p>
            <p className="mt-2 text-xs text-[#6f819b]">
              {lastUpdated ? `Updated: ${lastUpdated}` : "Live balance"}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm text-[#6f819b]">Minimum Required</p>
            <p className="mt-2 text-4xl font-black text-amber-600">
              GH₵{minBalance.toFixed(2)}
            </p>
            <p className="mt-2 text-xs text-[#6f819b]">
              To keep service active
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm text-[#6f819b]">Low Balance Alert</p>
            <p className="mt-2 text-4xl font-black text-rose-600">
              GH₵{lowBalanceThreshold.toFixed(2)}
            </p>
            <p className="mt-2 text-xs text-[#6f819b]">
              Alert trigger threshold
            </p>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mt-6 space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.title}
                className={`flex items-start gap-3 rounded-xl p-4 ${alert.className}`}
              >
                {alert.icon}
                <div>
                  <p className="font-semibold">{alert.title}</p>
                  <p className="text-sm">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0a2144]">
            <ShieldCheck className="h-5 w-5 text-[#0ea5a8]" /> Service Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#5f7088]">Service Active</span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${serviceActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
              >
                {serviceActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-[#6f819b]">
              Service status is derived from the current balance threshold.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#0a2144]">
            Last Top-up
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-[#6f819b]">
              Recent Completed Order Value
            </p>
            <p className="text-3xl font-black text-[#0a2144]">
              GH₵{lastTopUpAmount.toFixed(2)}
            </p>
            <p className="text-sm text-[#6f819b]">
              Date:{" "}
              {lastTopUpDate
                ? new Date(lastTopUpDate).toLocaleString()
                : "No records"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0a2144]">
          <Wallet className="h-5 w-5 text-[#0ea5a8]" /> Recent Data Orders
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest text-[#6f819b] border-b border-[#d6e1f0]">
                <th className="py-3">Order ID</th>
                <th className="py-3">Network</th>
                <th className="py-3">User</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Data</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#ebf1f8] last:border-0 hover:bg-[#f8fbff]"
                >
                  <td className="py-3">
                    <span className="rounded bg-[#eef7ff] px-2 py-1 text-xs font-mono text-[#0a2144]">
                      {order.reference || order.id}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-[#5f7088]">
                    {order.product?.category || "-"}
                  </td>
                  <td className="py-3 text-sm text-[#5f7088]">
                    {order.user?.email || order.user?.name || "-"}
                  </td>
                  <td className="py-3 text-sm text-[#5f7088]">
                    {order.recipientNumber || "-"}
                  </td>
                  <td className="py-3 text-sm text-[#5f7088]">
                    {order.product?.name || "-"}
                  </td>
                  <td className="py-3 text-sm font-semibold text-emerald-700">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        order.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "FAILED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-[#6f819b]">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-sm text-center text-[#6f819b]"
                  >
                    No recent orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#0a2144]">
          Network Consumption Snapshot
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {networkRows.map(([name, count]) => (
            <div
              key={name}
              className="rounded-2xl border border-[#e4edf7] bg-[#f8fbff] p-4"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
                {name}
              </p>
              <p className="mt-2 text-2xl font-black text-[#0a2144]">{count}</p>
            </div>
          ))}
          {networkRows.length === 0 && (
            <p className="text-sm text-[#6f819b]">
              No network usage recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
