"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    eyebrow: "M&N DATA HUB",
    title: "Reliable Mobile Data, Every Day",
    subtitle:
      "Fast and trusted bundles across MTN, AirtelTigo, and Telecel with instant order confirmation.",
    buttonText: "Browse Bundles",
    href: "/#categories",
    gradient: "from-[#0a2144] via-[#174c89] to-[#0f172a]",
  },
  {
    eyebrow: "AirtelTigo",
    title: "Instant iShare Activation",
    subtitle:
      "Complete payment and get connected quickly with live status tracking from checkout to delivery.",
    buttonText: "Get iShare",
    href: "/product/airteltigo1",
    gradient: "from-[#14532d] via-[#0f766e] to-[#042f2e]",
  },
  {
    eyebrow: "Telecel & MTN",
    title: "Flexible Packages For Every Budget",
    subtitle:
      "Small top-ups or larger plans, all on one clean and secure checkout flow.",
    buttonText: "Start Order",
    href: "/product/mtn1",
    gradient: "from-[#7c2d12] via-[#c2410c] to-[#0a2144]",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <section className="carousel-responsive relative max-w-360 overflow-hidden rounded-[28px] h-95 sm:h-125 lg:h-135">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            current === idx
              ? "z-10 opacity-100 animate-kenBurn"
              : "z-0 opacity-0"
          }`}
        >
          <div
            className={`absolute inset-0 bg-linear-to-br ${slide.gradient}`}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.22),transparent_38%)]" />
          <div className="absolute inset-0 bg-black/18 rounded-[28px]" />

          {current === idx && (
            <div
              key={current}
              className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white sm:px-8 animate-fadeInUp"
            >
              <p className="mb-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/80 font-bold">
                {slide.eyebrow}
              </p>
              <h1 className="hub-display mb-3 max-w-4xl text-3xl font-extrabold tracking-tight sm:mb-4 sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              <p className="max-w-[320px] sm:max-w-2xl mx-auto mb-7 text-sm leading-relaxed sm:text-lg text-white/90">
                {slide.subtitle}
              </p>
              <Link
                href={slide.href}
                className="rounded-full bg-white px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-[#0a2144] transition-all duration-300 hover:scale-[1.02] hover:bg-[#fef3c7]"
              >
                {slide.buttonText}
              </Link>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/20 p-3 text-xl text-white backdrop-blur-sm transition hover:bg-white/35 sm:block"
        aria-label="Previous slide"
        title="Previous slide"
      >
        &#10094;
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/20 p-3 text-xl text-white backdrop-blur-sm transition hover:bg-white/35 sm:block"
        aria-label="Next slide"
        title="Next slide"
      >
        &#10095;
      </button>

      <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center space-x-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            title={`Go to slide ${idx + 1}`}
            className={`h-3 w-3 rounded-full transition-all ${
              current === idx ? "bg-[#fef3c7] scale-110" : "bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
