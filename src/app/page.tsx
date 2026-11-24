import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  Printer,
  CreditCard,
  ChevronRight,
  Sparkles,
  BarChart3,
  HelpCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0d12] text-zinc-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* NAVBAR */}
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
            <a href="#fitur" className="hover:text-zinc-100 transition-colors">
              Fitur
            </a>
            <a href="#cara-kerja" className="hover:text-zinc-100 transition-colors">
              Cara Kerja
            </a>
            <a href="#harga" className="hover:text-zinc-100 transition-colors">
              Harga
            </a>
            <a href="#faq" className="hover:text-zinc-100 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Solusi Tagihan & Penawaran Bisnis Modern</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
            Kelola Invoice & Penawaran Bisnis{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
              Lebih Cepat dan Profesional
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Dari pembuatan penawaran harga (*quotation*), konversi ke invoice dalam satu klik, cetak PDF resmi, hingga pelacakan pelunasan pembayaran.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Mulai Buat Invoice Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#harga" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-base transition-colors">
              <CreditCard className="w-4 h-4 text-zinc-400" />
              <span>Lihat Paket & Harga</span>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-zinc-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tanpa kartu kredit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Gratis 10 invoice & penawaran/bulan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Siap pakai dalam 1 menit</span>
            </div>
          </div>

          {/* APP PREVIEW MOCKUP */}
          <div className="mt-14 relative mx-auto max-w-4xl rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-3 sm:p-5 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-zinc-500">invoger.app/dashboard</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-500/20 font-medium">
                Live Preview
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-left">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <p className="text-xs text-zinc-500 font-medium">Total Pendapatan</p>
                <p className="text-xl font-bold text-white mt-1">Rp 48.500.000</p>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <span>+12% dari bulan lalu</span>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <p className="text-xs text-zinc-500 font-medium">Menunggu Pelunasan</p>
                <p className="text-xl font-bold text-amber-400 mt-1">Rp 6.250.000</p>
                <p className="text-[11px] text-zinc-500 mt-1">3 invoice belum lunas</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <p className="text-xs text-zinc-500 font-medium">Penawaran Aktif</p>
                <p className="text-xl font-bold text-blue-400 mt-1">5 Dokumen</p>
                <p className="text-[11px] text-zinc-500 mt-1">Siap dikonversi ke invoice</p>
              </div>
            </div>

            {/* Mock Table */}
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40 text-left">
              <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs font-semibold text-zinc-400 flex justify-between items-center">
                <span>Daftar Transaksi Terbaru</span>
                <span className="text-[11px] text-blue-400">Sinkron Otomatis</span>
              </div>
              <div className="divide-y divide-zinc-800/60 text-xs">
                <div className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-950/70 text-blue-400 flex items-center justify-center font-bold">
                      INV
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-200">PT Maju Jaya Bersama</p>
                      <p className="text-[11px] text-zinc-500">INV-202611-001 • Jasa Desain Web</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-100">Rp 12.000.000</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                      Lunas
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950/70 text-indigo-400 flex items-center justify-center font-bold">
                      QUO
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-200">CV Solusi Digital Kreatif</p>
                      <p className="text-[11px] text-zinc-500">QUO-202611-002 • Pengembangan Sistem</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-100">Rp 25.000.000</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-950/70 text-blue-400 border border-blue-500/30">
                      Disetujui
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="fitur" className="py-20 border-t border-zinc-800/60 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 bg-blue-950/50 border border-blue-500/20 px-3 py-1 rounded-full">
              Fitur Lengkap
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-4">
              Dirancang untuk Kelancaran Finansial Bisnis Anda
            </h2>
            <p className="text-zinc-400 mt-3 text-sm sm:text-base">
              Semua perkakas yang Anda butuhkan untuk membuat penawaran profesional, menagih klien tepat waktu, dan memantau arus kas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/40 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Quotation to Invoice</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Buat penawaran harga resmi. Saat klien setuju, ubah menjadi invoice dalam 1 klik tanpa perlu mengetik ulang item transaksi.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/40 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Manajemen Pelanggan</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Simpan kontak, email, nomor telepon, dan alamat pelanggan secara rapi. Pilih pelanggan saat membuat invoice dalam sekejap.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/40 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Download PDF Resmi</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Format standar A4 yang elegan, hemat tinta printer, dan siap dikirim via WhatsApp atau email dengan identitas & logo bisnis Anda.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/40 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Catat Pembayaran & Saldo</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Catat pelunasan bertahap maupun lunas. Sistem otomatis menghitung sisa tagihan (*balance due*) dan memperbarui status invoice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="cara-kerja" className="py-20 border-t border-zinc-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400 bg-indigo-950/50 border border-indigo-500/20 px-3 py-1 rounded-full">
              Alur Singkat
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-4">
              Mulai dalam 3 Langkah Sederhana
            </h2>
            <p className="text-zinc-400 mt-3 text-sm sm:text-base">
              Tidak butuh pelatihan rumit. Siapapun bisa menerbitkan tagihan profesional dalam hitungan menit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg mb-4 shadow-md shadow-blue-600/30">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Atur Profil Bisnis</h3>
              <p className="text-sm text-zinc-400">
                Masukkan nama bisnis, kontak, alamat, dan nomor rekening pembayaran Anda di halaman pengaturan.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg mb-4 shadow-md shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Terbitkan Dokumen</h3>
              <p className="text-sm text-zinc-400">
                Pilih pelanggan, isi item barang atau jasa, lalu sesuaikan diskon dan pajak dengan pemisah ribuan otomatis.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg mb-4 shadow-md shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Kirim & Terima Dana</h3>
              <p className="text-sm text-zinc-400">
                Cetak PDF rapi, kirim ke klien Anda, dan catat pelunasan dengan tenang saat dana masuk ke rekening.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TEASER SECTION */}
      <section id="harga" className="py-20 border-t border-zinc-800/60 bg-zinc-950/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-3 py-1 rounded-full">
              Pilihan Paket
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-4">
              Paket Fleksibel Sesuai Kebutuhan Anda
            </h2>
            <p className="text-zinc-400 mt-3 text-sm sm:text-base">
              Mulai gratis sekarang. Upgrade ke Premium kapan pun bisnis Anda siap untuk transaksi tanpa batas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Paket FREE</h3>
                <p className="text-xs text-zinc-400 mt-1">Sempurna untuk perintis usaha & freelancer pemula</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-white">Rp 0</span>
                  <span className="text-zinc-500 text-xs ml-1">/ selamanya</span>
                </div>
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Maksimal 10 invoice / bulan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Maksimal 10 penawaran / bulan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Konversi Quotation ke Invoice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cetak & Download Dokumen PDF</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 w-full text-center py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition-colors"
              >
                Daftar Gratis
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="p-7 rounded-2xl bg-gradient-to-b from-blue-950/40 via-zinc-900 to-zinc-900 border-2 border-blue-500/50 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-md">
                Paling Diminati
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Paket PREMIUM</h3>
                <p className="text-xs text-blue-300/80 mt-1">Untuk agensi & bisnis yang aktif berkembang</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-white">Rp 29.000</span>
                  <span className="text-zinc-400 text-xs ml-1">/ bulan</span>
                </div>
                <ul className="space-y-3 text-sm text-zinc-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-semibold text-white">Invoice Tanpa Batas (Unlimited)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-semibold text-white">Penawaran Tanpa Batas (Unlimited)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Pencatatan Riwayat Pembayaran Penuh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Dukungan Prioritas</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 space-y-2.5">
                <Link
                  href="/register?plan=premium"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <span>Pilih Paket Premium</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="w-full inline-flex items-center justify-center text-xs text-blue-400 hover:text-blue-300 font-medium py-1 transition-colors"
                >
                  Lihat perbandingan detail di halaman harga →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 border-t border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
              Pertanyaan Umum
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-4">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Apakah InvoGer benar-benar bisa dipakai secara gratis?
              </h3>
              <p className="mt-2 text-sm text-zinc-400 pl-6 leading-relaxed">
                Ya! Paket FREE dapat digunakan gratis selamanya dengan jatah 10 invoice dan 10 quotation setiap bulannya. Tidak ada kewajiban memasukkan kartu kredit saat pendaftaran.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Bagaimana cara mengubah penawaran (quotation) menjadi invoice?
              </h3>
              <p className="mt-2 text-sm text-zinc-400 pl-6 leading-relaxed">
                Buka rincian penawaran yang sudah disetujui klien, lalu klik tombol &ldquo;Konversi ke Invoice&rdquo;. Sistem otomatis membuat invoice baru dengan data pelanggan dan item transaksi yang sama persis.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Apakah dokumen PDF siap dikirim langsung ke klien?
              </h3>
              <p className="mt-2 text-sm text-zinc-400 pl-6 leading-relaxed">
                Tentu saja. Tampilan cetak PDF diformat khusus untuk kertas A4 yang rapi, bersih, tanpa sidebar atau tombol web, serta dapat langsung Anda unduh atau kirimkan via WhatsApp dan email.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Bagaimana jika kuota dokumen bulanan saya habis?
              </h3>
              <p className="mt-2 text-sm text-zinc-400 pl-6 leading-relaxed">
                Anda dapat melakukan upgrade ke paket PREMIUM di halaman Harga untuk mendapatkan akses tanpa batas (*unlimited*) selama 30 hari. Kuota paket FREE juga akan di-reset otomatis pada awal bulan baru (UTC).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 border-t border-zinc-800/60 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Siap Mengelola Tagihan Bisnis Lebih Rapi?
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            Bergabunglah sekarang dan rasakan kemudahan membuat dokumen penawaran serta tagihan profesional dalam hitungan detik.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            >
              <span>Daftar Akun Gratis Sekarang</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-zinc-800 bg-[#08090d] text-zinc-400 py-12 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              IG
            </div>
            <span className="font-bold text-white text-base">InvoGer</span>
            <span className="text-zinc-600 ml-2">|</span>
            <span className="text-xs text-zinc-500 ml-2">Invoice & Quotation Manager</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm">
            <Link href="/pricing" className="hover:text-zinc-200 transition-colors">
              Harga
            </Link>
            <Link href="/login" className="hover:text-zinc-200 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="hover:text-zinc-200 transition-colors">
              Daftar
            </Link>
            <Link href="/terms" className="hover:text-zinc-200 transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="hover:text-zinc-200 transition-colors">
              Kebijakan Privasi
            </Link>
          </div>

          <p className="text-xs text-zinc-500">
            &copy; 2026 InvoGer. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
