# InvoGer --- Master Development Plan

**Versi dokumen:** 1.3\
**Tanggal pembaruan:** 23 November 2026\
**Status proyek:** Dalam pengembangan\
**Tujuan utama:** Membangun SaaS invoice dan quotation yang stabil,
mudah digunakan, dan dapat mulai menghasilkan pendapatan secepat
mungkin.

------------------------------------------------------------------------

## 1. Ringkasan Produk

InvoGer adalah aplikasi SaaS untuk membantu pelaku usaha membuat dan
mengelola invoice (tagihan) serta quotation (penawaran harga) secara
profesional.

### Sasaran versi pertama (MVP)

Pengguna harus dapat:

1.  Membuat akun dan login.
2.  Mengatur identitas bisnis.
3.  Mengelola data pelanggan.
4.  Membuat dan mengelola invoice.
5.  Membuat quotation dan mengubahnya menjadi invoice.
6.  Mengunduh dokumen PDF profesional.
7.  Melihat ringkasan aktivitas bisnis.
8.  Menggunakan paket FREE dengan batas pemakaian yang jelas.
9.  Upgrade ke PREMIUM melalui alur pembayaran yang aman.

**Prinsip produk:** prioritaskan alur utama yang benar-benar dibutuhkan
pelanggan. Jangan menambah fitur hanya karena terlihat menarik jika
fitur inti belum stabil.

------------------------------------------------------------------------

## 2. Teknologi dan Arsitektur Saat Ini

  Bagian            Teknologi
  ----------------- ----------------------------
  Framework         Next.js 16.4.3, App Router
  Bahasa            TypeScript
  Styling           Tailwind CSS
  ORM               Prisma 7
  Database          PostgreSQL
  Autentikasi       Better Auth
  Package manager   pnpm

### Catatan arsitektur penting

-   Proyek menggunakan Next.js App Router.
-   File schema Prisma dibagi menjadi beberapa file `.prisma` yang
    berada langsung di folder `prisma/`, bukan di subfolder.
-   Prisma Client dihasilkan ke `src/generated/prisma`.
-   Prisma 7 menggunakan `@prisma/adapter-pg`.
-   Konfigurasi Prisma berada di `prisma.config.ts`.
-   Seed plan dijalankan melalui `pnpm exec prisma db seed`.
-   Jangan mengganti teknologi atau merombak konfigurasi dasar tanpa
    alasan teknis yang jelas.
-   Jangan mengubah konfigurasi prerendering atau menambahkan
    `force-dynamic` secara sembarangan. Pernah ada masalah uncached data
    pada route `/dashboard`; pendekatan terakhir yang dipilih adalah
    layout dashboard sederhana tanpa pemeriksaan session di layout,
    dengan pemeriksaan autentikasi pada API.
-   Jangan pernah meminta pengguna mengirim isi `.env`, `DATABASE_URL`,
    atau `BETTER_AUTH_SECRET`.

### Struktur Prisma yang perlu dipertahankan

Generator dan datasource:

``` prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Konfigurasi `prisma.config.ts` saat ini:

``` ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

**Peringatan:** pertahankan konfigurasi seed tersebut ketika mengedit
`prisma.config.ts`.

------------------------------------------------------------------------

## 3. Status Implementasi Saat Ini

Status berikut berdasarkan konfirmasi pengguna dalam percakapan proyek.
Jangan menganggap pekerjaan yang belum dikonfirmasi sebagai selesai.

### Fondasi aplikasi

-   [x] Setup Next.js, TypeScript, Tailwind, pnpm.
-   [x] Setup Prisma 7 dan PostgreSQL.
-   [x] Migrasi database awal berhasil.
-   [x] Prisma Client berhasil dibuat.
-   [x] Seed paket FREE dan PREMIUM berhasil.
-   [x] Integrasi Better Auth.
-   [x] Registrasi berhasil.
-   [x] Login berhasil.
-   [x] Logout berhasil.
-   [x] Dashboard dasar dapat dibuka.
-   [x] Dashboard mengambil data melalui `/api/dashboard`.
-   [x] Pembuatan profil dan subscription FREE otomatis saat user baru
    dibuat melalui Better Auth database hook.
-   [x] Fallback upsert profil dan subscription pada API dashboard untuk
    akun lama.
-   [x] Layout dashboard terakhir disederhanakan agar tidak memicu
    masalah prerendering.
