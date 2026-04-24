"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProduct, products, type Product } from "@/lib/products-data";

// Product gradient fallback colors
const productGradients: Record<string, string> = {
  mtn1: "from-[#f59e0b] via-[#fcd34d] to-[#fff2c8]",
  airteltigo1: "from-[#0ea5a8] via-[#2dd4bf] to-[#defcf7]",
  telecel1: "from-[#0a2144] via-[#1d4f91] to-[#d9e8ff]",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const product = getProduct(id);

  const [selectedSize, setSelectedSize] = useState<string>(
    product?.sizes[0] ?? "",
  );
  const [phone, setPhone] = useState("");
  const [tab, setTab] = useState<"desc" | "info">("desc");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const getPhoneError = (network: string, phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length < 3) return null;

    const prefix = digits.substring(0, 3);
    const net = network.toLowerCase();

    const PREFIXES = {
      mtn: ["024", "025", "053", "054", "055", "059"],
      telecel: ["020", "050"],
      airteltigo: ["026", "027", "056", "057", "023"],
    };

    if (net.includes("mtn")) {
      if (!PREFIXES.mtn.includes(prefix)) {
        return `Wait! ${prefix} is not an MTN number. Make sure to use a valid MTN prefix.`;
      }
    } else if (net.includes("telecel") || net.includes("voda")) {
      if (!PREFIXES.telecel.includes(prefix)) {
        return `Wait! ${prefix} is not a Telecel number. Please use 020 or 050.`;
      }
    } else if (net.includes("airteltigo") || net.includes("at")) {
      if (!PREFIXES.airteltigo.includes(prefix)) {
        return `Wait! ${prefix} is not an AirtelTigo number. Use 026, 027, 056, 057.`;
      }
    }
    return null;
  };

  const phoneError = getPhoneError(product?.network ?? "", phone);

  if (!product) {
    return (
      <div className="hub-shell flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="hub-card max-w-md rounded-[28px] px-8 py-10">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#0ea5a8]">
            Product page
          </p>
          <p className="text-xl font-semibold text-[#0a2144]">
            Product not found.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-[#0a2144] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0ea5a8]"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const priceRange = (() => {
    const vals = Object.values(product.prices).map((p) =>
      parseFloat(p.replace(/[^0-9.]/g, "")),
    );
    return `₵${Math.min(...vals).toFixed(2)} - ₵${Math.max(...vals).toFixed(2)}`;
  })();

  const relatedProducts = product.relatedProducts
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const handleBuy = () => {
    if (!selectedSize) return showToast("Please select a package size.");
    if (!phone.trim())
      return showToast("Please enter beneficiary phone number.");

    if (phoneError)
      return showToast("Invalid phone number prefix for the selected network.");

    const payload = {
      productId: product.id,
      size: selectedSize,
      phone: phone.trim(),
    };
    sessionStorage.setItem("checkoutData", JSON.stringify(payload));
    router.push("/checkout");
  };

  return (
    <div className="hub-shell min-h-screen font-sans">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-[#0a2144] px-6 py-3 text-sm font-semibold text-white shadow-xl animate-fadeIn">
          {toast}
        </div>
      )}

      <div className="h-21" />

      <main className="mx-auto w-full max-w-360 px-4 pb-14 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5f7088]">
          <Link href="/" className="transition-colors hover:text-[#0ea5a8]">
            Home
          </Link>
          <span className="text-[#b7c5d8]">/</span>
          <span>{product.category}</span>
          <span className="text-[#b7c5d8]">/</span>
          <span className="text-[#0a2144]">{product.name}</span>
        </nav>

        <section className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="hub-card overflow-hidden rounded-[34px]">
              <div
                className={`relative min-h-105 bg-linear-to-br ${productGradients[product.id] ?? "from-slate-300 to-slate-100"}`}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => {}}
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#071a34]/60 via-transparent to-transparent" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/92 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a2144] shadow-sm">
                    {product.network}
                  </span>
                  {product.badge && (
                    <span className="hub-tag rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] shadow-sm">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">
                      Selected data service
                    </p>
                    <h1 className="hub-display mt-2 text-3xl font-bold sm:text-4xl">
                      {product.name}
                    </h1>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-right backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                      Price range
                    </p>
                    <p className="mt-1 text-lg font-extrabold">{priceRange}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden gap-4 sm:grid sm:grid-cols-3">
              <div className="hub-card rounded-[26px] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0ea5a8]">
                  Package
                </p>
                <p className="mt-2 text-lg font-extrabold text-[#0a2144]">
                  {selectedSize || "Select size"}
                </p>
              </div>
              <div className="hub-card rounded-[26px] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0ea5a8]">
                  Network
                </p>
                <p className="mt-2 text-lg font-extrabold text-[#0a2144]">
                  {product.network}
                </p>
              </div>
              <div className="hub-card rounded-[26px] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0ea5a8]">
                  SKU
                </p>
                <p className="mt-2 text-lg font-extrabold text-[#0a2144]">
                  {product.sku}
                </p>
              </div>
            </div>

            <div className="hub-card rounded-[34px] p-6 sm:p-7">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTab("desc")}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all ${tab === "desc" ? "bg-[#0a2144] text-white" : "bg-[#eef4ff] text-[#3e526d] hover:bg-[#e2ecfb]"}`}
                >
                  Description
                </button>
                <button
                  onClick={() => setTab("info")}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all ${tab === "info" ? "bg-[#0ea5a8] text-white" : "bg-[#eef4ff] text-[#3e526d] hover:bg-[#e2ecfb]"}`}
                >
                  Additional Information
                </button>
              </div>
              <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#40556f]">
                {tab === "desc" ? product.description : product.additionalInfo}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="hub-card rounded-[34px] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0ea5a8]">
                    Build your order
                  </p>
                  <h2 className="hub-display mt-2 text-2xl font-bold text-[#0a2144]">
                    Checkout Panel
                  </h2>
                </div>
                <div className="rounded-full bg-[#eef7ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0a2144]">
                  Instant flow
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7489a4]">
                    Select Package
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition-all ${
                          selectedSize === size
                            ? "border-[#0a2144] bg-[#0a2144] text-white shadow-lg shadow-[#0a2144]/15"
                            : "border-[#d8e2ef] bg-[#f9fbff] text-[#314661] hover:border-[#0ea5a8] hover:text-[#0ea5a8]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {product.notices.length > 0 && (
                  <div className="space-y-2">
                    {product.notices.map((notice, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
                      >
                        {notice}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 rounded-[26px] border border-[#dbe5f0] bg-[#f9fbff] p-4">
                  <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7489a4]">
                    Beneficiary Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0241234567"
                    className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${
                      phoneError
                        ? "border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        : "border-[#c9d9ec] focus:border-[#0ea5a8] focus:ring-2 focus:ring-[#0ea5a8]/20"
                    }`}
                  />
                  {phoneError && (
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-amber-600 bg-amber-50 p-2 rounded-xl border border-amber-100 animate-fadeIn">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      {phoneError}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[26px] border border-[#dbe5f0] bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7489a4]">
                      Selected price
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-[#0a2144]">
                      {selectedSize
                        ? product.prices[selectedSize]
                        : Object.values(product.prices)[0]}
                    </p>
                  </div>
                  <div className="rounded-[26px] border border-[#dbe5f0] bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7489a4]">
                      Delivery
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#0a2144]">
                      {product.network === "AirtelTigo"
                        ? "Instant iShare processing"
                        : "Fast fulfillment workflow"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleBuy}
                  className="hub-btn w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.18em] shadow-xl shadow-[#0a2144]/10 transition hover:-translate-y-px"
                >
                  Continue to Checkout
                </button>

                <div className="rounded-[26px] border border-[#dbe5f0] bg-[#eef7ff] p-4 text-sm leading-6 text-[#375071]">
                  <p className="font-bold text-[#0a2144]">
                    Need to track your order?
                  </p>
                  <p className="mt-1">
                    Use the order reference after payment to follow delivery
                    progress.
                  </p>
                  <Link
                    href="/track-order"
                    className="mt-3 inline-block font-semibold text-[#0f3f77] underline hover:text-[#0ea5a8]"
                  >
                    Go to Track Order →
                  </Link>
                </div>

                <div className="text-sm text-[#5f7088]">
                  <span className="font-semibold text-[#0a2144]">
                    Category:
                  </span>{" "}
                  {product.category}
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          {relatedProducts.length > 0 && (
            <div className="hub-card rounded-[34px] p-6 sm:p-7">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0ea5a8]">
                    Explore more
                  </p>
                  <h3 className="hub-display mt-2 text-2xl font-bold text-[#0a2144]">
                    Related products
                  </h3>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {relatedProducts.map((r) => (
                  <Link
                    key={r.id}
                    href={`/product/${r.id}`}
                    className="group overflow-hidden rounded-3xl border border-[#dbe5f0] bg-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div
                      className={`relative h-36 bg-linear-to-br ${productGradients[r.id] ?? "from-slate-300 to-slate-100"}`}
                    >
                      <Image
                        src={r.image}
                        alt={r.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[#071a34]/45 via-transparent to-transparent" />
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-bold text-[#0a2144]">
                        {r.name}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#64809f]">
                        {Object.values(r.prices)[0]} -{" "}
                        {Object.values(r.prices).at(-1)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
