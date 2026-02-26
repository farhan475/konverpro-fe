import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO & MENU KIRI */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-600/20">
              K
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-xl text-brand-900 tracking-tight leading-none">KonverPro</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Campus Marketplace</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" className="text-brand-600 font-semibold" asChild>
              <Link href="/">Beranda</Link>
            </Button>
            <Button variant="ghost" className="text-slate-600 hover:text-brand-600 font-semibold" asChild>
              <Link href="#kampus">Mitra Kampus</Link>
            </Button>
            <Button variant="ghost" className="text-slate-600 hover:text-brand-600 font-semibold" asChild>
              <Link href="#prosedur">Cara Kerja</Link>
            </Button>
          </div>
        </div>

        {/* TOMBOL KANAN */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-brand-600 hover:text-brand-800 hover:bg-brand-50 hidden sm:flex gap-2 font-bold" asChild>
            <Link href="/login"><LogIn className="w-4 h-4" /> Masuk</Link>
          </Button>
          <Button className="bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-600/20 px-6" asChild>
            <Link href="/login">Daftar Mitra</Link>
          </Button>
        </div>

      </div>
    </nav>
  );
}