-   [x] Pengguna mengonfirmasi kondisi terakhir aman tanpa error.

### Profil bisnis

-   [x] API profil: `src/app/api/profile/route.ts`.
-   [x] GET profil berdasarkan user yang sedang login.
-   [x] PUT untuk menyimpan profil.
-   [x] Halaman pengaturan: `src/app/settings/profile/page.tsx`.
-   [x] Nama bisnis.
-   [x] Email bisnis.
-   [x] Nomor telepon.
-   [x] Alamat bisnis bersifat opsional.
-   [x] NPWP bersifat opsional.
-   [x] Pengguna mengonfirmasi penyimpanan profil berjalan tanpa error,
    termasuk ketika alamat dan NPWP kosong.
-   [x] Menu Pengaturan Bisnis tersedia dari Dashboard dan dapat dibuka.

### Manajemen pelanggan (Customer CRUD)

-   [x] Model Customer diverifikasi pada schema Prisma.
-   [x] API daftar & pencarian: `GET /api/customers`.
-   [x] API tambah pelanggan: `POST /api/customers`.
-   [x] API detail pelanggan: `GET /api/customers/[id]`.
-   [x] API ubah pelanggan: `PUT /api/customers/[id]`.
-   [x] API hapus pelanggan: `DELETE /api/customers/[id]` dengan proteksi relasi dokumen.
-   [x] Validasi server-side (nama wajib, sanitasi string kosong).
-   [x] Isolasi data pelanggan berdasarkan user sesi.
-   [x] Halaman daftar pelanggan: `src/app/customers/page.tsx`.
-   [x] Fitur pencarian pelanggan instan.
-   [x] Modal form tambah dan edit pelanggan.
-   [x] Modal dialog konfirmasi hapus pelanggan.
-   [x] Menu navigasi Pelanggan pada Dashboard.
-   [x] Pengguna mengonfirmasi fitur berhasil.

### Manajemen invoice (Invoice CRUD)

-   [x] Model Document dan DocumentItem terkonfigurasi.
-   [x] API daftar & filter invoice: `GET /api/invoices`.
-   [x] API buat invoice: `POST /api/invoices` dengan penomoran otomatis `INV-YYYYMM-XXXX` dan kalkulasi server-side.
-   [x] API detail invoice: `GET /api/invoices/[id]`.
-   [x] API ubah invoice & status cepat: `PUT /api/invoices/[id]`.
-   [x] API hapus invoice: `DELETE /api/invoices/[id]` dengan proteksi status PAID.
-   [x] Halaman daftar invoice: `src/app/invoices/page.tsx` dengan filter status tab.
-   [x] Halaman buat invoice: `src/app/invoices/new/page.tsx` dengan baris item dinamis.
-   [x] Halaman detail invoice: `src/app/invoices/[id]/page.tsx` dengan kartu dokumen kertas & tombol aksi status.
-   [x] Halaman edit invoice: `src/app/invoices/[id]/edit/page.tsx`.
-   [x] Tampilan tema gelap (*Dark Theme*) seragam di seluruh halaman & komponen `AppShell`.
-   [x] Pengguna mengonfirmasi fitur berhasil.

### Manajemen quotation / penawaran (Quotation CRUD & Konversi)

-   [x] Model Document (`type: QUOTATION`) dan DocumentItem.
-   [x] API daftar & filter quotation: `GET /api/quotations` dengan pencarian dan filter status.
-   [x] API buat quotation: `POST /api/quotations` dengan nomor otomatis `QUO-YYYYMM-XXXX` (atau custom nomor).
-   [x] API detail quotation: `GET /api/quotations/[id]`.
-   [x] API ubah quotation: `PUT /api/quotations/[id]`.
-   [x] API konversi ke invoice: `POST /api/quotations/[id]/convert` dengan proteksi duplikasi konversi (`convertedToId`).
-   [x] API hapus quotation: `DELETE /api/quotations/[id]`.
-   [x] Halaman daftar penawaran: `src/app/quotations/page.tsx` dengan baris yang dapat diklik langsung.
-   [x] Halaman buat penawaran: `src/app/quotations/new/page.tsx` dengan baris item dinamis.
-   [x] Halaman detail penawaran: `src/app/quotations/[id]/page.tsx` dengan tombol konversi 1-klik ke invoice.
-   [x] Halaman edit penawaran: `src/app/quotations/[id]/edit/page.tsx`.
-   [x] Tombol kembali di kiri atas dan integrasi Sonner toast.
-   [x] Pengguna mengonfirmasi fitur berhasil.

