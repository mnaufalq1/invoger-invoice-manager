"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  CreditCard,
  ChevronRight,
  Shield,
  LogOut,
} from "lucide-react";
import AppShell from "@/components/app-shell";
import { authClient } from "@/lib/auth-client";

type SubscriptionInfo = {
  planCode: string;
  isPremium: boolean;
};

export default function SettingsIndexPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const isUserPremium =
          Boolean(data.isPremium) ||
          Boolean(data.quotaSummary?.subscription?.isPremium) ||
          data.subscription?.planCode === "PREMIUM";

        setUser({
          name: data.name || "Pengguna",
          email: data.email || "",
        });
        setSubscription({
          planCode: isUserPremium ? "PREMIUM" : (data.subscription?.planCode || "FREE"),
          isPremium: isUserPremium,
        });
      }
    } catch {
      // fallback
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  const isPremium = subscription?.isPremium ?? false;

  return (
    <AppShell
      title="Pengaturan"
      subtitle="Kelola profil bisnis, preferensi akun & keamanan, serta paket langganan Anda."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* LIST MENU PENGATURAN */}
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] divide-y divide-zinc-800/80 overflow-hidden shadow-sm">
          {/* Menu 1: Profil Bisnis */}
          <Link
            href="/settings/profile"
            className="flex items-center justify-between p-5 sm:p-6 hover:bg-zinc-800/40 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  Profil Bisnis
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Nama usaha, email bisnis, kontak telepon, alamat lengkap, dan NPWP untuk dokumen tagihan resmi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 shrink-0">
              <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition hidden sm:inline">
                Atur
              </span>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition" />
            </div>
          </Link>

          {/* Menu 2: Akun & Keamanan */}
          <Link
            href="/settings/account"
            className="flex items-center justify-between p-5 sm:p-6 hover:bg-zinc-800/40 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Pengaturan Akun & Keamanan
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Informasi akun pemilik, email login terdaftar, dan ganti kata sandi login Anda.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 shrink-0">
              <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition hidden sm:inline">
                Atur
              </span>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition" />
            </div>
          </Link>

          {/* Menu 3: Paket & Langganan */}
          <Link
            href="/settings/subscription"
            className="flex items-center justify-between p-5 sm:p-6 hover:bg-zinc-800/40 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-950/70 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                    Paket & Langganan
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isPremium
                        ? "bg-blue-900/60 text-blue-300 border border-blue-500/40"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {isPremium ? "PREMIUM" : "FREE"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Status paket aktif, pantau pemakaian kuota bulanan invoice & penawaran, serta opsi upgrade.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 shrink-0">
              <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition hidden sm:inline">
                Kelola
              </span>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition" />
            </div>
          </Link>
        </div>

        {/* Sesi & Logout */}
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Sesi Pengguna Aktif</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Masuk sebagai <strong className="text-zinc-200">{user?.name || "Pengguna"}</strong> ({user?.email || "-"})
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-950/30 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
