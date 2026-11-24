"use client";

import { Suspense, useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Zap, Edit, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/app-shell";

type DocumentItem = {
  id: string;
  description: string;
  quantity: number | string;
  unit: string;
  unitPrice: number | string;
  lineTotal: number | string;
};

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type ConvertedInvoice = {
  id: string;
  documentNumber: string;
  status: string;
};

type Quotation = {
  id: string;
  documentNumber: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  issueDate: string;
  dueDate: string | null;
  currency: string;
  subtotal: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  total: number | string;
  notes: string | null;
  terms: string | null;
  customer: Customer;
  items: DocumentItem[];
  convertedTo: ConvertedInvoice | null;
};

type Profile = {
  businessName: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessAddress: string | null;
  taxNumber: string | null;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-zinc-800 border-zinc-700 text-zinc-400" },
  SENT: { label: "Terkirim", className: "bg-blue-950/70 border-blue-500/30 text-blue-400" },
  ACCEPTED: { label: "Disetujui", className: "bg-emerald-950/70 border-emerald-500/30 text-emerald-400" },
  REJECTED: { label: "Ditolak", className: "bg-rose-950/70 border-rose-500/30 text-rose-400" },
  CANCELLED: { label: "Dibatalkan", className: "bg-zinc-900 border-zinc-800 text-zinc-500" },
};

function QuotationDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [converting, setConverting] = useState(false);

  // Modal delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [quoRes, profRes] = await Promise.all([
        fetch(`/api/quotations/${id}`),
        fetch("/api/settings/profile"),
      ]);

      if (quoRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!quoRes.ok) {
        throw new Error("Gagal mengambil data penawaran.");
      }

      const quoData = await quoRes.json();
      setQuotation(quoData.quotation);

      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData.profile);
      }
    } catch {
      toast.error("Tidak dapat memuat rincian penawaran.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  async function handleStatusChange(newStatus: string) {
    if (!quotation) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui status.");
      }

      setQuotation(data.quotation);
      toast.success(`Status berhasil diubah menjadi ${STATUS_LABELS[newStatus]?.label || newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleConvertToInvoice() {
    if (converting) return;
    setConverting(true);

    try {
      const res = await fetch(`/api/quotations/${id}/convert`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengonversi penawaran ke invoice.");
      }

      toast.success("Penawaran berhasil dikonversi menjadi Invoice!");
      router.push(`/invoices/${data.invoice.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan saat konversi.");
      setConverting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus penawaran.");
      }

      toast.success("Penawaran berhasil dihapus.");
      router.push("/quotations");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus penawaran.");
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center text-zinc-500">
          Memuat penawaran...
        </div>
      </AppShell>
    );
  }

  if (!quotation) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <p className="text-zinc-400">Penawaran tidak ditemukan atau telah dihapus.</p>
          <Link
            href="/quotations"
            className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Kembali ke Daftar Penawaran
          </Link>
        </div>
      </AppShell>
    );
  }

  const statusInfo = STATUS_LABELS[quotation.status] || {
    label: quotation.status,
    className: "bg-zinc-800 text-zinc-400",
  };

  const formattedIssueDate = new Date(quotation.issueDate).toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const formattedDueDate = quotation.dueDate
    ? new Date(quotation.dueDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <AppShell
      title={`Penawaran #${quotation.documentNumber}`}
      subtitle={`Diterbitkan ${formattedIssueDate}`}
      action={
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
          >
            {statusInfo.label}
          </span>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Tombol Kembali di Kiri Atas */}
        <div>
          <Link
            href="/quotations"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition group"
          >
            <span className="flex h-7 items-center rounded-lg border border-zinc-700/80 bg-zinc-800/90 px-2.5 py-1 text-zinc-300 group-hover:border-zinc-500 group-hover:bg-zinc-700 group-hover:text-white transition">
              ← Kembali ke Penawaran
            </span>
          </Link>
        </div>

        {/* Paper Quotation Box */}
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 sm:p-10 shadow-xl">
          {/* Header penawaran: Pengirim vs Penerima */}
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between border-b border-zinc-800 pb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Pemberi Penawaran
              </span>
              <h2 className="mt-1 text-xl font-bold text-white">
                {profile?.businessName || "Bisnis Saya"}
              </h2>
              {profile?.businessAddress && (
                <p className="mt-1 text-xs text-zinc-400 whitespace-pre-line">
                  {profile.businessAddress}
                </p>
              )}
              {profile?.businessEmail && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  Email: {profile.businessEmail}
                </p>
              )}
              {profile?.businessPhone && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  Telp: {profile.businessPhone}
                </p>
              )}
              {profile?.taxNumber && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  NPWP: {profile.taxNumber}
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Ditujukan Kepada
              </span>
              <h3 className="mt-1 text-lg font-bold text-white">
                {quotation.customer.name}
              </h3>
              {invoiceAddress(quotation.customer.address)}
              {quotation.customer.email && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  Email: {quotation.customer.email}
                </p>
              )}
              {quotation.customer.phone && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  Telp: {quotation.customer.phone}
                </p>
              )}
            </div>
          </div>

          {/* Info Tanggal & Nomor */}
          <div className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-4 border-b border-zinc-800 text-xs">
            <div>
              <span className="font-medium text-zinc-500">Nomor Penawaran</span>
              <p className="mt-1 font-bold text-white text-sm">
                {quotation.documentNumber}
              </p>
            </div>
            <div>
              <span className="font-medium text-zinc-500">Tanggal Terbit</span>
              <p className="mt-1 font-semibold text-zinc-200">
                {formattedIssueDate}
              </p>
            </div>
            <div>
              <span className="font-medium text-zinc-500">Masa Berlaku</span>
              <p className="mt-1 font-semibold text-zinc-200">
                {formattedDueDate || "-"}
              </p>
            </div>
            <div>
              <span className="font-medium text-zinc-500">Status Penawaran</span>
              <div className="mt-1">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.className}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Tabel Item Transaksi */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-3 font-semibold">Deskripsi</th>
                  <th className="py-3 text-right font-semibold">Qty</th>
                  <th className="py-3 text-right font-semibold">Harga Satuan</th>
                  <th className="py-3 text-right font-semibold">Estimasi Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {quotation.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3.5">
                      <div className="font-medium text-white">{item.description}</div>
                      <div className="text-[11px] text-zinc-500">{item.unit}</div>
                    </td>
                    <td className="py-3.5 text-right font-mono">
                      {Number(item.quantity).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 text-right font-mono">
                      Rp {Number(item.unitPrice).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 text-right font-mono font-semibold text-white">
                      Rp {Number(item.lineTotal).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Totals */}
          <div className="border-t border-zinc-800 pt-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
              {/* Catatan / Terms */}
              <div className="flex-1 space-y-3 text-xs text-zinc-400">
                {quotation.notes && (
                  <div>
                    <span className="font-semibold text-zinc-300">Catatan:</span>
                    <p className="mt-0.5 whitespace-pre-line">{quotation.notes}</p>
                  </div>
                )}
                {quotation.terms && (
                  <div>
                    <span className="font-semibold text-zinc-300">
                      Syarat & Ketentuan:
                    </span>
                    <p className="mt-0.5 whitespace-pre-line">{quotation.terms}</p>
                  </div>
                )}
              </div>

              {/* Rincian Angka */}
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">
                    Rp {Number(quotation.subtotal).toLocaleString("id-ID")}
                  </span>
                </div>
                {Number(quotation.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Diskon</span>
                    <span className="font-mono">
                      - Rp {Number(quotation.discountAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                {Number(quotation.taxAmount) > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Pajak</span>
                    <span className="font-mono text-white">
                      + Rp {Number(quotation.taxAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="border-t border-zinc-800 pt-3 flex justify-between text-sm sm:text-base font-bold text-white">
                  <span>Total Estimasi</span>
                  <span className="font-mono text-purple-400 text-lg">
                    Rp {Number(quotation.total).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bilah Aksi Kanan Bawah */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Link
            href={`/quotations/${id}/print`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition shadow-sm"
            title="Buka pratinjau cetak dan simpan PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </Link>

          {quotation.convertedTo ? (
            <Link
              href={`/invoices/${quotation.convertedTo.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/60 transition shadow-sm"
            >
              <span>Lihat Invoice #{quotation.convertedTo.documentNumber}</span>
            </Link>
          ) : (
            <button
              onClick={handleConvertToInvoice}
              disabled={converting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-purple-600/20 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{converting ? "Mengonversi..." : "Konversi ke Invoice"}</span>
            </button>
          )}

          <Link
            href={`/quotations/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition shadow-sm"
          >
            <Edit className="w-4 h-4 text-zinc-400" />
            <span>Edit</span>
          </Link>

          {quotation.status !== "ACCEPTED" && !quotation.convertedTo && (
            <button
              onClick={() => handleStatusChange("ACCEPTED")}
              disabled={updating}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Tandai Disetujui</span>
            </button>
          )}

          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-900/60 transition shadow-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Hapus</span>
          </button>
        </div>

        {/* Modal Konfirmasi Hapus */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-2xl">
              <h3 className="text-base font-bold text-white">Hapus Penawaran?</h3>
              <p className="mt-2 text-xs text-zinc-400">
                Apakah Anda yakin ingin menghapus penawaran{" "}
                <span className="font-bold text-white">{quotation.documentNumber}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function invoiceAddress(address: string | null) {
  if (!address) return null;
  return (
    <p className="mt-1 text-xs text-zinc-400 whitespace-pre-line">
      {address}
    </p>
  );
}

export default function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0c0d12] text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            <span>Memuat rincian penawaran...</span>
          </div>
        </div>
      }
    >
      <QuotationDetailContent params={params} />
    </Suspense>
  );
}
