import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; // GANTI FONT DI SINI
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Konfigurasi Font
const jakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: "KonverPro | Marketplace Konversi Kampus",
  description: "Transfer Kredit Kuliah Lebih Cepat & Transparan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${jakartaSans.variable} font-sans antialiased text-slate-600 bg-slate-50 min-h-screen flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}