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

<nav className="flex-1 p-4 space-y-2">
          {/* Menu Kampus */}
          <Link href="/super-admin">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              pathname === '/super-admin' ? "bg-white text-blue-900 shadow-lg" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <Building2 className="w-5 h-5" /> Manajemen Kampus
            </div>
          </Link>
          
          {/* Menu User (BARU) */}
          <Link href="/super-admin/users">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              pathname === '/super-admin/users' ? "bg-white text-blue-900 shadow-lg" : "text-blue-200 hover:text-white hover:bg-blue-800"
            }`}>
              <Users className="w-5 h-5" /> Manajemen User
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