"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Buildings,
  ChartBar,
  GraduationCap,
  Gear,
  House,
  Money,
  ShieldCheck,
  Users,
  ClipboardText,
  Database,
} from "@phosphor-icons/react";

export const superAdminNavItems = [
  { href: "/super-admin", label: "Overview", icon: House },
  { href: "/super-admin/campuses", label: "Manajemen Kampus", icon: Buildings },
  { href: "/super-admin/konversi", label: "Data Konversi", icon: GraduationCap },
  { href: "/super-admin/finance", label: "Top Up & Saldo", icon: Money },
  { href: "/super-admin/income", label: "Report Pemasukan", icon: ChartBar },
  { href: "/super-admin/users", label: "Manajemen User", icon: Users },
  { href: "/super-admin/settings", label: "Config Global", icon: Gear },
  { href: "/super-admin/notification-templates", label: "Template Notifikasi", icon: Bell },
  { href: "/super-admin/audit-logs", label: "Audit Logs", icon: ClipboardText },
  { href: "/super-admin/system", label: "Backup & Restore", icon: Database },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[320px] shrink-0 border-r border-white/5 bg-[#031f37] text-white xl:flex xl:flex-col">
      <div className="relative overflow-hidden border-b border-white/5 px-8 py-8">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#094E8B] shadow-lg shadow-black/20">
            <ShieldCheck size={24} weight="fill" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/70">
              KonverPro
            </p>
            <h1 className="text-lg font-black text-white">Central Control</h1>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              Super Admin Workspace
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-6 rounded-[1.6rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
            Control Scope
          </p>
          <p className="mt-2 text-sm font-black text-white">
            Kampus, top up, user, audit, dan konfigurasi pusat.
          </p>
        </div>
      </div>

      <nav className="space-y-2 px-4 py-6">
        {superAdminNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                active
                  ? "bg-white text-[#031f37] shadow-lg shadow-black/10"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={20} weight="bold" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-6">
        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">
            Central Note
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Jadikan panel ini sebagai ruang pantau utama untuk kampus partner,
            approval top up, dan kualitas operasional ekosistem KonverPro.
          </p>
        </div>
      </div>
    </aside>
  );
}
