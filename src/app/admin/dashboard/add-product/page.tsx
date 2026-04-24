"use client";

import { useState } from "react";
import Link from "next/link";
import { PackagePlus } from "lucide-react";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    category: "DATA",
    price: "",
    description: "",
    inStock: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const submit = async () => {
    setMessage("");
    setError("");

    if (!form.name.trim() || !form.price.trim()) {
      setError("Name and price are required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim() || "DATA",
          price: Number(form.price),
          description: form.description.trim(),
          inStock: form.inStock,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json?.success) {
        setError(json?.message || "Failed to add product.");
        return;
      }

      setMessage("Product created successfully.");
      setForm({
        name: "",
        category: "DATA",
        price: "",
        description: "",
        inStock: true,
      });
    } catch {
      setError("Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#0a2144]">Add Product</h2>
        <p className="text-[#5f7088] text-sm">
          Create a new data-service product for checkout and admin operations.
        </p>
      </div>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <PackagePlus className="h-5 w-5 text-[#0ea5a8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#5f7088]">
            Product Information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Product name"
            className="rounded-xl border border-[#c9d9ec] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5a8]/35"
          />

          <input
            type="text"
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category: e.target.value }))
            }
            placeholder="Category (e.g. MTN, AirtelTigo, Telecel)"
            className="rounded-xl border border-[#c9d9ec] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5a8]/35"
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: e.target.value }))
            }
            placeholder="Base price"
            className="rounded-xl border border-[#c9d9ec] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5a8]/35"
          />

          <label className="inline-flex items-center gap-2 rounded-xl border border-[#c9d9ec] px-4 py-3 text-sm text-[#4f647f]">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, inStock: e.target.checked }))
              }
            />
            In stock
          </label>

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Optional description"
            className="md:col-span-2 h-28 resize-none rounded-xl border border-[#c9d9ec] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5a8]/35"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-xl bg-[#0a2144] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123a70] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create Product"}
          </button>

          <Link
            href="/admin/dashboard/products"
            className="rounded-xl border border-[#c9d9ec] bg-white px-5 py-2.5 text-sm font-semibold text-[#0a2144]"
          >
            View Products
          </Link>
        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
