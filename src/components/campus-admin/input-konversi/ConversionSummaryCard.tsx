"use client";

import { ArrowRight, CircleNotch, ListChecks } from "@phosphor-icons/react";

interface ConversionSummaryCardProps {
  totalWajib: number;
  totalDiakui: number;
  sisaSks: number;
  estSem: number;
  formLoading: boolean;
  onSubmit: () => void;
}

export default function ConversionSummaryCard({
  totalWajib,
  totalDiakui,
  sisaSks,
  estSem,
  formLoading,
  onSubmit,
}: ConversionSummaryCardProps) {
  return (
    <div className="bg-[#094E8B] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
      <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-10 text-blue-200 flex items-center gap-3">
        <ListChecks weight="bold" />
        Estimasi Kebutuhan
      </h3>

      <div className="space-y-6 mb-10">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            Total SKS Wajib
          </span>
          <span className="text-xl font-black">{totalWajib}</span>
        </div>
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            SKS Diakui
          </span>
          <span className="text-xl font-black text-emerald-300">
            +{totalDiakui}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Sisa Beban Studi
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black leading-none">{sisaSks}</span>
            <span className="text-xs font-bold opacity-50 uppercase tracking-widest">
              SKS
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 mb-8 backdrop-blur-md">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-200 mb-2">
          Masa Studi Tersisa
        </p>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black text-amber-400">{estSem}</span>
          <span className="text-xs font-bold opacity-70">Semester Lagi</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={formLoading}
        className="h-16 bg-white text-[#094E8B] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
      >
        {formLoading ? (
          <CircleNotch className="animate-spin" size={20} />
        ) : (
          <>
            Submit ke Kaprodi
            <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </div>
  );
}
