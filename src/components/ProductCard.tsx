"use client";

import { motion } from "framer-motion";
import { Check, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProductProps {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  color: string;
  image: string;
}

export default function ProductCard({ id, name, price, description, features, color, image }: ProductProps) {
  return (
    <Link href={`/product/${id}`}>
      <motion.div
      whileHover={{ y: -8 }}
      className="glass-light rounded-[2.5rem] overflow-hidden group border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50"
    >
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className={`absolute top-6 left-6 z-20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg ${color}`}>
          Best Seller
        </div>
      </div>

      <div className="p-10 relative">
        <h3 className="text-3xl font-black mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{name}</h3>
        <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">{description}</p>
        
        <div className="flex items-baseline gap-2 mb-10">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Starting at</span>
          <span className="text-4xl font-black text-slate-900 tracking-tighter">{price}</span>
        </div>

        <div className="space-y-4 mb-10">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              {feature}
            </div>
          ))}
        </div>

        <div className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center gap-2 font-bold group-hover/btn:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
          Select Package
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center border border-white shadow-sm hover:bg-white transition-colors">
          <Info className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </motion.div>
    </Link>
  );
}
