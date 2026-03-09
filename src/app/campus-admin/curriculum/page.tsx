"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { 
  BookOpen, 
  UploadSimple, 
  CircleNotch, 
  Lightning, 
  MagnifyingGlass, 
  CheckCircle,
  X,
  Buildings,
  GraduationCap,
  CaretRight,
  WarningCircle,
  FileArrowUp
} from "@phosphor-icons/react";
import { toast } from "sonner";

export default function CurriculumPage() {
  const [prodis, setProdis] = useState<any[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Load Daftar Prodi
  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const res = await axios.get("/curriculum/prodi");
        const prodiData = res.data.data;
        setProdis(prodiData);
        if (prodiData && prodiData.length > 0) {
          setSelectedProdi(prodiData[0].id);
        }
      } catch (err) {
        toast.error("Gagal memuat prodi");
      }
    };
    fetchProdi();
  }, []);

  // 2. Load Mata Kuliah
  useEffect(() => {
    if (!selectedProdi) return;
    setLoading(true);
    axios.get(`/curriculum/prodi/${selectedProdi}/courses`)
      .then((res) => setCourses(res.data.data))
      .catch(() => toast.error("Gagal memuat mata kuliah"))
      .finally(() => setLoading(false));
  }, [selectedProdi]);

  // 3. Handle Import Excel
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedProdi) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("study_program_id", selectedProdi);

    try {
      await axios.post("/curriculum/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Kurikulum berhasil diupdate!");
      setModalOpen(false);
      setFile(null);
      // Reload
      const res = await axios.get(`/curriculum/prodi/${selectedProdi}/courses`);
      setCourses(res.data.data);
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || "Gagal import");
    } finally {
      setUploading(false);
    }
  };

  const currentProdiName = prodis.find(p => p.id === selectedProdi)?.name || "Pilih Program Studi";
  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in-quick pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h2 className="font-heading text-xl font-black text-[#001a33] uppercase tracking-tight">Repositori Kurikulum</h2>
            <p className="text-sm text-slate-400">Kelola master data mata kuliah untuk pencocokan konversi otomatis.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="px-8 py-4 bg-[#094E8B] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#073e6f] transition shadow-xl shadow-blue-900/10 active:scale-95 group"
        >
            <UploadSimple weight="bold" className="group-hover:-translate-y-1 transition-transform" /> Import Excel Master
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* LEFT: PRODI LIST */}
        <div className="lg:col-span-1 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <GraduationCap weight="bold" /> Program Studi
            </h4>
            <div className="space-y-3">
                {prodis.map((p) => (
                    <button 
                        key={p.id}
                        onClick={() => setSelectedProdi(p.id)}
                        className={`w-full text-left p-5 rounded-[1.5rem] transition-all relative overflow-hidden group ${
                            selectedProdi === p.id 
                            ? "bg-[#094E8B] text-white shadow-xl shadow-blue-900/20" 
                            : "bg-white border border-slate-50 text-slate-500 hover:border-blue-100 hover:bg-blue-50/10 shadow-sm"
                        }`}
                    >
                        {selectedProdi === p.id && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                        )}
                        <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${selectedProdi === p.id ? "text-blue-200" : "text-slate-300"}`}>
                            {p.level}
                        </p>
                        <p className="font-bold text-sm leading-tight pr-4">{p.name}</p>
                        <CaretRight weight="bold" className={`absolute right-4 top-1/2 -translate-y-1/2 transition-transform ${selectedProdi === p.id ? "text-white translate-x-0" : "text-slate-200 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                    </button>
                ))}
            </div>
        </div>

        {/* RIGHT: COURSE TABLE */}
        <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-6">
                   <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-900 shadow-sm border border-slate-100">
                           <BookOpen size={24} weight="duotone" />
                       </div>
                       <div>
                           <h3 className="font-black text-[#001a33] text-sm uppercase">{currentProdiName}</h3>
                           <p className="text-[10px] font-bold text-slate-400 mt-0.5">{courses.length} Mata Kuliah Terdaftar</p>
                       </div>
                   </div>

                   <div className="relative group w-full sm:w-64">
                       <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-900 transition-colors" />
                       <input 
                         placeholder="Cari Mata Kuliah..." 
                         className="w-full h-11 pl-12 pr-4 bg-white border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-100 transition-all shadow-sm"
                         value={searchQuery}
                         onChange={e => setSearchQuery(e.target.value)}
                       />
                   </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <CircleNotch weight="bold" className="animate-spin text-blue-900 w-12 h-12" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memetakan Kurikulum...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6">
                            <WarningCircle size={40} weight="light" className="text-slate-200" />
                        </div>
                        <h4 className="font-black text-[#001a33] text-lg uppercase tracking-tight">Database Kosong</h4>
                        <p className="text-sm text-slate-400 font-bold max-w-xs mt-2 italic">Belum ada mata kuliah untuk Prodi ini. Unggah file Excel untuk mengisi database.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-[#001a33]/[0.02] border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Kode</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Mata Kuliah</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">SKS</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Smt</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Sifat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCourses.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-5 font-mono text-[11px] font-black text-slate-400 group-hover:text-blue-900 transition-colors uppercase">{c.code}</td>
                                        <td className="px-8 py-5">
                                            <p className="font-black text-[#001a33] text-sm group-hover:text-blue-900 transition-colors">{c.name}</p>
                                            {c.keywords && c.keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {c.keywords.slice(0, 3).map((k: string, i: number) => (
                                                        <span key={i} className="text-[8px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded">
                                                            {k}
                                                        </span>
                                                    ))}
                                                    {c.keywords.length > 3 && <span className="text-[8px] text-slate-300">+{c.keywords.length - 3}</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-center font-black text-sm text-slate-700">{c.sks}</td>
                                        <td className="px-8 py-5 text-center font-bold text-xs text-slate-400">{c.semester}</td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${c.is_mandatory ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                                {c.is_mandatory ? 'Wajib' : 'Pilihan'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <div className="bg-[#001a33] p-8 text-white relative overflow-hidden mt-auto">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
                            <Lightning weight="fill" size={28} />
                        </div>
                        <div>
                            <h4 className="font-black uppercase tracking-[0.2em] text-xs">Matching Engine Active</h4>
                            <p className="text-[11px] text-blue-200 mt-1 font-medium italic opacity-70">
                                "Sistem menggunakan keywords pada setiap mata kuliah di atas untuk <br /> meningkatkan akurasi konversi otomatis hingga 98%."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL: IMPORT EXCEL */}
      {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
              <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in">
                  <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest">Import Master Kurikulum</h3>
                      <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 outline-none"><X weight="bold" size={24}/></button>
                  </div>
                  <form onSubmit={handleImport} className="p-10 space-y-8">
                      <div className="space-y-6">
                         <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex gap-6 items-start">
                             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                 <FileArrowUp weight="bold" size={24} />
                             </div>
                             <div className="space-y-2">
                                <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Panduan Format File</p>
                                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                                    Excel wajib menggunakan format kolom: <br />
                                    <span className="bg-white/50 px-2 py-0.5 rounded font-black">[No] [Kode MK] [Nama MK] [SKS] [Smt] [Wajib: Y/N]</span>
                                </p>
                             </div>
                         </div>

                         <div className="space-y-4">
                             <div>
                                 <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest px-1">Upload File (.xlsx / .xls)</label>
                                 <div className="relative h-32 border-2 border-dashed border-slate-100 rounded-[1.5rem] flex flex-col items-center justify-center hover:bg-slate-50 hover:border-blue-200 transition-all cursor-pointer group">
                                     <input 
                                        type="file" 
                                        accept=".xlsx,.xls" 
                                        onChange={(e) => setFile(e.target.files?.[0] || null)} 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                     />
                                     <div className="flex flex-col items-center text-center px-4">
                                         <UploadSimple size={32} weight="thin" className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                                         <p className="text-xs font-black text-slate-400 mt-2 truncate max-w-[200px]">
                                             {file ? file.name : "Klik atau seret file ke sini"}
                                         </p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                      </div>

                      <div className="flex gap-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-14 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition">Batal</button>
                        <button type="submit" disabled={uploading || !file} className="flex-1 h-16 bg-[#094E8B] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 flex items-center justify-center gap-4 hover:bg-[#073e6f] transition-all disabled:opacity-50">
                            {uploading ? <CircleNotch className="animate-spin" size={20} /> : <><CheckCircle weight="bold" size={20} /> Mulai Import</>}
                        </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}