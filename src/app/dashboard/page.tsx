"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  AlertTriangle,
  FileText,
  Wallet,
  Clock,
  ScrollText,
  CheckCircle2,
} from "lucide-react";
import AppShell from "@/components/app-shell";

type DashboardStats = {
  invoiceCount: number;
  paidRevenue: number;
  unpaidCount: number;
  unpaidAmount: number;
  quotationCount: number;
};

type RecentInvoice = {
  id: string;
  documentNumber: string;
  customerName: string;
  status: string;
  total: number;
  dueDate: string | null;
};

type DashboardData = {
  name: string;
  email: string;
  profile: {
    businessName: string | null;
  } | null;
  subscription: {
    planCode?: string;
    status: string;
    plan: {
      name: string;
      code?: string;
      monthlyPrice: number;
    };
  } | null;
  quotaSummary?: {
    subscription: {
      planCode: string;
      planName: string;
      isPremium: boolean;
    };
    invoices: {
      used: number;
      limit: number | null;
      remaining: number | null;
      isLimitReached: boolean;
    };
    quotations: {
      used: number;
      limit: number | null;
      remaining: number | null;
      isLimitReached: boolean;
    };
  };
  stats?: DashboardStats;
  recentInvoices?: RecentInvoice[];
  unpaidInvoices?: RecentInvoice[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Gagal mengambil data dashboard.");
        }

        const result = await response.json();
        setData(result);
      } catch {
        setError("Tidak dapat memuat data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0c0d12] text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span>Memuat Dashboard...</span>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0c0d12]">
        <p className="text-red-400">{error || "Data tidak ditemukan."}</p>
      </main>
    );
  }

  // Format nilai pendapatan riil
  const rawRevenue = data.stats?.paidRevenue || 0;
  let formattedRevenue = "Rp0";
  if (rawRevenue >= 1_000_000) {
    const jt = (rawRevenue / 1_000_000).toFixed(rawRevenue % 1_000_000 === 0 ? 0 : 1);
    formattedRevenue = `Rp${jt} jt`;
  } else if (rawRevenue > 0) {
    formattedRevenue = `Rp${rawRevenue.toLocaleString("id-ID")}`;
  }

  const rawUnpaidAmount = data.stats?.unpaidAmount || 0;
  let formattedUnpaidAmount = "Rp0";
  if (rawUnpaidAmount >= 1_000_000) {
    const jt = (rawUnpaidAmount / 1_000_000).toFixed(rawUnpaidAmount % 1_000_000 === 0 ? 0 : 1);
    formattedUnpaidAmount = `Rp${jt} jt`;
  } else if (rawUnpaidAmount > 0) {
    formattedUnpaidAmount = `Rp${rawUnpaidAmount.toLocaleString("id-ID")}`;
  }

  const hasRealInvoices = Boolean(data.recentInvoices && data.recentInvoices.length > 0);
  const totalInvoiceVal = data.stats?.invoiceCount ?? 0;
  const unpaidCountVal = data.stats?.unpaidCount ?? 0;
  const quotationCountVal = data.stats?.quotationCount ?? 0;

  return (
    <AppShell
      title="Dashboard"
      subtitle="Selamat datang kembali! Berikut ringkasan performa bisnis Anda."
      action={
        <div className="flex items-center gap-3">
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Invoice Baru</span>
          </Link>
        </div>
      }
    >
      {/* Alert Kuota Bulanan Habis */}
      {data.quotaSummary?.invoices?.isLimitReached && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Batas Kuota Bulanan Tercapai</p>
              <p className="text-xs text-rose-300/90">
                Anda telah menggunakan 10/10 kuota invoice gratis untuk bulan ini. Upgrade ke Paket Premium untuk membuat invoice tanpa batas.
              </p>
            </div>
          </div>
          <Link
            href="/settings/subscription"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 shadow-lg transition"
          >
            Upgrade ke Premium
          </Link>
        </div>
      )}
      {/* 4 Kartu Metrik Ringkasan (Real Data) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Invoice */}
        <div className="rounded-2xl border border-blue-500/30 bg-[#141926]/90 p-5 transition hover:border-blue-500/50">
          <div className="flex items-center justify-between text-blue-400">
            <FileText className="h-5 w-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
              Dokumen
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-400">Total Invoice</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-white">
              {totalInvoiceVal}
            </p>
            <p className="mt-2 text-xs text-zinc-500">Semua tagihan dibuat</p>
          </div>
        </div>

        {/* Card 2: Pendapatan Riil */}
        <div className="rounded-2xl border border-emerald-500/30 bg-[#12221b]/90 p-5 transition hover:border-emerald-500/50">
          <div className="flex items-center justify-between text-emerald-400">
            <Wallet className="h-5 w-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
              Diterima
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-400">Pendapatan Riil</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-white">
              {formattedRevenue}
            </p>
            <p className="mt-2 text-xs text-emerald-400/80">Pembayaran lunas tercatat</p>
          </div>
        </div>

        {/* Card 3: Belum Dibayar */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#241a15]/90 p-5 transition hover:border-amber-500/50">
          <div className="flex items-center justify-between text-amber-400">
            <Clock className="h-5 w-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
              Pending
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-400">Belum Dibayar</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-amber-400">
              {unpaidCountVal}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              {rawUnpaidAmount > 0 ? `Total: ${formattedUnpaidAmount}` : "Semua tagihan lunas"}
            </p>
          </div>
        </div>

        {/* Card 4: Penawaran Harga */}
        <div className="rounded-2xl border border-purple-500/30 bg-[#211629]/90 p-5 transition hover:border-purple-500/50">
          <div className="flex items-center justify-between text-purple-400">
            <ScrollText className="h-5 w-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
              Estimasi
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-400">Penawaran Dibuat</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-purple-400">
              {quotationCountVal}
            </p>
            <p className="mt-2 text-xs text-zinc-500">Proposal penawaran harga</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kolom 1: Invoice Terbaru */}
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Invoice Terbaru</h2>
            {hasRealInvoices && (
              <Link
                href="/invoices"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Lihat Semua →
              </Link>
            )}
          </div>

          {!hasRealInvoices ? (
            <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl">
              <div className="flex justify-center mb-2">
                <FileText className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="mt-2 text-sm font-semibold text-white">Belum ada invoice dibuat</p>
              <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
                Mulai buat invoice pertama Anda untuk menagih pelanggan secara profesional.
              </p>
              <Link
                href="/invoices/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Invoice Baru</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {data.recentInvoices?.map((inv) => {
                let badgeColor = "bg-amber-950/70 border-amber-500/30 text-amber-400";
                let badgeLabel = "Menunggu";

                if (inv.status === "PAID") {
                  badgeColor = "bg-emerald-950/70 border-emerald-500/30 text-emerald-400";
                  badgeLabel = "Lunas";
                } else if (inv.status === "OVERDUE") {
                  badgeColor = "bg-rose-950/70 border-rose-500/30 text-rose-400";
                  badgeLabel = "Jatuh Tempo";
                } else if (inv.status === "CANCELLED") {
                  badgeColor = "bg-zinc-800 border-zinc-700 text-zinc-400";
                  badgeLabel = "Dibatalkan";
                }

                return (
                  <div
                    key={inv.id}
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 cursor-pointer rounded-xl px-2 -mx-2 hover:bg-zinc-800/40 transition group"
                  >
                    <div>
                      <p className="font-semibold text-sm text-white group-hover:text-blue-400 transition">
                        {inv.documentNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">{inv.customerName}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        Rp {inv.total.toLocaleString("id-ID")}
                      </p>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeColor}`}
                        >
                          {badgeLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom 2: Menunggu Pembayaran / Tindakan Penagihan */}
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Menunggu Pembayaran</h2>
            {data.unpaidInvoices && data.unpaidInvoices.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {data.unpaidInvoices.length} Perlu Ditagih
              </span>
            )}
          </div>

          {!data.unpaidInvoices || data.unpaidInvoices.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl">
              <div className="flex justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/60" />
              </div>
              <p className="mt-2 text-sm font-semibold text-white">Tidak ada tagihan tertunggak</p>
              <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
                Semua invoice telah terbayar lunas atau belum ada invoice terbit.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {data.unpaidInvoices.map((inv) => {
                const dueDateStr = inv.dueDate
                  ? new Date(inv.dueDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  : null;

                return (
                  <div
                    key={inv.id}
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 cursor-pointer rounded-xl px-2 -mx-2 hover:bg-zinc-800/40 transition group"
                  >
                    <div>
                      <p className="font-semibold text-sm text-white group-hover:text-amber-400 transition">
                        {inv.documentNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">{inv.customerName}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">
                        Rp {inv.total.toLocaleString("id-ID")}
                      </p>
                      {dueDateStr && (
                        <p className="mt-0.5 text-[11px] text-zinc-500">
                          Jatuh tempo: {dueDateStr}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
