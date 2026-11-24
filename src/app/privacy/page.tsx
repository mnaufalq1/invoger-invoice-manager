import Link from "next/link";
import { FileText, ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0c0d12] text-zinc-100 flex flex-col">
      {/* NAVBAR */}
      <header className="border-b border-zinc-800 bg-[#0c0d12]/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Invo<span className="text-blue-500">Ger</span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Keamanan & Privasi Data</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Kebijakan Privasi
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Terakhir diperbarui: 23 November 2026
        </p>

        <div className="space-y-8 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">1. Komitmen Privasi Kami</h2>
            <p>
              InvoGer menghormati privasi bisnis Anda dan berkomitmen melindungi data pribadi serta data transaksi keuangan Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menyimpan, dan melindungi informasi Anda saat menggunakan aplikasi InvoGer.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">2. Informasi yang Kami Kumpulkan</h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-300">
              <li><strong>Informasi Akun:</strong> Nama, alamat email, dan kredensial terenkripsi yang digunakan saat registrasi akun.</li>
              <li><strong>Profil Bisnis:</strong> Nama bisnis, kontak, alamat usaha, nomor NPWP, dan catatan rekening yang Anda atur secara sukarela.</li>
              <li><strong>Data Pelanggan:</strong> Informasi kontak pelanggan (nama, email, telepon, alamat) yang Anda input untuk keperluan penagihan.</li>
              <li><strong>Data Transaksi:</strong> Rincian item faktur, harga, kuantitas, nilai diskon, pajak, dan catatan riwayat pembayaran.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">3. Isolasi Data Pengguna (Multi-Tenancy Security)</h2>
            <p>
              InvoGer menerapkan standar arsitektur <em>strict data isolation</em>. Setiap rekaman data pelanggan, invoice, quotation, dan pembayaran terikat secara kriptografis pada identitas akun pengguna (*userId*) di tingkat basis data. Pengguna lain tidak memiliki akses atau visibilitas terhadap data usaha Anda.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">4. Penggunaan Informasi</h2>
            <p className="mb-2">Informasi yang dikumpulkan digunakan semata-mata untuk:</p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-300">
              <li>Menyediakan layanan pembuatan faktur, penawaran harga, dan cetak PDF resmi.</li>
              <li>Menghitung ringkasan statistik keuangan dan pelacakan pembayaran pada dashboard Anda.</li>
              <li>Memverifikasi kuota penggunaan paket langganan.</li>
            </ul>
            <p className="mt-3 font-medium text-white">
              Kami tidak pernah menjual atau membagikan data bisnis atau informasi pelanggan Anda kepada pihak ketiga manapun untuk keperluan periklanan.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">5. Hak Akses dan Penghapusan Data</h2>
            <p>
              Anda memiliki kendali penuh atas data bisnis Anda. Anda dapat mengubah profil bisnis, menambah, memperbarui, atau menghapus data pelanggan dan dokumen faktur kapan saja langsung dari dashboard aplikasi InvoGer.
            </p>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 bg-[#08090d] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 InvoGer. Hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/" className="hover:text-zinc-300 transition-colors">
              Beranda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
