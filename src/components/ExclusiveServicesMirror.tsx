"use client";

import HeroCarousel from "@/components/HeroCarousel";
import ProductCategories from "@/components/ProductCategories";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const SUPPORT_PHONE = "0505265279";

export default function ExclusiveServicesMirror() {
  return (
    <div className="hub-shell relative min-h-screen pb-9">
      <Navbar />

      <div className="h-22" />

      <HeroCarousel />

      <div className="mx-4 mt-6">
        <div className="mx-auto flex max-w-360 flex-col gap-3 rounded-2xl border border-[#b8d4e6] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col text-center sm:text-left">
            <p className="hub-display text-base font-bold text-[#0a2144] sm:text-lg">
              M&amp;N DATA HUB support is online
            </p>
            <p className="text-sm text-[#48617f] sm:text-base">
              Need help with any order? Call <strong>{SUPPORT_PHONE}</strong>{" "}
              for quick assistance.
            </p>
          </div>

          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="hub-btn w-full rounded-xl px-5 py-2.5 text-center text-sm font-semibold sm:w-auto"
          >
            Call Support
          </a>
        </div>
      </div>

      <ProductCategories />
      <ChatWidget />
      <Footer />
    </div>
  );
}
