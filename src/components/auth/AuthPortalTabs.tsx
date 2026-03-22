"use client";

import { Buildings, ShieldCheck } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

import type { PortalMode } from "./portal-config";

interface AuthPortalTabsProps {
  mode: PortalMode;
  onChange: (mode: PortalMode) => void;
}

const options: Array<{
  mode: PortalMode;
  label: string;
  description: string;
  icon: typeof Buildings;
}> = [
  {
    mode: "campus_admin",
    label: "Admin Kampus",
    description: "Konversi, kurikulum, laporan",
    icon: Buildings,
  },
  {
    mode: "super_admin",
    label: "Super Admin",
    description: "Mitra, saldo, kontrol global",
    icon: ShieldCheck,
  },
];

export default function AuthPortalTabs({
  mode,
  onChange,
}: AuthPortalTabsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-[1.8rem] border border-slate-200 bg-slate-100/80 p-2 sm:grid-cols-2">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.mode === mode;

        return (
          <button
            key={option.mode}
            type="button"
            onClick={() => onChange(option.mode)}
            className={cn(
              "rounded-[1.4rem] border px-4 py-4 text-left transition-all",
              isActive
                ? "border-brand-900 bg-brand-900 text-white shadow-xl shadow-brand-900/20"
                : "border-transparent bg-white text-slate-500 hover:border-brand-100 hover:bg-brand-50/60 hover:text-brand-900",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors",
                  isActive
                    ? "border-white/10 bg-white/10 text-accent-500"
                    : "border-slate-200 bg-slate-50 text-brand-700",
                )}
              >
                <Icon size={22} weight={isActive ? "fill" : "duotone"} />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">
                  {option.label}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs leading-relaxed",
                    isActive ? "text-white/70" : "text-slate-400",
                  )}
                >
                  {option.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
