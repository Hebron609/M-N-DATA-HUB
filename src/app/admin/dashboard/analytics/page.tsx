"use client";

import { useEffect, useMemo, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, ShoppingBag, Clock, Download, Trash2 } from "lucide-react";
import { adminDemoMetrics } from "@/lib/admin-demo-data";

type Metrics = {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  daily: Array<{
    day: string;
    revenue: number;
    orders: number;
    profit: number;
  }>;
  networkCounts: Record<string, number>;
};

const networkColors = ["#0f766e", "#0ea5e9", "#f59e0b", "#dc2626"];

function formatCurrency(value: number) {
  return `GHS ${Number(value || 0).toFixed(2)}`;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalRevenue: adminDemoMetrics.totalRevenue,
    totalOrders: adminDemoMetrics.totalOrders,
    activeUsers: adminDemoMetrics.activeUsers,
    daily: adminDemoMetrics.daily,
    networkCounts: adminDemoMetrics.networkCounts,
  });
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataSource, setDataSource] = useState<"demo" | "live">("demo");
  const [dateRange, setDateRange] = useState("7");
  const [metricType, setMetricType] = useState<"revenue" | "orders" | "profit">(
    "revenue",
  );

  const loadMetrics = () => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) {
          setMetrics(json.metrics);
          setDataSource("live");
          setLastUpdated(new Date().toLocaleTimeString());
        }
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    loadMetrics();
    const timer = setInterval(loadMetrics, 20000);
    return () => clearInterval(timer);
  }, []);

  const networkData = useMemo(
    () =>
      Object.entries(metrics.networkCounts).map(([name, value], index) => ({
        name,
        value,
        color: networkColors[index % networkColors.length],
      })),
    [metrics.networkCounts],
  );

  const avgOrderValue =
    metrics.totalOrders > 0 ? metrics.totalRevenue / metrics.totalOrders : 0;

  const filteredDaily = useMemo(() => {
    const days = Number(dateRange);
    if (!Number.isFinite(days) || days <= 0) return metrics.daily;
    return metrics.daily.slice(-Math.min(days, metrics.daily.length));
  }, [metrics.daily, dateRange]);

  const chartKey =
    metricType === "revenue"
      ? "revenue"
      : metricType === "orders"
        ? "orders"
        : "profit";

  const exportAnalyticsCSV = () => {
    const rows = [
      ["Day", "Revenue", "Orders", "Profit"],
      ...filteredDaily.map((d) => [d.day, d.revenue, d.orders, d.profit]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAnalyticsData = () => {
    const confirmed = window.confirm(
      "Reset current analytics filters and chart preferences?",
    );
    if (!confirmed) return;
    setDateRange("7");
    setMetricType("revenue");
  };

  return (
    <div className="relative space-y-8 pb-12">
      <div className="pointer-events-none absolute -left-8 -top-4 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-52 w-52 rounded-full bg-violet-200/25 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-100/70" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#0ea5a8]">
              Insights Console
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0a2144] sm:text-4xl">
              Analytics &amp; Insights
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5f7088]">
              Operational insight into revenue, order mix, and recent activity
              across the data-service workflow.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a2144]">
                {dataSource === "demo" ? "Demo data preview" : "Live data"}
              </span>
              {lastUpdated && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6f819b] shadow-sm">
                  Updated: {lastUpdated}
                </span>
              )}
              <span className="rounded-full bg-[#0a2144] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Live metrics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl">
            <select
              title="Analytics range"
              aria-label="Analytics range"
              className="rounded-xl border border-[#c9d9ec] bg-white px-4 py-2 text-sm focus:outline-none"
            >
              <option>Last 7 Days</option>
            </select>
            <button
              onClick={loadMetrics}
              className="rounded-xl border border-[#c9d9ec] bg-white px-4 py-2 text-sm font-semibold text-[#0a2144] transition hover:bg-[#f8fbff]"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white/90 p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-[#0a2144]">
          Filters & Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-xl border border-[#c9d9ec] bg-white px-3 py-2 text-sm"
            title="Date range"
            aria-label="Date range"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <select
            value={metricType}
            onChange={(e) =>
              setMetricType(e.target.value as "revenue" | "orders" | "profit")
            }
            className="rounded-xl border border-[#c9d9ec] bg-white px-3 py-2 text-sm"
            title="Metric type"
            aria-label="Metric type"
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="profit">Profit</option>
          </select>
          <button
            onClick={exportAnalyticsCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a2144] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123a70]"
          >
            <Download className="h-4 w-4" /> Export Data
          </button>
          <button
            onClick={clearAnalyticsData}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0a2144] mb-4">
            Metric Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredDaily}>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={chartKey}
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{ fill: "#0f766e", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0a2144] mb-4">
            Order Share by Network
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={networkData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {networkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-[#d6e1f0] bg-[#f0fbff] p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6f819b]">
              Total Revenue
            </p>
            <p className="text-xl font-black text-[#0a2144]">
              {formatCurrency(metrics.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#d6e1f0] bg-[#f8fbff] p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-700">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6f819b]">
              Avg Order Value
            </p>
            <p className="text-xl font-black text-[#0a2144]">
              {formatCurrency(avgOrderValue)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#d6e1f0] bg-[#fff8ef] p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6f819b]">
              Active Users (30d)
            </p>
            <p className="text-xl font-black text-[#0a2144]">
              {metrics.activeUsers}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
