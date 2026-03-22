"use client";

import { Check } from "@phosphor-icons/react";

interface ScanResultModalProps {
  open: boolean;
  scanResultSks: number;
}

export default function ScanResultModal({
  open,
  scanResultSks,
}: ScanResultModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#094E8B]/80 backdrop-blur-md p-4 animate-fade-in-quick">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 flex flex-col items-center text-center animate-slide-in">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-emerald-50/50">
          <Check weight="bold" className="text-4xl" />
        </div>
        <h3 className="font-heading font-black text-[#001a33] text-2xl mb-2 uppercase tracking-tight">
          Analisis Berhasil
        </h3>
        <p className="text-sm text-slate-400 font-bold mb-8 italic leading-relaxed">
          Sistem berhasil memetakan data
          <br />
          transkrip ke kurikulum tujuan.
        </p>

        <div className="bg-[#094E8B] rounded-3xl p-6 w-full text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-300 mb-1">
            Mata Kuliah Linkage
          </p>
          <p className="text-5xl font-black">{scanResultSks}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mt-2">
            SKS Konversi
          </p>
        </div>
      </div>
    </div>
  );
}