### Dokumen PDF & Cetak (Invoice & Quotation)

-   [x] Format layout A4 standar bisnis (kop bisnis, identitas dokumen, tabel transaksi, rincian biaya, catatan pembayaran, kolom tanda tangan).
-   [x] Aturan styling media print (`@media print`) di `src/app/globals.css`.
-   [x] Halaman cetak / simpan PDF invoice: `src/app/invoices/[id]/print/page.tsx`.
-   [x] Halaman cetak / simpan PDF penawaran: `src/app/quotations/[id]/print/page.tsx`.
-   [x] Tombol aksi "Cetak / PDF" pada halaman detail invoice dan detail penawaran.
-   [x] Pengujian TypeScript & build produksi lolos tanpa error.

### Dashboard Statistik Riil & Pencatatan Pembayaran Invoice (Fase 6)

-   [x] Model Prisma Payment (`prisma/models/payment.prisma`) dengan relasi ke Document dan User.
-   [x] Sinkronisasi skema database (`prisma db push`) & generate Prisma Client.
-   [x] API Pencatatan Pembayaran: `GET` & `POST /api/invoices/[id]/payments` (validasi batas sisa tagihan, transaksi otomatis, status lunas otomatis bila terbayar penuh).
-   [x] Halaman Detail Invoice: perhitungan sisa tagihan, riwayat pembayaran diterima, tombol "Catat Pembayaran" di pojok kanan bawah, modal dialog interaktif.
-   [x] Dashboard Statistik Nyata (`/api/dashboard` & `src/app/dashboard/page.tsx`): 100% data riil tanpa mock, metrik Total Invoice, Pendapatan Riil (berdasarkan pencatatan pembayaran), Belum Dibayar, Penawaran Dibuat, dan daftar faktur menunggu pembayaran.
-   [x] Pengujian TypeScript & build produksi lolos tanpa error.

### Penyempurnaan Komponen UI (Number Field & Select Dropdown)

-   [x] Migrasi input number dari stepper Base UI ke `react-number-format` (`NumericFormat`) dengan pemisah ribuan otomatis tanpa tombol stepper.
-   [x] Migrasi seluruh elemen dropdown `<select>` bawaan HTML ke komponen Shadcn `Select` (pilihan pelanggan dan metode pembayaran).
-   [x] Pengujian TypeScript & build produksi lolos tanpa error.

### Monetisasi & Pembatasan Kuota Paket SaaS (Fase 7)

-   [x] Modul Kuota Global UTC (`src/lib/quota.ts`): kalkulasi kuota bulanan konsisten dan aman.
-   [x] Proteksi Kuota Server-Side: penolakan otomatis (HTTP 403) di `POST /api/invoices`, `POST /api/quotations`, dan `POST /api/quotations/[id]/convert` jika batas kuota Free (10 dokumen/bulan) tercapai.
-   [x] API Langganan & Upgrade: `GET` & `POST /api/subscription` (status paket aktif, daftar paket, upgrade 30 hari Premium, downgrade Free).
-   [x] Halaman Perbandingan Paket & Langganan: `src/app/pricing/page.tsx` dengan kartu komparasi Free vs Premium dan tombol aksi upgrade.
-   [x] Indikator Kuota & Alert di UI: badge paket di header Dashboard, banner alert kuota habis di Dashboard dan Form Buat Dokumen.
-   [x] Pengujian TypeScript & build produksi lolos tanpa error.

### Belum dikerjakan / belum dikonfirmasi

-   [ ] Upload logo bisnis.
-   [ ] Peluncuran MVP & Pengujian Akhir (Fase 8).
-   [ ] Integrasi webhook payment gateway eksternal otomatis (bila diputuskan terpasang).

------------------------------------------------------------------------

## 4. Master Feature Tree

### A. Fondasi aplikasi dan keamanan

-   [x] Setup proyek dan database.
-   [x] Registrasi, login, logout.
-   [x] Session dan autentikasi API.
-   [ ] Audit proteksi semua halaman dan endpoint.
-   [ ] Validasi input server-side secara konsisten.
-   [ ] Penanganan error dan pesan pengguna yang konsisten.
-   [ ] Rate limiting untuk endpoint sensitif.
-   [ ] Pengujian akses lintas akun: pengguna tidak boleh membaca atau
    mengubah data pengguna lain.

