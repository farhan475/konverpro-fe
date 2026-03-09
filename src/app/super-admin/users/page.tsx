"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { 
  Users, 
  Trash, 
  Plus, 
  ShieldCheck, 
  Buildings, 
  EnvelopeSimple, 
  Key, 
  CircleNotch,
  Check,
  X,
  IdentificationBadge,
  CaretRight
} from "@phosphor-icons/react";
import { toast } from "sonner";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, data: null as any });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    try {
      const [resUsers, resCampuses] = await Promise.all([
        axios.get('/super-admin/users'),
        axios.get('/super-admin/campuses')
      ]);
      setUsers(resUsers.data.data);
      setCampuses(resCampuses.data.data);
    } catch (error) {
      toast.error("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password') || undefined,
        role: formData.get('role'),
        university_id: formData.get('role') === 'campus_admin' ? formData.get('university_id') : null
    };

    try {
        if (modal.data) {
            await axios.put(`/super-admin/users/${modal.data.id}`, payload);
            toast.success("Data user diperbarui!");
        } else {
            await axios.post('/super-admin/users', payload);
            toast.success("User baru berhasil dibuat!");
        }
        setModal({ isOpen: false, data: null });
        fetchData();
    } catch (error: unknown) {
        toast.error(error.response?.data?.message || "Gagal menyimpan user.");
    } finally {
        setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Yakin ingin mencabut akses user ini?")) return;
    try {
      await axios.delete(`/super-admin/users/${id}`);
      toast.success("Akses user berhasil dicabut.");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus user.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-quick">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h2 className="font-heading text-xl font-black text-[#001a33] uppercase tracking-tight">Manajemen Akses & Pengguna</h2>
            <p className="text-sm text-slate-400">Kelola kredensial dan hak akses seluruh administrator platform.</p>
        </div>
        <button 
          onClick={() => setModal({ isOpen: true, data: null })}
          className="px-8 py-4 bg-[#094E8B] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#073e6f] transition shadow-xl shadow-blue-900/10 active:scale-95"
        >
            <Plus weight="bold" /> Tambah Administrator
        </button>
      </header>

      {/* USER LIST CARDS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-32 gap-4">
                 <CircleNotch weight="bold" className="animate-spin text-blue-900 w-12 h-12" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memetakan Pengguna...</p>
             </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identitas User</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Level Akses</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Afiliasi Institusi</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:border-blue-900 transition-colors relative overflow-hidden">
                                            <Users size={24} weight="duotone" className="group-hover:text-blue-900 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#001a33] text-sm">{u.name}</p>
                                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        <ShieldCheck weight="fill" />
                                        {u.role === 'super_admin' ? 'Super Admin' : 'Admin Kampus'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-slate-500">
                                    {u.university ? (
                                        <div className="flex items-center gap-2">
                                            <Buildings size={16} weight="duotone" className="text-slate-300" />
                                            <span>{u.university.name}</span>
                                        </div>
                                    ) : (
                                        <p className="italic text-slate-300 font-medium">Global Platform Admin</p>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 outline-none">
                                        <button onClick={() => setModal({ isOpen: true, data: u })} className="h-9 w-9 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-200 transition shadow-sm">
                                            <IdentificationBadge size={20} weight="bold" />
                                        </button>
                                        <button onClick={() => handleDelete(u.id)} className="h-9 w-9 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition shadow-sm">
                                            <Trash size={20} weight="bold" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* MODAL: CREATE/EDIT */}
      {modal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-quick">
              <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in">
                  <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <h3 className="font-heading font-black text-[#001a33] uppercase text-xs tracking-widest">{modal.data ? 'Update' : 'Registrasi'} Profil User</h3>
                      <button onClick={() => setModal({isOpen: false, data: null})} className="text-slate-400 hover:text-slate-600 outline-none"><X weight="bold" size={24}/></button>
                  </div>
                  <form onSubmit={handleSave} className="p-10 space-y-6">
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Nama Lengkap</label>
                                <input name="name" defaultValue={modal.data?.name || ""} required className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="Nama Admin"/>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Email Login</label>
                                <div className="relative">
                                    <EnvelopeSimple className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input name="email" type="email" defaultValue={modal.data?.email || ""} required className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="user@domain.id"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Password</label>
                                <div className="relative">
                                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input name="password" type="password" required={!modal.data} className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="******"/>
                                </div>
                                {modal.data && <p className="text-[9px] text-slate-400 mt-2 italic px-1">*Biarkan kosong jika tidak ingin ganti password.</p>}
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Level Akses</label>
                                <select name="role" defaultValue={modal.data?.role || "campus_admin"} className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none appearance-none cursor-pointer">
                                    <option value="campus_admin">Admin Kampus Mitra</option>
                                    <option value="super_admin">Super Administrator</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Afiliasi Kampus</label>
                                <div className="relative">
                                    <Buildings className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <select name="university_id" defaultValue={modal.data?.university_id || ""} className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none appearance-none cursor-pointer">
                                        <option value="">Tidak ada Afiliasi (Global)</option>
                                        {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                          </div>
                      </div>

                      <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setModal({isOpen: false, data: null})} className="flex-1 h-14 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition">Batal</button>
                        <button type="submit" disabled={formLoading} className="flex-1 h-16 bg-[#094E8B] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 flex items-center justify-center gap-4 hover:bg-[#073e6f] transition-all disabled:opacity-50">
                            {formLoading ? <CircleNotch className="animate-spin" size={20} /> : <><Check weight="bold" size={20} /> Simpan User</>}
                        </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}