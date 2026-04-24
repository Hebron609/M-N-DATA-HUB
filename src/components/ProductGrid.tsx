"use client";

import ProductCard from "./ProductCard";
import { motion } from "framer-motion";
import { products } from "@/lib/products-data";

const networkColors: Record<string, string> = {
  MTN: "bg-yellow-500",
  AirtelTigo: "bg-red-500",
  Telecel: "bg-red-600",
};

const networkFeatures: Record<string, string[]> = {
  MTN: ["Instant Delivery", "4G/5G Supported", "Long Validity"],
  AirtelTigo: ["Easy Sharing", "No Expiry", "Reliable Speed"],
  Telecel: ["Never Expires", "Unrestricted Usage", "Premium Priority"],
};

export default function ProductGrid() {
  // Group products into a "Data Bundles" category for now
  // In a real app, you might have different categories in products-data
  const categories = [
    {
      title: "Data Bundles",
      items: products,
    },
    {
      title: "Streaming Services (Coming Soon)",
      items: [
        { id: "netflix", name: "Netflix Premium", category: "Digital", image: "/images/netflix.jpg", description: "Unlimited movies and TV shows.", stock: "out" as const },
        { id: "spotify", name: "Spotify Individual", category: "Digital", image: "/images/spotify.jpg", description: "Millions of songs without ads.", stock: "out" as const },
      ],
    },
  ];

  return (
    <section id="categories" className="py-24 max-w-[1440px] mx-auto px-6 font-montserrat">
      <div className="space-y-24">
        {categories.map((category) => (
          <div key={category.title}>
            <div className="flex justify-between items-end mb-10 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {category.title}
                </h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">
                  Premium {category.title.split(" ")[0]} Solutions
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-slate-400 group cursor-pointer hover:text-slate-900 transition-colors">
                <span className="text-xs font-bold uppercase tracking-widest">Scroll to explore</span>
                <div className="w-8 h-px bg-slate-200 group-hover:w-12 transition-all" />
              </div>
            </div>

            <div className="flex gap-8 pb-10 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2">
              {category.items.map((product) => (
                <div key={product.id} className="min-w-[300px] sm:min-w-[400px] snap-start">
                  <ProductCard 
                    id={product.id}
                    name={product.name}
                    price={(product as any).prices ? Object.values((product as any).prices)[0] as string : "₵0.00"}
                    description={product.description}
                    features={networkFeatures[(product as any).network] || ["Fast Activation", "Reliable Support"]}
                    color={networkColors[(product as any).network] || "bg-indigo-500"}
                    image={product.image}
                  />
                  {category.title.includes("Soon") && (
                     <div className="mt-4 text-center">
                        <span className="px-3 py-1 bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-full">Coming Soon</span>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
