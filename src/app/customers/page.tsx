"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/app-shell";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
};

type FormData = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Modal delete state
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const [, startTransition] = useTransition();

  const loadCustomers = useCallback(async (searchQuery = "") => {
    try {
      const url = searchQuery
        ? `/api/customers?search=${encodeURIComponent(searchQuery)}`
        : "/api/customers";
      const response = await fetch(url);

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal memuat data pelanggan.");
      }

      const data = await response.json();
      setCustomers(data.customers || []);
    } catch {
      toast.error("Tidak dapat memuat data pelanggan. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCustomers();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchTerm(val);
    startTransition(() => {
      loadCustomers(val);
    });
  }

  function openCreateModal() {
    setFormData(initialFormData);
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditModal(customer: Customer) {
    setFormData({
      id: customer.id,
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
    setFormError("");
    setIsFormOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Nama pelanggan wajib diisi.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const isEdit = Boolean(formData.id);
      const url = isEdit ? `/api/customers/${formData.id}` : "/api/customers";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal menyimpan data pelanggan.");
      }

      toast.success(result.message || "Data pelanggan berhasil disimpan.");
      setIsFormOpen(false);
      loadCustomers(searchTerm);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!customerToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal menghapus pelanggan.");
      }

      toast.success(result.message || "Pelanggan berhasil dihapus.");
      setCustomerToDelete(null);
      loadCustomers(searchTerm);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus pelanggan."
      );
      setCustomerToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AppShell
      title="Pelanggan"
      subtitle="Kelola data kontak dan informasi pelanggan Anda."
      action={
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pelanggan</span>
        </button>
      }
    >
      {/* Action Bar Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder="Cari pelanggan (nama, email, telepon)..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-zinc-700/80 bg-[#16171d] px-4 py-2.5 text-sm text-white shadow-sm outline-none transition placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                loadCustomers("");
              }}
              className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-white"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-12 text-center text-zinc-400">
          Memuat daftar pelanggan...
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#16171d] p-12 text-center">
          <div className="flex justify-center mb-3">
            <Users className="w-12 h-12 text-zinc-600" />
          </div>
          <h3 className="mt-2 text-lg font-bold text-white">
            {searchTerm ? "Pelanggan tidak ditemukan" : "Belum ada pelanggan"}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {searchTerm
              ? "Coba kata kunci pencarian yang lain."
              : "Mulai tambahkan pelanggan pertama Anda untuk membuat invoice dan quotation."}
          </p>
          {!searchTerm && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
            >
              + Tambah Pelanggan Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#16171d] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-[#13141a] text-xs font-semibold uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Nama Pelanggan</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4">Alamat</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      {c.notes && (
                        <div className="mt-1 text-xs text-zinc-500">
                          Catatan: {c.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <div>{c.email || "-"}</div>
                      <div className="text-xs text-zinc-500">{c.phone || ""}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {c.address ? (
                        <span className="line-clamp-2 max-w-xs">{c.address}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setCustomerToDelete(c)}
                          className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-400 transition hover:bg-rose-950/60"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Pelanggan */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-[#16171d] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {formData.id ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Isi informasi pelanggan di bawah ini.
            </p>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/60 p-3 text-sm text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">
                  Nama Pelanggan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="PT Maju Bersama / Budi Santoso"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#101116] px-4 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="kontak@pelanggan.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#101116] px-4 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400">
                    No. Telepon / WA (Opsional)
                  </label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#101116] px-4 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">
                  Alamat (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Sudirman No. 123, Jakarta"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#101116] px-4 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan khusus, PIC, nomor referensi, dll."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#101116] px-4 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#16171d] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              Hapus Pelanggan?
            </h3>
            <p className="mt-2 text-sm text-zinc-300">
              Apakah Anda yakin ingin menghapus pelanggan{" "}
              <span className="font-semibold text-white">
                &ldquo;{customerToDelete.name}&rdquo;
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
