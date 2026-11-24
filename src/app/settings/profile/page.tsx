"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  Undo2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/app-shell";

type BusinessProfile = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  taxNumber: string;
};

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: "",
  businessEmail: "",
  businessPhone: "",
  businessAddress: "",
  taxNumber: "",
};

export default function BusinessProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [savedProfile, setSavedProfile] =
    useState<BusinessProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const p = data.profile || {};
        const loaded: BusinessProfile = {
          businessName: p.businessName || "",
          businessEmail: p.businessEmail || "",
          businessPhone: p.businessPhone || "",
          businessAddress: p.businessAddress || "",
          taxNumber: p.taxNumber || "",
        };
        setProfile(loaded);
        setSavedProfile(loaded);
      }
    } catch {
      setMsg({ type: "error", text: "Gagal memuat profil bisnis." });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProfile]);

  // Cek apakah ada perubahan yang belum disimpan (isDirty)
  const isDirty =
    profile.businessName !== savedProfile.businessName ||
    profile.businessEmail !== savedProfile.businessEmail ||
    profile.businessPhone !== savedProfile.businessPhone ||
    profile.businessAddress !== savedProfile.businessAddress ||
    profile.taxNumber !== savedProfile.taxNumber;

  function handleUndo() {
    setProfile({ ...savedProfile });
    setMsg(null);
    toast.info("Perubahan form profil telah dikembalikan ke data sebelumnya.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSavedProfile({ ...profile });
        setMsg({ type: "success", text: "Profil bisnis berhasil disimpan!" });
        toast.success("Profil bisnis berhasil diperbarui.");
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg({
          type: "error",
          text: err.message || err.error || "Gagal menyimpan profil bisnis.",
        });
        toast.error("Gagal menyimpan profil bisnis.");
      }
    } catch {
      setMsg({ type: "error", text: "Terjadi kesalahan jaringan." });
      toast.error("Kesalahan jaringan saat menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell
      title="Profil Bisnis"
      subtitle="Kelola identitas usaha Anda yang akan dicetak di faktur dan penawaran resmi."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tombol Navigasi Kembali */}
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
          <div className="py-16 rounded-2xl border border-zinc-800 bg-[#16171d] flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Memuat profil usaha...</p>
          </div>
        ) : (
          <>
            {/* FORM EDIT DATA PROFIL & TOMBOL UNDO */}
            <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-zinc-800 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Formulir Perubahan Profil</span>
                    {isDirty && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Ada Perubahan Belum Disimpan
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Perbarui rincian usaha Anda di bawah ini dan tekan Simpan.
                  </p>
                </div>

                {/* Tombol Undo di Header Form */}
                {isDirty && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
                    title="Batalkan seluruh editan yang belum disimpan"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Batalkan Perubahan</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Nama Bisnis / Perusahaan{" "}
                    <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={profile.businessName}
                      onChange={(e) =>
                        setProfile({ ...profile, businessName: e.target.value })
                      }
                      placeholder="Contoh: PT Solusi Digital Prima"
                      className="w-full bg-[#1c1d24] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                      Email Bisnis <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={profile.businessEmail}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            businessEmail: e.target.value,
                          })
                        }
                        placeholder="billing@perusahaan.com"
                        className="w-full bg-[#1c1d24] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                      No. Telepon / WhatsApp{" "}
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={profile.businessPhone}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            businessPhone: e.target.value,
                          })
                        }
                        placeholder="081234567890"
                        className="w-full bg-[#1c1d24] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Alamat Lengkap Bisnis
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 pointer-events-none text-zinc-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <textarea
                      rows={3}
                      value={profile.businessAddress}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          businessAddress: e.target.value,
                        })
                      }
                      placeholder="Alamat kantor atau lokasi operasional bisnis Anda..."
                      className="w-full bg-[#1c1d24] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    NPWP Bisnis (Opsional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={profile.taxNumber}
                      onChange={(e) =>
                        setProfile({ ...profile, taxNumber: e.target.value })
                      }
                      placeholder="00.000.000.0-000.000"
                      className="w-full bg-[#1c1d24] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Footer Tombol Aksi: Undo dan Simpan */}
                <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
                  <div>
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                      Data profil selaras dengan data tersimpan
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !isDirty}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Profil Bisnis</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
