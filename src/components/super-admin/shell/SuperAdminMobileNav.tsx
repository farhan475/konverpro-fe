"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { superAdminNavItems } from "./SuperAdminSidebar";

export default function SuperAdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md xl:hidden">
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {superAdminNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                active
                  ? "border-[#031f37] bg-[#031f37] text-white shadow-lg shadow-[#031f37]/20"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Icon size={16} weight="bold" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