### B. Profil bisnis

-   [x] Lihat profil bisnis.
-   [x] Ubah profil bisnis.
-   [x] Nama bisnis, email, telepon, alamat, NPWP.
-   [ ] Upload dan pengelolaan logo.
-   [ ] Validasi format email, nomor telepon, dan batas panjang input.
-   [ ] Preview identitas bisnis yang akan tampil di dokumen.

### C. Manajemen pelanggan

-   [x] Tambah pelanggan.
-   [x] Daftar pelanggan.
-   [x] Detail pelanggan.
-   [x] Edit pelanggan.
-   [x] Hapus pelanggan dengan konfirmasi.
-   [x] Pencarian pelanggan.
-   [ ] Pagination jika daftar sudah panjang.
-   [x] Validasi data pelanggan.
-   [x] Isolasi data berdasarkan user pemilik.

Data pelanggan minimum yang disarankan: - Nama pelanggan atau nama
perusahaan. - Email (opsional). - Nomor telepon (opsional). - Alamat
(opsional). - NPWP (opsional, bila diperlukan).

### D. Manajemen invoice

-   [x] Membuat invoice untuk pelanggan.
-   [x] Nomor invoice otomatis dan unik.
-   [x] Tanggal penerbitan dan tanggal jatuh tempo.
-   [x] Memilih pelanggan tersimpan.
-   [x] Menambahkan beberapa item/baris.
-   [x] Nama/deskripsi item.
-   [x] Kuantitas.
-   [x] Harga satuan.
-   [x] Subtotal otomatis.
-   [x] Diskon.
-   [x] Pajak sesuai kebutuhan dan aturan yang berlaku.
-   [x] Total akhir otomatis.
-   [x] Catatan dan instruksi pembayaran.
-   [x] Status draft, sent, paid, overdue, cancelled (finalisasi enum
    sesuai kebutuhan).
-   [x] Daftar dan detail invoice.
-   [x] Edit invoice dengan aturan aman.
-   [x] Hapus atau batalkan invoice sesuai status.
-   [x] Tandai invoice lunas.
-   [ ] Riwayat perubahan/status.
-   [x] Filter dan pencarian invoice.

**Catatan perhitungan:** gunakan perhitungan server-side sebagai sumber
kebenaran. Jangan hanya mempercayai total yang dikirim browser. Tentukan
strategi penyimpanan nilai uang dan pembulatan secara konsisten sebelum
implementasi.

### E. Manajemen quotation / penawaran

-   [ ] Membuat quotation untuk pelanggan.
-   [ ] Nomor quotation otomatis dan unik.
-   [ ] Tanggal penerbitan dan masa berlaku.
-   [ ] Memilih pelanggan.
-   [ ] Item, kuantitas, harga, diskon, pajak, total.
-   [ ] Status draft, sent, accepted, rejected, expired.
-   [ ] Daftar dan detail quotation.
-   [ ] Edit dan hapus quotation dengan aturan status.
-   [ ] Konversi quotation yang diterima menjadi invoice.
-   [ ] Pastikan konversi tidak menggandakan dokumen ketika diulang.

### F. PDF dan dokumen

-   [x] Template PDF/Cetak invoice A4.
-   [x] Template PDF/Cetak quotation A4.
-   [x] Tampilan profesional, bersih, dan konsisten.
-   [x] Identitas bisnis, NPWP, dan kontak.
-   [x] Informasi lengkap pelanggan.
-   [x] Rincian item tabel, kalkulasi diskon, pajak, dan total.
-   [x] Download / Save as PDF melalui browser print engine.
-   [x] Preview dokumen resmi sebelum cetak/unduh (`/print`).
-   [x] Uji tampilan responsif desktop dan layout cetak.
-   [x] Proteksi elemen UI (sidebar & tombol otomatis sembunyi saat print).

### G. Pengiriman dan komunikasi

-   [ ] Link dokumen yang aman untuk pelanggan.
-   [ ] Email invoice.
-   [ ] Email quotation.
-   [ ] Pengingat jatuh tempo.
-   [ ] Template email yang dapat dipahami.
-   [ ] Catatan status pengiriman dan kegagalan pengiriman.

