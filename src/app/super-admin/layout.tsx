"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Wallet, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import axios from "@/lib/axios";
import { toast } from "sonner";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      console.error(error);
    } finally {
      Cookies.remove('token');
      Cookies.remove('user_role');
      Cookies.remove('user_univ');
      toast.success("Anda berhasil keluar.");
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-blue-900 text-white fixed h-full hidden md:flex flex-col z-50">
        <div className="p-6 border-b border-blue-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-blue-900 text-lg">K</div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">KonverPro</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest">Super Central</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-black uppercase text-blue-300 tracking-widest px-4 mb-2 mt-2">Main Menu</div>
          <Link href="/super-admin">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === '/super-admin' ? "bg-white text-blue-900 shadow-lg font-bold" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <LayoutDashboard className="w-5 h-5" /> Overview
            </div>
          </Link>
          <Link href="/super-admin/kampus">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/super-admin/kampus') ? "bg-white text-blue-900 shadow-lg font-bold" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <Building2 className="w-5 h-5" /> Manajemen Kampus
            </div>
          </Link>
          <Link href="/super-admin/konversi">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/super-admin/konversi') ? "bg-white text-blue-900 shadow-lg font-bold" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <LayoutDashboard className="w-5 h-5" /> Data Konversi
            </div>
          </Link>

          <div className="text-[10px] font-black uppercase text-blue-300 tracking-widest px-4 mb-2 mt-6">Keuangan & User</div>
          <Link href="/super-admin/finance">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/super-admin/finance') ? "bg-white text-blue-900 shadow-lg font-bold" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <Wallet className="w-5 h-5" /> Top Up & Saldo
            </div>
          </Link>
          <Link href="/super-admin/income">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/super-admin/income') ? "bg-white text-blue-900 shadow-lg font-bold" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <LayoutDashboard className="w-5 h-5" /> Report Pemasukan
            </div>
          </Link>
          <Link href="/super-admin/users">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/super-admin/users') ? "bg-white text-blue-900 shadow-lg font-bold" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <Users className="w-5 h-5" /> Manajemen User
            </div>
          </Link>

          <div className="text-[10px] font-black uppercase text-blue-300 tracking-widest px-4 mb-2 mt-6">System Control</div>
          <Link href="/super-admin/settings">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/super-admin/settings') ? "bg-white text-blue-900 shadow-lg font-bold" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <LayoutDashboard className="w-5 h-5" /> Config Global
            </div>
          </Link>
          <Link href="/super-admin/audit">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/super-admin/audit') ? "bg-white text-blue-900 shadow-lg font-bold" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <LayoutDashboard className="w-5 h-5" /> Audit Log
            </div>
          </Link>
          <Link href="/super-admin/notifikasi">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/super-admin/notifikasi') ? "bg-white text-blue-900 shadow-lg font-bold" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <LayoutDashboard className="w-5 h-5" /> Notifikasi
            </div>
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <Button variant="destructive" className="w-full justify-start gap-2 bg-red-500 hover:bg-red-600" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Keluar Sistem
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-8 w-full min-w-0">
        {children}
      </main>
    </div>
  );
}