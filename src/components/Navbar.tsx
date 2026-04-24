"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Data Plans", href: "/#categories" },
  { name: "Track Order", href: "/track-order" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isScrolled
          ? "bg-white/88 backdrop-blur-2xl border-b border-[#d6e1f0] shadow-lg py-3"
          : "bg-linear-to-r from-[#0a2144] via-[#123a70] to-[#0f172a] text-white py-5"
      }`}
    >
      <div className="max-w-360 mx-auto flex items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex flex-col leading-tight">
          <span
            className={`hub-display text-[11px] tracking-[0.24em] font-bold ${isScrolled ? "text-[#0ea5a8]" : "text-[#8ef6ef]"}`}
          >
            M&N
          </span>
          <span
            className={`hub-display text-lg sm:text-xl font-extrabold tracking-tight ${isScrolled ? "text-[#0a2144]" : "text-white"}`}
          >
            DATA HUB
          </span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  isScrolled
                    ? "text-[#32445f] hover:text-[#0ea5a8]"
                    : "text-white/85 hover:text-[#fcd34d]"
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className={`md:hidden text-2xl ${isScrolled ? "text-[#0a2144]" : "text-white"}`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          title="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 top-full w-full border-b border-[#d6e1f0] bg-white p-5 shadow-lg md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-semibold text-[#0a2144] hover:text-[#0ea5a8]"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