Fitur email dan pengingat dapat dikerjakan setelah alur dokumen inti
stabil.

### H. Dashboard dan laporan

-   [x] Total invoice.
-   [x] Total quotation.
-   [x] Invoice belum dibayar.
-   [x] Total pembayaran/pendapatan berdasarkan pembayaran yang
    tercatat.
-   [x] Ringkasan invoice jatuh tempo.
-   [ ] Grafik pendapatan.
-   [ ] Laporan bulanan.
-   [ ] Filter rentang tanggal.
-   [x] Pastikan semua angka dihitung dari data milik user yang sedang
    login.

### I. Pembayaran dan pencatatan transaksi pelanggan

-   [x] Catat pembayaran manual.
-   [x] Pembayaran sebagian.
-   [x] Sisa tagihan otomatis.
-   [x] Riwayat pembayaran.
-   [x] Metode pembayaran.
-   [x] Bukti atau referensi pembayaran (jika diperlukan).
-   [ ] Integrasi payment gateway untuk pembayaran invoice, bila
    tervalidasi kebutuhannya.

### J. Paket, kuota, dan monetisasi SaaS

-   [x] Model Plan.
-   [x] Model Subscription.
-   [x] Paket FREE dan PREMIUM di-seed.
-   [x] Definisikan aturan kuota secara eksplisit.
-   [x] Hitung penggunaan kuota berdasarkan periode yang tepat (waktu global UTC).
-   [x] Enforcement kuota di server/API, bukan hanya menyembunyikan tombol.
-   [x] Halaman perbandingan paket.
-   [x] Halaman upgrade.
-   [x] Aktivasi dan perpanjangan subscription (30 hari Premium).
-   [x] Penanganan subscription kedaluwarsa otomatis fallback ke Free.
-   [x] Pembatalan/downgrade langganan.
-   [ ] Integrasi payment gateway otomatis pihak ketiga (jika tervalidasi).
-   [x] Uji seluruh alur upgrade/downgrade.

Paket awal yang sudah ada di seed: - **FREE:** harga Rp0/bulan, batas 10
invoice dan 10 quotation, PDF export aktif, fitur premium tertentu tidak
aktif. - **PREMIUM:** harga awal Rp39.000/bulan, batas invoice dan
quotation tidak terbatas, fitur premium diaktifkan.

Harga dan benefit tersebut adalah konfigurasi awal proyek, belum
dianggap hasil validasi pasar. Pastikan aturan kuota dan fitur paket
konsisten antara database, backend, dan UI.

### K. Admin dan operasional

-   [ ] Role admin yang aman.
-   [ ] Dashboard admin.
-   [ ] Daftar dan detail pengguna.
-   [ ] Manajemen paket.
-   [ ] Monitoring subscription.
-   [ ] Monitoring transaksi.
-   [ ] Audit log untuk tindakan penting.
-   [ ] Pengaturan aplikasi.
-   [ ] Prosedur dukungan pelanggan.

### L. Persiapan peluncuran

-   [ ] Landing page yang menjelaskan manfaat produk.
-   [ ] Halaman harga.
-   [ ] Desain responsif mobile.
-   [ ] SEO dasar dan metadata.
-   [ ] Domain dan deployment production.
-   [ ] Environment variable production yang aman.
-   [ ] Backup database dan uji pemulihan.
-   [ ] Error monitoring dan logging.
-   [ ] Pengujian keamanan.
-   [ ] Pengujian alur end-to-end.
-   [ ] Terms of Service.
-   [ ] Privacy Policy.
-   [ ] Kontak bantuan.
-   [ ] Uji coba dengan pengguna awal.
-   [ ] Perbaikan berdasarkan feedback.
-   [ ] Peluncuran MVP.

------------------------------------------------------------------------

## 5. Urutan Pengerjaan yang Disepakati

Ikuti urutan ini sebagai jalur utama. Perubahan urutan harus memiliki
alasan, misalnya dependensi teknis atau risiko keamanan.

### Fase 1 --- Fondasi dan profil

**Status: sebagian besar selesai**

1.  Setup aplikasi, database, autentikasi.
2.  Dashboard dasar.
3.  Profil bisnis.
4.  Audit keamanan dasar dan proteksi data.

### Fase 2 --- Pelanggan

**Status: selesai (terkonfirmasi)**

