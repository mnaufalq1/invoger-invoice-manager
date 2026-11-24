"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/ui/password-input";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Registrasi gagal.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0c0d12] px-4 font-sans text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#16171d] p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs">
              IG
            </div>
            <span className="text-base font-bold tracking-tight text-white">InvoGer</span>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">
          Buat Akun InvoGer
        </h1>

        <p className="mb-6 text-sm text-zinc-400">
          Mulai kelola invoice dan penawaran bisnismu secara profesional.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-zinc-400">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-700 bg-[#101116] px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 placeholder-zinc-500"
              placeholder="Nama Anda"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-zinc-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-700 bg-[#101116] px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 placeholder-zinc-500"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-zinc-400">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-950/60 p-3 text-xs text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
