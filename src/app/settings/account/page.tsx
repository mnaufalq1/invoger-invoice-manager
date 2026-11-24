"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AppShell from "@/components/app-shell";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/ui/password-input";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUser({
          name: data.name || "Pengguna",
          email: data.email || "",
        });
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadUserData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadUserData]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({
        type: "error",
        text: "Kata sandi baru minimal 8 karakter.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: "error",
        text: "Konfirmasi kata sandi baru tidak cocok.",
      });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (res.error) {
        setPasswordMsg({
          type: "error",
          text: res.error.message || "Gagal mengubah kata sandi. Periksa kata sandi saat ini.",
        });
      } else {
        setPasswordMsg({
          type: "success",
          text: "Kata sandi berhasil diperbarui!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMsg({
        type: "error",
        text: "Terjadi kesalahan saat memproses perubahan kata sandi.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <AppShell
      title="Pengaturan Akun & Keamanan"
      subtitle="Kelola data akun personal Anda dan amankan akses masuk aplikasi."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
          <span>Kembali ke Pengaturan</span>
        </Link>

        {/* Informasi Akun */}
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-zinc-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Informasi Akun Pemilik</h2>
              <p className="text-xs text-zinc-400">
                Informasi identitas akun yang digunakan untuk masuk ke InvoGer.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-6 flex items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <p className="text-sm">Memuat profil akun...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#1c1d24] border border-zinc-800/80">
                <span className="text-xs text-zinc-400 font-medium">Nama Lengkap</span>
                <p className="text-sm font-semibold text-white mt-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-500" />
                  {user?.name || "-"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1c1d24] border border-zinc-800/80">
                <span className="text-xs text-zinc-400 font-medium">Alamat Email Terdaftar</span>
                <p className="text-sm font-semibold text-white mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  {user?.email || "-"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ganti Kata Sandi */}
        <div className="rounded-2xl border border-zinc-800 bg-[#16171d] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-zinc-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ganti Kata Sandi</h2>
              <p className="text-xs text-zinc-400">
                Gunakan kombinasi sandi yang aman dan tidak mudah ditebak minimal 8 karakter.
              </p>
            </div>
          </div>

          {passwordMsg && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-sm mb-6 ${
                passwordMsg.type === "success"
                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-950/40 text-rose-400 border border-rose-500/30"
              }`}
            >
              {passwordMsg.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Kata Sandi Saat Ini <span className="text-rose-400">*</span>
              </label>
              <PasswordInput
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi saat ini"
                className="bg-[#1c1d24] focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Kata Sandi Baru <span className="text-rose-400">*</span>
                </label>
                <PasswordInput
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="bg-[#1c1d24] focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Konfirmasi Sandi Baru <span className="text-rose-400">*</span>
                </label>
                <PasswordInput
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi sandi baru"
                  className="bg-[#1c1d24] focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memperbarui...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Perbarui Kata Sandi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