1.  Periksa model `Customer` yang sudah ada di schema Prisma.
2.  Cocokkan field dan relasi dengan kebutuhan produk.
3.  Buat API daftar dan tambah pelanggan.
4.  Buat UI daftar dan form pelanggan.
5.  Tambahkan edit dan hapus.
6.  Tambahkan pencarian.
7.  Uji autentikasi dan isolasi data antar-user.

### Fase 3 --- Invoice

**Status: selesai (terkonfirmasi)**

1.  Finalisasi model dan relasi invoice.
2.  Buat API dan UI pembuatan invoice.
3.  Tambahkan item dan kalkulasi.
4.  Tambahkan nomor otomatis.
5.  Tambahkan status, edit, detail, dan daftar.
6.  Uji semua kalkulasi dan kepemilikan data.

### Fase 4 --- Quotation

**Status: selesai (terkonfirmasi)**

1.  Buat alur quotation.
2.  Gunakan kembali komponen pelanggan dan item bila sesuai.
3.  Tambahkan status dan masa berlaku.
4.  Buat konversi quotation menjadi invoice.
5.  Uji agar konversi tidak membuat duplikasi.

### Fase 5 --- PDF

**Status: selesai (menunggu konfirmasi pengujian)**

1.  Tentukan desain dokumen profesional siap cetak/unduh.
2.  Buat fitur Cetak / Download PDF untuk invoice.
3.  Buat fitur Cetak / Download PDF untuk quotation.
4.  Sertakan informasi profil bisnis, detail pelanggan, dan rincian transaksi lengkap.
5.  Uji tampilan print & hasil dokumen PDF A4 (tampilan bersih, hemat tinta, tanpa elemen UI/sidebar).

### Fase 6 --- Dashboard dan pembayaran

**Status: selesai (menunggu konfirmasi pengujian)**

1.  Hubungkan statistik ke data nyata.
2.  Catat pembayaran invoice (manual payment logging).
3.  Tampilkan tagihan yang belum lunas.
4.  Tambahkan ringkasan/laporan dasar.

### Fase 7 --- Monetisasi

**Status: selesai (menunggu konfirmasi pengujian)**

1.  Terapkan kuota FREE di server berbasis waktu global UTC (10 invoice & 10 penawaran/bulan).
2.  Buat halaman perbandingan harga & paket (/pricing).
3.  Buat upgrade PREMIUM (30 hari akses unlimited).
4.  Indikator status kuota & alert di dashboard dan form dokumen.
5.  Uji kondisi upgrade, penolakan saat batas kuota tercapai, dan downgrade.

### Fase 8 --- Peluncuran MVP

**Status: sedang berjalan**

1.  [x] Landing page modern (`/`) dan halaman legal (`/terms`, `/privacy`).
2.  Audit responsivitas menyeluruh di perangkat mobile, tablet, dan desktop.
3.  Pengujian end-to-end dan keamanan (Pelanggan → Penawaran → Konversi Invoice → Cetak PDF → Pembayaran → Kuota/Upgrade).
4.  Backup, monitoring, deployment produksi.
5.  Uji coba pengguna awal.
6.  Rilis dan kumpulkan feedback.

### Fase 9 --- Pengembangan setelah MVP

-   Email otomatis.
-   Pengingat pembayaran.
-   Laporan lanjutan.
-   Dashboard admin.
-   Fitur premium tambahan.
-   Integrasi lain berdasarkan kebutuhan pelanggan.

------------------------------------------------------------------------

## 6. Aturan Kerja untuk AI Agent

Dokumen ini dapat diberikan kepada AI coding agent sebagai konteks
proyek. Agent wajib mengikuti aturan berikut.

### Cara bekerja

1.  Baca dokumen ini sebelum mengubah kode.
2.  Periksa struktur file dan kode aktual sebelum mengedit. Jangan
    mengasumsikan isi file sama dengan contoh atau percakapan lama.
3.  Kerjakan **satu langkah kecil atau satu fitur pada satu waktu**.
4.  Sebelum mengubah database, periksa seluruh schema terkait, relasi,
    migration, dan seed.
5.  Pertahankan arsitektur dan pola kode yang sudah berjalan.
6.  Jangan melakukan refactor besar atau mengganti stack tanpa
    persetujuan.
7.  Berikan instruksi file-per-file yang jelas untuk pengguna pemula.
8.  Jelaskan perintah terminal yang harus dijalankan dan direktori
    tempat menjalankannya.
