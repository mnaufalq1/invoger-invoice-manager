"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type ItemRow = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

const initialItem: ItemRow = {
  description: "",
  quantity: 1,
  unit: "unit",
  unitPrice: 0,
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Form states
  const [customerId, setCustomerId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ ...initialItem }]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    async function fetchCustomers() {
      setIssueDate(new Date().toISOString().split("T")[0]);
      try {
        const res = await fetch("/api/customers");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.customers?.length > 0) {
          setCustomerId(data.customers[0].id);
        }
      } catch {
        toast.error("Gagal memuat daftar pelanggan.");
      } finally {
        setLoadingCustomers(false);
      }
    }

    fetchCustomers();
  }, [router]);

  function handleItemChange(
    index: number,
    field: keyof ItemRow,
    value: string | number
  ) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  function handleAddItem() {
    setItems([...items, { ...initialItem }]);
  }

  function handleRemoveItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((acc, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const grandTotal = Math.max(
    0,
    subtotal - (Number(discountAmount) || 0) + (Number(taxAmount) || 0)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) {
      toast.error("Silakan pilih pelanggan terlebih dahulu.");
      setError("Silakan pilih pelanggan.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].description.trim()) {
        const msg = `Deskripsi item baris ke-${i + 1} wajib diisi.`;
        toast.error(msg);
        setError(msg);
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          documentNumber: documentNumber.trim() || undefined,
          issueDate,
          dueDate: dueDate || undefined,
          items,
          discountAmount: Number(discountAmount) || 0,
          taxAmount: Number(taxAmount) || 0,
          notes: notes.trim() || undefined,
          terms: terms.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 || data.limitReached) {
          setIsLimitReached(true);
        }
        throw new Error(data.message || "Gagal membuat invoice.");
      }

      toast.success("Invoice berhasil dibuat!");
      router.push(`/invoices/${data.invoice.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
      setError(msg);
      toast.error(msg);
      setSaving(false);
    }
  }

  return (
    <AppShell
      title="Buat Invoice Baru"
      subtitle="Isi rincian transaksi untuk membuat tagihan baru."
    >
      <div className="max-w-5xl mx-auto">
        {/* Tombol Kembali di Kiri Atas */}
        <div className="mb-6">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition group"
          >
            <span className="flex h-7 items-center rounded-lg border border-zinc-700/80 bg-zinc-800/90 px-2.5 py-1 text-zinc-300 group-hover:border-zinc-500 group-hover:bg-zinc-700 group-hover:text-white transition">
              ← Kembali ke Invoice
            </span>
          </Link>
        </div>

        {/* Banner Peringatan Kuota Free */}
        {isLimitReached && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 text-lg">
                ⚠️
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Batas Kuota Bulanan Paket Free Tercapai</h4>
                <p className="mt-0.5 text-xs text-rose-300/90">
                  {error || "Anda telah mencapai batas 10 invoice/bulan untuk paket Free."}
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="self-start sm:self-auto shrink-0 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-rose-500 transition"
            >
              Upgrade Paket
            </Link>
          </div>
        )}

        {error && !isLimitReached && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/60 p-4 text-sm font-medium text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Pelanggan & Info Dasar */}
          <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-sm">
            <h2 className="text-base font-bold text-white">
              Informasi Invoice & Pelanggan
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400">
                  Pelanggan <span className="text-rose-400">*</span>
                </label>
                {loadingCustomers ? (
                  <div className="mt-1.5 h-10 animate-pulse rounded-xl bg-zinc-800" />
                ) : customers.length === 0 ? (
                  <div className="mt-1.5 text-xs text-amber-400">
                    Belum ada pelanggan.{" "}
                    <Link href="/customers" className="underline font-semibold">
                      Tambah pelanggan baru
                    </Link>
                  </div>
                ) : (
                  <Select value={customerId} onValueChange={(val) => setCustomerId(val)}>
                    <SelectTrigger className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 px-3 py-2 text-sm text-white h-10 outline-none focus:border-blue-500">
                      <SelectValue placeholder="Pilih Pelanggan" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-[#1e2029] text-white">
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                          <span className="font-medium text-white">{c.name}</span>
                          {c.email && (
                            <span className="text-zinc-400 text-xs ml-1.5 font-normal">
                              ({c.email})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400">
                  Nomor Invoice (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Otomatis: INV-YYYYMM-XXXX"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#121318] px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  Kosongkan jika ingin nomor digenerate otomatis oleh sistem.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400">
                  Tanggal Terbit <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#121318] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400">
                  Jatuh Tempo (Opsional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#121318] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Daftar Item Tagihan */}
          <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Rincian Item</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="rounded-xl border border-blue-500/40 bg-blue-600/10 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-600/20"
              >
                + Tambah Baris
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item, index) => {
                const lineTotal =
                  (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

                return (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-[#121318] p-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1">
                      <label className="text-[11px] font-medium text-zinc-500 sm:hidden">
                        Deskripsi Item
                      </label>
                      <input
                        type="text"
                        placeholder="Deskripsi jasa atau produk..."
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-700/60 bg-transparent px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="w-full sm:w-28">
                      <label className="text-[11px] font-medium text-zinc-500 sm:hidden">
                        Qty
                      </label>
                      <ShadcnNumberInput
                        value={Number(item.quantity) || 0}
                        onChange={(val) => handleItemChange(index, "quantity", val)}
                        min={0.00}
                        step={1}
                        align="center"
                      />
                    </div>

                    <div className="w-full sm:w-24">
                      <label className="text-[11px] font-medium text-zinc-500 sm:hidden">
                        Satuan
                      </label>
                      <input
                        type="text"
                        placeholder="unit/jam"
                        value={item.unit}
                        onChange={(e) =>
                          handleItemChange(index, "unit", e.target.value)
                        }
                        className="w-full rounded-xl border border-zinc-700/80 bg-[#121318] px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500 h-9"
                      />
                    </div>

                    <div className="w-full sm:w-44">
                      <label className="text-[11px] font-medium text-zinc-500 sm:hidden">
                        Harga (Rp)
                      </label>
                      <ShadcnNumberInput
                        value={Number(item.unitPrice) || 0}
                        onChange={(val) => handleItemChange(index, "unitPrice", val)}
                        min={0}
                        step={1000}
                        align="right"
                      />
                    </div>

                    <div className="flex items-center justify-between sm:w-32 sm:justify-end">
                      <span className="text-xs font-semibold text-zinc-300">
                        Rp {lineTotal.toLocaleString("id-ID")}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="ml-3 text-zinc-500 hover:text-rose-400 transition"
                          title="Hapus baris"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Kalkulasi Diskon, Pajak & Total */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400">
                  Catatan untuk Pelanggan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Terima kasih atas kerjasamanya."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#121318] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400">
                  Syarat & Ketentuan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pembayaran dilakukan maksimal 7 hari setelah invoice diterima."
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#121318] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-white mb-2">
                Ringkasan Pembayaran
              </h2>

              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-zinc-400">Potongan Diskon (Rp)</span>
                <div className="w-44">
                  <ShadcnNumberInput
                    value={discountAmount}
                    onChange={setDiscountAmount}
                    min={0}
                    step={5000}
                    align="right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-zinc-400">Pajak Tambahan (Rp)</span>
                <div className="w-44">
                  <ShadcnNumberInput
                    value={taxAmount}
                    onChange={setTaxAmount}
                    min={0}
                    step={5000}
                    align="right"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
                <span className="text-base font-bold text-white">Total Tagihan</span>
                <span className="text-xl font-extrabold text-blue-400">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Link
                  href="/invoices"
                  className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={saving || isLimitReached}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Invoice"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
