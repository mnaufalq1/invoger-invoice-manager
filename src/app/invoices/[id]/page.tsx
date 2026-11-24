"use client";

import { Suspense, useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Printer, Edit, Check, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/app-shell";
import { ShadcnNumberInput } from "@/components/ui/shadcn-number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type PaymentRecord = {
  id: string;
  amount: number | string;
  paymentDate: string;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
};

type Invoice = {
  id: string;
  documentNumber: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "PAID" | "OVERDUE" | "CANCELLED";
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
  payments?: PaymentRecord[];
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
  ACCEPTED: { label: "Disetujui", className: "bg-teal-950/70 border-teal-500/30 text-teal-400" },
  REJECTED: { label: "Ditolak", className: "bg-rose-950/70 border-rose-500/30 text-rose-400" },
  PAID: { label: "Lunas", className: "bg-emerald-950/70 border-emerald-500/30 text-emerald-400" },
  OVERDUE: { label: "Jatuh Tempo", className: "bg-amber-950/70 border-amber-500/30 text-amber-400" },
  CANCELLED: { label: "Dibatalkan", className: "bg-zinc-900 border-zinc-800 text-zinc-500" },
};

const PAYMENT_METHODS: Record<string, string> = {
  BANK_TRANSFER: "Transfer Bank",
  CASH: "Tunai / Cash",
  QRIS: "QRIS",
  CREDIT_CARD: "Kartu Kredit",
  OTHER: "Lainnya",
};

function InvoiceDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Modal delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal Catat Pembayaran
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [savingPayment, setSavingPayment] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [invRes, profRes] = await Promise.all([
        fetch(`/api/invoices/${id}`),
        fetch("/api/settings/profile"),
      ]);

      if (invRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!invRes.ok) {
        throw new Error("Gagal mengambil data invoice.");
      }

      const invData = await invRes.json();
      setInvoice(invData.invoice);

      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData.profile);
      }
    } catch {
      toast.error("Tidak dapat memuat rincian invoice.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
      setPaymentDate(new Date().toISOString().split("T")[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const totalPaid = (invoice?.payments || []).reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const invoiceTotal = Number(invoice?.total || 0);
  const balanceDue = Math.max(0, Math.round((invoiceTotal - totalPaid) * 100) / 100);

  function handleOpenPayment() {
    setPaymentAmount(balanceDue > 0 ? balanceDue : invoiceTotal);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentReference("");
    setPaymentNotes("");
    setOpenPaymentModal(true);
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (paymentAmount <= 0) {
      toast.error("Nominal pembayaran harus lebih dari 0.");
      return;
    }

    if (paymentAmount > balanceDue + 0.01) {
      toast.error(`Nominal tidak boleh melebihi sisa tagihan (Rp ${balanceDue.toLocaleString("id-ID")}).`);
      return;
    }

    setSavingPayment(true);

    try {
      const res = await fetch(`/api/invoices/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentDate,
          paymentMethod,
          reference: paymentReference.trim() || undefined,
          notes: paymentNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mencatat pembayaran.");
      }

      toast.success(data.message || "Pembayaran berhasil dicatat.");
      setOpenPaymentModal(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!invoice) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui status.");
      }

      setInvoice(data.invoice);
      toast.success(`Status berhasil diubah menjadi ${STATUS_LABELS[newStatus]?.label || newStatus}`);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui status.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus invoice.");
      }

      toast.success("Invoice berhasil dihapus.");
      router.push("/invoices");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus invoice.");
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center text-zinc-500">
          Memuat invoice...
        </div>
      </AppShell>
    );
  }

  if (!invoice) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <p className="text-zinc-400">Invoice tidak ditemukan atau telah dihapus.</p>
          <Link
            href="/invoices"
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Kembali ke Daftar Invoice
          </Link>
        </div>
      </AppShell>
    );
  }

  const statusInfo = STATUS_LABELS[invoice.status] || {
    label: invoice.status,
    className: "bg-zinc-800 text-zinc-400",
  };

  const formattedIssueDate = new Date(invoice.issueDate).toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const formattedDueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <AppShell
      title={`Invoice #${invoice.documentNumber}`}
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
            href="/invoices"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition group"
          >
            <span className="flex h-7 items-center rounded-lg border border-zinc-700/80 bg-zinc-800/90 px-2.5 py-1 text-zinc-300 group-hover:border-zinc-500 group-hover:bg-zinc-700 group-hover:text-white transition">
              ← Kembali ke Invoice
            </span>
          </Link>
        </div>

        {/* Paper Invoice Box */}
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 sm:p-10 shadow-xl">
          {/* Header invoice: Pengirim vs Penerima */}
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between border-b border-zinc-800 pb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Penerbit Tagihan
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
                Ditagihkan Kepada
              </span>
              <h3 className="mt-1 text-lg font-bold text-white">
                {invoice.customer.name}
              </h3>
              {invoice.customer.address && (
                <p className="mt-1 text-xs text-zinc-400 whitespace-pre-line">
                  {invoice.customer.address}
                </p>
              )}
              {invoice.customer.email && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  Email: {invoice.customer.email}
                </p>
              )}
              {invoice.customer.phone && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  Telp: {invoice.customer.phone}
                </p>
              )}
            </div>
          </div>

          {/* Info Tanggal & Nomor */}
          <div className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-4 border-b border-zinc-800 text-xs">
            <div>
              <span className="font-medium text-zinc-500">Nomor Invoice</span>
              <p className="mt-1 font-bold text-white text-sm">
                {invoice.documentNumber}
              </p>
            </div>
            <div>
              <span className="font-medium text-zinc-500">Tanggal Terbit</span>
              <p className="mt-1 font-semibold text-zinc-200">
                {formattedIssueDate}
              </p>
            </div>
            <div>
              <span className="font-medium text-zinc-500">Jatuh Tempo</span>
              <p className="mt-1 font-semibold text-zinc-200">
                {formattedDueDate || "-"}
              </p>
            </div>
            <div>
              <span className="font-medium text-zinc-500">Status Tagihan</span>
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
                  <th className="py-3 text-right font-semibold">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {invoice.items.map((item) => (
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

          {/* Summary Totals & Sisa Tagihan */}
          <div className="border-t border-zinc-800 pt-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
              {/* Catatan / Terms */}
              <div className="flex-1 space-y-3 text-xs text-zinc-400">
                {invoice.notes && (
                  <div>
                    <span className="font-semibold text-zinc-300">Catatan:</span>
                    <p className="mt-0.5 whitespace-pre-line">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <span className="font-semibold text-zinc-300">
                      Syarat & Ketentuan:
                    </span>
                    <p className="mt-0.5 whitespace-pre-line">{invoice.terms}</p>
                  </div>
                )}
              </div>

              {/* Rincian Angka & Pembayaran */}
              <div className="w-full sm:w-80 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">
                    Rp {Number(invoice.subtotal).toLocaleString("id-ID")}
                  </span>
                </div>
                {Number(invoice.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Diskon</span>
                    <span className="font-mono">
                      - Rp {Number(invoice.discountAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                {Number(invoice.taxAmount) > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Pajak</span>
                    <span className="font-mono text-white">
                      + Rp {Number(invoice.taxAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="border-t border-zinc-800 pt-2.5 flex justify-between text-sm font-bold text-white">
                  <span>Total Tagihan</span>
                  <span className="font-mono text-blue-400 text-base">
                    Rp {Number(invoice.total).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Info Akumulasi Pembayaran Riil */}
                {totalPaid > 0 && (
                  <div className="flex justify-between text-emerald-400 pt-1 border-t border-zinc-800/80">
                    <span>Telah Dibayar</span>
                    <span className="font-mono font-bold">
                      - Rp {totalPaid.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                <div className="border-t border-zinc-700/80 pt-2 flex justify-between items-center text-sm font-bold">
                  <span className="text-zinc-300">Sisa Tagihan:</span>
                  <span
                    className={`font-mono text-base ${
                      balanceDue <= 0 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    Rp {balanceDue.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Riwayat Catatan Pembayaran */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mt-8 border-t border-zinc-800 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Riwayat Pembayaran Diterima
                </h3>
                <span className="text-xs text-zinc-400">
                  {invoice.payments.length} transaksi pembayaran
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#121318]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Tanggal</th>
                      <th className="px-4 py-2.5">Metode</th>
                      <th className="px-4 py-2.5">Referensi / Catatan</th>
                      <th className="px-4 py-2.5 text-right">Jumlah Dibayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-200 font-mono">
                    {invoice.payments.map((p) => {
                      const pDateStr = new Date(p.paymentDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <tr key={p.id}>
                          <td className="px-4 py-2.5 text-zinc-300">{pDateStr}</td>
                          <td className="px-4 py-2.5 font-sans">
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
                              {PAYMENT_METHODS[p.paymentMethod] || p.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-sans text-zinc-400">
                            {p.reference && <span className="font-mono text-white mr-2">#{p.reference}</span>}
                            {p.notes || "-"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-emerald-400">
                            Rp {Number(p.amount).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Bilah Aksi Kanan Bawah */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {/* Tombol Catat Pembayaran */}
          {balanceDue > 0 && invoice.status !== "CANCELLED" && (
            <button
              onClick={handleOpenPayment}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Catat Pembayaran</span>
            </button>
          )}

          <Link
            href={`/invoices/${id}/print`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition shadow-sm"
            title="Buka pratinjau cetak dan simpan PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </Link>

          <Link
            href={`/invoices/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition shadow-sm"
          >
            <Edit className="w-4 h-4 text-zinc-400" />
            <span>Edit</span>
          </Link>

          {invoice.status !== "PAID" && (
            <button
              onClick={() => handleStatusChange("PAID")}
              disabled={updating}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Tandai Lunas</span>
            </button>
          )}

          {invoice.status !== "SENT" && (
            <button
              onClick={() => handleStatusChange("SENT")}
              disabled={updating}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Tandai Terkirim</span>
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

        {/* Modal Catat Pembayaran */}
        {openPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-white">Catat Pembayaran</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Invoice #{invoice.documentNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenPaymentModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs">
                  <span className="text-amber-300">Sisa Tagihan Saat Ini:</span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    Rp {balanceDue.toLocaleString("id-ID")}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Jumlah Nominal Diterima (Rp) <span className="text-rose-400">*</span>
                  </label>
                  <ShadcnNumberInput
                    value={paymentAmount}
                    onChange={setPaymentAmount}
                    max={balanceDue}
                    step={1000}
                    align="right"
                  />
                  {paymentAmount === balanceDue && (
                    <p className="mt-1 text-[11px] text-emerald-400">
                      ✓ Pembayaran penuh (akan langsung melunasi invoice).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Tanggal Pembayaran <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-[#121318] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Metode Pembayaran
                  </label>
                  <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val)}>
                    <SelectTrigger className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 px-3 py-2 text-sm text-white h-10 outline-none focus:border-blue-500">
                      <SelectValue placeholder="Pilih Metode Pembayaran" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-[#1e2029] text-white">
                      <SelectItem value="BANK_TRANSFER" className="cursor-pointer">Transfer Bank</SelectItem>
                      <SelectItem value="CASH" className="cursor-pointer">Tunai / Cash</SelectItem>
                      <SelectItem value="QRIS" className="cursor-pointer">QRIS</SelectItem>
                      <SelectItem value="CREDIT_CARD" className="cursor-pointer">Kartu Kredit</SelectItem>
                      <SelectItem value="OTHER" className="cursor-pointer">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Nomor Referensi / Bukti Transfer (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: BCA-TRX-94829"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#121318] px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Catatan Pembayaran (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Diterima oleh tim keuangan via rekening BCA"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#121318] px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenPaymentModal(false)}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingPayment}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                  >
                    {savingPayment ? "Menyimpan..." : "Simpan Pembayaran"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-2xl">
              <h3 className="text-base font-bold text-white">Hapus Invoice?</h3>
              <p className="mt-2 text-xs text-zinc-400">
                Apakah Anda yakin ingin menghapus invoice{" "}
                <span className="font-bold text-white">{invoice.documentNumber}</span>? Tindakan ini tidak dapat dibatalkan.
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

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0c0d12] text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span>Memuat rincian invoice...</span>
          </div>
        </div>
      }
    >
      <InvoiceDetailContent params={params} />
    </Suspense>
  );
}
