"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Buildings,
  BookOpen,
  Plus,
  SignOut,
  SquaresFour,
  Scan,
  ListChecks,
  Gear,
  ShieldCheck,
} from "@phosphor-icons/react";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import axios from "@/lib/axios";
import { campusLogoLoader, getStoredCampusLogo } from "@/lib/campusBranding";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [balance, setBalance] = useState(0);
  const [campusLogo, setCampusLogo] = useState<string | null>(null);
  const [campusName, setCampusName] = useState("KonverPro");

  useEffect(() => {
    let isMounted = true;

    const loadHeaderContext = async () => {
      try {
        const response = await axios.get("/campus/settings/profile");
        if (isMounted) {
          const remoteLogo = (response.data?.data?.logo_path as string | undefined) ?? null;
          const storedLogo = getStoredCampusLogo();
          const profileName =
            (response.data?.data?.name as string | undefined)?.trim() || null;

          setBalance(Number(response.data?.data?.balance ?? 0));
          setCampusLogo(storedLogo ?? remoteLogo);
          setCampusName(profileName ?? "KonverPro");
        }
      } catch (error) {
        console.error("Failed to load campus balance", error);
      }
    };

    void loadHeaderContext();

    return () => {
      isMounted = false;
    };
  }, []);

  const menuItemsDesktop = [
    { name: "Dashboard", href: "/campus-admin" },
    { name: "Kurikulum", href: "/campus-admin/curriculum" },
    { name: "Akad Settings", href: "/campus-admin/akad-settings" },
    { name: "Input Konversi", href: "/campus-admin/input-konversi" },
    { name: "Hasil Konversi", href: "/campus-admin/conversions" },
    { name: "Laporan", href: "/campus-admin/laporan" },
    { name: "Pengaturan", href: "/campus-admin/settings" },
  ];

  const isRouteActive = (href: string) => {
    if (href === "/campus-admin") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isSettingsShortcutActive =
    pathname === "/campus-admin/settings" ||
    pathname.startsWith("/campus-admin/settings/") ||
    pathname.startsWith("/campus-admin/akad-settings");

  const activeSection =
    menuItemsDesktop.find((item) => isRouteActive(item.href))?.name ??
    "Dashboard";

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
    router.push("/campus-admin/settings?tab=billing");
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 font-sans text-slate-600 pb-20 lg:pb-0">
      
      {/* Header (Desktop & Mobile Optimized) */}
      <nav className="fixed z-50 w-full border-b border-white/10 bg-[#094E8B] text-white shadow-[0_18px_50px_rgba(3,31,55,0.22)] no-print transition-all duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(253,216,36,0.16),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.06),_transparent_32%)]" />
        <div className="w-full px-4 py-3 lg:px-6 lg:py-4 flex justify-between items-center gap-4">
          
          {/* Brand / Logo */}
          <Link href="/campus-admin" className="relative z-10 flex items-center gap-3 cursor-pointer">
            <div className="bg-white p-1 rounded-lg w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center overflow-hidden shrink-0">
              {campusLogo ? (
                <Image
                  loader={campusLogoLoader}
                  unoptimized
                  src={campusLogo}
                  alt="Logo kampus"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Buildings weight="bold" className="text-[#094E8B] text-lg lg:text-xl" />
              )}
            </div>
            <div className="border-l border-white/20 pl-3">
              <h1 className="font-heading font-medium text-base lg:text-lg leading-none uppercase tracking-tighter text-white truncate max-w-[150px] lg:max-w-none">
                {campusName}
              </h1>
              <span className="text-[8px] lg:text-[9px] uppercase tracking-[0.2em] text-blue-200 block mt-0.5 lg:mt-1 font-medium">
                Higher Ed Admin
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <div className="relative z-10 hidden items-center gap-6 overflow-x-auto no-scrollbar py-2 text-white font-bold text-xs uppercase tracking-wide lg:flex">
            {menuItemsDesktop.map((item) => {
              const isActive = isRouteActive(item.href);
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
          <div className="relative z-10 flex items-center gap-2 lg:gap-4">
            <div className="hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-right lg:block">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-100/60">
                Active Section
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                {activeSection}
              </p>
            </div>
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
            <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-blue-50">
              <ShieldCheck weight="fill" className="text-amber-400" />
              Campus Control
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
          href="/campus-admin/curriculum" 
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${pathname === '/campus-admin/curriculum' || pathname.startsWith('/campus-admin/curriculum/') ? 'text-[#001a33] font-black' : 'text-slate-400 hover:text-[#094E8B]'}`}
        >
          <BookOpen weight="bold" className={`text-2xl mb-0.5 ${pathname === '/campus-admin/curriculum' || pathname.startsWith('/campus-admin/curriculum/') ? 'text-amber-500' : ''}`} />
          <span className="text-[9px] font-bold tracking-wide">Kuri</span>
        </Link>
        <Link 
          href="/campus-admin/conversions" 
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${pathname === '/campus-admin/conversions' || pathname.startsWith('/campus-admin/conversions/') ? 'text-[#001a33] font-black' : 'text-slate-400 hover:text-[#094E8B]'}`}
        >
          <ListChecks weight="bold" className={`text-2xl mb-0.5 ${pathname === '/campus-admin/conversions' || pathname.startsWith('/campus-admin/conversions/') ? 'text-amber-500' : ''}`} />
          <span className="text-[9px] font-bold tracking-wide">Hasil</span>
        </Link>
        <Link 
          href="/campus-admin/settings" 
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${isSettingsShortcutActive ? 'text-[#001a33] font-black' : 'text-slate-400 hover:text-[#094E8B]'}`}
        >
          <Gear weight="bold" className={`text-2xl mb-0.5 ${isSettingsShortcutActive ? 'text-amber-500' : ''}`} />
          <span className="text-[9px] font-bold tracking-wide">Akun</span>
        </Link>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="relative flex-1 px-4 pt-24 pb-8 lg:px-6 lg:pt-32 lg:pb-6">
        <div className="mx-auto w-full max-w-[1500px] animate-fade-in-quick">
          <div className="absolute inset-x-0 top-24 -z-10 mx-auto hidden h-64 max-w-[1500px] rounded-full bg-[radial-gradient(circle_at_top,_rgba(9,78,139,0.08),_transparent_65%)] blur-3xl lg:block" />
          {children}
        </div>
      </main>
      
      <footer className="w-full py-6 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 no-print mb-16 lg:mb-0">
        &copy; 2025 KonverPro, PT Rajo Net Indonesia
      </footer>
    </div>
  );
}
