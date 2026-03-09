"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { 
  CurrencyCircleDollar, 
  CheckCircle, 
  Clock, 
  CircleNotch, 
  ArrowRight,
  Receipt,
  Buildings,
  WarningCircle,
  ChatCircleText,
  TrendUp
} from "@phosphor-icons/react";
import { toast } from "sonner";

export default function FinanceTopupPage() {
  const [topups, setTopups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState<string | null>(null);

  const fetchTopups = async () => {
    try {
      const res = await axios.get('/super-admin/topups?status=pending');
      setTopups(res.data.data || []);
    } catch (error) {
      console.warn("API /topups disabled or missing.");
      setTopups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopups();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm("Konfirmasi verifikasi transfer dan tambah saldo otomatis?")) return;
    
    setFormLoading(id);
    try {
      await axios.post(`/super-admin/topups/${id}/approve`);
      toast.success("Top Up disetujui, saldo telah ditambahkan.");
      fetchTopups();
    } catch (error) {
      toast.error("Gagal melakukan approve top up");
    } finally {
      setFormLoading(null);
    }
  };

  const pendingQueue = topups.filter(t => t.status === 'pending');

  return (
    <div className="space-y-10 animate-fade-in-quick">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <h2 className="font-heading text-xl font-black text-[#001a33] uppercase tracking-tight">Verifikasi Keuangan</h2>
                <p className="text-sm text-slate-400">Pusat approval deposit saldo kampus mitra secara real-time.</p>
            </div>
            <div className="flex bg-blue-50/50 p-2 rounded-2xl border border-blue-100 items-center gap-4 px-6 py-3">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-blue-900/40 uppercase tracking-widest">Antrean Pending</span>
                    <span className="text-lg font-black text-blue-900 leading-tight">{pendingQueue.length} <span className="text-[10px] font-medium text-slate-400">Transaksi</span></span>
                </div>
                <button 
                  onClick={fetchTopups}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 hover:rotate-180 transition-transform duration-700 active:scale-95 border border-slate-100"
                >
                    <TrendUp weight="bold" />
                </button>
            </div>
        </header>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-4">
                 <CircleNotch weight="bold" className="animate-spin text-blue-900 w-12 h-12" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mengecek Antrean Transaksi...</p>
             </div>
        ) : pendingQueue.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-50 shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-slate-100 rounded-[2rem] animate-ping opacity-20"></div>
                    <ChatCircleText size={48} weight="light" className="text-slate-200" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                </div>
                <h3 className="text-xl font-black text-[#001a33] mb-2 uppercase tracking-tight">Tidak Ada Antrean</h3>
                <p className="text-sm text-slate-400 font-bold max-w-xs text-center leading-relaxed italic">Seluruh permintaan top-up mitra telah terverifikasi atau tidak ada data baru.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {pendingQueue.map((t) => (
                    <div key={t.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-900 group-hover:text-white transition-colors">
                                        <Buildings size={24} weight="duotone" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-[#001a33] text-sm group-hover:text-blue-900 transition-colors uppercase pr-10">{t.campus?.name || t.campusName}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock size={12} className="text-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-400 italic">Request: {new Date(t.created_at || Date.now()).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                                    <WarningCircle size={20} weight="fill" />
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    <Receipt weight="bold" /> Nominal Top Up
                                </p>
                                <h2 className="text-3xl font-black text-[#094E8B]">
                                    Rp {(t.amount || 0).toLocaleString('id-ID')}
                                </h2>
                            </div>

                            <button 
                                disabled={formLoading === t.id}
                                className="w-full h-16 bg-[#094E8B] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:bg-[#073e6f] transition-all flex items-center justify-center gap-4 group/btn disabled:opacity-50"
                                onClick={() => handleApprove(t.id, t.campus?.name || "Kampus")}
                            >
                                {formLoading === t.id ? (
                                     <CircleNotch className="animate-spin" size={20} />
                                ) : (
                                    <>Verify & Process <ArrowRight weight="bold" className="group-hover/btn:translate-x-2 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}
