import Link from "next/link";
import { LogIn } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-600/20">K</div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-xl text-brand-900 tracking-tight leading-none">KonverPro</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Campus Marketplace</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition">Beranda</Link>
            <Link href="#kampus" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition">Kampus</Link>
            <Link href="#prosedur" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition">Cara Kerja</Link>
            <Link href="#simulation-area" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition">Cari Prodi</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-800 transition px-4 py-2 rounded-lg hover:bg-brand-50">
            <LogIn className="w-4 h-4" /> Masuk
          </Link>
          <Link href="/register" className="px-5 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
            Daftar Mitra
          </Link>
        </div>
      </div>
    </nav>
  );
}