9.  Jangan mengklaim berhasil sebelum pengguna menjalankan dan
    mengonfirmasi hasilnya.
10. Setelah setiap langkah, tunggu konfirmasi pengguna sebelum
    melanjutkan ke langkah berikutnya.

### Standar keamanan dan kualitas

-   Semua data bisnis harus terikat pada user pemilik.
-   Semua endpoint privat harus memeriksa session di server.
-   Jangan mempercayai `userId` dari request body untuk menentukan
    kepemilikan data; ambil identitas user dari session.
-   Setiap query baca/tulis data pelanggan dan dokumen harus membatasi
    akses berdasarkan user yang sedang login.
-   Validasi input di server.
-   Tangani input kosong sesuai aturan field. Field opsional harus tetap
    boleh kosong.
-   Jangan mengirim secret atau kredensial ke browser.
-   Jangan meminta pengguna membagikan file `.env` atau secret.
-   Gunakan transaksi database untuk operasi multi-tabel yang harus
    konsisten.
-   Jangan menghapus data atau migration tanpa memahami dampaknya.
-   Jangan mengubah konfigurasi Next.js prerendering secara spekulatif.
-   Jalankan pemeriksaan yang sesuai setelah perubahan, misalnya
    TypeScript/build, Prisma validate/generate, migration, dan pengujian
    manual. Pilih perintah yang cocok dengan kondisi proyek aktual.
-   Jika muncul error, fokus memperbaiki error tersebut sebelum menambah
    fitur lain.

### Pola interaksi yang disukai pengguna

-   Gunakan Bahasa Indonesia informal dan jelas.
-   Pengguna masih pemula dalam coding.
-   Berikan satu instruksi konkret pada satu waktu, bukan daftar
    perubahan besar sekaligus.
-   Sebutkan path file lengkap.
-   Jika perlu mengganti file, berikan kode lengkap dan jelaskan bahwa
    isi file tersebut diganti.
-   Setelah langkah selesai, minta pengguna mengonfirmasi apakah aman
    atau ada error.
-   Jangan mengulang langkah yang sudah berhasil dikonfirmasi tanpa
    alasan.

------------------------------------------------------------------------

## 7. Langkah Berikutnya yang Aktif

**Fitur berikutnya: Fase 8 — Langkah 2: Audit Responsivitas & Penyempurnaan Tampilan Multi-Perangkat (Mobile/Tablet/Desktop).**

Langkah-langkah terencana:
1. [x] Landing page produk dan halaman legal / terms of service.
2. Audit responsivitas menyeluruh di perangkat mobile, tablet, dan desktop.
3. Pengujian end-to-end dan audit keamanan menyeluruh (Pelanggan → Penawaran → Konversi Invoice → Cetak PDF → Pembayaran → Kuota/Upgrade).
4. Penyiapan backup, monitoring, dan deployment produksi.

------------------------------------------------------------------------

## 8. Definition of Done

Sebuah fitur hanya boleh ditandai selesai jika:

-   [ ] Implementasi backend selesai.
-   [ ] UI berfungsi sesuai kebutuhan.
-   [ ] Validasi input berjalan.
-   [ ] Autentikasi dan otorisasi diuji.
-   [ ] Data tersimpan dan terbaca dengan benar.
-   [ ] Kondisi input kosong dan error ditangani.
-   [ ] Tidak ada error TypeScript/build yang diketahui.
-   [ ] Pengguna sudah menguji dan mengonfirmasi hasilnya.

Jangan mencentang fitur hanya karena kode sudah ditulis.

------------------------------------------------------------------------

## 9. Catatan Perubahan Roadmap

Saat roadmap berubah:

1.  Naikkan versi dokumen bila perubahan cukup besar.
2.  Perbarui tanggal pembaruan.
3.  Tandai fitur selesai hanya berdasarkan hasil yang sudah diuji.
4.  Catat keputusan arsitektur penting dan alasannya.
5.  Simpan ide baru di bagian backlog sebelum mengubah urutan prioritas.
6.  Pastikan langkah berikutnya selalu ditulis jelas.

**Prioritas tetap:** bangun MVP yang stabil, aman, mudah dipakai, dan
dapat diuji dengan pelanggan nyata. Hindari menghabiskan waktu pada
fitur tambahan sebelum alur pelanggan → invoice/quotation → PDF →
monetisasi bekerja dengan baik.
