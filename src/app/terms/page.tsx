import Link from "next/link";
import { FileText, ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>Dokumen Legal Resmi</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Syarat dan Ketentuan Layanan
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Terakhir diperbarui: 23 November 2026
        </p>

        <div className="space-y-8 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mendaftar, mengakses, atau menggunakan platform <strong>InvoGer</strong> (&ldquo;Layanan&rdquo;), Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, Anda disarankan untuk tidak melanjutkan penggunaan Layanan.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">2. Pendaftaran dan Keamanan Akun</h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-300">
              <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun, termasuk kata sandi login Anda.</li>
              <li>Anda wajib memberikan informasi profil bisnis yang akurat dan sah saat menggunakan fitur faktur dan penawaran.</li>
              <li>InvoGer tidak bertanggung jawab atas kerugian akibat akses tidak sah ke akun Anda yang disebabkan kelalaian pengguna.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">3. Penggunaan Layanan dan Kuota Dokumen</h2>
            <p className="mb-3">
              InvoGer menyediakan model layanan berbasis kuota pemakaian:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-300">
              <li><strong>Paket FREE:</strong> Pengguna mendapatkan alokasi hingga 10 invoice dan 10 quotation per bulan kalender berbasis waktu global (UTC). Kuota akan di-reset otomatis pada awal bulan baru.</li>
              <li><strong>Paket PREMIUM:</strong> Pengguna yang melakukan upgrade mendapatkan akses tanpa batas (*unlimited*) untuk pembuatan invoice dan penawaran selama masa aktif langganan.</li>
              <li>Upaya manipulasi atau rekayasa data sistem kuota dianggap pelanggaran terhadap integritas layanan dan dapat mengakibatkan pembatasan akun.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">4. Kepemilikan Data dan Hak Cipta</h2>
            <p>
              Seluruh data bisnis, daftar pelanggan, item transaksi, dan dokumen invoice atau penawaran yang dibuat pengguna adalah <strong>hak milik eksklusif pengguna</strong>. InvoGer hanya bertindak sebagai penyedia infrastruktur perangkat lunak (*software-as-a-service*) untuk memproses dan mencetak dokumen tersebut.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">5. Batasan Tanggung Jawab</h2>
            <p>
              InvoGer tidak bertanggung jawab atas sengketa keuangan atau hukum yang timbul antara pengguna dengan pihak ketiga (klien atau mitra bisnis pengguna). InvoGer menyediakan fitur pembuatan dokumen dan perhitungan matematis sebagai alat bantu administrasi bisnis.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-bold text-white mb-3">6. Perubahan Syarat dan Ketentuan</h2>
            <p>
              InvoGer berhak memperbarui ketentuan layanan ini dari waktu ke waktu sesuai dengan perkembangan fitur dan regulasi yang berlaku. Pembaruan akan ditampilkan pada halaman ini dengan tanggal pembaruan yang disesuaikan.
            </p>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 bg-[#08090d] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 InvoGer. Hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Kebijakan Privasi
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
