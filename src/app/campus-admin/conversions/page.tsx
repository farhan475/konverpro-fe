"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { 
  MagnifyingGlass, 
  Funnel, 
  FileArrowDown, 
  ListDashes, 
  CheckCircle, 
  Clock, 
  XCircle, 
  UserSquare, 
  FileText,
  CaretRight,
  CircleNotch,
  ArrowRight,
  DotsThreeVertical,
  CalendarBlank,
  Buildings,
  GraduationCap,
  X
} from "@phosphor-icons/react";
import { toast } from "sonner";
import Link from "next/link";

export default function HasilKonversi() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [validationModal, setValidationModal] = useState<{isOpen: boolean, data: any | null}>({isOpen: false, data: null});

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/conversions');
      const listData = response.data?.data?.data || response.data?.data || [];
      
      const mapped = listData.map((item:any) => ({
          id: item.id,
          trx_id: item.trx_id || `TRX-${item.id}`,
          name: item.student_name || item.name,
          origin: item.origin_campus || item.origin,
          prodi: item.study_program?.name || item.prodi,
          sks: item.total_sks || item.sks,
          status: item.status || 'pending',
          date: item.created_at || new Date().toISOString(),
          results: item.matched_courses || item.results
      }));
      
      setData(mapped);
    } catch (error) {
      const local = JSON.parse(localStorage.getItem('kp_mhs_v2') || "[]");
      setData(local.map((l:any) => ({ ...l, trx_id: `TRX-${l.id}`, date: new Date(l.id).toISOString() })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (action: 'approve' | 'revise' | 'reject') => {
      const id = validationModal.data.id;
      const statusMap = { approve: 'approved', revise: 'revisi', reject: 'rejected' };
      const newStatus = statusMap[action];

      toast.info(`Memproses ${newStatus}...`);
      try {
        await axios.post(`/admin/finalize/${id}`, { status: newStatus });
        toast.success(`Berhasil memperbarui status.`);
        loadData();
      } catch (e) {
        // Fallback for mock/local
        setData(prev => prev.map(p => p.id === id ? {...p, status: newStatus} : p));
        toast.success(`Status diperbarui (Mode Offline)`);
      } finally {
        setValidationModal({isOpen: false, data: null});
      }
  };

  const filteredData = data.filter(item => {
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase()) || 
                        item.trx_id?.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === "all") return matchSearch;
    return item.status.toLowerCase() === statusFilter.toLowerCase() && matchSearch;
  });

  return (
    <div className="space-y-10 animate-fade-in-quick pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h2 className="font-heading text-xl font-black text-[#001a33] uppercase tracking-tight">Data Hasil Konversi</h2>
            <p className="text-sm text-slate-400">Verifikasi dan finalisasi hasil pemetaan kredit mahasiswa.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#094E8B] hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-3">
                <FileArrowDown size={18} weight="fill" /> Export Laporan
            </button>
            <Link href="/campus-admin/input-konversi" className="flex-1 md:flex-none px-8 py-4 bg-[#094E8B] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#073e6f] transition shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3">
                <UserSquare size={18} weight="fill" /> Konversi Baru
            </Link>
        </div>
      </header>

      {/* FILTER BOX */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex bg-white p-1.5 rounded-[1.25rem] border border-slate-100 shadow-sm w-fit overflow-x-auto no-scrollbar">
              <button onClick={() => setStatusFilter('all')} className={`px-8 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-[#094E8B] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-slate-600'}`}>Semua</button>
              <button onClick={() => setStatusFilter('pending')} className={`px-8 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'pending' ? 'bg-amber-400 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Pending</button>
              <button onClick={() => setStatusFilter('approved')} className={`px-8 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'approved' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Disetujui</button>
          </div>

          <div className="relative group w-full lg:w-96">
              <MagnifyingGlass className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#094E8B] transition-colors" />
              <input 
                placeholder="Cari Nama Mahasiswa / ID..." 
                className="w-full h-14 pl-16 pr-6 bg-white border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all shadow-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
      </div>

      {/* LIST TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-32 gap-4">
                 <CircleNotch weight="bold" className="animate-spin text-blue-900 w-12 h-12" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Database...</p>
             </div>
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identitas Pengajuan</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Program Studi</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Hasil</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">Data tidak ditemukan.</td></tr>
                        ) : (
                            filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-[#094E8B] group-hover:bg-[#001a33] group-hover:text-white transition-all shadow-inner">
                                                <FileText size={20} weight="duotone" />
                                            </div>
                                            <div>
                                                <p className="font-black text-[#001a33] text-sm group-hover:text-[#094E8B] transition-colors">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black text-[#094E8B] bg-blue-50 px-1.5 py-0.5 rounded italic">{item.trx_id}</span>
                                                    <span className="text-slate-300">/</span>
                                                    <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{item.origin}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap weight="bold" className="text-slate-300" />
                                            <span className="text-xs font-bold text-slate-700">{item.prodi}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black text-[#094E8B] leading-none">{item.sks}</span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase mt-1">SKS Konversi</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            (item.status === 'approved' || item.status === 'disetujui') ? 'bg-emerald-50 text-emerald-600' :
                                            (item.status === 'rejected' || item.status === 'ditolak') ? 'bg-rose-50 text-rose-600' :
                                            'bg-amber-50 text-amber-500'
                                        }`}>
                                            {(item.status === 'approved' || item.status === 'disetujui') ? <CheckCircle weight="fill" /> : <Clock weight="fill" />}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                          onClick={() => setValidationModal({isOpen: true, data: item})}
                                          className="px-6 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-100 transition shadow-sm hover:shadow-md active:scale-95"
                                        >
                                            Buka Validasi
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             </div>
          )}
      </div>

      {/* VALIDATION MODAL */}
      {validationModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
              <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in flex flex-col max-h-[90vh]">
                  <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white z-10">
                    <div>
                        <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest">Validasi Kelayakan Konversi</h3>
                        <p className="text-lg font-black text-[#094E8B] mt-1">ID Pengajuan: {validationModal.data?.trx_id}</p>
                    </div>
                    <button onClick={() => setValidationModal({isOpen:false, data:null})} className="text-slate-400 hover:text-slate-600"><X weight="bold" size={24}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-6 lg:col-span-2">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em] mb-2">Nama Mahasiswa</p>
                                        <p className="font-black text-[#001a33] text-lg">{validationModal.data?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em] mb-2">Asal Universitas</p>
                                        <p className="font-bold text-slate-600 text-sm">{validationModal.data?.origin}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em] mb-2">Program Studi Tujuan</p>
                                        <p className="font-black text-[#001a33] text-sm">{validationModal.data?.prodi}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#094E8B] p-8 rounded-[2rem] text-white shadow-xl flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2">Total SKS Diakui</p>
                                <h1 className="text-6xl font-black">{validationModal.data?.sks}</h1>
                            </div>
                       </div>

                       <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rincian Mata Kuliah Terkonversi</h4>
                                <ListDashes weight="bold" className="text-slate-200" />
                            </div>
                            <div className="divide-y divide-slate-50">
                                {validationModal.data?.results && Object.entries(validationModal.data.results).map(([target, src]: [string, any], idx) => (
                                    <div key={idx} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors">
                                        <div className="flex items-center gap-5 flex-1">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xs font-black">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-black text-[#001a33] text-sm">{target}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{src.sks} SKS • Kurikulum Tujuan</p>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-auto flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Dikoversi Dari</p>
                                                <p className="text-[11px] font-bold text-slate-600">{src.matchedName}</p>
                                            </div>
                                            <div className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-black text-xs">
                                                {src.grade}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                       </div>
                  </div>

                  <div className="px-10 py-6 border-t border-slate-50 bg-white flex flex-wrap gap-4 justify-end z-10">
                      <button onClick={() => handleAction('reject')} className="px-8 h-12 bg-rose-50 text-rose-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-100 transition">Tolak</button>
                      <button onClick={() => handleAction('revise')} className="px-8 h-12 bg-amber-50 text-amber-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-amber-100 transition">Butuh Revisi</button>
                      <button onClick={() => handleAction('approve')} className="px-10 h-12 bg-[#094E8B] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#073e6f] transition shadow-xl shadow-blue-900/10 flex items-center gap-3">
                          <CheckCircle weight="bold" size={18} /> Approve & Cetak SK
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}