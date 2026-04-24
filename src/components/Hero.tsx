"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck, Globe, Activity } from "lucide-react";

const slides = [
  {
    id: "mtn",
    title: "MTN Data Bundles",
    subtitle: "Experience lightning-fast speeds and nationwide coverage with our affordable MTN data plans.",
    image: "/images/mtn.webp",
    accent: "bg-yellow-400",
    textAccent: "text-amber-600",
    badge: "Most Popular",
  },
  {
    id: "airteltigo",
    title: "AirtelTigo iShare",
    subtitle: "Share the joy of connectivity with instant iShare data delivery to any AirtelTigo number.",
    image: "/images/airteltigo.webp",
    accent: "bg-blue-600",
    textAccent: "text-blue-600",
    badge: "Instant Delivery",
  },
  {
    id: "telecel",
    title: "Telecel Non-Expiry",
    subtitle: "Switch to Telecel non-expiry data and enjoy browsing at your own pace without the pressure of time.",
    image: "/images/telecel.webp",
    accent: "bg-red-600",
    textAccent: "text-red-600",
    badge: "Best Value",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[85vh] lg:min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-white">
      {/* Background Decor - consistent with light theme */}
      <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-fuchsia-50/40 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="relative z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={slides[current].id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100/50">
                      {slides[current].badge}
                    </span>
                    <div className="h-px w-8 bg-slate-200" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Connecting you to the best
                    </span>
                  </div>

                  <h1 className="text-6xl md:text-7xl font-black leading-[1.1] text-slate-900 tracking-tighter">
                    <span className="text-gradient block">{slides[current].title.split(" ")[0]}</span>
                    <span className="block mt-1">{slides[current].title.split(" ").slice(1).join(" ")}</span>
                  </h1>
                </div>

                <p className="text-lg text-slate-500 mb-10 max-w-md leading-relaxed font-semibold opacity-90">
                  {slides[current].subtitle}
                </p>

                <div className="flex flex-wrap gap-5">
                  <button className="btn-primary flex items-center gap-2 group text-lg py-5 px-10">
                    Shop Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-10 py-5 border-2 border-slate-100 rounded-full font-bold text-slate-900 hover:bg-slate-50 transition-all text-lg active:scale-95 shadow-sm">
                    View Rates
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-16 flex gap-10 items-center text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-slate-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Activity className="w-5 h-5 text-slate-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time</span>
              </div>
            </div>
          </div>

          {/* Right Content - Premium Frame */}
          <div className="relative">
             <AnimatePresence mode="wait">
                <motion.div
                  key={slides[current].id}
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="relative group"
                >
                  <div className="relative w-full aspect-square md:aspect-[4/5] lg:aspect-square max-w-[500px] mx-auto">
                    {/* Shadow Decor */}
                    <div className={`absolute -inset-4 rounded-[3rem] blur-2xl opacity-20 ${slides[current].accent}`} />
                    
                    <div className="w-full h-full glass-light rounded-[3rem] p-2 relative overflow-hidden shadow-2xl shadow-slate-200/50">
                      <div className="w-full h-full rounded-[2.5rem] bg-slate-50 overflow-hidden relative">
                        <img 
                          src={slides[current].image}
                          alt={slides[current].title}
                          className="w-full h-full object-cover animate-kenBurn brightness-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                        
                        {/* Interactive Status Indicator Overlay */}
                        <div className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-lg flex items-center gap-3">
                          <div className="relative">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full pulse-green" />
                          </div>
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Network Live</span>
                        </div>

                        {/* Slide Info Badge */}
                        <div className="absolute bottom-10 left-10 text-white">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 opacity-80">Connected via</p>
                          <h4 className="text-3xl font-black tracking-tight">{slides[current].id.toUpperCase()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
             </AnimatePresence>

             {/* Carousel Controls */}
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
               {slides.map((_, idx) => (
                 <button
                   key={idx}
                   onClick={() => setCurrent(idx)}
                   className={`h-1.5 transition-all rounded-full ${
                     current === idx ? "w-8 bg-slate-900" : "w-4 bg-slate-200"
                   }`}
                   aria-label={`Go to slide ${idx + 1}`}
                 />
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
