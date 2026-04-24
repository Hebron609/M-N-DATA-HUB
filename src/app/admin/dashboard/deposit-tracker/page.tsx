"use client";

import { useEffect, useMemo, useState } from "react";
import { Database } from "lucide-react";
import {
  adminDemoDeposits,
  adminDemoTransactions,
} from "@/lib/admin-demo-data";

type Deposit = {
  id: string;
  method: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  reference: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
};

type Tx = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product: { name: string; category: string; price?: number };
};

function formatCurrency(value: number) {
  return Number(value || 0).toFixed(2);
}

export default function DepositTracker() {
  const [deposits, setDeposits] = useState<Deposit[]>(adminDemoDeposits);
  const [transactions, setTransactions] = useState<Tx[]>(adminDemoTransactions);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataSource, setDataSource] = useState<"demo" | "live">("demo");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [paystackFeeRate, setPaystackFeeRate] = useState(1.95);
  const [expandedCycles, setExpandedCycles] = useState<Record<string, boolean>>(
    {},
  );

  const [form, setForm] = useState({
    amount: "",
    method: "Momo",
    date: "",
    reference: "",
  });

  const loadDeposits = () => {
    Promise.all([
      fetch("/api/admin/deposits").then((r) => r.json()),
      fetch("/api/admin/transactions?limit=500").then((r) => r.json()),
    ])
      .then(([d, t]) => {
        if (d?.success) {
          const items = d.deposits || [];
          if (items.length > 0) {
            setDeposits(items);
            setDataSource("live");
          }
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
    loadDeposits();
    const timer = setInterval(loadDeposits, 20000);
    return () => clearInterval(timer);
  }, []);

  const saveDeposit = async () => {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    setFormError("");
    setFormSuccess(false);

    try {
      const res = await fetch("/api/admin/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: form.method || "Momo",
          createdAt: form.date || undefined,
          reference: form.reference || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        setFormError(json?.message || "Failed to save deposit.");
        return;
      }

      setDeposits((prev) => [json.deposit, ...prev]);
      setForm({ amount: "", method: "Momo", date: "", reference: "" });
      setFormSuccess(true);
      setShowForm(false);
    } catch {
      setFormError("Failed to save deposit.");
    } finally {
      setSaving(false);
      setTimeout(() => setFormSuccess(false), 2500);
    }
  };

  const deleteDeposit = async (id: string) => {
    const confirmed = window.confirm("Delete this deposit record?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/deposits", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        alert(json?.message || "Failed to delete deposit.");
        return;
      }
      setDeposits((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Failed to delete deposit.");
    }
  };

  const toggleCycle = (id: string) => {
    setExpandedCycles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sortedDeposits = useMemo(
    () =>
      [...deposits].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [deposits],
  );

  const cycleRows = useMemo(() => {
    if (sortedDeposits.length === 0) return [];

    const asc = [...sortedDeposits].reverse();

    return asc
      .map((dep, idx) => {
        const start = new Date(dep.createdAt).getTime();
        const next = asc[idx + 1];
        const end = next ? new Date(next.createdAt).getTime() : Date.now();

        const cycleTx = transactions
          .filter((t) => t.status === "COMPLETED")
          .filter((t) => {
            const ts = new Date(t.createdAt).getTime();
            return ts >= start && ts < end;
          })
          .map((t) => {
            const sold = Number(t.amount) || 0;
            const providerCost = Number(t.product?.price || sold * 0.9);
            const paystackFee = (sold * paystackFeeRate) / 100;
            const netProfit = sold - paystackFee - providerCost;
            return {
              id: t.id,
              createdAt: t.createdAt,
              product: t.product?.name || "-",
              network: t.product?.category || "Unknown",
              sold,
              providerCost,
              netProfit,
            };
          })
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

        const totalGross = cycleTx.reduce((s, x) => s + x.sold, 0);
        const totalProviderCost = cycleTx.reduce(
          (s, x) => s + x.providerCost,
          0,
        );
        const totalNetProfit = cycleTx.reduce((s, x) => s + x.netProfit, 0);
        const remaining = dep.amount - totalProviderCost;

        return {
          deposit: dep,
          cycleEnd: next?.createdAt || null,
          isActive: idx === asc.length - 1,
          txCount: cycleTx.length,
          totalGross,
          totalProviderCost,
          totalNetProfit,
          remaining,
          rows: cycleTx,
        };
      })
      .reverse();
  }, [sortedDeposits, transactions, paystackFeeRate]);

  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalNetProfit = cycleRows.reduce(
    (sum, c) => sum + c.totalNetProfit,
    0,
  );
  const overallRoi =
    totalDeposited > 0
      ? ((totalNetProfit / totalDeposited) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="relative space-y-8 pb-12">
      <div className="pointer-events-none absolute -left-6 -top-4 h-40 w-40 rounded-full bg-linear-to-br from-emerald-200/50 to-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-32 h-48 w-48 rounded-full bg-linear-to-br from-sky-200/40 to-indigo-200/30 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-[#d6e1f0] bg-linear-to-r from-[#f0fff8] via-white to-[#eef7ff] p-6 shadow-xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-linear-to-br from-emerald-300/30 to-cyan-200/20" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/80">
              Deposit Accountability
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-[#0a2144] sm:text-4xl">
              Deposit Tracker
            </h2>
            <p className="mt-1 max-w-xl text-sm text-[#5f7088]">
              Log every top-up and track how much profit was generated in each
              deposit cycle.
            </p>
            <p className="mt-3 inline-flex rounded-full bg-[#eef7ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a2144]">
              {dataSource === "demo" ? "Demo data preview" : "Live data"}
            </p>
            {lastUpdated && (
              <p className="mt-2 text-xs text-[#6f819b]">
                Updated: {lastUpdated}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="self-start rounded-2xl bg-linear-to-r from-emerald-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:opacity-90 md:self-center"
          >
            {showForm ? "Cancel" : "Log New Deposit"}
          </button>
        </div>
      </section>

      {showForm && (
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
          <h3 className="mb-5 text-lg font-bold text-[#0a2144]">
            Log a New Deposit
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <input
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              type="number"
              min="1"
              step="0.01"
              placeholder="Amount (GH₵)"
              title="Deposit amount"
              aria-label="Deposit amount"
              className="w-full rounded-xl border border-[#c9d9ec] px-3 py-3 text-sm"
            />
            <input
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              type="datetime-local"
              title="Deposit date"
              aria-label="Deposit date"
              className="w-full rounded-xl border border-[#c9d9ec] px-3 py-3 text-sm"
            />
            <select
              value={form.method}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, method: e.target.value }))
              }
              className="w-full rounded-xl border border-[#c9d9ec] px-3 py-3 text-sm"
              title="Deposit method"
              aria-label="Deposit method"
            >
              <option value="Momo">Momo</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
            <input
              value={form.reference}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reference: e.target.value }))
              }
              type="text"
              placeholder="Reference (optional)"
              title="Deposit reference"
              aria-label="Deposit reference"
              className="w-full rounded-xl border border-[#c9d9ec] px-3 py-3 text-sm"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={saveDeposit}
              disabled={saving}
              className="rounded-xl bg-linear-to-r from-emerald-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Deposit"}
            </button>
            {formError && <p className="text-sm text-rose-600">{formError}</p>}
            {formSuccess && (
              <p className="text-sm font-semibold text-emerald-600">
                Deposit saved.
              </p>
            )}
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <article className="rounded-2xl border border-[#d6e1f0] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
            Total Deposits
          </p>
          <p className="mt-2 text-2xl font-black text-[#0a2144]">
            {deposits.length}
          </p>
        </article>
        <article className="rounded-2xl border border-[#d6e1f0] bg-[#ecfdf5] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
            Total Deposited
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-700">
            GH₵{formatCurrency(totalDeposited)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#d6e1f0] bg-[#f5f3ff] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
            Total Net Profit
          </p>
          <p
            className={`mt-2 text-2xl font-black ${totalNetProfit >= 0 ? "text-violet-700" : "text-rose-700"}`}
          >
            GH₵{formatCurrency(totalNetProfit)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#d6e1f0] bg-[#fff7ed] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6f819b]">
            Overall ROI
          </p>
          <p
            className={`mt-2 text-2xl font-black ${Number(overallRoi) >= 0 ? "text-amber-700" : "text-rose-700"}`}
          >
            {overallRoi}%
          </p>
        </article>
      </section>

      <div className="flex items-center gap-4 rounded-2xl border border-[#d6e1f0] bg-white/80 px-5 py-3 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6f819b]">
          Paystack Fee %
        </span>
        <input
          value={paystackFeeRate}
          onChange={(e) => setPaystackFeeRate(Number(e.target.value) || 0)}
          type="number"
          min="0"
          step="0.01"
          title="Paystack fee percentage"
          aria-label="Paystack fee percentage"
          className="w-24 rounded-lg border border-[#c9d9ec] px-2 py-1 text-sm font-semibold text-[#0a2144]"
        />
        <button
          onClick={() => setPaystackFeeRate(1.95)}
          className="rounded-lg bg-[#0a2144] px-3 py-1 text-xs font-semibold text-white hover:bg-[#123a70]"
        >
          Reset 1.95%
        </button>
      </div>

      {deposits.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 py-16 text-center">
          <p className="text-4xl">No deposits logged yet</p>
          <p className="mt-3 text-sm text-[#5f7088]">
            Click Log New Deposit to record your first top-up.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {cycleRows.map((cycle, idx) => (
            <article
              key={cycle.deposit.id}
              className="overflow-hidden rounded-3xl border border-[#d6e1f0] bg-white/90 shadow-lg"
            >
              <div
                className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                  cycle.isActive
                    ? "bg-linear-to-r from-emerald-50 to-cyan-50"
                    : "bg-[#f8fbff]"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        cycle.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {cycle.isActive
                        ? "Active Cycle"
                        : `Cycle ${cycleRows.length - idx}`}
                    </span>
                  </div>
                  <p className="text-sm text-[#5f7088]">
                    {new Date(cycle.deposit.createdAt).toLocaleString()} →{" "}
                    {cycle.cycleEnd
                      ? new Date(cycle.cycleEnd).toLocaleString()
                      : "Now"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-[#6f819b]">New Deposit</p>
                    <p className="text-lg font-black text-[#0a2144]">
                      GH₵{formatCurrency(cycle.deposit.amount)}
                    </p>
                  </div>
                  <div className="border-l border-[#d6e1f0] pl-3 text-right">
                    <p className="text-xs text-[#6f819b]">Est. Remaining</p>
                    <p
                      className={`text-lg font-black ${cycle.remaining >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                    >
                      GH₵{formatCurrency(cycle.remaining)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteDeposit(cycle.deposit.id)}
                    className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                    title="Delete deposit"
                    aria-label="Delete deposit"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-[#e8f0fb] sm:grid-cols-5">
                <div className="bg-white px-4 py-3">
                  <p className="text-xs text-[#6f819b]">Transactions</p>
                  <p className="mt-0.5 text-xl font-bold text-[#0a2144]">
                    {cycle.txCount}
                  </p>
                </div>
                <div className="bg-white px-4 py-3">
                  <p className="text-xs text-[#6f819b]">Gross Sales</p>
                  <p className="mt-0.5 text-xl font-bold text-blue-700">
                    GH₵{formatCurrency(cycle.totalGross)}
                  </p>
                </div>
                <div className="bg-white px-4 py-3">
                  <p className="text-xs text-[#6f819b]">Provider Cost</p>
                  <p className="mt-0.5 text-xl font-bold text-amber-700">
                    GH₵{formatCurrency(cycle.totalProviderCost)}
                  </p>
                </div>
                <div className="bg-white px-4 py-3">
                  <p className="text-xs text-[#6f819b]">Net Profit</p>
                  <p
                    className={`mt-0.5 text-xl font-bold ${cycle.totalNetProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    GH₵{formatCurrency(cycle.totalNetProfit)}
                  </p>
                </div>
                <div className="bg-white px-4 py-3">
                  <p className="text-xs text-[#6f819b]">Method</p>
                  <p className="mt-0.5 text-xl font-bold text-[#0a2144]">
                    {cycle.deposit.method}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#e4edf7] p-4">
                <button
                  onClick={() => toggleCycle(cycle.deposit.id)}
                  className="rounded-xl border border-[#c9d9ec] bg-white px-4 py-2 text-sm font-semibold text-[#0a2144] hover:bg-[#f8fbff]"
                >
                  {expandedCycles[cycle.deposit.id]
                    ? "Hide Transactions"
                    : "Show Transactions"}
                </button>
              </div>

              {expandedCycles[cycle.deposit.id] && (
                <div className="overflow-x-auto border-t border-[#e4edf7]">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[#f8fbff] text-left text-xs font-bold uppercase tracking-widest text-[#6f819b]">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Network</th>
                        <th className="px-4 py-3">Sold</th>
                        <th className="px-4 py-3">Provider Cost</th>
                        <th className="px-4 py-3">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycle.rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-[#ebf1f8] hover:bg-[#f8fbff]"
                        >
                          <td className="px-4 py-3 text-xs text-[#5f7088]">
                            {new Date(row.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#0a2144]">
                            {row.product}
                          </td>
                          <td className="px-4 py-3 text-[#5f7088]">
                            {row.network}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#0a2144]">
                            GH₵{formatCurrency(row.sold)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-amber-700">
                            GH₵{formatCurrency(row.providerCost)}
                          </td>
                          <td
                            className={`px-4 py-3 font-semibold ${row.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                          >
                            GH₵{formatCurrency(row.netProfit)}
                          </td>
                        </tr>
                      ))}
                      {cycle.rows.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-sm text-[#6f819b]"
                          >
                            No transactions in this cycle.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#0a2144]">
          <Database className="h-5 w-5 text-[#0ea5a8]" /> Deposit Logs
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d6e1f0] text-xs font-bold uppercase tracking-widest text-[#6f819b]">
                <th className="py-3">Method</th>
                <th className="py-3">Reference</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeposits.map((dep) => (
                <tr
                  key={dep.id}
                  className="border-b border-[#ebf1f8] last:border-0"
                >
                  <td className="py-3 text-sm font-semibold text-[#0a2144]">
                    {dep.method}
                  </td>
                  <td className="py-3 text-xs font-mono text-[#5f7088]">
                    {dep.reference || dep.id}
                  </td>
                  <td className="py-3 text-sm font-black text-[#0a2144]">
                    GH₵{formatCurrency(dep.amount)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        dep.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : dep.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {dep.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-[#5f7088]">
                    {new Date(dep.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
