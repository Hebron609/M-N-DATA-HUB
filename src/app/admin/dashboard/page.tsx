"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, ShoppingCart, Wallet } from "lucide-react";
import {
  adminDemoMetrics,
  adminDemoTransactions,
  type AdminDemoMetrics,
  type AdminDemoTransaction,
} from "@/lib/admin-demo-data";

type Metrics = {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  totalDeposits: number;
  estimatedProfit: number;
};

type Tx = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  reference: string | null;
  product: { name: string; category: string };
  user: { name: string | null; email: string };
};

function formatCurrency(value: number) {
  return `GHS ${Number(value || 0).toFixed(2)}`;
}

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState<Metrics>(adminDemoMetrics);
  const [transactions, setTransactions] = useState<Tx[]>(adminDemoTransactions);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataSource, setDataSource] = useState<"demo" | "live">("demo");

  const loadData = () => {
    Promise.all([
      fetch("/api/admin/metrics").then((r) => r.json()),
      fetch("/api/admin/transactions?limit=8").then((r) => r.json()),
    ])
      .then(([m, t]) => {
        if (m?.success) {
          setMetrics(m.metrics);
          setDataSource("live");
        }
        if (t?.success && (t.transactions || []).length > 0) {
          setTransactions(t.transactions || []);
          setDataSource("live");
        }
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0a2144]">
            Dashboard Overview
          </h2>
          <p className="text-[#5f7088] text-sm">
            Data services command center with Postgres-backed metrics.
          </p>
          <p className="mt-2 inline-flex rounded-full bg-[#eef7ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a2144]">
            {dataSource === "demo" ? "Demo data preview" : "Live data"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-[#6f819b]">
              Updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={loadData}
            className="rounded-xl border border-[#c9d9ec] bg-white px-4 py-2 text-sm font-semibold text-[#0a2144] hover:bg-[#f8fbff]"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
              Total Revenue
            </p>
            <TrendingUp className="h-5 w-5 text-[#0ea5a8]" />
          </div>
          <p className="mt-3 text-2xl font-black text-[#0a2144]">
            {formatCurrency(metrics.totalRevenue)}
          </p>
        </div>

        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
              Orders
            </p>
            <ShoppingCart className="h-5 w-5 text-[#0a2144]" />
          </div>
          <p className="mt-3 text-2xl font-black text-[#0a2144]">
            {metrics.totalOrders}
          </p>
        </div>

        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
              Active Users (30d)
            </p>
            <Users className="h-5 w-5 text-[#f59e0b]" />
          </div>
          <p className="mt-3 text-2xl font-black text-[#0a2144]">
            {metrics.activeUsers}
          </p>
        </div>

        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
              Completed Deposits
            </p>
            <Wallet className="h-5 w-5 text-[#0ea5a8]" />
          </div>
          <p className="mt-3 text-2xl font-black text-[#0a2144]">
            {formatCurrency(metrics.totalDeposits)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0a2144]">
            Recent Transactions
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-widest text-[#6f819b] border-b border-[#d6e1f0]">
                  <th className="py-3">Product</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-[#ebf1f8]">
                    <td className="py-3 text-sm font-semibold text-[#0a2144]">
                      {t.product.name}
                    </td>
                    <td className="py-3 text-sm text-[#5f7088]">
                      {t.user.name || t.user.email}
                    </td>
                    <td className="py-3 text-sm font-bold text-[#0a2144]">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 text-xs font-bold uppercase text-[#5f7088]">
                      {t.status}
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-[#6f819b]"
                    >
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0a2144]">Estimated Profit</h3>
          <p className="mt-2 text-sm text-[#5f7088]">
            Using current 10% margin estimate.
          </p>
          <p className="mt-5 text-3xl font-black text-[#0ea5a8]">
            {formatCurrency(metrics.estimatedProfit)}
          </p>

          <div className="mt-6 rounded-2xl bg-[#f8fbff] border border-[#d6e1f0] p-4">
            <p className="text-xs uppercase tracking-widest font-bold text-[#6f819b]">
              Operations Note
            </p>
            <p className="mt-2 text-sm text-[#4a5d77] leading-relaxed">
              Real-time fulfillment and margin precision can be improved by
              adding provider cost logs per package.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
