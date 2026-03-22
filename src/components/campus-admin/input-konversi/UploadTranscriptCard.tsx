"use client";

import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  FileArrowUp,
  FileXls,
  MagicWand,
  UploadSimple,
} from "@phosphor-icons/react";
import type { ChangeEvent } from "react";

import type { StudyProgramOption } from "../types";

interface UploadTranscriptCardProps {
  prodiList: StudyProgramOption[];
  selectedProdiId: string;
  onSelectProdi: (value: string) => void;
  onDownloadTemplate: () => void;
  onFileSelection: (event: ChangeEvent<HTMLInputElement>) => void;
  onTriggerScan: () => void;
  file: File | null;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function UploadTranscriptCard({
  prodiList,
  selectedProdiId,
  onSelectProdi,
  onDownloadTemplate,
  onFileSelection,
  onTriggerScan,
  file,
  loading,
  fileInputRef,
}: UploadTranscriptCardProps) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50">
      <header className="flex items-center gap-5 border-b border-slate-50 pb-8 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#094E8B] flex items-center justify-center shadow-inner">
          <FileArrowUp weight="fill" size={28} />
        </div>
        <div>
          <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest">
            Input Data Transkrip
          </h3>
          <p className="text-lg font-black text-[#094E8B] mt-1">
            Ektraksi Cerdas Berbasis AI
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 block">
            Prodi Target Konversi
          </label>
          <div className="relative group">
            <select
              value={selectedProdiId}
              onChange={(event) => onSelectProdi(event.target.value)}
              className="w-full h-14 pl-6 pr-10 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-100 transition-all cursor-pointer appearance-none"
            >
              {prodiList.map((prodi) => (
                <option key={prodi.id} value={prodi.id}>
                  {prodi.level} {prodi.name}
                </option>
              ))}
            </select>
            <ArrowRight
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-blue-900 transition-colors"
              weight="bold"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#094E8B] hover:bg-blue-50 transition-colors flex items-center justify-center gap-3 w-full"
          >
            <FileXls size={20} weight="fill" />
            Unduh Template Transkrip
          </button>
        </div>
      </div>

      <div className="relative group">
        {loading ? (
          <div className="h-40 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 animate-pulse">
            <CircleNotch className="animate-spin text-blue-900" size={32} />
            <p className="text-xs font-black text-blue-900 uppercase tracking-widest">
              Menganalisis Kolom & Nilai...
            </p>
          </div>
        ) : (
          <div
            className="h-40 border-2 border-dashed border-slate-100 rounded-[2rem] hover:border-[#094E8B] hover:bg-blue-50/10 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadSimple
              weight="light"
              size={48}
              className="text-slate-200 group-hover:text-blue-900 transition-colors"
            />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-900">
              {file ? file.name : "Seret File Transkrip ke Sini"}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              className="hidden"
              onChange={onFileSelection}
            />
          </div>
        )}

        {!loading && file ? (
          <button
            type="button"
            onClick={onTriggerScan}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-10 h-12 bg-[#001a33] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center gap-3 group"
          >
            <MagicWand weight="bold" className="group-hover:rotate-12 transition-transform" />
            Mulai Analisis Data
          </button>
        ) : null}

        {!loading && !file ? (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-lg border border-slate-100">
            <CheckCircle size={14} weight="fill" className="text-emerald-500" />
            Siapkan file lalu jalankan analisis
          </div>
        ) : null}
      </div>
    </div>
  );
}
