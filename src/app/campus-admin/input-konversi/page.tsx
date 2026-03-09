"use client";

import { useState, useRef, useEffect } from "react";
import axios from "@/lib/axios";
import { 
  UploadSimple, 
  MagicWand, 
  ListChecks, 
  PencilSimple, 
  Check, 
  CircleNotch, 
  X,
  FileXls,
  WarningCircle,
  FileArrowUp,
  MagnifyingGlass,
  ArrowRight
} from "@phosphor-icons/react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Tipe data untuk raw transcript & selected course
interface RawTranscriptItem {
  name: string;
  grade: string;
  sks: number;
}
interface SelectedCourse {
  sks: number;
  matchedName: string;
  grade: string;
}

export default function InputKonversi() {
  const router = useRouter();
  
  // State
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [selectedProdiId, setSelectedProdiId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanResultModal, setScanResultModal] = useState(false);
  const [scanResultSks, setScanResultSks] = useState(0);

  // Data mapping state
  const [rawTranscript, setRawTranscript] = useState<RawTranscriptItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Record<string, SelectedCourse>>({});
  const [curriculum, setCurriculum] = useState<any[]>([]);
  
  // Biodata state
  const [studentBio, setStudentBio] = useState({
    name: "-",
    univ: "-",
    email: "-",
    phone: "-"
  });
  const [isBioEditing, setIsBioEditing] = useState(false);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProdis = async () => {
        try {
            const res = await axios.get("/curriculum/prodi");
            setProdiList(res.data.data);
            if (res.data.data && res.data.data.length > 0) {
                setSelectedProdiId(res.data.data[0].id);
            }
        } catch (err) {
            toast.error("Gagal memuat prodi");
        }
    };
    fetchProdis();
  }, []);

  useEffect(() => {
    if (selectedProdiId) {
      setSelectedCourses({});
      loadCurriculum(selectedProdiId);
    }
  }, [selectedProdiId]);

  const loadCurriculum = async (id: string) => {
    try {
        const res = await axios.get(`/curriculum/prodi/${id}/courses`);
        const courses = res.data.data;
        
        const semesters: Record<number, any[]> = {};
        courses.forEach((c: any) => {
            const sem = c.semester || 1;
            if(!semesters[sem]) semesters[sem] = [];
            semesters[sem].push(c);
        });

        const structured = Object.keys(semesters).sort((a,b)=>Number(a)-Number(b)).map(s => ({
            semester: parseInt(s),
            courses: semesters[Number(s)]
        }));
        setCurriculum(structured);
    } catch (err) {
        toast.error("Gagal memuat kurikulum.");
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const downloadTranscriptTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = [
        ["DATA MAHASISWA", ""],
        ["Nama Mahasiswa", "Budi Santoso"],
        ["Asal Perguruan Tinggi", "Politeknik Negeri Jakarta"],
        ["Email", "budi@example.com"],
        [],
        ["NO", "KODE_MK", "NAMA_MATAKULIAH", "SKS", "NILAI"],
        [1, "COMP101", "Algoritma dan Pemrograman", 3, "A"], 
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [{wch:20}, {wch:15}, {wch:40}, {wch:10}, {wch:10}];
    XLSX.utils.book_append_sheet(wb, ws, "Template_Transkrip");
    XLSX.writeFile(wb, "Template_Transkrip_Mahasiswa.xlsx");
  };

  const triggerScan = () => {
    if (!file) {
      toast.error("Silakan upload file transkrip terlebih dahulu.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, {type: 'array'});
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[][] = XLSX.utils.sheet_to_json(firstSheet, {header:1}); 
          
          let extractedName = "", extractedUniv = "", extractedEmail = "";

          for(let i=0; i<Math.min(json.length, 10); i++) {
              const row = json[i];
              if (!row) continue;
              const rowStr = JSON.stringify(row).toLowerCase();
              if (rowStr.includes("nama") && !extractedName) {
                  const idx = row.findIndex(cell => String(cell).toLowerCase().includes("nama"));
                  if (idx !== -1 && row[idx+1]) extractedName = String(row[idx+1]).replace(":", "").trim();
              }
              if ((rowStr.includes("universitas") || rowStr.includes("perguruan") || rowStr.includes("kampus")) && !extractedUniv) {
                  const idx = row.findIndex(cell => String(cell).toLowerCase().includes("universitas") || String(cell).toLowerCase().includes("perguruan") || String(cell).toLowerCase().includes("kampus"));
                  if (idx !== -1 && row[idx+1]) extractedUniv = String(row[idx+1]).replace(":", "").trim();
              }
          }

          setStudentBio(prev => ({ ...prev, name: extractedName || prev.name, univ: extractedUniv || prev.univ }));

          // PARSE COURSES
          const KEYWORDS = {
              name: ['nama', 'mata kuliah', 'matakuliah', 'course', 'subject', 'mk'],
              sks: ['sks', 'kredit', 'credit', 'unit'],
              grade: ['nilai', 'grade', 'huruf', 'indeks']
          };

          let headerRowIdx = -1;
          let colMap = { name: -1, grade: -1, sks: -1 };

          for (let i = 0; i < Math.min(json.length, 50); i++) {
              const row = json[i];
              if (!row) continue;
              row.forEach((cell, colIdx) => {
                  if (!cell) return;
                  const txt = String(cell).toLowerCase().trim();
                  if (KEYWORDS.name.some(k => txt.includes(k))) colMap.name = colIdx;
                  if (KEYWORDS.grade.some(k => txt.includes(k))) colMap.grade = colIdx;
                  if (KEYWORDS.sks.some(k => txt.includes(k))) colMap.sks = colIdx;
              });
              if (colMap.name !== -1 && (colMap.grade !== -1 || colMap.sks !== -1)) {
                  headerRowIdx = i;
                  break; 
              }
          }

          const dataRows = json.slice(headerRowIdx + 1);
          let rawMks: RawTranscriptItem[] = [];

          dataRows.forEach(row => {
              if(!row) return;
              let name = (colMap.name !== -1 && row[colMap.name]) ? String(row[colMap.name]).trim() : "";
              let grade = (colMap.grade !== -1 && row[colMap.grade]) ? String(row[colMap.grade]).trim().toUpperCase() : "";
              let sks = (colMap.sks !== -1 && row[colMap.sks]) ? parseInt(row[colMap.sks]) : 0;
              if (name.length > 2 && !name.toLowerCase().includes("total")) {
                  rawMks.push({name, grade, sks});
              }
          });
          
          setRawTranscript(rawMks);

          // Matching Logic
          const flatCourses = curriculum.flatMap(sem => sem.courses);
          let matchCount = 0;
          let totalCredit = 0;
          let newSelected: Record<string, SelectedCourse> = {};

          flatCourses.forEach(target => {
              // Try match by name OR keywords
              let bestMatch = rawMks.find(src => {
                  const sName = src.name.toLowerCase();
                  const tName = target.name.toLowerCase();
                  if (sName.includes(tName) || tName.includes(sName)) return true;
                  if (target.keywords && target.keywords.some((k:string) => sName.includes(k.toLowerCase()))) return true;
                  return false;
              });
              
              if(bestMatch && ['A','B','C'].some(g => bestMatch?.grade.startsWith(g))) {
                  newSelected[target.name] = { sks: target.sks, matchedName: bestMatch.name, grade: bestMatch.grade };
                  matchCount++;
                  totalCredit += target.sks;
              }
          });

          setSelectedCourses(newSelected);
          setScanResultSks(totalCredit);
          setLoading(false);
          setScanResultModal(true);
          setTimeout(() => setScanResultModal(false), 2500);

        } catch (err) {
          setLoading(false);
          toast.error("Gagal membaca file excel.");
        }
      }, 1500);
    };
    reader.readAsArrayBuffer(file);
  };

  const manualMap = (targetName: string, sks: number, sourceName: string) => {
    setSelectedCourses(prev => {
      const next = {...prev};
      if (!sourceName) {
        delete next[targetName];
      } else {
        const src = rawTranscript.find(x => x.name === sourceName);
        if (src) {
           next[targetName] = { sks, matchedName: src.name, grade: src.grade };
        }
      }
      return next;
    });
  };

  const saveToKaprodi = async () => {
    if (studentBio.name === "-" || !studentBio.name) {
      toast.error('Isi Nama Mahasiswa dulu.');
      return;
    }

    setFormLoading(true);
    try {
        let totalSks = 0;
        Object.values(selectedCourses).forEach(v => totalSks += v.sks);
        
        const payload = {
            student_name: studentBio.name,
            origin_campus: studentBio.univ,
            email: studentBio.email,
            phone: studentBio.phone,
            study_program_id: selectedProdiId,
            matched_courses: selectedCourses,
            total_sks: totalSks
        };

        await axios.post('/conversions', payload);
        toast.success('Pengajuan berhasil dikirim!');
        router.push('/campus-admin/conversions');
    } catch (error) {
        toast.error("Gagal menyimpan pengajuan.");
    } finally {
        setFormLoading(false);
    }
  };

  const [formLoading, setFormLoading] = useState(false);

  let totalWajib = 0;
  curriculum.forEach(s => s.courses.forEach((c:any) => totalWajib += c.sks));
  let totalDiakui = 0;
  Object.values(selectedCourses).forEach(m => totalDiakui += m.sks);
  const sisaSks = totalWajib - totalDiakui;
  let estSem = Math.ceil(sisaSks / 20); 

  return (
    <div className="space-y-10 animate-fade-in-quick">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0 space-y-10">
          
          {/* Card 1: Upload */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50">
            <header className="flex items-center gap-5 border-b border-slate-50 pb-8 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#094E8B] flex items-center justify-center shadow-inner">
                    <FileArrowUp weight="fill" size={28} />
                </div>
                <div>
                    <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest">Input Data Transkrip</h3>
                    <p className="text-lg font-black text-[#094E8B] mt-1">Ektraksi Cerdas Berbasis AI</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 block">Prodi Target Konversi</label>
                    <div className="relative group">
                        <select 
                          value={selectedProdiId}
                          onChange={(e) => setSelectedProdiId(e.target.value)}
                          className="w-full h-14 pl-6 pr-10 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-100 transition-all cursor-pointer appearance-none"
                        >
                          {prodiList.map(p => <option key={p.id} value={p.id}>{p.level} {p.name}</option>)}
                        </select>
                        <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-blue-900 transition-colors" weight="bold" />
                    </div>
                </div>

                <div className="flex items-end">
                    <button 
                      onClick={downloadTranscriptTemplate}
                      className="h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#094E8B] hover:bg-blue-50 transition-colors flex items-center justify-center gap-3 w-full"
                    >
                        <FileXls size={20} weight="fill" /> Unduh Template Transkrip
                    </button>
                </div>
            </div>

            <div className="relative group">
              {loading ? (
                 <div className="h-40 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 animate-pulse">
                     <CircleNotch className="animate-spin text-blue-900" size={32} />
                     <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Menganalisis Kolom & Nilai...</p>
                 </div>
              ) : (
                 <div className="h-40 border-2 border-dashed border-slate-100 rounded-[2rem] hover:border-[#094E8B] hover:bg-blue-50/10 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    <UploadSimple weight="light" size={48} className="text-slate-200 group-hover:text-blue-900 transition-colors" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-900">
                        {file ? file.name : "Seret File Transkrip ke Sini"}
                    </p>
                    <input type="file" ref={fileInputRef} accept=".xlsx,.xls" className="hidden" onChange={handleFileSelection} />
                 </div>
              )}
              {!loading && file && (
                  <button 
                    onClick={triggerScan}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-10 h-12 bg-[#001a33] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center gap-3 group"
                  >
                      <MagicWand weight="bold" className="group-hover:rotate-12 transition-transform" /> Mulai Analisis Data
                  </button>
              )}
            </div>
          </div>

          {/* Card 2: Mapping */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 min-h-[500px]">
              <header className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-50 pb-8 mb-8 gap-4">
                  <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest flex items-center gap-3">
                      <ListChecks weight="fill" className="text-blue-500" size={24} /> Hasil Pemetaan Kurikulum
                  </h3>
                  <div className="bg-emerald-50 px-6 py-2 rounded-xl border border-emerald-100 flex items-center gap-4">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">SKS Diakui</span>
                      <span className="font-black text-xl text-emerald-700">{totalDiakui}</span>
                  </div>
              </header>
              
              <div className="space-y-6">
                  {curriculum.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <MagnifyingGlass weight="light" size={64} className="opacity-10 mb-6" />
                        <p className="text-sm font-bold italic">Menunggu input transkrip mahasiswa...</p>
                    </div>
                  ) : (
                    curriculum.map(sem => (
                      <div key={sem.semester} className="rounded-3xl border border-slate-50 p-6 space-y-4 bg-slate-50/10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Semester {sem.semester}</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {sem.courses.map((c: any) => {
                            const match = selectedCourses[c.name];
                            const isTaken = !!match;
                            return (
                              <div key={c.id} className={`p-4 rounded-[1.5rem] border transition-all flex flex-col sm:flex-row items-center justify-between gap-6 ${isTaken ? 'bg-emerald-50/30 border-emerald-100 shadow-sm' : 'bg-white border-slate-50 shadow-sm'}`}>
                                <div className="flex items-center gap-5 flex-1 w-full">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${isTaken ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                      {isTaken ? <Check weight="bold" /> : c.code.substring(0,2)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-[#001a33]">{c.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{c.sks} SKS • {c.code}</p>
                                    </div>
                                </div>
                                <div className="w-full sm:w-64">
                                     <select 
                                        value={match ? match.matchedName : ""} 
                                        onChange={(e) => manualMap(c.name, c.sks, e.target.value)}
                                        className={`w-full h-11 px-4 text-[11px] font-bold border rounded-xl outline-none focus:bg-white transition-all ${isTaken ? 'bg-emerald-100/50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                      >
                                          <option value="">-- Manual Link --</option>
                                          {rawTranscript.map((src, i) => <option key={i} value={src.name}>{src.name} ({src.grade})</option>)}
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

        </div>

        {/* SIDEBAR */}
        <div className="lg:w-96 space-y-8">
            {/* Biodata Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden group">
                <div className="bg-[#001a33] p-8 flex justify-between items-center group-hover:bg-[#094E8B] transition-colors">
                    <div>
                        <h4 className="text-[10px] font-black text-blue-200/50 uppercase tracking-[0.2em] mb-1">Biodata</h4>
                        <p className="text-white font-black text-sm uppercase">Smart Extraction</p>
                    </div>
                    <button onClick={() => setIsBioEditing(!isBioEditing)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
                        {isBioEditing ? <Check weight="bold" /> : <PencilSimple weight="bold" />}
                    </button>
                </div>
                <div className="p-8 space-y-6 relative min-h-[200px]">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Nama Lengkap</label>
                            {isBioEditing ? <input className="w-full h-11 px-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold" value={studentBio.name} onChange={e => setStudentBio({...studentBio, name: e.target.value})}/> : <p className="font-black text-[#001a33] text-sm truncate">{studentBio.name}</p>}
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Asal Perguruan Tinggi</label>
                            {isBioEditing ? <input className="w-full h-11 px-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold" value={studentBio.univ} onChange={e => setStudentBio({...studentBio, univ: e.target.value})}/> : <p className="font-bold text-slate-600 text-xs truncate leading-relaxed">{studentBio.univ}</p>}
                        </div>
                    </div>
                    {studentBio.name === "-" && !isBioEditing && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in-quick">
                            <MagnifyingGlass weight="duotone" size={32} className="text-slate-300 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menunggu Hasil Analisis</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Sticky */}
            <div className="sticky top-10 space-y-6">
                <div className="bg-[#094E8B] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-10 text-blue-200 flex items-center gap-3">
                        <ListChecks weight="bold" /> Estimasi Kebutuhan
                    </h3>
                    
                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Total SKS Wajib</span>
                            <span className="text-xl font-black">{totalWajib}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">SKS Diakui</span>
                            <span className="text-xl font-black text-emerald-300">+{totalDiakui}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Sisa Beban Studi</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black leading-none">{sisaSks}</span>
                                <span className="text-xs font-bold opacity-50 uppercase tracking-widest">SKS</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 mb-8 backdrop-blur-md">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-200 mb-2">Masa Studi Tersisa</p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black text-amber-400">{estSem}</span>
                            <span className="text-xs font-bold opacity-70">Semester Lagi</span>
                        </div>
                    </div>

                    <button 
                        onClick={saveToKaprodi}
                        disabled={formLoading}
                        className="h-16 bg-white text-[#094E8B] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
                    >
                        {formLoading ? <CircleNotch className="animate-spin" size={20} /> : <>Submit ke Kaprodi <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </div>
            </div>
        </div>

      </div>

      {/* Success Modal */}
      {scanResultModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#094E8B]/80 backdrop-blur-md p-4 animate-fade-in-quick">
            <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 flex flex-col items-center text-center animate-slide-in">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-emerald-50/50">
                    <Check weight="bold" className="text-4xl" />
                </div>
                <h3 className="font-heading font-black text-[#001a33] text-2xl mb-2 uppercase tracking-tight">Analisis Berhasil</h3>
                <p className="text-sm text-slate-400 font-bold mb-8 italic leading-relaxed">Sistem berhasil memetakan data <br /> transkrip ke kurikulum tujuan.</p>
                
                <div className="bg-[#094E8B] rounded-3xl p-6 w-full text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-300 mb-1">Mata Kuliah Linkage</p>
                    <p className="text-5xl font-black">{scanResultSks}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mt-2">SKS Konversi</p>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
