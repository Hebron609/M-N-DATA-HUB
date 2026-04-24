"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { adminDemoMetrics, adminDemoTransactions } from "@/lib/admin-demo-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type Metrics = {
  totalRevenue: number;
  estimatedProfit: number;
  daily: Array<{
    day: string;
    revenue: number;
    orders: number;
    profit: number;
  }>;
};

type Tx = {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  reference: string | null;
  createdAt: string;
  product: { name: string; category: string; price?: number };
};

function formatCurrency(value: number) {
  return Number(value || 0).toFixed(2);
}

export default function ProfitTracker() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalRevenue: adminDemoMetrics.totalRevenue,
    estimatedProfit: adminDemoMetrics.estimatedProfit,
    daily: adminDemoMetrics.daily,
  });
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataSource, setDataSource] = useState<"demo" | "live">("demo");
  const [transactions, setTransactions] = useState<Tx[]>(adminDemoTransactions);
  const [paystackFeeRate, setPaystackFeeRate] = useState(1.95);
  const [filterProduct, setFilterProduct] = useState("");
  const [filterNetwork, setFilterNetwork] = useState("");
  const [dateRangeDays, setDateRangeDays] = useState(30);
  const [nowTs, setNowTs] = useState(() => Date.now());

  const load = () => {
    Promise.all([
      fetch("/api/admin/metrics").then((r) => r.json()),
      fetch("/api/admin/transactions?limit=500").then((r) => r.json()),
    ])
      .then(([m, t]) => {
        if (m?.success) {
          setMetrics(m.metrics);
          setDataSource("live");
        }
        if (t?.success && (t.transactions || []).length > 0) {
          setTransactions(t.transactions);
          setDataSource("live");
        }
        setNowTs(Date.now());
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 20000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const rows = useMemo(() => {
    return transactions
      .filter((tx) => tx.status === "COMPLETED")
      .filter((tx) => {
        const matchesProduct =
          !filterProduct ||
          tx.product?.name?.toLowerCase().includes(filterProduct.toLowerCase());
        const matchesNetwork =
          !filterNetwork || tx.product?.category === filterNetwork;
        const matchesRange =
          dateRangeDays === 0 ||
          nowTs - new Date(tx.createdAt).getTime() <=
            dateRangeDays * 24 * 60 * 60 * 1000;

        return matchesProduct && matchesNetwork && matchesRange;
      })
      .map((tx) => {
        const sold = Number(tx.amount) || 0;
        const providerCost = Number(tx.product?.price || sold * 0.9);
        const paystackFeeAmount = (sold * paystackFeeRate) / 100;
        const netAfterPaystack = sold - paystackFeeAmount;
        const netProfit = netAfterPaystack - providerCost;

        return {
          id: tx.id,
          timestamp: tx.createdAt,
          reference: tx.reference || tx.id,
          productName: tx.product?.name || "-",
          network: tx.product?.category || "Unknown",
          sold,
          providerCost,
          paystackFeeAmount,
          netAfterPaystack,
          netProfit,
        };
      });
  }, [
    transactions,
    filterProduct,
    filterNetwork,
    dateRangeDays,
    paystackFeeRate,
    nowTs,
  ]);

  const totalGrossSales = rows.reduce((sum, r) => sum + r.sold, 0);
  const totalPaystackDeductions = rows.reduce(
    (sum, r) => sum + r.paystackFeeAmount,
    0,
  );
  const totalProviderCost = rows.reduce((sum, r) => sum + r.providerCost, 0);
  const totalNetProfit = rows.reduce((sum, r) => sum + r.netProfit, 0);

  const margin =
    totalGrossSales > 0 ? (totalNetProfit / totalGrossSales) * 100 : 0;

  const chartRows = metrics.daily.map((d) => ({
    day: d.day,
    revenue: d.revenue,
    profit: d.profit,
  }));

  return (
    <div className="relative space-y-8 pb-12">
      <div className="absolute -left-6 -top-4 h-36 w-36 rounded-full bg-linear-to-br from-amber-200/60 to-rose-200/40 blur-2xl" />
      <div className="absolute -right-10 top-28 h-48 w-48 rounded-full bg-linear-to-br from-cyan-200/50 to-emerald-200/40 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-[#d6e1f0] bg-linear-to-r from-[#fff6e8] via-white to-[#eefaf5] p-6 shadow-xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-linear-to-br from-amber-300/35 to-orange-200/20" />
        <div className="absolute -bottom-20 left-24 h-56 w-56 rounded-full bg-linear-to-br from-emerald-200/30 to-cyan-100/30" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700/80">
              Revenue Intelligence
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0a2144] sm:text-4xl">
              Profit Tracker
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5f7088]">
              Deep transaction-level profitability: selling price, fee
              deductions, provider cost estimate, and exact net margin.
            </p>
            <p className="mt-2 inline-flex rounded-full bg-[#eef7ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a2144]">
              {dataSource === "demo" ? "Demo data preview" : "Live data"}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm md:w-auto">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#5f7088]">
              Paystack Fee %
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={paystackFeeRate}
                onChange={(e) =>
                  setPaystackFeeRate(Number(e.target.value) || 0)
                }
                type="number"
                min="0"
                step="0.01"
                title="Paystack fee percentage"
                aria-label="Paystack fee percentage"
                className="w-full rounded-xl border border-[#c9d9ec] px-3 py-2 text-sm font-semibold text-[#0a2144] sm:w-28"
              />
              <button
                onClick={() => setPaystackFeeRate(1.95)}
                className="rounded-xl bg-[#0a2144] px-3 py-2 text-sm font-semibold text-white hover:bg-[#123a70]"
              >
                Reset 1.95%
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-[#d6e1f0] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
            Transactions
          </p>
          <p className="mt-2 text-2xl font-black text-[#0a2144]">
            {rows.length}
          </p>
        </article>
        <article className="rounded-2xl border border-[#d6e1f0] bg-[#eff6ff] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
            Gross Sales
          </p>
          <p className="mt-2 text-2xl font-black text-blue-700">
            GH₵{formatCurrency(totalGrossSales)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#d6e1f0] bg-[#fff7ed] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
            Fee Deductions
          </p>
          <p className="mt-2 text-2xl font-black text-amber-700">
            GH₵{formatCurrency(totalPaystackDeductions)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#d6e1f0] bg-[#f5f3ff] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
            Provider Cost
          </p>
          <p className="mt-2 text-2xl font-black text-violet-700">
            GH₵{formatCurrency(totalProviderCost)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#d6e1f0] bg-[#ecfdf5] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
            Net Profit
          </p>
          <p
            className={`mt-2 text-2xl font-black ${totalNetProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}
          >
            GH₵{formatCurrency(totalNetProfit)}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-[#d6e1f0] bg-white/90 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0a2144]">
            Filter Transactions
          </h3>
          <span className="rounded-full bg-[#0a2144] px-3 py-1 text-xs font-semibold text-white">
            {rows.length} rows
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            placeholder="Search product name..."
            className="w-full rounded-xl border border-[#c9d9ec] px-3 py-3 text-sm"
          />
          <select
            value={filterNetwork}
            onChange={(e) => setFilterNetwork(e.target.value)}
            className="w-full rounded-xl border border-[#c9d9ec] px-3 py-3 text-sm"
            title="Filter by network"
            aria-label="Filter by network"
          >
            <option value="">All Networks</option>
            <option value="MTN">MTN</option>
            <option value="Telecel">Telecel</option>
            <option value="AirtelTigo">AirtelTigo</option>
          </select>
          <select
            value={dateRangeDays}
            onChange={(e) => setDateRangeDays(Number(e.target.value))}
            className="w-full rounded-xl border border-[#c9d9ec] px-3 py-3 text-sm"
            title="Date range"
            aria-label="Date range"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 365 days</option>
            <option value={0}>All time</option>
          </select>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-[#0a2144]">
            Revenue vs Profit (Last 7 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows}>
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
                <Bar dataKey="revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-[#0a2144]">
            Profit Trend
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartRows}>
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
                  dataKey="profit"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{ fill: "#0f766e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 rounded-2xl border border-[#d6e1f0] bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
              Estimated Margin
            </p>
            <p className="mt-2 text-2xl font-black text-[#0ea5a8]">
              {margin.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-[#5f7088]">
              Based on transaction amount, fee rate, and product price cost
              estimate.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d6e1f0] bg-white/90 p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-[#0a2144]">
            Profit By Transaction
          </h3>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              Profit
            </span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
              Fees
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#d6e1f0] bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#0a2144] text-left text-xs font-semibold uppercase tracking-wider text-white">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Sold (GH₵)</th>
                <th className="px-4 py-3">Paystack Fee</th>
                <th className="px-4 py-3">Net After Fee</th>
                <th className="px-4 py-3">Provider Cost</th>
                <th className="px-4 py-3">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#ebf1f8] transition hover:bg-[#f8fbff]"
                >
                  <td className="px-4 py-3 text-xs text-[#5f7088]">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[#0a2144]">
                    {row.reference}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#0a2144]">
                    {row.productName}
                  </td>
                  <td className="px-4 py-3 text-[#5f7088]">{row.network}</td>
                  <td className="px-4 py-3 font-semibold text-[#0a2144]">
                    GH₵{formatCurrency(row.sold)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-orange-700">
                    GH₵{formatCurrency(row.paystackFeeAmount)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    GH₵{formatCurrency(row.netAfterPaystack)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-violet-700">
                    GH₵{formatCurrency(row.providerCost)}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${row.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    GH₵{formatCurrency(row.netProfit)}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-sm text-[#6f819b]"
                  >
                    No transactions found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {lastUpdated && (
          <span className="text-xs text-[#6f819b]">Updated: {lastUpdated}</span>
        )}
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-[#c9d9ec] bg-white px-4 py-2 text-sm font-semibold text-[#4f647f] hover:bg-[#f8fbff]"
        >
          Refresh
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-[#c9d9ec] bg-white px-4 py-2 text-sm font-semibold text-[#4f647f]">
          <Calendar className="h-4 w-4" /> This Month
        </button>
      </div>
    </div>
  );
}
