"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/app-shell";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type Invoice = {
  id: string;
  documentNumber: string;
  type: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "PAID" | "OVERDUE" | "CANCELLED";
  issueDate: string;
  dueDate: string | null;
  total: number | string;
  customer: Customer;
  createdAt: string;
};

type QuotaInfo = {
  planCode: string;
  invoiceLimit: number | null;
  usedThisMonth: number;
  isLimitReached: boolean;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-zinc-800 border-zinc-700 text-zinc-400" },
  SENT: { label: "Terkirim", className: "bg-blue-950/70 border-blue-500/30 text-blue-400" },
  ACCEPTED: { label: "Disetujui", className: "bg-teal-950/70 border-teal-500/30 text-teal-400" },
  REJECTED: { label: "Ditolak", className: "bg-rose-950/70 border-rose-500/30 text-rose-400" },
  PAID: { label: "Lunas", className: "bg-emerald-950/70 border-emerald-500/30 text-emerald-400" },
  OVERDUE: { label: "Jatuh Tempo", className: "bg-amber-950/70 border-amber-500/30 text-amber-400" },
  CANCELLED: { label: "Dibatalkan", className: "bg-zinc-900 border-zinc-800 text-zinc-500" },
};

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [, startTransition] = useTransition();

  const loadInvoices = useCallback(async (search = "", status = "ALL") => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status !== "ALL") params.append("status", status);

      const url = params.toString() ? `/api/invoices?${params.toString()}` : "/api/invoices";
      const res = await fetch(url);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Gagal mengambil data invoice.");
      }

      const data = await res.json();
      setInvoices(data.invoices || []);
      if (data.quota) {
        setQuota(data.quota);
      }
    } catch {
      toast.error("Tidak dapat memuat daftar invoice. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadInvoices();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadInvoices]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchTerm(val);
    startTransition(() => {
      loadInvoices(val, selectedStatus);
    });
  }

  function handleStatusFilter(status: string) {
    setSelectedStatus(status);
    loadInvoices(searchTerm, status);
  }

  const statuses = [
    { key: "ALL", label: "Semua" },
    { key: "DRAFT", label: "Draft" },
    { key: "SENT", label: "Terkirim" },
    { key: "PAID", label: "Lunas" },
    { key: "OVERDUE", label: "Jatuh Tempo" },
    { key: "CANCELLED", label: "Dibatalkan" },
  ];

  return (
    <AppShell
      title="Invoice"
      subtitle="Kelola seluruh tagihan dan status pembayaran pelanggan."
      action={
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Invoice Baru</span>
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
                Anda telah menggunakan seluruh kuota ({quota.usedThisMonth}/{quota.invoiceLimit} invoice) bulan ini. Upgrade ke Langganan Bulanan untuk membuat invoice tanpa batas.
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
      {quota && quota.planCode === "FREE" && !quota.isLimitReached && quota.invoiceLimit !== null && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-[#16171d] px-4 py-3 text-xs text-zinc-400">
          <span>
            Kuota invoice bulan ini: <strong className="text-white">{quota.usedThisMonth}</strong> / {quota.invoiceLimit}
          </span>
          <span className="text-zinc-500">Sisa kuota: {Math.max(0, quota.invoiceLimit - quota.usedThisMonth)}</span>
        </div>
      )}

      {/* Action Bar Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder="Cari nomor invoice atau pelanggan..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-zinc-700/80 bg-[#16171d] px-4 py-2.5 text-sm text-white shadow-sm outline-none transition placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                loadInvoices("", selectedStatus);
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
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
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
          Memuat daftar invoice...
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#16171d] p-12 text-center">
          <div className="flex justify-center mb-3">
            <FileText className="w-12 h-12 text-zinc-600" />
          </div>
          <h3 className="mt-2 text-lg font-bold text-white">
            {searchTerm || selectedStatus !== "ALL"
              ? "Tidak ada invoice yang sesuai"
              : "Belum ada invoice"}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {searchTerm || selectedStatus !== "ALL"
              ? "Silakan coba ubah filter atau kata kunci pencarian."
              : "Buat invoice pertama Anda untuk mulai menagih pelanggan secara profesional."}
          </p>
          {!searchTerm && selectedStatus === "ALL" && (
            <Link
              href="/invoices/new"
              className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
            >
              + Buat Invoice Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#16171d] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-[#13141a] text-xs font-semibold uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Nomor Invoice</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Total Tagihan</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {invoices.map((inv) => {
                  const statusInfo = STATUS_LABELS[inv.status] || {
                    label: inv.status,
                    className: "bg-zinc-800 border-zinc-700 text-zinc-400",
                  };

                  const formattedTotal = Number(inv.total).toLocaleString("id-ID");
                  const issueDateStr = new Date(inv.issueDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const dueDateStr = inv.dueDate
                    ? new Date(inv.dueDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : null;

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="cursor-pointer hover:bg-zinc-800/50 transition group"
                      title="Klik untuk melihat detail invoice"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-400 group-hover:text-blue-300 group-hover:underline">
                          {inv.documentNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white group-hover:text-zinc-100">{inv.customer.name}</div>
                        {inv.customer.email && (
                          <div className="text-xs text-zinc-500">{inv.customer.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        <div>{issueDateStr}</div>
                        {dueDateStr && (
                          <div className="text-xs text-zinc-500">Jatuh tempo: {dueDateStr}</div>
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
