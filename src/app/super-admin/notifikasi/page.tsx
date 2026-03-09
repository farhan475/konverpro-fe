"use client";

import { useState, useEffect } from "react";
import { 
  EnvelopeSimple, 
  PencilSimple, 
  Trash, 
  Plus, 
  X, 
  Check, 
  Bell, 
  Info,
  CircleNotch,
  ChatCircleText
} from "@phosphor-icons/react";
import { toast } from "sonner";
import axios from "@/lib/axios";

export default function NotificationTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, data: null as any });

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/super-admin/notification-templates');
      setTemplates(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat template notifikasi.");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
        name: formData.get('name'),
        trigger: formData.get('trigger'),
        subject: formData.get('subject'),
        body: formData.get('body'),
    };

    try {
        if (modal.data) {
            await axios.put(`/super-admin/notification-templates/${modal.data.id}`, payload);
        } else {
            await axios.post('/super-admin/notification-templates', payload);
        }
        await fetchTemplates();
        setModal({ isOpen: false, data: null });
        toast.success("Template berhasil disimpan!");
    } catch (error: any) {
        toast.error("Gagal menyimpan template", { description: error.response?.data?.message || "Cek kembali data Anda." });
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus template ini?")) {
        try {
            await axios.delete(`/super-admin/notification-templates/${id}`);
            await fetchTemplates();
            toast.success("Template berhasil dihapus.");
        } catch (error) {
            toast.error("Gagal menghapus template.");
        }
    }
  };

  if (isInitialLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <CircleNotch className="animate-spin text-blue-900 w-12 h-12" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat Template...</p>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in-quick">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight text-[#001a33] uppercase">
                Template Notifikasi
            </h2>
            <p className="text-slate-400 text-sm">
                Kelola template Email dan WA yang dikirimkan secara otomatis oleh sistem.
            </p>
        </div>
        <button 
          onClick={() => setModal({ isOpen: true, data: null })}
          className="px-6 py-3 bg-[#094E8B] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#073e6f] transition shadow-xl shadow-blue-900/10"
        >
            <Plus weight="bold" /> Template Baru
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <EnvelopeSimple size={24} weight="duotone" />
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => setModal({ isOpen: true, data: tpl })} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-500 shadow-sm">
                                <PencilSimple weight="bold" />
                            </button>
                            <button onClick={() => handleDelete(tpl.id)} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500 shadow-sm">
                                <Trash weight="bold" />
                            </button>
                        </div>
                    </div>
                    
                    <h4 className="font-black text-[#001a33] mb-1">{tpl.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{tpl.trigger}</p>
                    
                    <div className="space-y-3 mt-auto pt-6 border-t border-slate-50">
                        <p className="text-xs text-slate-500 line-clamp-2"><span className="font-bold text-slate-800">Subjek:</span> {tpl.subject}</p>
                        <div className="p-3 bg-slate-50 rounded-xl">
                           <p className="text-[10px] text-slate-400 italic font-mono line-clamp-2">{tpl.body}</p>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {templates.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <ChatCircleText size={64} weight="light" className="text-slate-200 mx-auto mb-6" />
              <h4 className="font-bold text-slate-400">Belum ada template notifikasi aktif.</h4>
          </div>
      )}

      {/* MODAL EDIT/ADD */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest">{modal.data ? 'Edit' : 'Tambah'} Template</h3>
                    <button onClick={() => setModal({isOpen:false, data:null})} className="text-slate-400 hover:text-slate-600"><X weight="bold" size={24}/></button>
                </div>
                <form onSubmit={handleSave} className="p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Nama Template</label>
                            <input name="name" defaultValue={modal.data?.name || ""} required className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="Contoh: Email Selamat Datang"/>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Trigger (Event ID)</label>
                            <input name="trigger" defaultValue={modal.data?.trigger || ""} required className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-sm" placeholder="user_welcome_email"/>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Subjek Email/Pesan</label>
                            <input name="subject" defaultValue={modal.data?.subject || ""} required className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="Selamat Datang di KonverPro!"/>
                        </div>
                        <div className="col-span-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Konten Pesan (HTML/Markdown)</label>
                             <textarea name="body" defaultValue={modal.data?.body || ""} required className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-medium text-sm min-h-[180px]" placeholder="Gunakan placeholder seperti {{name}}, {{university}}, dll." />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-3xl flex gap-4 items-start border border-blue-100">
                        <Info size={24} weight="fill" className="text-blue-600 shrink-0" />
                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">Tips: Anda dapat menggunakan variabel sistem di dalam kurung kurawal ganda seperti <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{{user_name}}"}</code> untuk personalisasi pesan otomatis.</p>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setModal({isOpen:false, data:null})} className="flex-1 h-14 font-bold text-xs uppercase rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200">Batal</button>
                        <button type="submit" disabled={loading} className="flex-1 h-14 font-black text-xs uppercase rounded-2xl bg-[#094E8B] text-white hover:bg-[#073e6f] shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3">
                            {loading ? <CircleNotch className="animate-spin" size={20} /> : <><Check weight="bold" size={20}/> Simpan Template</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}
