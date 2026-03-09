"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { 
  Buildings, 
  Plus, 
  DownloadSimple, 
  MagnifyingGlass, 
  Gear, 
  Crown, 
  CheckCircle,
  Warning,
  CircleNotch,
  CaretRight,
  Globe,
  CurrencyCircleDollar,
  X
} from "@phosphor-icons/react";
import { toast } from "sonner";

export default function KampusManagementPage() {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState({ type: null as 'add' | 'manage' | null, data: null as any });
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get('/super-admin/campuses');
      setCampuses(res.data.data);
    } catch (error) {
      toast.error("Gagal memuat data kampus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const payload = {
        name: formData.get('name'),
        slug: String(formData.get('name')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        email: formData.get('email'),
        plan: formData.get('plan'),
        billing_mode: 'independent',
        student_fee: 50000, 
        cost_per_check: 15000
    };

    try {
      await axios.post('/super-admin/campuses', payload);
      toast.success("Kampus berhasil didaftarkan!");
      setModal({ type: null, data: null });
      fetchData();
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || "Gagal mendaftarkan kampus");
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Approve mitra ${name}?`)) return;
    try {
      await axios.post(`/super-admin/campuses/${id}/approve`);
      toast.success(`${name} disetujui.`);
      fetchData();
    } catch (error) {
      toast.error("Gagal menyetujui " + name);
    }
  };

  const pendingCount = campuses.filter(c => c.status === 'pending').length;
  const filteredCampuses = campuses.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTab = activeTab === 'all' ? true : c.status === 'pending';
      return matchSearch && matchTab;
  });

  return (
    <div className="space-y-8 animate-fade-in-quick">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h2 className="font-heading text-xl font-black text-[#001a33] uppercase tracking-tight">Manajemen Mitra Kampus</h2>
            <p className="text-sm text-slate-400">Kelola institusi perguruan tinggi yang bekerjasama dengan KonverPro.</p>
        </div>
        <button 
          onClick={() => setModal({ type: 'add', data: null })}
          className="px-8 py-4 bg-[#094E8B] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#073e6f] transition shadow-xl shadow-blue-900/10 active:scale-95"
        >
            <Plus weight="bold" /> Registrasi Mitra
        </button>
      </header>

      {/* TABS & SEARCH */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex bg-white p-1.5 rounded-[1.25rem] border border-slate-100 shadow-sm w-fit">
              <button 
                onClick={() => setActiveTab('all')} 
                className={`px-8 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'all' ? 'bg-[#094E8B] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  Semua Mitra
              </button>
              <button 
                onClick={() => setActiveTab('pending')} 
                className={`flex items-center gap-3 px-8 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'pending' ? 'bg-amber-400 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  Pending {pendingCount > 0 && <span className={`px-1.5 py-0.5 rounded-lg text-[8px] ${activeTab === 'pending' ? 'bg-white text-amber-500' : 'bg-red-500 text-white'}`}>{pendingCount}</span>}
              </button>
          </div>

          <div className="relative group w-full lg:w-96">
              <MagnifyingGlass className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#094E8B] transition-colors" />
              <input 
                placeholder="Cari Perguruan Tinggi..." 
                className="w-full h-14 pl-16 pr-6 bg-white border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all shadow-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
          </div>
      </div>

      {/* MAIN TABLE */}
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
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Informasi Institusi</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Lisensi</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Saldo Deposit</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredCampuses.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">Data tidak ditemukan.</td></tr>
                        ) : (
                            filteredCampuses.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-lg">
                                                {c.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-[#001a33] text-sm group-hover:text-[#094E8B] transition-colors">{c.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Globe size={12} className="text-slate-300" />
                                                    <p className="text-[10px] font-bold text-slate-400 lowercase">{c.slug}.konverpro.id</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${c.plan === 'Enterprise' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                {c.plan || 'Premium'}
                                            </span>
                                            {c.isPartner && <Crown weight="fill" className="text-amber-400" size={18} />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>
                                            <div className={`w-1 h-1 rounded-full ${c.status === 'active' ? 'bg-emerald-600' : 'bg-amber-500'}`}></div>
                                            {c.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`font-mono font-black text-sm ${c.balance < 100000 ? 'text-rose-500' : 'text-slate-700'}`}>
                                            Rp {(c.balance || 0).toLocaleString('id-ID')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {c.status === 'pending' && (
                                                <button onClick={() => handleApprove(c.id, c.name)} className="h-9 px-4 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">
                                                    Approve
                                                </button>
                                            )}
                                            <button onClick={() => setModal({ type: 'manage', data: c })} className="h-9 px-4 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition shadow-sm">
                                                <Gear weight="bold" /> Kelola Plan
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             </div>
        )}
      </div>

      {/* MODAL: REGISTRASI */}
      {modal.type === 'add' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
              <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in">
                  <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                      <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest">Registrasi Mitra Baru</h3>
                      <button onClick={() => setModal({type:null, data:null})} className="text-slate-400 hover:text-slate-600"><X weight="bold" size={24}/></button>
                  </div>
                  <form onSubmit={handleCreate} className="p-10 space-y-6">
                      <div className="space-y-4">
                          <div>
                              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Nama Institusi</label>
                              <input name="name" required className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="Universitas Terbuka Baru"/>
                          </div>
                          <div>
                              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Email Administrasi</label>
                              <input name="email" type="email" required className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="admin@kampus.ac.id"/>
                          </div>
                          <div>
                              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Paket Layanan</label>
                              <select name="plan" className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm appearance-none cursor-pointer">
                                  <option value="Enterprise">Enterprise (SaaS Managed)</option>
                                  <option value="Premium">Premium (Quota Based)</option>
                              </select>
                          </div>
                      </div>

                      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                          <Warning size={24} weight="fill" className="text-blue-600 shrink-0" />
                          <p className="text-[11px] text-blue-700 leading-relaxed font-medium">Sistem akan otomatis membuatkan subdomain dan mengirimkan email aktivasi ke administrasi kampus setelah pendaftaran.</p>
                      </div>

                      <button type="submit" disabled={formLoading} className="w-full h-16 bg-[#094E8B] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-900/20 flex items-center justify-center gap-4 hover:bg-[#073e6f] transition-all disabled:opacity-50">
                          {formLoading ? <CircleNotch className="animate-spin" size={20} /> : "Konfirmasi & Daftarkan"}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* MODAL: MANAGE */}
      {modal.type === 'manage' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
              <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in flex flex-col max-h-[90vh]">
                  <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white z-10">
                    <div>
                        <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest">Detail & Manajemen Mitra</h3>
                        <p className="text-lg font-black text-[#094E8B] mt-1">{modal.data?.name}</p>
                    </div>
                    <button onClick={() => setModal({type:null, data:null})} className="text-slate-400 hover:text-slate-600"><X weight="bold" size={24}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">Informasi Dasar</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] text-slate-400 mb-1">Status Lisensi</p>
                                        <p className="text-blue-900">{modal.data?.plan || 'Enterprise'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] text-slate-400 mb-1">Status Akun</p>
                                        <p className="text-emerald-600 uppercase italic text-[11px]">{modal.data?.status || 'Active'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 col-span-2">
                                        <p className="text-[9px] text-slate-400 mb-1">Endpoint Subdomain</p>
                                        <p className="text-slate-700 font-mono">{modal.data?.slug}.konverpro.id</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">Keuangan Mitra</h4>
                                <div className="bg-[#094E8B] p-8 rounded-[2rem] text-white shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                                     <CurrencyCircleDollar size={48} weight="duotone" className="text-amber-400 mb-4" />
                                     <p className="text-[10px] uppercase font-black text-blue-200 tracking-[0.2em] mb-2">Saldo Deposit</p>
                                     <h2 className="text-3xl font-black">Rp {(modal.data?.balance || 0).toLocaleString('id-ID')}</h2>
                                </div>
                            </div>
                       </div>

                       <div className="mt-12 bg-white rounded-3xl border border-slate-100 p-8">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Tindakan Cepat</h4>
                            <div className="flex flex-wrap gap-4">
                                <button className="px-6 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition">Reset Password Admin</button>
                                <button className="px-6 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition">Transfer Kuota Manual</button>
                                <button className="px-6 py-3 bg-rose-50 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-100 transition">Suspend Akses</button>
                            </div>
                       </div>
                  </div>

                  <div className="px-10 py-6 border-t border-slate-50 bg-white flex justify-end gap-4 z-10">
                      <button onClick={() => setModal({type:null, data:null})} className="px-8 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition">Tutup</button>
                      <button className="px-8 py-3 bg-[#094E8B] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#073e6f] transition shadow-lg shadow-blue-900/10">Buka Panel Mitra <CaretRight weight="bold" className="inline ml-1"/></button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
