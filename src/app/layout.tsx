import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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
      <body className="font-sans antialiased text-slate-600 bg-slate-50 min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
