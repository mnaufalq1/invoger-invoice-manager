import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvoGer - Aplikasi Invoice & Penawaran Bisnis Cepat dan Profesional",
  description: "Buat invoice, penawaran harga (quotation), kelola pelanggan, dan catat pembayaran bisnis Anda dalam hitungan detik.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0c0d12] text-zinc-100">
        {children}
        <Toaster theme="dark" richColors closeButton position="top-center" duration={3000} />
      </body>
    </html>
  );
}
