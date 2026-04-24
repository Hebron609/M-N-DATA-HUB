"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProduct } from "@/lib/products-data";

const productGradients: Record<string, string> = {
  mtn1: "from-[#f59e0b] to-[#fcd34d]",
  airteltigo1: "from-[#0ea5a8] to-[#2dd4bf]",
  telecel1: "from-[#0a2144] to-[#1d4f91]",
};

const PAYSTACK_FEE_RATE = 0.0195;

function getChargeBreakdown(baseAmount: number) {
  const basePesewas = Math.round(baseAmount * 100);
  const grossPesewas = Math.ceil(basePesewas / (1 - PAYSTACK_FEE_RATE));
  const feePesewas = Math.max(0, grossPesewas - basePesewas);
  return {
    feeGhs: feePesewas / 100,
    grossGhs: grossPesewas / 100,
    grossPesewas,
  };
}

function parsePriceValue(raw?: string) {
  if (!raw) return 0;
  const parsed = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(n?: number | null) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function formatPhoneForAPI(phone: string) {
  const cleaned = phone.trim().replace(/[^0-9]/g, "");
  if (cleaned.startsWith("233")) return `0${cleaned.substring(3)}`;
  return cleaned.startsWith("0") ? cleaned : `0${cleaned}`;
}

const getDeliveryEstimate = (network: string) => {
  const map: Record<string, string> = {
    MTN: "Your data will arrive in 20 minutes to 4 hours",
    AirtelTigo: "Your data will arrive instantly (iShare)",
    Telecel: "Your data will arrive in a few minutes",
  };
  return map[network] ?? "Your data will arrive in 2–5 minutes";
};

type CheckoutData = {
  productId: string;
  size: string;
  phone: string;
};

type OrderResult = {
  orderId: string;
  reference: string;
  network: string;
  size: string;
  amount: number;
  productId?: string;
  phone?: string;
  email?: string;
  pendingVerification?: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [item, setItem] = useState<CheckoutData | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [formTouched, setFormTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [orderError, setOrderError] = useState<string>("");
  const [billingRef, setBillingRef] = useState("Waiting...");

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("checkoutData") || "null");
    if (!saved) {
      router.push("/");
      return;
    }

    setItem({
      productId: String(saved.productId || ""),
      size: String(saved.size || ""),
      phone: String(saved.phone || ""),
    });
    setForm((current) => ({ ...current, phone: String(saved.phone || "") }));

    const savedForm = JSON.parse(
      sessionStorage.getItem("checkoutForm") || "null",
    );
    if (savedForm) setForm((current) => ({ ...current, ...savedForm }));

    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (reference) handlePaystackReturn(reference, saved);
  }, [router]);

  const handlePaystackReturn = async (
    reference: string,
    data: CheckoutData,
  ) => {
    setLoading(true);
    try {
      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Verification failed");
      }

      const orderId = json.order_id || reference;
      setBillingRef(orderId);
      const resolvedProduct = getProduct(data.productId);
      const resolvedAmount =
        resolvedProduct && data.size && resolvedProduct.prices[data.size]
          ? parsePriceValue(resolvedProduct.prices[data.size])
          : 0;

      setOrderResult({
        orderId,
        reference,
        productId: data.productId,
        size: data.size,
        phone: data.phone,
        network: resolvedProduct?.network || "",
        amount: resolvedAmount,
      });
      sessionStorage.removeItem("checkoutData");
      sessionStorage.removeItem("checkoutForm");
    } catch {
      setBillingRef(reference);
      const resolvedProduct = getProduct(data.productId);
      const resolvedAmount =
        resolvedProduct && data.size && resolvedProduct.prices[data.size]
          ? parsePriceValue(resolvedProduct.prices[data.size])
          : 0;

      setOrderResult({
        orderId: reference,
        reference,
        productId: data.productId,
        size: data.size,
        phone: data.phone,
        network: resolvedProduct?.network || "",
        amount: resolvedAmount,
        pendingVerification: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = item ? getProduct(item.productId) : null;
  const selectedAmount =
    selectedProduct && item?.size && selectedProduct.prices[item.size]
      ? parsePriceValue(selectedProduct.prices[item.size])
      : 0;
  const breakdown = getChargeBreakdown(selectedAmount);
  const paystackFee = breakdown.feeGhs;
  const totalAmount = breakdown.grossGhs;

  const placeOrder = async () => {
    setFormTouched(true);
    setOrderError("");
    setOrderResult(null);

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setOrderError("Please fill in all required fields (Name, Phone, Email).");
      return;
    }

    const phoneRegex = /^(\+233|0)[235]\d{8}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      setOrderError(
        "Please enter a valid Ghana phone number (e.g. 0241234567).",
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setOrderError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      sessionStorage.setItem("checkoutForm", JSON.stringify(form));
      sessionStorage.setItem("checkoutData", JSON.stringify(item));

      const sanitizedPhone = formatPhoneForAPI(form.phone);
      const customerEmail = form.email.trim().toLowerCase();

      if (!selectedProduct) {
        setOrderError("Selected product is unavailable.");
        setLoading(false);
        return;
      }

      const callbackUrl = `${window.location.origin}/checkout`;
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail,
          productId: item!.productId,
          size: item!.size,
          phone_number: sanitizedPhone,
          customer_name: form.name.trim(),
          notes: form.notes.trim(),
          callback_url: callbackUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setOrderError(
          data.message || "Failed to initialize payment. Please try again.",
        );
        setLoading(false);
        return;
      }

      window.location.href = data.authorization_url;
    } catch (error: unknown) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
      setLoading(false);
    }
  };

  const productData = selectedProduct;

  if (!item) {
    return (
      <div className="hub-shell flex min-h-screen items-center justify-center">
        <div className="hub-card rounded-2xl px-8 py-10 text-center">
          <p className="mb-4 text-lg text-[#375071]">No product selected.</p>
          <Link
            href="/"
            className="font-semibold text-[#0f3f77] underline hover:text-[#0ea5a8]"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hub-shell flex min-h-screen flex-col">
      <header className="fixed left-0 top-0 z-50 w-full">
        <Navbar />
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] border border-[#dbe5f0] bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0ea5a8]">
                Secure checkout
              </p>
              <h1 className="hub-display mt-2 text-3xl font-bold text-[#0a2144] sm:text-4xl">
                Complete your order
              </h1>
            </div>
            <div className="rounded-full bg-[#eef7ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0a2144]">
              Paystack protected
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="hub-card rounded-[34px] p-5 sm:p-7 lg:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0ea5a8]">
                  Customer details
                </p>
                <h2 className="hub-display mt-2 text-2xl font-bold text-[#0a2144] sm:text-3xl">
                  Payment form
                </h2>
              </div>
              <div className="hidden rounded-full border border-[#dbe5f0] bg-[#f8fbff] px-4 py-2 text-xs font-semibold text-[#4a6282] sm:inline-flex">
                Required fields only
              </div>
            </div>

            <div className="grid gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full Name"
                  required
                  className="w-full rounded-2xl border border-[#c9d9ec] bg-[#fbfdff] p-4 text-sm outline-none transition focus:border-[#0ea5a8] focus:ring-2 focus:ring-[#0ea5a8]/20"
                />
                {!form.name && formTouched && (
                  <span className="absolute right-3 top-3 text-xs text-red-500">
                    Required
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone Number (e.g., 0241234567)"
                  required
                  className="w-full rounded-2xl border border-[#c9d9ec] bg-[#fbfdff] p-4 text-sm outline-none transition focus:border-[#0ea5a8] focus:ring-2 focus:ring-[#0ea5a8]/20"
                />
                {!form.phone && formTouched && (
                  <span className="absolute right-3 top-3 text-xs text-red-500">
                    Required
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email Address"
                  required
                  className="w-full rounded-2xl border border-[#c9d9ec] bg-[#fbfdff] p-4 text-sm outline-none transition focus:border-[#0ea5a8] focus:ring-2 focus:ring-[#0ea5a8]/20"
                />
                {!form.email && formTouched && (
                  <span className="absolute right-3 top-3 text-xs text-red-500">
                    Required
                  </span>
                )}
              </div>

              <p className="-mt-2 text-xs text-[#6a7f99]">
                Required for order confirmation.
              </p>

              <div>
                <input
                  type="text"
                  readOnly
                  value={billingRef}
                  title="Billing reference"
                  aria-label="Billing reference"
                  className="w-full rounded-2xl border border-[#c9d9ec] bg-[#edf4ff] p-4 text-lg font-semibold text-[#2f4666] outline-none"
                />
              </div>

              <div>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Delivery Notes (optional)"
                  className="h-28 w-full resize-none rounded-2xl border border-[#c9d9ec] bg-[#fbfdff] p-4 text-sm outline-none transition focus:border-[#0ea5a8] focus:ring-2 focus:ring-[#0ea5a8]/20"
                />
              </div>

              <div className="rounded-[28px] border border-[#dbe5f0] bg-[#f8fbff] p-4 sm:p-5">
                <div
                  className={`relative h-44 overflow-hidden rounded-2xl bg-linear-to-br ${productGradients[item.productId] ?? "from-slate-200 to-slate-400"}`}
                >
                  {productData && (
                    <Image
                      src={productData.image}
                      alt={productData.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-[#071a34]/55 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {productData?.badge ? (
                      <span className="hub-tag rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">
                        {productData.badge}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0a2144]">
                      {productData?.network || "Network"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0ea5a8]">
                      Selected item
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#0a2144]">
                      {productData?.name || "Selected item"}
                    </p>
                    {item.size && (
                      <p className="text-sm text-[#4a6282]">
                        Package: {item.size}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7489a4]">
                      Total due
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-[#0a2144]">
                      ₵{formatPrice(totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="hub-card rounded-[34px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0ea5a8]">
                    Order summary
                  </p>
                  <h2 className="hub-display mt-2 text-2xl font-bold text-[#0a2144]">
                    Review & pay
                  </h2>
                </div>
                <div className="rounded-full bg-[#eef7ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0a2144]">
                  Fast checkout
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[26px] border border-[#dbe5f0] bg-[#f9fbff] p-4">
                  <div className="flex justify-between gap-4 text-sm text-[#4a6282]">
                    <span>Beneficiary Phone</span>
                    <span className="font-semibold text-[#0a2144]">
                      {form.phone || item.phone || "N/A"}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between gap-4 text-sm text-[#4a6282]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#0a2144]">
                      ₵{formatPrice(selectedAmount)}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between gap-4 text-sm text-[#4a6282]">
                    <span>Paystack Fee (1.95%)</span>
                    <span className="font-semibold text-[#0a2144]">
                      ₵{formatPrice(paystackFee)}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between gap-4 border-t border-[#d7e3f2] pt-3 text-lg font-bold text-[#0a2144]">
                    <span>Total</span>
                    <span>₵{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                <div className="rounded-[26px] border border-[#d7e3f2] bg-white p-4">
                  <div className="rounded-2xl border border-[#bcd2e8] bg-[#f8fbff] px-4 py-3 text-center text-sm font-semibold text-[#365376]">
                    Pay securely via Mobile Money
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={loading || !!orderResult}
                    className="hub-btn mt-4 w-full rounded-2xl py-3 font-semibold transition shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </button>

                  <div className="mt-4 rounded-2xl border border-[#bcd2e8] bg-[#eaf4ff] p-4 text-sm text-[#173a63]">
                    <p className="font-semibold">Need to track your order?</p>
                    <p className="mt-1">
                      Use your Order ID as the tracking reference.
                    </p>
                    <Link
                      href="/track-order"
                      className="mt-2 inline-block font-semibold text-[#0f3f77] underline hover:text-[#0ea5a8]"
                    >
                      Go to Track Order →
                    </Link>
                  </div>

                  {orderError && !orderResult && (
                    <div className="mt-4 rounded-2xl border border-red-300 bg-red-100 p-4 text-sm text-gray-900">
                      <p className="font-semibold">Error:</p>
                      <p>{orderError}</p>
                    </div>
                  )}

                  {orderResult && (
                    <div className="animate-fadeIn mt-4 space-y-3 rounded-2xl border border-green-200 bg-green-50 p-5">
                      <div className="flex items-start gap-3">
                        <svg
                          className="mt-0.5 h-6 w-6 shrink-0 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-green-900">
                            {orderResult.pendingVerification
                              ? "Payment Received - Confirming..."
                              : "Order Confirmed"}
                          </p>
                          <div className="mt-2 space-y-1 text-sm text-green-800">
                            <p>
                              <span className="font-semibold">Order ID:</span>{" "}
                              {orderResult.orderId}
                            </p>
                            <p>
                              <span className="font-semibold">Network:</span>{" "}
                              {orderResult.network}
                            </p>
                            <p>
                              <span className="font-semibold">Package:</span>{" "}
                              {orderResult.size}
                            </p>
                            <p>
                              <span className="font-semibold">Amount:</span> ₵
                              {formatPrice(orderResult.amount)}
                            </p>
                          </div>
                          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <p className="text-sm font-semibold text-blue-900">
                              Delivery Estimate
                            </p>
                            <p className="text-sm text-blue-800">
                              {getDeliveryEstimate(orderResult.network)}
                            </p>
                          </div>
                          <Link
                            href={`/track-order?id=${orderResult.orderId}`}
                            className="mt-4 inline-block w-full rounded-lg bg-[#0f3f77] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#0a2144]"
                          >
                            Track Order Status
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
