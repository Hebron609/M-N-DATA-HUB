"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-8 hub-shell sm:px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full -right-24 -top-24 h-72 w-72 bg-cyan-100/70 blur-3xl" />
        <div className="absolute rounded-full -bottom-24 -left-24 h-72 w-72 bg-amber-100/70 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 rounded-[28px] border border-[#dbe5f0] bg-white/85 p-5 text-center shadow-sm backdrop-blur-sm sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0ea5a8]">
            Admin access
          </p>
          <Link href="/" className="inline-block">
            <div className="hub-display mt-2 text-3xl font-extrabold tracking-tight text-[#0a2144]">
              M&amp;N DATA HUB
            </div>
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[#0a2144]">
            Admin Portal
          </h2>
          <p className="mt-1 text-sm text-[#5f7088]">
            Sign in to manage transactions, balances, and operations.
          </p>
        </div>

        <div className="p-6 hub-card rounded-4xl sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm border rounded-xl border-rose-300 bg-rose-100 text-rose-900">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#526983]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mndata.com"
                className="w-full rounded-2xl border border-[#c9d9ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#0a2144] outline-none transition focus:border-[#0ea5a8] focus:ring-2 focus:ring-[#0ea5a8]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#526983]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-[#c9d9ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#0a2144] outline-none transition focus:border-[#0ea5a8] focus:ring-2 focus:ring-[#0ea5a8]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold transition shadow-lg hub-btn rounded-2xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#dbe5f0] pt-5 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-[#4a6282] transition-colors hover:text-[#0ea5a8]"
            >
              ← Return to main website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
