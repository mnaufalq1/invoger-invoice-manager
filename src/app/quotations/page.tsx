"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, AlertTriangle, ScrollText } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/app-shell";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type ConvertedInvoice = {
  id: string;
  documentNumber: string;
};

type Quotation = {
  id: string;
  documentNumber: string;
  type: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  issueDate: string;
  dueDate: string | null;
  total: number | string;
  customer: Customer;
  convertedTo: ConvertedInvoice | null;
  createdAt: string;
};

type QuotaInfo = {
  planCode: string;
  quotationLimit: number | null;
  usedThisMonth: number;
  isLimitReached: boolean;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-zinc-800 border-zinc-700 text-zinc-400" },
  SENT: { label: "Terkirim", className: "bg-blue-950/70 border-blue-500/30 text-blue-400" },
  ACCEPTED: { label: "Disetujui", className: "bg-emerald-950/70 border-emerald-500/30 text-emerald-400" },
  REJECTED: { label: "Ditolak", className: "bg-rose-950/70 border-rose-500/30 text-rose-400" },
  CANCELLED: { label: "Dibatalkan", className: "bg-zinc-900 border-zinc-800 text-zinc-500" },
};

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [, startTransition] = useTransition();

  const loadQuotations = useCallback(async (search = "", status = "ALL") => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status !== "ALL") params.append("status", status);

      const url = params.toString() ? `/api/quotations?${params.toString()}` : "/api/quotations";
      const res = await fetch(url);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Gagal mengambil data penawaran.");
      }

      const data = await res.json();
      setQuotations(data.quotations || []);
      if (data.quota) {
        setQuota(data.quota);
      }
    } catch {
      toast.error("Tidak dapat memuat daftar penawaran. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadQuotations();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadQuotations]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchTerm(val);
    startTransition(() => {
      loadQuotations(val, selectedStatus);
    });
  }

  function handleStatusFilter(status: string) {
    setSelectedStatus(status);
    loadQuotations(searchTerm, status);
  }

  const statuses = [
    { key: "ALL", label: "Semua" },
    { key: "DRAFT", label: "Draft" },
    { key: "SENT", label: "Terkirim" },
    { key: "ACCEPTED", label: "Disetujui" },
    { key: "REJECTED", label: "Ditolak" },
    { key: "CANCELLED", label: "Dibatalkan" },
  ];

  return (
    <AppShell
      title="Penawaran"
      subtitle="Buat estimasi biaya formal dan konversi langsung menjadi invoice saat disetujui."
      action={
        <Link
          href="/quotations/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:bg-purple-500"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Penawaran Baru</span>
        </Link>
      }
    >
      {/* Banner Peringatan Kuota Free Tercapai */}
      {quota?.isLimitReached && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">Batas Kuota Bulanan Paket Free Telah Tercapai</h4>
              <p className="mt-0.5 text-xs text-rose-300/90">
                Anda telah menggunakan seluruh kuota ({quota.usedThisMonth}/{quota.quotationLimit} penawaran) bulan ini. Upgrade ke Langganan Bulanan untuk membuat penawaran tanpa batas.
              </p>
            </div>
          </div>
          <Link
            href="/settings/subscription"
            className="self-start sm:self-auto shrink-0 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-rose-500 transition"
          >
            Upgrade Paket
          </Link>
        </div>
      )}

      {/* Info Kuota jika Free belum tercapai */}
      {quota && quota.planCode === "FREE" && !quota.isLimitReached && quota.quotationLimit !== null && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-[#16171d] px-4 py-3 text-xs text-zinc-400">
          <span>
            Kuota penawaran bulan ini: <strong className="text-white">{quota.usedThisMonth}</strong> / {quota.quotationLimit}
          </span>
          <span className="text-zinc-500">Sisa kuota: {Math.max(0, quota.quotationLimit - quota.usedThisMonth)}</span>
        </div>
      )}

      {/* Action Bar Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder="Cari nomor penawaran atau pelanggan..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-zinc-700/80 bg-[#16171d] px-4 py-2.5 text-sm text-white shadow-sm outline-none transition placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                loadQuotations("", selectedStatus);
              }}
              className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-white"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusFilter(tab.key)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              selectedStatus === tab.key
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "border border-zinc-800 bg-[#16171d] text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-12 text-center text-zinc-400">
          Memuat daftar penawaran...
        </div>
      ) : quotations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#16171d] p-12 text-center">
          <div className="flex justify-center mb-3">
            <ScrollText className="w-12 h-12 text-zinc-600" />
          </div>
          <h3 className="mt-2 text-lg font-bold text-white">
            {searchTerm || selectedStatus !== "ALL"
              ? "Tidak ada penawaran yang sesuai"
              : "Belum ada penawaran"}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {searchTerm || selectedStatus !== "ALL"
              ? "Silakan coba ubah filter atau kata kunci pencarian."
              : "Buat penawaran harga pertama Anda dan konversikan menjadi invoice dengan 1 klik ketika disetujui klien."}
          </p>
          {!searchTerm && selectedStatus === "ALL" && (
            <Link
              href="/quotations/new"
              className="mt-5 inline-flex items-center rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition"
            >
              + Buat Penawaran Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#16171d] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-[#13141a] text-xs font-semibold uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Nomor Penawaran</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Total Penawaran</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Konversi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {quotations.map((quo) => {
                  const statusInfo = STATUS_LABELS[quo.status] || {
                    label: quo.status,
                    className: "bg-zinc-800 border-zinc-700 text-zinc-400",
                  };

                  const formattedTotal = Number(quo.total).toLocaleString("id-ID");
                  const issueDateStr = new Date(quo.issueDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const dueDateStr = quo.dueDate
                    ? new Date(quo.dueDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : null;

                  return (
                    <tr
                      key={quo.id}
                      onClick={() => router.push(`/quotations/${quo.id}`)}
                      className="cursor-pointer hover:bg-zinc-800/50 transition group"
                      title="Klik untuk melihat detail penawaran"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-purple-400 group-hover:text-purple-300 group-hover:underline">
                          {quo.documentNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white group-hover:text-zinc-100">{quo.customer.name}</div>
                        {quo.customer.email && (
                          <div className="text-xs text-zinc-500">{quo.customer.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        <div>{issueDateStr}</div>
                        {dueDateStr && (
                          <div className="text-xs text-zinc-500">Berlaku s/d: {dueDateStr}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        Rp {formattedTotal}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {quo.convertedTo ? (
                          <Link
                            href={`/invoices/${quo.convertedTo.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
                          >
                            <span>Invoice #{quo.convertedTo.documentNumber}</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-zinc-500">Belum dikonversi</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
