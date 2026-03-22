"use client";

import { ShieldCheck, SignOut } from "@phosphor-icons/react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { logoutRequest } from "../api";
import { getErrorMessage } from "../utils";

interface SuperAdminHeaderProps {
  userName?: string;
}

export default function SuperAdminHeader({
  userName = "Administrator",
}: SuperAdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutRequest();
      toast.success("Berhasil logout.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal logout."));
    } finally {
      Cookies.remove("token");
      Cookies.remove("user_role");
      Cookies.remove("user_univ");
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-slate-50/85 px-6 py-5 backdrop-blur-md md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Panel Kontrol
          </p>
          <h2 className="mt-1 text-base font-black text-[#001a33] md:text-lg">
            Halo, {userName}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Pusat kendali kampus partner, transaksi, user, dan konfigurasi global.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 md:inline-flex">
            <ShieldCheck size={16} weight="fill" className="text-brand-700" />
            Super Control Active
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
          >
            <SignOut size={18} weight="bold" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
