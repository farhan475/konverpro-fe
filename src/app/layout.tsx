import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // <--- 1. Import ini

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KonverPro",
  description: "Sistem Konversi SKS Kampus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster /> {/* <--- 2. Pasang komponen ini di sini */}
      </body>
    </html>
  );
}