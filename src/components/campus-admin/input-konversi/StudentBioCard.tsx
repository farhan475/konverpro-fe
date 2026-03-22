"use client";

import { Check, MagnifyingGlass, PencilSimple } from "@phosphor-icons/react";

import type { StudentBio } from "../types";

interface StudentBioCardProps {
  studentBio: StudentBio;
  isEditing: boolean;
  onToggleEditing: () => void;
  onChange: (nextBio: StudentBio) => void;
}

export default function StudentBioCard({
  studentBio,
  isEditing,
  onToggleEditing,
  onChange,
}: StudentBioCardProps) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden group">
      <div className="bg-[#001a33] p-8 flex justify-between items-center group-hover:bg-[#094E8B] transition-colors">
        <div>
          <h4 className="text-[10px] font-black text-blue-200/50 uppercase tracking-[0.2em] mb-1">
            Biodata
          </h4>
          <p className="text-white font-black text-sm uppercase">
            Smart Extraction
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleEditing}
          className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          {isEditing ? <Check weight="bold" /> : <PencilSimple weight="bold" />}
        </button>
      </div>
      <div className="p-8 space-y-6 relative min-h-[200px]">
        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">
              Nama Lengkap
            </label>
            {isEditing ? (
              <input
                className="w-full h-11 px-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold"
                value={studentBio.name}
                onChange={(event) =>
                  onChange({
                    ...studentBio,
                    name: event.target.value,
                  })
                }
              />
            ) : (
              <p className="font-black text-[#001a33] text-sm truncate">
                {studentBio.name}
              </p>
            )}
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">
              Asal Perguruan Tinggi
            </label>
            {isEditing ? (
              <input
                className="w-full h-11 px-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold"
                value={studentBio.univ}
                onChange={(event) =>
                  onChange({
                    ...studentBio,
                    univ: event.target.value,
                  })
                }
              />
            ) : (
              <p className="font-bold text-slate-600 text-xs truncate leading-relaxed">
                {studentBio.univ}
              </p>
            )}
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">
              Email Mahasiswa
            </label>
            {isEditing ? (
              <input
                className="w-full h-11 px-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold"
                value={studentBio.email}
                onChange={(event) =>
                  onChange({
                    ...studentBio,
                    email: event.target.value,
                  })
                }
              />
            ) : (
              <p className="font-bold text-slate-600 text-xs truncate leading-relaxed">
                {studentBio.email || "-"}
              </p>
            )}
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">
              Nomor WhatsApp
            </label>
            {isEditing ? (
              <input
                className="w-full h-11 px-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold"
                value={studentBio.phone}
                onChange={(event) =>
                  onChange({
                    ...studentBio,
                    phone: event.target.value,
                  })
                }
              />
            ) : (
              <p className="font-bold text-slate-600 text-xs truncate leading-relaxed">
                {studentBio.phone || "-"}
              </p>
            )}
          </div>
        </div>
        {studentBio.name === "-" && !isEditing ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in-quick">
            <MagnifyingGlass weight="duotone" size={32} className="text-slate-300 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Menunggu Hasil Analisis
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
