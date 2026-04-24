"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  History,
  BarChart3,
  TrendingUp,
  Database,
  LogOut,
  Menu,
  X,
  Smartphone,
  ChevronRight,
  Bell,
  ShieldCheck,
} from "lucide-react";

const sidebarLinks = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Balance", href: "/admin/dashboard/balance", icon: Wallet },
  {
    name: "Transactions",
    href: "/admin/dashboard/transactions",
    icon: History,
  },
  { name: "Analytics", href: "/admin/dashboard/analytics", icon: BarChart3 },
  {
    name: "Profit Tracker",
    href: "/admin/dashboard/profit-tracker",
    icon: TrendingUp,
  },
  {
    name: "Deposit Tracker",
    href: "/admin/dashboard/deposit-tracker",
    icon: Database,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication Guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c9d9ec] border-t-[#0ea5a8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-55 admin-pattern" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-amber-100/70 blur-3xl" />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a2144]/35 backdrop-blur-sm md:hidden">
          <div className="h-full w-76 max-w-[88%] border-r border-[#d6e1f0] bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#0a2144] to-[#0ea5a8]">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <span className="text-base font-bold text-[#0a2144]">
                  M&amp;L Admin
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
                title="Close menu"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#0a2144] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => signOut()}
              className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative z-30 hidden h-screen flex-col border-r border-[#d6e1f0] bg-white/88 backdrop-blur md:flex"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#0a2144] to-[#0ea5a8] rounded-xl flex items-center justify-center shrink-0">
            <Smartphone className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold tracking-tight"
            >
              M&amp;L<span className="text-[#0ea5a8]">Admin</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                  isActive
                    ? "bg-[#0a2144] text-white shadow-lg shadow-[#0a2144]/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <link.icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "group-hover:text-[#0ea5a8]"}`}
                />
                {isSidebarOpen && <span>{link.name}</span>}
                {isSidebarOpen && isActive && (
                  <motion.div layoutId="active" className="ml-auto">
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        {isSidebarOpen && (
          <div className="mx-4 mb-4 rounded-2xl border border-[#f3ddae] bg-[#fff8e7] p-4 text-xs text-[#8a5a02]">
            <div className="mb-1 flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4" /> Single Admin Mode
            </div>
            <p className="leading-relaxed">
              Access is restricted to one configured admin identity.
            </p>
          </div>
        )}

        <div className="p-4 mt-auto">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-700 hover:bg-rose-50 transition-all font-medium"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-[#d6e1f0] flex items-center justify-between px-4 sm:px-8 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              title="Open menu"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors md:block hidden"
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <h1 className="text-xl font-semibold capitalize text-slate-900">
              {pathname.split("/").pop()?.replace("-", " ") || "Overview"}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold">2</span>
              </div>
              <Bell className="w-6 h-6 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors" />
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-[10px] text-[#0ea5a8] font-bold uppercase tracking-widest">
                  Master Admin
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#e7f8f7] to-[#e9f2ff] border border-[#cfe6f2] flex items-center justify-center">
                <span className="text-sm font-bold text-[#0a2144]">AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-screen-2xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
