"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  CreditCard,
  FileCheck,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/app-shell";
import { exportToPdf } from "@/lib/pdf";

type ReportData = {
  period: string;
  summary: {
    totalRevenue: number;
    totalGrossInvoiced: number;
    totalOutstanding: number;
    totalOverdue: number;
    totalInvoices: number;
    totalQuotations: number;
    acceptedQuotations: number;
    totalQuotationValue: number;
    conversionRate: number;
  };
  statusDistribution: Record<string, { count: number; total: number }>;
  topCustomers: Array<{
    id: string;
    name: string;
    totalInvoiced: number;
    totalPaid: number;
    invoiceCount: number;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference: string | null;
    invoiceNumber: string;
    customerName: string;
  }>;
};

const PERIOD_LABELS: Record<string, string> = {
  this_month: "Bulan Ini",
  last_3_months: "3 Bulan Terakhir",
  this_year: "Tahun Ini",
  all: "Semua Waktu",
};

const STATUS_LABELS: Record<string, { label: string; color: string; barColor: string }> = {
  PAID: { label: "Lunas", color: "text-emerald-400", barColor: "bg-emerald-500" },
  SENT: { label: "Terkirim", color: "text-blue-400", barColor: "bg-blue-500" },
  DRAFT: { label: "Draft", color: "text-zinc-400", barColor: "bg-zinc-600" },
  OVERDUE: { label: "Jatuh Tempo", color: "text-amber-400", barColor: "bg-amber-500" },
  CANCELLED: { label: "Dibatalkan", color: "text-zinc-500", barColor: "bg-zinc-800" },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<string>("this_month");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const loadReport = useCallback(
    async (selectedPeriod = period) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?period=${selectedPeriod}`);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Gagal mengambil data laporan.");
        const result = await res.json();
        setData(result);
      } catch {
        toast.error("Gagal memuat laporan finansial.");
      } finally {
        setLoading(false);
      }
    },
    [period, router]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadReport();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadReport]);

  function handlePeriodChange(newPeriod: string) {
    setPeriod(newPeriod);
    void loadReport(newPeriod);
  }

  async function handleDownloadPdf() {
    const el = document.getElementById("printable-report");
    if (!el) return;
    setIsExporting(true);
    try {
      await exportToPdf(el, `Laporan-Bisnis-${period}`);
      toast.success("Laporan berhasil diunduh dalam format PDF.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh laporan PDF.");
    } finally {
      setIsExporting(false);
    }
  }

  const s = data?.summary;
  const totalInvoices = s?.totalInvoices || 0;

  return (
    <AppShell
      title="Laporan Bisnis"
      subtitle="Analisis performa omzet kas masuk, tagihan piutang, dan efektivitas penawaran bisnis Anda."
      action={
        <div className="flex items-center gap-2.5 print:hidden">
          {/* Filter Periode */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-[#16171d] p-1">
            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePeriodChange(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  period === key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tombol Cetak / Simpan PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 disabled:opacity-50 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors shadow-sm cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Menyimpan PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Unduh PDF</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <div id="printable-report" className="space-y-6">
        {/* KPI CARDS */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Omzet Terbayar */}
            <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Omzet Kas Masuk
                </span>
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white mt-3">
                {formatRupiah(s?.totalRevenue || 0)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Dari {formatRupiah(s?.totalGrossInvoiced || 0)} total invoice
              </p>
            </div>

            {/* Card 2: Piutang / Menunggu Pembayaran */}
            <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Menunggu Pelunasan
                </span>
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-amber-400 mt-3">
                {formatRupiah(s?.totalOutstanding || 0)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Sisa saldo tagihan aktif
              </p>
            </div>

            {/* Card 3: Tagihan Jatuh Tempo */}
            <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Jatuh Tempo (Overdue)
                </span>
                <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-rose-400 mt-3">
                {formatRupiah(s?.totalOverdue || 0)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Perlu tindak lanjut penagihan
              </p>
            </div>

            {/* Card 4: Konversi Quotation */}
            <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Konversi Penawaran
                </span>
                <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-blue-400 mt-3">
                {s?.conversionRate ?? 0}%
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {s?.acceptedQuotations ?? 0} dari {s?.totalQuotations ?? 0} penawaran disetujui
              </p>
            </div>
          </div>
        )}

        {/* SECTION 2: BREAKDOWN & TOP CUSTOMERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribusi Status Invoice */}
          <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-400" />
              Rekapitulasi Status Invoice ({PERIOD_LABELS[period]})
            </h3>

            {loading ? (
              <div className="space-y-4 py-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 bg-zinc-900 rounded" />
                ))}
              </div>
            ) : totalInvoices === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Belum ada data invoice pada periode ini.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(STATUS_LABELS).map(([key, config]) => {
                  const stat = data?.statusDistribution?.[key] || { count: 0, total: 0 };
                  const percentage = totalInvoices > 0 ? Math.round((stat.count / totalInvoices) * 100) : 0;

                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${config.color}`}>
                          {config.label} ({stat.count})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-200 font-bold">
                            {formatRupiah(stat.total)}
                          </span>
                          <span className="text-zinc-500 text-[11px] w-8 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${config.barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top 5 Pelanggan Teratas */}
          <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-indigo-400" />
              Pelanggan Teratas Berdasarkan Omzet
            </h3>

            {loading ? (
              <div className="space-y-3 py-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-zinc-900 rounded-xl" />
                ))}
              </div>
            ) : (data?.topCustomers || []).length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Belum ada transaksi pelanggan pada periode ini.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {data?.topCustomers.map((c, idx) => (
                  <div key={c.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{c.name}</p>
                        <p className="text-[11px] text-zinc-500">
                          {c.invoiceCount} transaksi tagihan
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">
                        {formatRupiah(c.totalPaid)}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Total {formatRupiah(c.totalInvoiced)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: RIWAYAT PEMBAYARAN TERBARU */}
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Riwayat Penerimaan Pembayaran Terbaru
            </h3>
            <span className="text-xs text-zinc-500">
              Maks. 10 transaksi terakhir
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-zinc-500 text-xs">Memuat data pembayaran...</div>
          ) : (data?.recentPayments || []).length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              Belum ada catatan pembayaran yang diterima pada periode ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="pb-3 font-semibold">Tanggal</th>
                    <th className="pb-3 font-semibold">No. Invoice</th>
                    <th className="pb-3 font-semibold">Pelanggan</th>
                    <th className="pb-3 font-semibold">Metode</th>
                    <th className="pb-3 font-semibold text-right">Jumlah Dibayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {data?.recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/40">
                      <td className="py-3 text-zinc-400">
                        {new Date(p.paymentDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 font-mono font-medium text-blue-400">
                        {p.invoiceNumber}
                      </td>
                      <td className="py-3 font-medium text-white">{p.customerName}</td>
                      <td className="py-3 text-zinc-400">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px]">
                          {p.paymentMethod.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-400">
                        {formatRupiah(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
