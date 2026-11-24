"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  ScrollText,
  BarChart3,
  Settings,
  User,
  Building2,
  CreditCard,
  LogOut,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type UserInfo = {
  name: string;
  email: string;
  planCode?: string;
  isPremium?: boolean;
};

function SidebarLinks() {
  const pathname = usePathname();

  function isActive(path: string) {
    if (path === "/dashboard") return pathname === "/dashboard";
    if (path === "/settings") return pathname.startsWith("/settings");
    return pathname.startsWith(path);
  }

  const navItemClass = (path: string) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
      isActive(path)
        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-medium text-white shadow-lg shadow-indigo-600/20"
        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
    }`;

  return (
    <div>
      {/* Menu Dashboard Utama */}
      <div className="mt-4">
        <Link href="/dashboard" className={navItemClass("/dashboard")}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Group 1: Business */}
      <div className="mt-6">
        <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Business
        </div>
        <nav className="mt-2 space-y-1">
          <Link href="/customers" className={navItemClass("/customers")}>
            <Users className="h-4 w-4" />
            <span>Pelanggan</span>
          </Link>

          <Link href="/invoices" className={navItemClass("/invoices")}>
            <FileText className="h-4 w-4" />
            <span>Invoice</span>
          </Link>

          <Link href="/quotations" className={navItemClass("/quotations")}>
            <ScrollText className="h-4 w-4" />
            <span>Penawaran</span>
          </Link>

          <Link href="/reports" className={navItemClass("/reports")}>
            <BarChart3 className="h-4 w-4" />
            <span>Laporan</span>
          </Link>
        </nav>
      </div>

      {/* Group 2: Account */}
      <div className="mt-6">
        <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Account
        </div>
        <nav className="mt-2 space-y-1">
          <Link href="/settings" className={navItemClass("/settings")}>
            <Settings className="h-4 w-4" />
            <span>Pengaturan</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default function AppShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          const isUserPremium =
            Boolean(data.isPremium) ||
            Boolean(data.quotaSummary?.subscription?.isPremium) ||
            data.subscription?.planCode === "PREMIUM";

          setUser({
            name: data.name || "Pengguna",
            email: data.email || "",
            planCode: isUserPremium ? "PREMIUM" : (data.subscription?.planCode || "FREE"),
            isPremium: isUserPremium,
          });
        }
      } catch {
        // Fallback default
      }
    }
    void loadUser();

    function handleSubscriptionSync() {
      void loadUser();
    }
    window.addEventListener("subscription-changed", handleSubscriptionSync);
    window.addEventListener("focus", handleSubscriptionSync);

    return () => {
      window.removeEventListener("subscription-changed", handleSubscriptionSync);
      window.removeEventListener("focus", handleSubscriptionSync);
    };
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#0c0d12] text-zinc-100 font-sans">
      {/* Sidebar Navigasi Kiri */}
      <aside className="w-64 border-r border-zinc-800/80 bg-[#121319] p-5 flex flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div>
          {/* Logo Header */}
          <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Invo<span className="text-blue-500">Ger</span>
            </span>
          </Link>

          <Suspense fallback={<div className="mt-4 h-32 animate-pulse bg-zinc-800/30 rounded-xl" />}>
            <SidebarLinks />
          </Suspense>
        </div>

        {/* User Card & Dropdown di Bawah Sidebar */}
        <div className="relative border-t border-zinc-800/80 pt-4" ref={userMenuRef}>
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-3 z-50 rounded-2xl border border-zinc-800 bg-[#16171d] p-2 shadow-2xl shadow-black/90">
              <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || "Pengguna"}</p>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      user?.isPremium
                        ? "bg-blue-900/60 text-blue-300 border border-blue-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {user?.isPremium ? "PREMIUM" : "FREE"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user?.email || ""}</p>
              </div>
              <div className="space-y-0.5">
                <Link
                  href="/settings/account"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pengaturan Akun</span>
                </Link>
                <Link
                  href="/settings/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Profil Bisnis</span>
                </Link>
                <Link
                  href="/settings/subscription"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                  <span>Paket & Langganan</span>
                </Link>
              </div>
              <div className="border-t border-zinc-800/80 my-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    void handleLogout();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-zinc-800/60 transition cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-zinc-700"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate max-w-[110px]">
                  {user?.name || "Pengguna"}
                </p>
                <p className="text-[11px] font-medium mt-0.5">
                  {user?.isPremium ? (
                    <span className="text-blue-400 font-semibold">Premium</span>
                  ) : (
                    <span className="text-zinc-400 font-normal">Free Plan</span>
                  )}
                </p>
              </div>
            </div>
            {isUserMenuOpen ? (
              <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
            ) : (
              <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto min-h-screen">
        <div className="mx-auto max-w-6xl w-full">
          {title && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
                )}
              </div>
              {action && <div>{action}</div>}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
