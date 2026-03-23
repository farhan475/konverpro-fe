"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "@phosphor-icons/react";

import {
  isSuperAdminNavItemActive,
  superAdminNavSections,
} from "../config/navigation";

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

      <nav className="space-y-5 px-4 py-6">
        {superAdminNavSections.map((section) => (
          <div key={section.label}>
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/45">
              {section.label}
            </p>
            <div className="mt-3 space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isSuperAdminNavItemActive(pathname, item.href);

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
            </div>
          </div>
        ))}
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
