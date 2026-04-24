"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type OrderStatus = {
  id: string;
  productName: string;
  network: string;
  size: string;
  amount: number;
  phone: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
};

const STATUS_COLORS: Record<OrderStatus["status"], string> = {
  PENDING: "bg-amber-100 text-amber-900 border-amber-300",
  PROCESSING: "bg-[#e8f5ff] text-[#0f3f77] border-[#b9d8f4]",
  COMPLETED: "bg-[#e9fbf5] text-[#0e5f46] border-[#9edec7]",
  FAILED: "bg-rose-100 text-rose-900 border-rose-300",
};

function formatAmount(amount: number | undefined) {
  return typeof amount === "number" && Number.isFinite(amount)
    ? amount.toFixed(2)
    : "0.00";
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const track = async () => {
    if (!orderId.trim()) {
      setError("Please enter your Order ID.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/orders/track?id=${encodeURIComponent(orderId.trim())}`,
      );
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(
          json.message || "Order not found. Please check your Order ID.",
        );
      } else {
        setResult(json.order);
      }
    } catch {
      setError("Unable to fetch order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hub-shell min-h-screen">
      <Navbar />
      <div className="h-20" />

      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-[28px] border border-[#dbe5f0] bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0ea5a8]">
                Order tracking
              </p>
              <h1 className="hub-display mt-2 text-3xl font-bold text-[#0a2144] sm:text-4xl">
                Track Your Order
              </h1>
            </div>
            <div className="rounded-full bg-[#eef7ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0a2144]">
              Live status updates
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-[#5f7088]">
            Enter your Order ID or Paystack reference to view real-time progress
            and delivery status.
          </p>
        </section>

        <div className="hub-card rounded-4xl p-5 sm:p-8">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#526983]">
                Order ID / Reference
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && track()}
                placeholder="e.g. TXN_abc123xyz"
                className="w-full rounded-2xl border border-[#c9d9ec] bg-[#fbfdff] p-4 text-sm text-[#0a2144] outline-none transition focus:border-[#0ea5a8] focus:ring-2 focus:ring-[#0ea5a8]/20"
              />
            </div>

            <button
              onClick={track}
              disabled={loading}
              className="hub-btn w-full rounded-2xl py-3 font-semibold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-100 p-4 text-sm text-rose-900">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between gap-3">
                <h3 className="hub-display text-xl font-bold text-[#0a2144]">
                  Order Details
                </h3>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_COLORS[result.status]}`}
                >
                  {result.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Order ID", result.id],
                  ["Product", result.productName],
                  ["Network", result.network],
                  ["Package", result.size],
                  ["Amount", `₵${formatAmount(result.amount)}`],
                  ["Phone", result.phone],
                  [
                    "Date",
                    new Date(result.createdAt).toLocaleDateString("en-GH"),
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[#dbe5f0] bg-[#f8fbff] p-4"
                  >
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7489a4]">
                      {label}
                    </p>
                    <p className="truncate text-sm font-semibold text-[#0a2144]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {result.status === "COMPLETED" && (
                <div className="rounded-2xl border border-[#9edec7] bg-[#e9fbf5] p-4 text-sm text-[#0e5f46]">
                  Your data bundle has been delivered successfully.
                </div>
              )}

              {(result.status === "PENDING" ||
                result.status === "PROCESSING") && (
                <div className="rounded-2xl border border-[#b9d8f4] bg-[#e8f5ff] p-4 text-sm text-[#0f3f77]">
                  Your order is being processed. This may take up to 4 hours for
                  MTN orders.
                </div>
              )}

              {result.status === "FAILED" && (
                <div className="rounded-2xl border border-rose-300 bg-rose-100 p-4 text-sm text-rose-900">
                  This order failed. Please contact support for a refund.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-[#0f3f77] underline transition-colors hover:text-[#0ea5a8]"
          >
            ← Return to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
