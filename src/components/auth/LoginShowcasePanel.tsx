import Link from "next/link";
import {
  ArrowLeft,
  Buildings,
  ChartBar,
  GearSix,
  Scan,
  Sparkle,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

import { portalConfigs, type PortalMode } from "./portal-config";

interface LoginShowcasePanelProps {
  mode: PortalMode;
}

const iconMap = {
  scan: Scan,
  chart: ChartBar,
  wallet: Wallet,
  buildings: Buildings,
  users: UsersThree,
  gear: GearSix,
} as const;

export default function LoginShowcasePanel({
  mode,
}: LoginShowcasePanelProps) {
  const config = portalConfigs[mode];

  return (
    <aside className="relative hidden overflow-hidden bg-brand-900 px-10 py-12 text-white lg:flex lg:min-h-[780px] lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(253,216,36,0.22),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_30%)]" />
      <div className="absolute -left-16 bottom-10 h-40 w-40 rounded-full bg-sky-300/10 blur-3xl" />
      <div className="absolute -right-12 top-24 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={16} weight="bold" />
          Kembali ke Landing
        </Link>

        <div className="mt-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-brand-900 shadow-2xl shadow-black/20">
            K
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight">KonverPro</p>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/50">
              {config.badge}
            </p>
          </div>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-accent-500">
          <Sparkle size={16} weight="fill" />
          {config.badgeAccent}
        </div>

        <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-tight">
          {config.sideTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
          {config.sideDescription}
        </p>

        <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
            Portal Focus
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              "Akses role-based",
              "Dokumen resmi",
              "Operasional kampus",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          {config.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <p className="text-lg font-black text-accent-500">
                {metric.value}
              </p>
              <p className="mt-3 text-sm font-bold text-white">
                {metric.label}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                {metric.hint}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-4">
          {config.features.map((feature) => {
            const Icon = iconMap[feature.icon];

            return (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-accent-500">
                  <Icon size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    {feature.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 rounded-[1.8rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-accent-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </div>
        <p className="text-sm font-semibold italic leading-relaxed text-white/80">
          {config.quote}
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {config.notes.map((note, index) => (
            <div
              key={note.title}
              className={cn(
                "rounded-[1.4rem] border px-4 py-4",
                index === 0
                  ? "border-accent-500/30 bg-accent-500/10"
                  : "border-white/10 bg-white/5",
              )}
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/75">
                {note.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                {note.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-slate-950/20 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-500">
            <Buildings size={20} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Trusted Workflow
            </p>
            <p className="mt-1 text-sm text-white/70">
              Portal ini dirancang untuk operasi mitra kampus dan kontrol pusat
              KonverPro.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
