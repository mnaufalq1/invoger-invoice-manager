"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Check,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  Zap,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface SubStatus {
  isPremium: boolean;
  planCode?: string;
  expiresAt?: string | null;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoadingSub(true);
    try {
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const data = await res.json();
        const current = data?.currentSubscription;
        setSubStatus({
          isPremium: current?.plan?.code === "PREMIUM",
          planCode: current?.plan?.code || "FREE",
          expiresAt: current?.expiresAt || null,
        });
      }
    } catch {
      // Abaikan jika gagal memuat status opsional
    } finally {
      setLoadingSub(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: "PREMIUM" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memproses langganan.");
      }

      const resData = await res.json();
      setSuccessMessage(
        resData.message || "Selamat! Paket Premium Unlimited Anda berhasil diaktifkan."
      );
      setSubStatus((prev) => ({
        ...prev,
        isPremium: true,
        planCode: "PREMIUM",
        expiresAt: resData.subscription?.expiresAt || null,
      }));

      // Kirim event global agar sidebar & app-shell langsung sinkron
      window.dispatchEvent(new Event("subscription-changed"));
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat aktivasi."
      );
    } finally {
      setUpgrading(false);
    }
  };

  const isPremiumUser = subStatus?.isPremium ?? false;

  return (
    <div className="min-h-screen bg-[#0c0d12] text-zinc-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* NAVBAR PUBLIK */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/70 bg-[#0c0d12]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Invo<span className="text-blue-500">Ger</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/#fitur" className="hover:text-zinc-100 transition-colors">
              Fitur
            </Link>
            <Link href="/#cara-kerja" className="hover:text-zinc-100 transition-colors">
              Cara Kerja
            </Link>
            <Link href="/pricing" className="text-blue-400 font-semibold">
              Harga
            </Link>
            <Link href="/#faq" className="hover:text-zinc-100 transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl shadow-sm shadow-blue-500/25 transition-all"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm shadow-blue-500/25 transition-all"
                >
                  Mulai Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION PRICING */}
      <section className="relative pt-16 pb-14 md:pt-20 md:pb-18 overflow-hidden text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparan & Tanpa Biaya Tersembunyi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Pilihan Paket yang Tepat untuk{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
              Pertumbuhan Bisnis Anda
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Mulai gratis selamanya untuk bisnis pemula, atau upgrade ke Premium untuk pembuatan tagihan tanpa batas kuota.
          </p>

          {isLoggedIn && (
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300">
              <span className={`w-2 h-2 rounded-full ${isPremiumUser ? "bg-amber-400" : "bg-emerald-400"}`} />
              <span>
                Masuk sebagai:{" "}
                <strong className="text-white">
                  {session?.user?.name || session?.user?.email}
                </strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">
                Paket Anda:{" "}
                <strong className={isPremiumUser ? "text-amber-400" : "text-emerald-400"}>
                  {loadingSub ? "Memeriksa..." : isPremiumUser ? "Premium Unlimited" : "Starter Free"}
                </strong>
              </span>
              <span className="text-zinc-600">|</span>
              <Link
                href="/settings/subscription"
                className="text-blue-400 hover:text-blue-300 font-semibold underline"
              >
                Pengaturan Kuota
              </Link>
            </div>
          )}

          {/* NOTIFIKASI SUKSES / ERROR LANGSUNG DI TEMPAT */}
          {successMessage && (
            <div className="mt-6 max-w-xl mx-auto p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 max-w-xl mx-auto p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-sm flex items-center justify-center gap-3">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </section>

      {/* KARTU KOMPARASI PAKET */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* KARTU FREE */}
            <div className="rounded-3xl border border-zinc-800 bg-[#161720] p-8 flex flex-col justify-between shadow-sm relative">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Mulai Sekarang
                  </span>
                  {isLoggedIn && !isPremiumUser ? (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                      ✓ Paket Aktif Saat Ini
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                      Gratis Selamanya
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mt-3">Starter Free</h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Pilihan sempurna bagi freelancer, konsultan, atau bisnis rintisan yang baru memulai penagihan.
                </p>

                <div className="mt-6 pb-6 border-b border-zinc-800/80">
                  <span className="text-4xl font-extrabold text-white">Rp 0</span>
                  <span className="text-sm font-medium text-zinc-400"> / bulan</span>
                </div>

                <div className="mt-6 space-y-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Fitur yang didapatkan:
                  </p>
                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>10 Dokumen Invoice</strong> per bulan</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>10 Dokumen Penawaran</strong> per bulan</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cetak & Download Dokumen PDF A4</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Pencatatan Pembayaran & Sisa Piutang</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Manajemen Pelanggan & Laporan Bisnis</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800/80">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold border border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 transition"
                  >
                    Buka Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold border border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 transition"
                  >
                    Daftar Akun Gratis
                  </Link>
                )}
              </div>
            </div>

            {/* KARTU PREMIUM */}
            <div className="rounded-3xl border-2 border-blue-500/50 bg-gradient-to-b from-blue-950/30 via-[#161722] to-[#161722] p-8 flex flex-col justify-between shadow-xl shadow-blue-500/10 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                {isPremiumUser ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Check className="w-3 h-3" /> Paket Anda Aktif
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3.5 py-1 rounded-full shadow-md">
                    Paling Populer
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Skala & Pertumbuhan
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
                  <span>Premium Unlimited</span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h2>
                <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">
                  Solusi tanpa batasan bagi bisnis, agensi, toko, dan UMKM yang membutuhkan tagihan tanpa batas.
                </p>

                <div className="mt-6 pb-6 border-b border-blue-500/20">
                  <span className="text-4xl font-extrabold text-white">Rp 29.000</span>
                  <span className="text-sm font-medium text-zinc-400"> / bulan</span>
                </div>

                <div className="mt-6 space-y-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    Semua fitur Free, ditambah:
                  </p>
                  <ul className="space-y-3 text-sm text-zinc-200">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-semibold text-white">Unlimited Invoice (Tanpa Batas Kuota)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-semibold text-white">Unlimited Penawaran (Tanpa Batas Kuota)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Konversi Penawaran ke Invoice 1-Klik</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Analisis Finansial & Omzet Lengkap</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Dukungan Teknis Prioritas</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-500/20">
                {!isLoggedIn ? (
                  <Link
                    href="/register?plan=premium"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    <span>Mulai Berlangganan Premium</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : isPremiumUser ? (
                  <div className="space-y-2.5">
                    <button
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-60"
                    >
                      {upgrading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Memproses Perpanjangan...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Perpanjang +30 Hari (Rp 29.000)</span>
                        </>
                      )}
                    </button>
                    <Link
                      href="/dashboard"
                      className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition"
                    >
                      Buka Dashboard
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition cursor-pointer disabled:opacity-60"
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengaktifkan Premium...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Aktifkan Premium Sekarang (Rp 29.000)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABEL PERBANDINGAN FITUR LENGKAP */}
      <section className="py-16 border-t border-zinc-800/80 bg-[#0e0f15]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white">Perbandingan Fitur Terperinci</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Lihat apa saja perbedaan fasilitas antara Starter Free dan Premium Unlimited.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#161720] overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-zinc-900/90 p-4 border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <div>Fitur</div>
              <div className="text-center">Starter Free</div>
              <div className="text-center text-blue-400">Premium Unlimited</div>
            </div>

            <div className="divide-y divide-zinc-800/70 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-white">Kuota Invoice Bulanan</span>
                <span className="text-center text-zinc-400">10 dokumen</span>
                <span className="text-center text-emerald-400 font-bold">Tanpa Batas (∞)</span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-white">Kuota Penawaran Harga</span>
                <span className="text-center text-zinc-400">10 dokumen</span>
                <span className="text-center text-emerald-400 font-bold">Tanpa Batas (∞)</span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-white">Cetak & Unduh File PDF A4</span>
                <span className="text-center text-emerald-400 font-bold">✓</span>
                <span className="text-center text-emerald-400 font-bold">✓</span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-white">Konversi Penawaran ke Invoice 1-Klik</span>
                <span className="text-center text-emerald-400 font-bold">✓</span>
                <span className="text-center text-emerald-400 font-bold">✓</span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-white">Pencatatan Riwayat Pembayaran & Piutang</span>
                <span className="text-center text-emerald-400 font-bold">✓</span>
                <span className="text-center text-emerald-400 font-bold">✓</span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-white">Dashboard Analisis Finansial Lengkap</span>
                <span className="text-center text-zinc-400">Dasar</span>
                <span className="text-center text-blue-400 font-bold">Lengkap & Export PDF</span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-white">Dukungan Prioritas Pengguna</span>
                <span className="text-center text-zinc-500">Standar</span>
                <span className="text-center text-blue-400 font-bold">Prioritas Cepat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION SINGKAT */}
      <section className="py-16 border-t border-zinc-800/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white">Pertanyaan Seputar Harga</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Jawaban cepat atas hal yang sering ditanyakan mengenai sistem berlangganan.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Apakah paket Free memiliki masa kedaluwarsa?
              </h4>
              <p className="mt-2 text-xs text-zinc-400 pl-6 leading-relaxed">
                Tidak ada. Anda dapat menggunakan paket Free selamanya dengan jatah 10 invoice dan 10 penawaran yang diperbarui setiap awal bulan kalender (UTC).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Bagaimana cara memperpanjang masa aktif Premium?
              </h4>
              <p className="mt-2 text-xs text-zinc-400 pl-6 leading-relaxed">
                Anda dapat langsung menekan tombol perpanjang di halaman Harga ini atau melalui menu Pengaturan &gt; Paket & Langganan. Masa aktif akan otomatis bertambah +30 hari dengan 1 klik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER PUBLIK */}
      <footer className="mt-auto border-t border-zinc-800/60 py-8 bg-[#0a0a0e] text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 InvoGer. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/terms" className="hover:text-white transition">
              Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
