"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Buildings, 
  Plus, 
  SignOut, 
  SquaresFour, 
  Scan, 
  ListChecks, 
  Gear 
} from "@phosphor-icons/react";
import Cookies from "js-cookie";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [balance, setBalance] = useState(7500000);
  
  // Nanti balance bisa ditarik dari API global settings/user
  useEffect(() => {
    // Simulasi load balance dari global state jika ada
  }, []);

  const menuItemsDesktop = [
    { name: "Dashboard", href: "/campus-admin" },
    { name: "Input Konversi", href: "/campus-admin/input-konversi" },
    { name: "Hasil Konversi", href: "/campus-admin/conversions" },
    { name: "Laporan", href: "/campus-admin/laporan" },
    { name: "Pengaturan", href: "/campus-admin/settings" },
  ];

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      Cookies.remove('token');
      Cookies.remove('user_role');
      Cookies.remove('user_univ');
      
      toast.success("Anda berhasil keluar.");
      router.push('/login');
    }
  };

  const TopUpButton = () => {
    toast.info("Fitur Top Up sedang dalam pengembangan");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-600 overflow-x-hidden pb-20 lg:pb-0">
      
      {/* Header (Desktop & Mobile Optimized) */}
      <nav className="fixed w-full z-50 bg-[#094E8B] text-white shadow-lg no-print transition-all duration-300">
        <div className="w-full px-4 py-3 lg:px-6 lg:py-4 flex justify-between items-center gap-4">
          
          {/* Brand / Logo */}
          <Link href="/campus-admin" className="flex items-center gap-3 cursor-pointer">
            <div className="bg-white p-1 rounded-lg w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center overflow-hidden shrink-0">
              <Buildings weight="bold" className="text-[#094E8B] text-lg lg:text-xl" />
            </div>
            <div className="border-l border-white/20 pl-3">
              <h1 className="font-heading font-medium text-base lg:text-lg leading-none uppercase tracking-tighter text-white truncate max-w-[150px] lg:max-w-none">
                KonverPro
              </h1>
              <span className="text-[8px] lg:text-[9px] uppercase tracking-[0.2em] text-blue-200 block mt-0.5 lg:mt-1 font-medium">
                Higher Ed Admin
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-6 overflow-x-auto no-scrollbar py-2 text-white font-bold text-xs uppercase tracking-wide">
            {menuItemsDesktop.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`transition-colors duration-200 hover:text-amber-500 border-b-2 px-1 whitespace-nowrap ${
                    isActive ? "text-amber-500 border-amber-500" : "border-transparent"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <div 
              className="bg-white/10 pl-3 pr-1.5 py-1 lg:pl-5 lg:pr-2 lg:py-1.5 rounded-xl flex items-center gap-2 lg:gap-4 border border-white/10 cursor-pointer hover:bg-white/20 transition group" 
              onClick={TopUpButton}
            >
              <div className="text-right">
                <p className="text-[8px] uppercase font-black text-blue-200 opacity-60 leading-none mb-0.5 lg:mb-1">Saldo</p>
                <p className="text-xs lg:text-sm font-bold text-white group-hover:text-amber-500 transition-colors">
                  Rp {balance.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="w-7 h-7 lg:w-9 lg:h-9 bg-amber-400 text-[#094E8B] rounded-lg flex items-center justify-center shadow-lg text-xs lg:text-sm">
                <Plus weight="bold" />
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-lg" 
              title="Keluar"
            >
              <SignOut weight="bold" className="text-lg" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (Superapp Style) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 z-[60] flex justify-between items-end px-6 pb-4 pt-2 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] no-print pb-safe">
        <Link 
          href="/campus-admin" 
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${pathname === '/campus-admin' ? 'text-[#001a33] font-black' : 'text-slate-400 hover:text-[#094E8B]'}`}
        >
          <SquaresFour weight="bold" className={`text-2xl mb-0.5 ${pathname === '/campus-admin' ? 'text-amber-500' : ''}`} />
          <span className="text-[9px] font-bold tracking-wide">Home</span>
        </Link>
        <Link 
          href="/campus-admin/input-konversi" 
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${pathname === '/campus-admin/input-konversi' ? 'text-[#001a33] font-black' : 'text-slate-400 hover:text-[#094E8B]'}`}
        >
          <div className="w-12 h-12 bg-[#094E8B] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/40 -mt-6 border-4 border-slate-50 transform active:scale-95 transition-transform">
            <Scan weight="bold" className="text-2xl" />
          </div>
          <span className="text-[9px] font-bold tracking-wide mt-1">Scan</span>
        </Link>
        <Link 
          href="/campus-admin/conversions" 
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${pathname === '/campus-admin/conversions' ? 'text-[#001a33] font-black' : 'text-slate-400 hover:text-[#094E8B]'}`}
        >
          <ListChecks weight="bold" className={`text-2xl mb-0.5 ${pathname === '/campus-admin/conversions' ? 'text-amber-500' : ''}`} />
          <span className="text-[9px] font-bold tracking-wide">Hasil</span>
        </Link>
        <Link 
          href="/campus-admin/settings" 
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${pathname === '/campus-admin/settings' ? 'text-[#001a33] font-black' : 'text-slate-400 hover:text-[#094E8B]'}`}
        >
          <Gear weight="bold" className={`text-2xl mb-0.5 ${pathname === '/campus-admin/settings' ? 'text-amber-500' : ''}`} />
          <span className="text-[9px] font-bold tracking-wide">Akun</span>
        </Link>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 pt-24 lg:pt-32 px-4 lg:px-6 w-full max-w-[1500px] mx-auto pb-8 lg:pb-6 animate-fade-in-quick">
        {children}
      </main>
      
      <footer className="w-full py-6 text-center text-[10px] font-bold uppercase text-slate-400 no-print mb-16 lg:mb-0">
        &copy; 2025 KonverPro, PT Rajo Net Indonesia
      </footer>
    </div>
  );
}