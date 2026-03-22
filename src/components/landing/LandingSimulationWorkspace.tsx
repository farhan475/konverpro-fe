"use client";

import type { ChangeEvent } from "react";
import {
  CircleNotch,
  DownloadSimple,
  FileArrowUp,
  ListChecks,
  Sparkle,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

interface LandingSimulationWorkspaceProps {
  file: File | null;
  accept: string;
  isLoading: boolean;
  visibleStats: {
    matchCount: number;
    maxSks: number;
  };
  detectedName: string;
  detectedOriginCampus: string;
  onTemplateDownload: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onProcess: () => void;
}

export default function LandingSimulationWorkspace({
  file,
  accept,
  isLoading,
  visibleStats,
  detectedName,
  detectedOriginCampus,
  onTemplateDownload,
  onFileChange,
  onProcess,
}: LandingSimulationWorkspaceProps) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="flex items-center gap-3 text-2xl font-bold text-brand-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-inner">
              <Sparkle weight="fill" className="h-5 w-5" />
            </div>
            Simulasi Konversi
          </h3>
          <p className="ml-[52px] mt-1 text-sm text-slate-500">
            Unggah transkrip nilai Anda untuk melihat hasil estimasi SKS lintas
            kampus mitra.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
        <button
          type="button"
          onClick={onTemplateDownload}
          className="group flex min-h-[100px] w-full shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-8 py-4 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 xl:w-auto"
        >
          <DownloadSimple className="h-8 w-8 text-slate-400 transition-colors group-hover:text-green-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Download Template
          </span>
        </button>

        <label className="group relative flex min-h-[100px] flex-grow cursor-pointer items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-8 py-4 transition hover:border-brand-300 hover:bg-brand-50">
          <input
            type="file"
            accept={accept}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={onFileChange}
          />
          <div className="flex w-full items-center gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-brand-600 shadow-sm transition duration-300 group-hover:scale-110">
              <FileArrowUp weight="bold" className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-slate-700 transition-colors group-hover:text-brand-700">
                {file?.name ?? "Klik untuk unggah file Excel"}
              </p>
              <p className="text-sm text-slate-400">
                Format .xlsx atau .csv (Maks 5MB)
              </p>
            </div>
          </div>
        </label>

        <Button
          type="button"
          disabled={isLoading || !file}
          onClick={onProcess}
          className="group relative min-h-[100px] w-full shrink-0 overflow-hidden rounded-2xl bg-brand-600 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-brand-600/20 hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 xl:w-auto"
        >
          {isLoading ? (
            <>
              <CircleNotch
                weight="bold"
                className="mr-2 h-5 w-5 animate-spin"
              />
              Menganalisis...
            </>
          ) : (
            <>
              <ListChecks weight="bold" className="mr-2 h-5 w-5" />
              Hitung SKS
            </>
          )}
        </Button>

        <div className="relative flex min-h-[100px] items-center overflow-hidden rounded-2xl bg-brand-900 p-6 text-white shadow-xl xl:w-96 xl:shrink-0">
          <div className="relative z-10 flex w-full items-center justify-between divide-x divide-brand-700/50 text-center">
            <div className="flex-1 px-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-200">
                Kampus Cocok
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-black text-accent-500">
                  {visibleStats.matchCount}
                </span>
                <span className="text-xs font-bold opacity-80">Univ</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-200">
                SKS Diakui
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-black text-green-400">
                  {visibleStats.maxSks}
                </span>
                <span className="text-xs font-bold opacity-80">SKS</span>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-4 -right-4 text-[5rem] font-black text-white/5">
            K
          </div>
        </div>
      </div>

      {(detectedName || detectedOriginCampus) && (
        <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 text-sm text-brand-900/80">
          {detectedName && (
            <p>
              Nama dari template:{" "}
              <span className="font-bold text-brand-900">{detectedName}</span>
            </p>
          )}
          {detectedOriginCampus && (
            <p className={detectedName ? "mt-1" : ""}>
              Asal kampus dari template:{" "}
              <span className="font-bold text-brand-900">
                {detectedOriginCampus}
              </span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
