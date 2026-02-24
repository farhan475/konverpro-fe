"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Settings, LogOut, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import axios from "@/lib/axios";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", href: "/campus-admin", icon: LayoutDashboard },
    { name: "Validasi Konversi", href: "/campus-admin/conversions", icon: FileText },
    { name: "Kurikulum", href: "/campus-admin/curriculum", icon: GraduationCap },
    { name: "Pengaturan", href: "/campus-admin/settings", icon: Settings }, // Settings ini nanti bisa kita buat
  ];

  // FUNGSI LOGOUT
  const handleLogout = async () => {
    try {
      // 1. Tembak API Logout di Laravel agar token di database dimatikan
      await axios.post('/logout');
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      // 2. Hapus semua data kredensial dari browser
      Cookies.remove('token');
      Cookies.remove('user_role');
      Cookies.remove('user_univ');
      
      toast.success("Anda berhasil keluar.");
      
      // 3. Arahkan kembali ke halaman login
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full hidden md:flex flex-col z-50">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">K</div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">KonverPro</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}>
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
            <p className="text-xs text-slate-400 mb-1">Login sebagai:</p>
            <p className="text-sm font-bold text-white truncate">Admin Kampus</p>
            <p className="text-[10px] text-slate-500 truncate">Sesi Aktif</p>
          </div>
          {/* TOMBOL LOGOUT SEKARANG AKTIF */}
          <Button 
            variant="destructive" 
            className="w-full justify-start gap-2 pl-4 bg-red-600/90 hover:bg-red-600"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Keluar
          </Button>
        </div>
      </aside>

      {/* MOBILE HEADER (muncul saat layar kecil) */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white p-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">KonverPro</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300">
          <LogOut className="w-4 h-4 mr-2" /> Keluar
        </Button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-20 md:pt-8 w-full min-w-0">
        {children}
      </main>
    </div>
  );
}