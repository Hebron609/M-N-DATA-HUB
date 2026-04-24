"use client";

import Image from "next/image";
import Link from "next/link";
import { products, getPriceRange, type Product } from "@/lib/products-data";

const productGradients: Record<string, string> = {
  mtn1: "from-[#f59e0b] via-[#fcd34d] to-[#fff2c8]",
  airteltigo1: "from-[#0ea5a8] via-[#2dd4bf] to-[#defcf7]",
  telecel1: "from-[#0a2144] via-[#1d4f91] to-[#d9e8ff]",
};

function ProductCard({ product }: { product: Product }) {
  const isOut = product.stock === "out";
  const priceRange = getPriceRange(product);

  return (
    <Link
      href={isOut ? "#" : `/product/${product.id}`}
      aria-disabled={isOut}
      tabIndex={isOut ? -1 : 0}
      className={`group product-card relative block overflow-hidden rounded-[28px] ${
        isOut ? "cursor-not-allowed opacity-70" : "cursor-pointer"
      }`}
    >
      <div className="hub-card relative h-full overflow-hidden rounded-[28px] transition-all duration-500 hover:-translate-y-1">
        <div
          className={`relative aspect-4/3 w-full overflow-hidden bg-linear-to-br ${productGradients[product.id] ?? "from-slate-300 to-slate-100"}`}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-90"
            onError={() => {}}
          />

          <div className="absolute inset-0 bg-linear-to-t from-[#071a34]/72 via-transparent to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0a2144] shadow-sm">
              {product.network}
            </span>
            {product.badge && !isOut && (
              <span className="hub-tag rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-[#071a34]/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {isOut ? "Waitlist" : "Available"}
          </div>

          {isOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a2144]/60 backdrop-blur-[2px]">
              <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-widest text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0ea5a8]">
              Data Service
            </p>
            <p className="text-[11px] font-semibold text-[#5f7088]">
              {product.sku}
            </p>
          </div>

          <h3 className="hub-display text-[1.15rem] font-bold leading-tight text-[#0a2144] transition-colors group-hover:text-[#0ea5a8]">
            {product.name}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-[#5f7088]">
            {product.additionalInfo}
          </p>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#e2ebf5] pt-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7b8ea8]">
                Price range
              </p>
              <p className="mt-1 text-base font-extrabold text-[#0a2144]">
                {priceRange}
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${
                isOut
                  ? "bg-[#eef4ff] text-[#5f7088]"
                  : "bg-[#0a2144] text-white"
              }`}
            >
              {isOut ? "Coming soon" : "View bundle"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductCategories() {
  return (
    <section
      id="categories"
      className="relative mx-auto max-w-360 px-4 py-16 sm:py-20"
    >
      <div className="absolute inset-x-4 top-8 -z-10 h-56 rounded-4xl bg-linear-to-r from-[#eef7ff] via-white to-[#effcf7] opacity-90 blur-3xl" />

      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-[28px] border border-[#dbe5f0] bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0ea5a8]">
              Live catalog
            </p>
            <p className="mt-1 text-sm text-[#5f7088]">
              Browse the current bundles below and open any card to continue.
            </p>
          </div>
          <div className="hidden rounded-full bg-[#0a2144] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white sm:inline-flex">
            {products.length} bundles
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
