"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Check,
  FileText,
  ScrollText,
  Calendar,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AppShell from "@/components/app-shell";

type SubscriptionDetail = {
  planCode: string;
  isPremium: boolean;
  activeUntil: string | null;
  usage: {
    invoiceCount: number;
    maxInvoices: number;
    quotationCount: number;
    maxQuotations: number;
  };
};

export default function SubscriptionSettingsPage() {
  const router = useRouter();
  const [sub, setSub] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const quota = data.quotaSummary;
        const currentSub = data.currentSubscription || quota?.subscription;

        setSub({
          planCode: currentSub?.planCode || "FREE",
          isPremium: Boolean(currentSub?.isPremium),
          activeUntil: currentSub?.currentPeriodEnd || null,
          usage: {
            invoiceCount: quota?.invoices?.used ?? 0,
            maxInvoices: quota?.invoices?.limit ?? 10,
            quotationCount: quota?.quotations?.used ?? 0,
            maxQuotations: quota?.quotations?.limit ?? 10,
          },
        });
      }
    } catch {
      setMsg({ type: "error", text: "Gagal memuat status langganan." });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSubscription();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSubscription]);

  async function handleUpgrade() {
    setUpgrading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: "PREMIUM" }),
      });
      if (res.ok) {
        setMsg({
          type: "success",
          text: "Paket Premium berhasil diaktifkan / diperpanjang 30 hari!",
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("subscription-changed"));
        }
        await loadSubscription();
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg({
          type: "error",
          text: err.error || "Gagal memperbarui langganan.",
        });
      }
    } catch {
      setMsg({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setUpgrading(false);
    }
  }

  const isPremium = sub?.isPremium ?? false;
  const maxInvoices = sub?.usage?.maxInvoices ?? 10;
  const invoiceCount = sub?.usage?.invoiceCount ?? 0;
  const maxQuotations = sub?.usage?.maxQuotations ?? 10;
  const quotationCount = sub?.usage?.quotationCount ?? 0;

  const invoicePercent =
    maxInvoices > 0
      ? Math.min(100, Math.round((invoiceCount / maxInvoices) * 100))
      : 0;
  const quotationPercent =
    maxQuotations > 0
      ? Math.min(100, Math.round((quotationCount / maxQuotations) * 100))
      : 0;

  return (
    <AppShell
      title="Paket & Langganan"
      subtitle="Pantau status paket aktif, kuota pemakaian bulanan, dan kelola peningkatan paket."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
          <span>Kembali ke Pengaturan</span>
        </Link>

        {msg && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
              msg.type === "success"
                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-950/40 text-rose-400 border border-rose-500/30"
            }`}
          >
            {msg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-[#16171d] py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Memuat data paket & kuota langganan...</p>
          </div>
        ) : (
          <>
            {/* Status Card */}
            <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 sm:p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">Status Paket Saat Ini</h2>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isPremium
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {isPremium ? "Premium Unlimited" : "Free Plan"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {isPremium
                      ? "Nikmati pembuatan invoice dan penawaran tanpa batas serta fitur cetak PDF instan."
                      : "Akun Free memiliki batas kuota 10 dokumen invoice dan penawaran per bulan."}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isPremium ? "Perpanjang (+30 Hari)" : "Tingkatkan ke Premium"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Masa Aktif jika ada */}
              {sub?.activeUntil && (
                <div className="mt-4 flex items-center gap-2 text-xs text-blue-300">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>
                    Masa aktif Premium berlaku hingga:{" "}
                    <strong>{new Date(sub.activeUntil).toLocaleDateString("id-ID", { dateStyle: "long" })}</strong>
                  </span>
                </div>
              )}

              {/* Progress Kuota */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kuota Invoice */}
                <div className="p-4 rounded-xl bg-[#1c1d24] border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Kuota Invoice Bulan Ini
                    </span>
                    <span className="font-mono font-bold text-white">
                      {invoiceCount} / {isPremium ? "∞" : maxInvoices}
                    </span>
                  </div>
                  {!isPremium && (
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          invoicePercent >= 90
                            ? "bg-rose-500"
                            : invoicePercent >= 70
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${invoicePercent}%` }}
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    {isPremium
                      ? "Akses pembuatan invoice tanpa batasan kuota."
                      : `Tersisa ${Math.max(0, maxInvoices - invoiceCount)} invoice gratis bulan ini.`}
                  </p>
                </div>

                {/* Kuota Penawaran */}
                <div className="p-4 rounded-xl bg-[#1c1d24] border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300 flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-indigo-400" />
                      Kuota Penawaran Bulan Ini
                    </span>
                    <span className="font-mono font-bold text-white">
                      {quotationCount} / {isPremium ? "∞" : maxQuotations}
                    </span>
                  </div>
                  {!isPremium && (
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          quotationPercent >= 90
                            ? "bg-rose-500"
                            : quotationPercent >= 70
                            ? "bg-amber-500"
                            : "bg-indigo-500"
                        }`}
                        style={{ width: `${quotationPercent}%` }}
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    {isPremium
                      ? "Akses pembuatan penawaran tanpa batasan kuota."
                      : `Tersisa ${Math.max(0, maxQuotations - quotationCount)} penawaran gratis bulan ini.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Komparasi Fitur & Paket */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Paket Free */}
              <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mulai Gratis</span>
                    {!isPremium && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                        Paket Aktif Saat Ini
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">Starter Free</h3>
                  <div className="text-2xl font-bold text-white pt-2">
                    Rp 0 <span className="text-xs font-normal text-zinc-500">/ selamanya</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 mt-4 border-t border-zinc-800/80">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Maksimal 10 Invoice per bulan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Maksimal 10 Penawaran per bulan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Manajemen data pelanggan & produk</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Download PDF & ringkasan laporan</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-zinc-800/80">
                  <span className="block w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold bg-zinc-800/60 text-zinc-400 border border-zinc-700/50">
                    {!isPremium ? "Paket Anda Sedang Digunakan" : "Paket Dasar"}
                  </span>
                </div>
              </div>

              {/* Paket Premium */}
              <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-b from-blue-950/20 to-[#16171d] p-6 flex flex-col justify-between space-y-4 relative">
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500 text-white uppercase tracking-wider">
                    Paling Populer
                  </span>
                </div>

                <div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Bisnis Bertumbuh
                    </span>
                    <h3 className="text-lg font-bold text-white">Premium Unlimited</h3>
                    <div className="text-2xl font-bold text-white pt-2">
                      Rp 29.000 <span className="text-xs font-normal text-zinc-400">/ bulan</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 mt-4 border-t border-blue-500/20">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <strong className="text-white">Invoice Tanpa Batas (Unlimited)</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <strong className="text-white">Penawaran Tanpa Batas (Unlimited)</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Hapus batasan kuota bulanan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Dukungan prioritas & export laporan PDF</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-blue-500/20">
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Memproses Langganan...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isPremium ? "Perpanjang Masa Aktif (+30 Hari)" : "Aktifkan Premium Sekarang (Rp 29.000)"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* TABEL RINCIAN PERBANDINGAN FITUR LENGKAP */}
            <div className="rounded-2xl border border-zinc-800 bg-[#16171d] overflow-hidden shadow-sm">
              <div className="p-5 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-white">Rincian Perbandingan Fasilitas Paket</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Seluruh fitur dirancang untuk kemudahan dan kelancaran penagihan usaha Anda.
                </p>
              </div>

              <div className="divide-y divide-zinc-800/80 text-xs">
                <div className="grid grid-cols-3 bg-zinc-900/60 p-3 font-semibold uppercase tracking-wider text-zinc-400">
                  <div>Fitur Utama</div>
                  <div className="text-center">Starter Free</div>
                  <div className="text-center text-blue-400 font-bold">Premium Unlimited</div>
                </div>

                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="font-medium text-white">Kuota Dokumen Invoice Bulanan</span>
                  <span className="text-center text-zinc-400">10 dokumen</span>
                  <span className="text-center text-emerald-400 font-bold">Tanpa Batas (∞)</span>
                </div>

                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="font-medium text-white">Kuota Dokumen Penawaran Bulanan</span>
                  <span className="text-center text-zinc-400">10 dokumen</span>
                  <span className="text-center text-emerald-400 font-bold">Tanpa Batas (∞)</span>
                </div>

                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="font-medium text-white">Cetak & Unduh Dokumen PDF Resmi A4</span>
                  <span className="text-center text-emerald-400 font-bold">✓</span>
                  <span className="text-center text-emerald-400 font-bold">✓</span>
                </div>

                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="font-medium text-white">Konversi Penawaran ke Invoice 1-Klik</span>
                  <span className="text-center text-emerald-400 font-bold">✓</span>
                  <span className="text-center text-emerald-400 font-bold">✓</span>
                </div>

                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="font-medium text-white">Pencatatan Riwayat Pembayaran & Piutang</span>
                  <span className="text-center text-emerald-400 font-bold">✓</span>
                  <span className="text-center text-emerald-400 font-bold">✓</span>
                </div>

                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="font-medium text-white">Analisis Finansial & Unduh Laporan PDF</span>
                  <span className="text-center text-zinc-400">Dasar</span>
                  <span className="text-center text-blue-400 font-bold">Lengkap & Export PDF</span>
                </div>

                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="font-medium text-white">Prioritas Dukungan Teknis</span>
                  <span className="text-center text-zinc-500">Standar</span>
                  <span className="text-center text-blue-400 font-bold">Prioritas Cepat</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
