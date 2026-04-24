"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Search } from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  inStock: boolean;
  createdAt: string;
};

function formatCurrency(value: number) {
  return `GHS ${Number(value || 0).toFixed(2)}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) {
          setProducts(json.products || []);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    });
  }, [products, query]);

  const inStockCount = products.filter((p) => p.inStock).length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0a2144]">Products</h2>
          <p className="text-[#5f7088] text-sm">
            Manage available bundles and product catalog entries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#d6e1f0] bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest font-bold text-[#6f819b]">
            Total Products
          </p>
          <p className="mt-2 text-2xl font-black text-[#0a2144]">
            {products.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#d6e1f0] bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest font-bold text-[#6f819b]">
            In Stock
          </p>
          <p className="mt-2 text-2xl font-black text-[#0ea5a8]">
            {inStockCount}
          </p>
        </div>
        <div className="rounded-2xl border border-[#d6e1f0] bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest font-bold text-[#6f819b]">
            Out of Stock
          </p>
          <p className="mt-2 text-2xl font-black text-[#b91c1c]">
            {products.length - inStockCount}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white p-5 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6f819b]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, or description..."
            className="w-full rounded-xl border border-[#c9d9ec] py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5a8]/35"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#d6e1f0] flex items-center gap-2">
          <Boxes className="h-4 w-4 text-[#0ea5a8]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#5f7088]">
            Product Inventory
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8fbff] text-xs font-bold uppercase tracking-widest text-[#6f819b]">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebf1f8]">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-[#6f819b]">
                    Loading products...
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#f8fbff] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#0a2144]">
                        {p.name}
                      </p>
                      {p.description && (
                        <p className="mt-0.5 text-xs text-[#6f819b] line-clamp-1">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4f647f]">
                      {p.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#0a2144]">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${p.inStock ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                      >
                        {p.inStock ? "In Stock" : "Out"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5f7088]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-[#6f819b]"
                  >
                    No products found.
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
