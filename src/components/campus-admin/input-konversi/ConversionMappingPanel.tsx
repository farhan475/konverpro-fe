"use client";

import { Check, ListChecks, MagnifyingGlass } from "@phosphor-icons/react";

import type {
  CurriculumSemester,
  RawTranscriptItem,
  SelectedCourse,
} from "../types";

interface ConversionMappingPanelProps {
  curriculum: CurriculumSemester[];
  rawTranscript: RawTranscriptItem[];
  selectedCourses: Record<string, SelectedCourse>;
  totalDiakui: number;
  onManualMap: (targetName: string, sks: number, sourceName: string) => void;
}

export default function ConversionMappingPanel({
  curriculum,
  rawTranscript,
  selectedCourses,
  totalDiakui,
  onManualMap,
}: ConversionMappingPanelProps) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 min-h-[500px]">
      <header className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-50 pb-8 mb-8 gap-4">
        <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest flex items-center gap-3">
          <ListChecks weight="fill" className="text-blue-500" size={24} />
          Hasil Pemetaan Kurikulum
        </h3>
        <div className="bg-emerald-50 px-6 py-2 rounded-xl border border-emerald-100 flex items-center gap-4">
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
            SKS Diakui
          </span>
          <span className="font-black text-xl text-emerald-700">
            {totalDiakui}
          </span>
        </div>
      </header>

      <div className="space-y-6">
        {curriculum.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MagnifyingGlass weight="light" size={64} className="opacity-10 mb-6" />
            <p className="text-sm font-bold italic">
              Menunggu input transkrip mahasiswa...
            </p>
          </div>
        ) : (
          curriculum.map((semesterGroup) => (
            <div
              key={semesterGroup.semester}
              className="rounded-3xl border border-slate-50 p-6 space-y-4 bg-slate-50/10"
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Semester {semesterGroup.semester}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {semesterGroup.courses.map((course) => {
                  const match = selectedCourses[course.name];
                  const isTaken = Boolean(match);

                  return (
                    <div
                      key={course.id}
                      className={`p-4 rounded-[1.5rem] border transition-all flex flex-col sm:flex-row items-center justify-between gap-6 ${
                        isTaken
                          ? "bg-emerald-50/30 border-emerald-100 shadow-sm"
                          : "bg-white border-slate-50 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-5 flex-1 w-full">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                            isTaken
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isTaken ? <Check weight="bold" /> : course.code.substring(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-[#001a33]">{course.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                            {course.sks} SKS • {course.code}
                          </p>
                        </div>
                      </div>
                      <div className="w-full sm:w-64">
                        <select
                          value={match ? match.matchedName : ""}
                          onChange={(event) =>
                            onManualMap(course.name, course.sks, event.target.value)
                          }
                          className={`w-full h-11 px-4 text-[11px] font-bold border rounded-xl outline-none focus:bg-white transition-all ${
                            isTaken
                              ? "bg-emerald-100/50 text-emerald-800 border-emerald-200"
                              : "bg-slate-50 text-slate-400 border-slate-100"
                          }`}
                        >
                          <option value="">-- Manual Link --</option>
                          {rawTranscript.map((source, index) => (
                            <option key={`${course.id}-${index}`} value={source.name}>
                              {source.name} ({source.grade})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
