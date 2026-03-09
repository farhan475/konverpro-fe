"use client";

import { useState, useEffect } from "react";
import { 
  Buildings, 
  GraduationCap, 
  Book, 
  Wallet, 
  Info,
  CheckCircle,
  PencilSimple,
  Plus,
  Trash,
  Check,
  X,
  CreditCard,
  Receipt,
  DownloadSimple,
  ListChecks,
  CircleNotch
} from "@phosphor-icons/react";
import { toast } from "sonner";
import axios from "@/lib/axios";

export default function PengaturanKampus() {
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // States
  const [campusProfile, setCampusProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    logo_path: ""
  });
  
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [dictionary, setDictionary] = useState<any[]>([]);
  const [billing, setBilling] = useState({ balance: 0, transactions: [] });

  // Modal States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [prodiModal, setProdiModal] = useState({ isOpen: false, data: null as any });
  const [dictModal, setDictModal] = useState({ isOpen: false, data: null as any, keywords: "" });
  const [topupModal, setTopupModal] = useState(false);

  const loadAllData = async () => {
    try {
      const [resProfile, resProdis, resDict, resBilling] = await Promise.all([
        axios.get('/campus/settings/profile'),
        axios.get('/campus/settings/prodi'),
        axios.get('/campus/settings/dictionary'),
        axios.get('/campus/settings/billing-history')
      ]);

      setCampusProfile(resProfile.data.data);
      setProdiList(resProdis.data.data);
      setDictionary(resDict.data.data);
      setBilling({
        balance: resProfile.data.data.balance || 0,
        transactions: resBilling.data.data
      });
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data pengaturan.");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- ACTIONS ---
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
        await axios.post('/campus/settings/profile', {
            name: campusProfile.name,
            website: campusProfile.website
            // phone and address need back-end support if we want to save them
        });
        setIsEditingProfile(false);
        toast.success("Profil kampus berhasil diperbarui!");
    } catch (error) {
        toast.error("Gagal memperbarui profil.");
    } finally {
        setLoading(false);
    }
  };

  const handleSaveProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
        code: formData.get('code'),
        name: formData.get('nama'),
        level: formData.get('strata')
    };

    try {
        if (prodiModal.data) {
            await axios.put(`/campus/settings/prodi/${prodiModal.data.id}`, payload);
        } else {
            await axios.post('/campus/settings/prodi', payload);
        }
        await loadAllData();
        setProdiModal({ isOpen: false, data: null });
        toast.success("Data Prodi berhasil disimpan!");
    } catch (err) {
        toast.error("Gagal menyimpan data Prodi.");
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteProdi = async (id: string) => {
    if(confirm("Hapus prodi ini beserta kurikulumnya?")) {
        try {
            await axios.delete(`/campus/settings/prodi/${id}`);
            await loadAllData();
            toast.success("Prodi dihapus.");
        } catch (err) {
            toast.error("Gagal menghapus prodi.");
        }
    }
  };

  const handleSaveDictionary = async () => {
    const keysArray = dictModal.keywords.split(',').map(k => k.trim()).filter(k => k);
    setLoading(true);
    try {
        await axios.put(`/campus/settings/dictionary/${dictModal.data.id}`, {
            keywords: keysArray
        });
        await loadAllData();
        setDictModal({ isOpen: false, data: null, keywords: "" });
        toast.success("Sinonim diperbarui!");
    } catch (err) {
        toast.error("Gagal memperbarui kamus.");
    } finally {
        setLoading(false);
    }
  };

  const requestTopup = () => {
      setTopupModal(false);
      toast.success("Invoice Top-Up berhasil dibuat dan dikirim ke email Rektorat.");
  };

  if (isInitialLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <CircleNotch className="animate-spin text-blue-900 w-12 h-12" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menyiapkan Pengaturan...</p>
          </div>
      );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-quick pb-20 lg:pb-0">
      <header className="flex justify-between items-end">
        <div>
            <h2 className="font-heading text-lg lg:text-xl font-semibold tracking-tight text-[#001a33] uppercase">
                Pengaturan Sistem
            </h2>
            <p className="text-slate-400 text-xs lg:text-sm">
                Konfigurasi aplikasi KonverPro untuk kampus Anda.
            </p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* SIDEBAR TABS */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar bg-white p-2 lg:p-3 shadow-sm border border-slate-100 rounded-2xl sticky top-24 z-10">
            <button 
              onClick={() => setActiveTab('profil')} 
              className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === 'profil' ? 'bg-[#094E8B] text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
            >
                <Buildings weight={activeTab === 'profil' ? "fill" : "regular"} className="text-lg lg:text-xl" /> Profil Institusi
            </button>
            <button 
              onClick={() => setActiveTab('prodi')} 
              className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === 'prodi' ? 'bg-[#094E8B] text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
            >
                <GraduationCap weight={activeTab === 'prodi' ? "fill" : "regular"} className="text-lg lg:text-xl" /> Program Studi
            </button>
            <button 
              onClick={() => setActiveTab('kamus')} 
              className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === 'kamus' ? 'bg-[#094E8B] text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
            >
                <Book weight={activeTab === 'kamus' ? "fill" : "regular"} className="text-lg lg:text-xl" /> Kamus Pintar
            </button>
            <hr className="border-slate-100 my-1 hidden lg:block" />
            <button 
              onClick={() => setActiveTab('billing')} 
              className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === 'billing' ? 'bg-[#094E8B] text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
            >
                <Wallet weight={activeTab === 'billing' ? "fill" : "regular"} className="text-lg lg:text-xl" /> Tagihan & Token
            </button>
            <button 
              onClick={() => setActiveTab('info')} 
              className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === 'info' ? 'bg-[#094E8B] text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
            >
                <Info weight={activeTab === 'info' ? "fill" : "regular"} className="text-lg lg:text-xl" /> Informasi Sistem
            </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 w-full min-w-0 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:p-8 min-h-[500px]">
            
            {/* TAB: PROFIL */}
            {activeTab === 'profil' && (
                <div className="animate-fade-in-quick max-w-2xl">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                        <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                            <Buildings weight="duotone" className="text-blue-600 text-2xl" /> Identitas Kampus
                        </h3>
                        <button 
                          onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition ${isEditingProfile ? 'bg-amber-400 text-amber-900 hover:brightness-95' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {loading ? <CircleNotch className="animate-spin" /> : (isEditingProfile ? <><Check weight="bold" /> Simpan</> : <><PencilSimple weight="bold" /> Edit Profil</>)}
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Nama Institusi Terdaftar</label>
                                {isEditingProfile ? (
                                    <input 
                                      type="text" 
                                      value={campusProfile.name}
                                      onChange={e => setCampusProfile({...campusProfile, name: e.target.value})}
                                      className="w-full px-4 py-3 bg-yellow-50 border border-amber-300 rounded-xl font-bold text-[#001a33] focus:ring-2 focus:ring-amber-200 outline-none"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[#001a33] text-sm">{campusProfile.name}</div>
                                )}
                            </div>
                            
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Email Resmi Terdaftar</label>
                                <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-400 text-sm italic">{campusProfile.email} (Non-editable)</div>
                            </div>
                            
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Website</label>
                                {isEditingProfile ? (
                                    <input 
                                      type="text" 
                                      value={campusProfile.website || ""}
                                      onChange={e => setCampusProfile({...campusProfile, website: e.target.value})}
                                      className="w-full px-4 py-3 bg-yellow-50 border border-amber-300 rounded-xl font-bold text-[#001a33] focus:ring-2 focus:ring-amber-200 outline-none"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[#001a33] text-sm">{campusProfile.website || "-"}</div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                                        {campusProfile.logo_path ? (
                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${campusProfile.logo_path}`} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <Buildings className="text-blue-600" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-900">Logo Institusi</p>
                                        <p className="text-[10px] text-blue-700/60">Logo ini digunakan pada header aplikasi dan dokumen PDF resmi.</p>
                                    </div>
                                    {isEditingProfile && (
                                        <button className="ml-auto text-xs font-bold text-blue-600 hover:underline">Ubah Logo</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: PRODI */}
            {activeTab === 'prodi' && (
                <div className="animate-fade-in-quick">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-100 pb-4 gap-4">
                        <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                            <GraduationCap weight="duotone" className="text-blue-600 text-2xl" /> Manajemen Program Studi
                        </h3>
                        <button 
                          onClick={() => setProdiModal({ isOpen: true, data: null })}
                          className="px-4 py-2.5 bg-[#094E8B] text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#073e6f] transition shadow-md w-full sm:w-auto justify-center"
                        >
                            <Plus weight="bold" className="text-base" /> Tambah Prodi
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prodiList.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                                Belum ada Program Studi yang ditambahkan.
                            </div>
                        ) : (
                            prodiList.map((p, i) => (
                                <div key={p.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-blue-200 transition group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-blue-200/50 transition"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-[#094E8B] bg-blue-100 px-2 py-1 rounded uppercase">{p.level}</span>
                                                <h4 className="font-bold text-slate-800">{p.name}</h4>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                <button onClick={() => setProdiModal({ isOpen: true, data: p })} className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-500 transition shadow-sm">
                                                    <PencilSimple weight="bold" />
                                                </button>
                                                <button onClick={() => handleDeleteProdi(p.id)} className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500 transition shadow-sm">
                                                    <Trash weight="bold" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500"><span className="font-bold">Kode:</span> {p.code}</p>
                                            <p className="text-xs text-slate-500"><span className="font-bold">Tarif Konversi:</span> Rp 150.000 (Global)</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB: KAMUS PINTAR (Dictionary) */}
            {activeTab === 'kamus' && (
                <div className="animate-fade-in-quick">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-4 gap-4">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                                <Book weight="duotone" className="text-blue-600 text-2xl" /> Kamus Kata Kunci Pintar
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Tambahkan sinonim/variasi nama mata kuliah untuk meningkatkan akurasi auto-mapping.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full admin-table min-w-[600px]">
                            <thead>
                                <tr>
                                    <th className="w-1/3">Target Pencocokan</th>
                                    <th>Kata Kunci Transkrip (Variasi)</th>
                                    <th className="text-right w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dictionary.length === 0 ? (
                                    <tr><td colSpan={3} className="py-8 text-center text-slate-400 font-bold italic">Belum ada mata kuliah terdaftar. Silakan import kurikulum terlebih dahulu.</td></tr>
                                ) : (
                                    dictionary.map((d, i) => (
                                        <tr key={d.id} className="hover:bg-slate-50 transition">
                                            <td className="font-bold text-[#001a33]">{d.name}</td>
                                            <td>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {d.keywords && d.keywords.length > 0 ? d.keywords.map((k: string, j: number) => (
                                                        <span key={j} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded uppercase tracking-wider">{k}</span>
                                                    )) : <span className="text-xs text-slate-400 italic">Belum ada kata kunci...</span>}
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <button 
                                                  onClick={() => setDictModal({ isOpen: true, data: d, keywords: d.keywords?.join(", ") || "" })}
                                                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-amber-500 transition shadow-sm"
                                                >
                                                    <PencilSimple weight="bold" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: BILLING */}
            {activeTab === 'billing' && (
                <div className="animate-fade-in-quick">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                        <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                            <Wallet weight="duotone" className="text-blue-600 text-2xl" /> Saldo Perguruan Tinggi
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-[#094E8B] to-[#052f53] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-[200px] flex flex-col justify-between group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Saldo Tersedia</p>
                                    <h4 className={`text-4xl font-black ${billing.balance <= 1000000 ? 'text-amber-300' : 'text-white'}`}>
                                        Rp {billing.balance.toLocaleString('id-ID')}
                                    </h4>
                                </div>
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                                    <Wallet weight="duotone" className="text-3xl text-amber-400" />
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${billing.balance <= 1000000 ? 'bg-amber-400 animate-pulse' : 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'}`}></div>
                                    <span className="text-xs font-bold uppercase opacity-90">{billing.balance <= 1000000 ? 'Saldo Menipis' : 'Aktif'}</span>
                                </div>
                                <button onClick={() => setTopupModal(true)} className="px-5 py-2.5 bg-amber-400 text-[#001a33] font-black text-xs rounded-xl hover:bg-amber-300 transition shadow-lg flex items-center gap-2 transform active:scale-95">
                                    <CreditCard weight="bold" className="text-base" /> Top Up
                                </button>
                            </div>
                        </div>

                         <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex flex-col justify-center h-[200px]">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                                <Receipt weight="bold" className="text-lg text-rose-400" /> Transaksi Terakhir
                            </p>
                            <h4 className="text-3xl font-black text-slate-800 mb-4">
                                {billing.transactions.length} <span className="text-xs font-normal text-slate-400 uppercase tracking-widest">Aktivitas</span>
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Top-up saldo diproses secara otomatis jika menggunakan payment gateway.</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-[#001a33] uppercase mb-4 flex items-center gap-2">
                            <ListChecks weight="bold" className="text-slate-400" /> Histori Billing
                        </h4>
                        <div className="border border-slate-100 rounded-2xl overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Item / Deskripsi</th>
                                        <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Jumlah (Mhs)</th>
                                        <th className="px-5 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-5 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Nominal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billing.transactions.length === 0 ? (
                                        <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400 italic font-bold">Belum ada riwayat transaksi billing.</td></tr>
                                    ) : (
                                        billing.transactions.map((t:any, i) => (
                                            <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                                <td className="px-5 py-3 font-bold text-[#001a33]">{t.type === 'topup' ? `Top-Up Saldo (#${t.trx_id})` : `Layanan Konversi (#${t.trx_id})`}</td>
                                                <td className="px-5 py-3 font-bold text-slate-500">{t.amount_mhs || "-"}</td>
                                                <td className="px-5 py-3 text-center font-mono text-slate-500">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                                                <td className={`px-5 py-3 text-right font-black ${t.type === 'topup' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {t.type === 'topup' ? `+ Rp ${t.amount.toLocaleString()}` : `- Rp ${t.amount.toLocaleString()}`}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: INFO */}
            {activeTab === 'info' && (
                <div className="animate-fade-in-quick max-w-2xl">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                        <h3 className="text-lg font-heading font-bold text-[#001a33] flex items-center gap-2">
                            <Info weight="duotone" className="text-blue-600 text-2xl" /> Informasi Sistem
                        </h3>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-[#094E8B] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-900/10">K</div>
                            <div>
                                <h4 className="text-lg font-heading font-bold text-[#001a33]">KonverPro Enterprise</h4>
                                <p className="text-xs font-bold text-blue-600 bg-blue-100/50 inline-block px-2 py-0.5 rounded uppercase tracking-wider mt-1">v.2.1.0-Release</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm font-medium text-slate-600 border-t border-blue-100 pt-6">
                            <div className="flex justify-between py-2 border-b border-slate-100/50">
                                <span className="text-slate-400">Lisensi Institusi</span>
                                <span className="font-bold text-[#001a33]">{campusProfile.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100/50">
                                <span className="text-slate-400">Status Langganan</span>
                                <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle weight="fill" /> Aktif</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-slate-400">Dukungan Teknis</span>
                                <a href="mailto:support@konverpro.id" className="font-bold text-blue-600 hover:underline">support@konverpro.id</a>
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <button className="w-full py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm text-xs uppercase flex items-center justify-center gap-2 active:scale-95">
                                <DownloadSimple weight="bold" className="text-base" /> Unduh Dokumen Panduan (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* MODAL PRODI */}
      {prodiModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-in">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest">{prodiModal.data ? 'Edit' : 'Tambah'} Program Studi</h3>
                    <button onClick={() => setProdiModal({isOpen:false, data:null})} className="text-slate-400 hover:text-slate-600">
                        <X weight="bold" className="text-xl"/>
                    </button>
                </div>
                <form onSubmit={handleSaveProdi} className="p-8 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Strata</label>
                            <select name="strata" defaultValue={prodiModal.data?.level || "S1"} className="w-full p-3.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 outline-none bg-slate-50">
                                <option>D3</option><option>D4</option><option>S1</option><option>S2</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Nama Prodi</label>
                            <input name="nama" defaultValue={prodiModal.data?.name || ""} required className="w-full p-3.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 outline-none placeholder:text-slate-300" placeholder="Contoh: Teknik Informatika"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Kode Prodi Terdaftar (PDDIKTI)</label>
                        <input name="code" defaultValue={prodiModal.data?.code || ""} required className="w-full p-3.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 outline-none" placeholder="CP: 55201"/>
                    </div>
                    
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setProdiModal({isOpen:false, data:null})} className="flex-1 py-3.5 font-bold text-xs uppercase rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition">Batal</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3.5 font-black text-xs uppercase rounded-xl bg-[#094E8B] text-white hover:bg-[#073e6f] shadow-xl shadow-blue-900/20 flex items-center justify-center">
                            {loading ? <CircleNotch className="animate-spin text-lg" /> : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL DICTIONARY */}
      {dictModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-in">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest truncate max-w-[80%]">Mapping: {dictModal.data?.name}</h3>
                    <button onClick={() => setDictModal({isOpen:false, data:null, keywords:""})} className="text-slate-400 hover:text-slate-600">
                        <X weight="bold" className="text-xl"/>
                    </button>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-3">Variasi Nama MK di Transkrip (Pisahkan Koma)</label>
                        <textarea 
                          value={dictModal.keywords} 
                          onChange={(e) => setDictModal({...dictModal, keywords: e.target.value})}
                          className="w-full p-4 border border-amber-300 bg-amber-50/50 rounded-2xl text-sm font-bold focus:border-amber-400 outline-none min-h-[140px] text-amber-900 leading-relaxed shadow-inner" 
                          placeholder="Statistika IT, Probabilitas & Statistika, Probstat"
                        />
                        <div className="p-3 bg-amber-100/50 rounded-xl mt-4 flex gap-3">
                            <Info weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-700 leading-relaxed font-bold">Sinonim membantu AI mengenali MK yang sama meskipun namanya berbeda di transkrip asal.</p>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button onClick={() => setDictModal({isOpen:false, data:null, keywords:""})} className="flex-1 py-3.5 font-bold text-xs uppercase rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">Batal</button>
                        <button onClick={handleSaveDictionary} disabled={loading} className="flex-1 py-3.5 font-black text-xs uppercase rounded-xl bg-[#094E8B] text-white hover:bg-[#073e6f] shadow-xl shadow-blue-900/20 flex items-center justify-center">
                            {loading ? <CircleNotch className="animate-spin text-lg" /> : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL TOPUP */}
      {topupModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden text-center p-10 animate-slide-in">
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-inner">
                    <CreditCard weight="duotone" className="text-5xl" />
                </div>
                <h3 className="font-heading font-black text-xl text-[#001a33] mb-2 tracking-tight">Top-Up Saldo Token</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Pilih Nominal Pengisian</p>
                
                <div className="space-y-3 mb-8">
                    <button className="w-full py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600 transition-all transform active:scale-95">Rp 1.000.000</button>
                    <button className="w-full py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600 transition-all transform active:scale-95">Rp 2.500.000</button>
                    <button className="w-full py-3 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 cursor-not-allowed uppercase tracking-tighter">Atau Input Nominal Kustom</button>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setTopupModal(false)} className="flex-1 py-4 font-bold text-xs uppercase rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200">Batal</button>
                    <button onClick={requestTopup} className="flex-1 py-4 font-black text-xs uppercase rounded-2xl bg-amber-400 text-amber-900 hover:bg-amber-300 shadow-xl shadow-amber-500/20">Bayar</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}