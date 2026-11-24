"use client";

import { Suspense, useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { exportToPdf } from "@/lib/pdf";

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
};

type Profile = {
  businessName: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessAddress: string | null;
  taxNumber: string | null;
};

const STATUS_TEXT: Record<string, { label: string; borderClass: string; textClass: string }> = {
  DRAFT: { label: "DRAFT", borderClass: "border-zinc-400", textClass: "text-zinc-600" },
  SENT: { label: "TERKIRIM", borderClass: "border-blue-500", textClass: "text-blue-700" },
  ACCEPTED: { label: "DISETUJUI", borderClass: "border-teal-500", textClass: "text-teal-700" },
  REJECTED: { label: "DITOLAK", borderClass: "border-rose-500", textClass: "text-rose-700" },
  PAID: { label: "LUNAS", borderClass: "border-emerald-600", textClass: "text-emerald-700" },
  OVERDUE: { label: "JATUH TEMPO", borderClass: "border-amber-600", textClass: "text-amber-700" },
  CANCELLED: { label: "DIBATALKAN", borderClass: "border-zinc-400", textClass: "text-zinc-500" },
};

function InvoicePrintContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [invRes, profRes] = await Promise.all([
          fetch(`/api/invoices/${id}`),
          fetch("/api/settings/profile"),
        ]);

        if (invRes.status === 401) {
          router.push("/login");
          return;
        }

        if (!invRes.ok) throw new Error("Gagal mengambil data invoice.");

        const invData = await invRes.json();
        setInvoice(invData.invoice);

        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData.profile);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  async function handleDownloadPdf() {
    const el = document.getElementById("printable-invoice");
    if (!el || !invoice) return;
    setIsExporting(true);
    try {
      await exportToPdf(el, `Invoice-${invoice.documentNumber}`);
    } catch (err) {
      console.error("Gagal export PDF:", err);
    } finally {
      setIsExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-zinc-600 font-sans">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Menyiapkan dokumen cetak...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-4 text-center font-sans">
        <p className="text-rose-600 font-semibold">{error || "Invoice tidak ditemukan."}</p>
        <Link
          href={`/invoices/${id}`}
          className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          ← Kembali ke Detail Invoice
        </Link>
      </div>
    );
  }

  const statusBadge = STATUS_TEXT[invoice.status] || {
    label: invoice.status,
    borderClass: "border-zinc-400",
    textClass: "text-zinc-600",
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
    <div className="min-h-screen bg-zinc-200/70 font-sans text-zinc-900 antialiased print:bg-white print:p-0">
      {/* Top Action Bar (Hanya tampil di layar browser, tersembunyi saat dicetak) */}
      <header className="no-print sticky top-0 z-50 border-b border-zinc-300 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/invoices/${id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Detail</span>
            </Link>
            <span className="hidden sm:inline text-xs font-medium text-zinc-500">
              Pratinjau Dokumen Resmi #{invoice.documentNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50 transition cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Area Kertas Dokumen (A4 Standard) */}
      <main className="p-4 sm:p-8 print:p-0 flex justify-center">
        <div id="printable-invoice" className="print-container w-full max-w-[210mm] bg-white p-8 sm:p-12 shadow-xl print:shadow-none print:w-full border border-zinc-200 print:border-none min-h-[297mm] flex flex-col justify-between">
          <div>
            {/* Header / KOP Dokumen */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b-2 border-zinc-900 pb-6 gap-6">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 uppercase">
                  {profile?.businessName || "INVOICE"}
                </h1>
                <div className="mt-2 text-xs leading-relaxed text-zinc-600 space-y-0.5">
                  {profile?.businessAddress && (
                    <p className="whitespace-pre-line max-w-xs">{profile.businessAddress}</p>
                  )}
                  {profile?.businessEmail && <p>Email: {profile.businessEmail}</p>}
                  {profile?.businessPhone && <p>Telp / WA: {profile.businessPhone}</p>}
                  {profile?.taxNumber && <p>NPWP: {profile.taxNumber}</p>}
                </div>
              </div>

              <div className="sm:text-right">
                <span className="inline-block text-3xl font-black tracking-wider text-blue-900">
                  INVOICE
                </span>
                <p className="mt-1 text-sm font-bold font-mono text-zinc-800">
                  #{invoice.documentNumber}
                </p>

                {/* Stempel Cap Status */}
                <div className="mt-3 sm:flex sm:justify-end">
                  <span
                    className={`inline-block border-2 px-3 py-1 text-xs font-black tracking-widest uppercase rounded ${statusBadge.borderClass} ${statusBadge.textClass}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Pelanggan & Tanggal Tagihan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-200 text-xs">
              <div>
                <span className="font-bold uppercase tracking-wider text-zinc-500">
                  Ditagihkan Kepada:
                </span>
                <h2 className="mt-1.5 text-base font-bold text-zinc-900">
                  {invoice.customer.name}
                </h2>
                <div className="mt-1 text-zinc-600 space-y-0.5">
                  {invoice.customer.address && (
                    <p className="whitespace-pre-line max-w-xs">{invoice.customer.address}</p>
                  )}
                  {invoice.customer.email && <p>Email: {invoice.customer.email}</p>}
                  {invoice.customer.phone && <p>Telepon: {invoice.customer.phone}</p>}
                </div>
              </div>

              <div className="sm:text-right space-y-2">
                <div>
                  <span className="font-semibold text-zinc-500">Tanggal Penerbitan:</span>
                  <p className="font-bold text-zinc-900">{formattedIssueDate}</p>
                </div>
                {formattedDueDate && (
                  <div>
                    <span className="font-semibold text-zinc-500">Jatuh Tempo Pembayaran:</span>
                    <p className="font-bold text-zinc-900">{formattedDueDate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabel Item Tagihan */}
            <div className="py-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-800 bg-zinc-100/90 text-zinc-800">
                    <th className="py-2.5 px-3 font-bold w-12 text-center">No</th>
                    <th className="py-2.5 px-3 font-bold">Deskripsi Barang / Jasa</th>
                    <th className="py-2.5 px-3 font-bold text-center w-20">Qty</th>
                    <th className="py-2.5 px-3 font-bold text-right w-36">Harga Satuan (Rp)</th>
                    <th className="py-2.5 px-3 font-bold text-right w-36">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="page-break-inside-avoid">
                      <td className="py-3 px-3 text-center text-zinc-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-zinc-900">{item.description}</div>
                        {item.unit && item.unit !== "unit" && (
                          <div className="text-[11px] text-zinc-500 font-normal">
                            Satuan: {item.unit}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {Number(item.quantity).toLocaleString("id-ID")} {item.unit || ""}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {Number(item.unitPrice).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-zinc-900">
                        {Number(item.lineTotal).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rincian Kalkulasi & Catatan */}
            <div className="border-t-2 border-zinc-800 pt-4 page-break-inside-avoid">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
                {/* Catatan / Instruksi Rekening */}
                <div className="flex-1 space-y-3 text-xs text-zinc-700">
                  {invoice.notes && (
                    <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                      <span className="font-bold text-zinc-900 block mb-1">
                        Catatan & Instruksi Pembayaran:
                      </span>
                      <p className="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div className="text-zinc-500">
                      <span className="font-semibold block mb-0.5">Syarat & Ketentuan:</span>
                      <p className="whitespace-pre-line leading-relaxed">{invoice.terms}</p>
                    </div>
                  )}
                </div>

                {/* Ringkasan Angka Nominal */}
                <div className="w-full sm:w-72 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      Rp {Number(invoice.subtotal).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {Number(invoice.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Potongan Diskon</span>
                      <span className="font-mono font-semibold">
                        - Rp {Number(invoice.discountAmount).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  {Number(invoice.taxAmount) > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Pajak Tambahan</span>
                      <span className="font-mono font-semibold text-zinc-900">
                        + Rp {Number(invoice.taxAmount).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-zinc-900 pt-2.5 flex justify-between items-center text-sm font-extrabold text-zinc-900 bg-zinc-100 p-2.5 rounded">
                    <span className="uppercase tracking-wider">Total Tagihan</span>
                    <span className="font-mono text-base text-blue-900">
                      Rp {Number(invoice.total).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Tanda Tangan */}
            <div className="mt-12 pt-6 flex justify-end page-break-inside-avoid">
              <div className="text-center w-56 text-xs">
                <p className="text-zinc-600">Hormat Kami,</p>
                <p className="font-bold text-zinc-900 mt-1">
                  {profile?.businessName || "Penerbit Invoice"}
                </p>
                <div className="h-20" />
                <div className="border-b border-zinc-900 w-full" />
                <p className="mt-1.5 text-[11px] text-zinc-500">Tanda Tangan & Nama Terang</p>
              </div>
            </div>
          </div>

          {/* Dokumen Footer */}
          <footer className="mt-12 pt-4 border-t border-zinc-200 text-center text-[10px] text-zinc-400 page-break-inside-avoid">
            <p>Terima kasih atas kerja sama dan kepercayaan Anda.</p>
            <p className="mt-0.5">Dokumen ini diterbitkan secara resmi melalui aplikasi InvoGer.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-zinc-600 font-sans">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span>Menyiapkan dokumen cetak...</span>
          </div>
        </div>
      }
    >
      <InvoicePrintContent params={params} />
    </Suspense>
  );
}

