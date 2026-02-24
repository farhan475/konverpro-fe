"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Building, GraduationCap, BookA, Loader2, Plus, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profil");
  const [loading, setLoading] = useState(false);

  // States
  const [profile, setProfile] = useState({ name: "", website: "" });
  const [prodis, setProdis] = useState<any[]>([]);
  const [dictionary, setDictionary] = useState<any[]>([]);

  // Modal States
  const [openProdiModal, setOpenProdiModal] = useState(false);
  const [newProdi, setNewProdi] = useState({ code: "", name: "", level: "S1" });
  
  const [openDictModal, setOpenDictModal] = useState(false);
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [keywordInput, setKeywordInput] = useState("");

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, prodRes, dictRes] = await Promise.all([
        axios.get("/campus/settings/profile"),
        axios.get("/campus/settings/prodi"),
        axios.get("/campus/settings/dictionary")
      ]);
      setProfile(profRes.data.data);
      setProdis(prodRes.data.data);
      setDictionary(dictRes.data.data);
    } catch (error) {
      toast.error("Gagal memuat data pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post("/campus/settings/profile", profile);
      toast.success("Profil berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan profil");
    }
  };

  const handleAddProdi = async () => {
    try {
      await axios.post("/campus/settings/prodi", newProdi);
      toast.success("Prodi berhasil ditambahkan");
      setOpenProdiModal(false);
      setNewProdi({ code: "", name: "", level: "S1" });
      fetchData();
    } catch (error) {
      toast.error("Gagal menambah prodi");
    }
  };

  const handleDeleteProdi = async (id: string) => {
    if (!confirm("Yakin ingin menghapus prodi ini?")) return;
    try {
      await axios.delete(`/campus/settings/prodi/${id}`);
      toast.success("Prodi dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus prodi");
    }
  };

  const handleSaveDictionary = async () => {
    try {
      const keywordArray = keywordInput.split(",").map(k => k.trim()).filter(k => k !== "");
      await axios.put(`/campus/settings/dictionary/${activeCourse.id}`, { keywords: keywordArray });
      toast.success("Kamus sinonim berhasil diperbarui"); // REVISI TEKS
      setOpenDictModal(false);
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui kamus");
    }
  };

  if (loading && !profile.name) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pengaturan Kampus</h2>
        <p className="text-slate-500 text-sm">Kelola profil, program studi, dan kamus pencocokan.</p> {/* REVISI TEKS */}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <button onClick={() => setActiveTab("profil")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profil' ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <Building className="w-4 h-4" /> Profil Kampus
          </button>
          <button onClick={() => setActiveTab("prodi")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'prodi' ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <GraduationCap className="w-4 h-4" /> Program Studi
          </button>
          <button onClick={() => setActiveTab("kamus")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'kamus' ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <BookA className="w-4 h-4" /> Kamus Pencocokan {/* REVISI TEKS */}
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0 w-full">
          
          {/* TAB 1 & 2 DIBIARKAN SAMA (Profil & Prodi) ... */}
          {activeTab === "profil" && (
            <Card className="animate-fade-in border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 mb-4 flex flex-row justify-between items-center">
                <CardTitle className="text-lg">Informasi Kampus</CardTitle>
                <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 mr-2" /> Simpan</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Nama Kampus</label>
                  <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="bg-slate-50" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Website Utama</label>
                  <Input value={profile.website || ""} onChange={(e) => setProfile({...profile, website: e.target.value})} className="bg-slate-50" placeholder="https://..." />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "prodi" && (
            <Card className="animate-fade-in border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 mb-4 flex flex-row justify-between items-center">
                <CardTitle className="text-lg">Daftar Program Studi</CardTitle>
                <Button onClick={() => setOpenProdiModal(true)} className="bg-blue-600"><Plus className="w-4 h-4 mr-2" /> Tambah Prodi</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Prodi</TableHead>
                      <TableHead className="text-center">Jenjang</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prodis.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.code}</TableCell>
                        <TableCell className="font-bold text-slate-700">{p.name}</TableCell>
                        <TableCell className="text-center"><Badge variant="secondary">{p.level}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteProdi(p.id)} className="text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: KAMUS AI -> Menjadi KAMUS FUZZY LOGIC */}
          {activeTab === "kamus" && (
            <Card className="animate-fade-in border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 mb-4">
                <CardTitle className="text-lg">Kamus Sinonim Akademik</CardTitle>
                <p className="text-xs text-slate-500">Tambahkan kata kunci/sinonim untuk meningkatkan akurasi sistem Fuzzy Logic kami.</p> {/* REVISI TEKS */}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-1/3">Mata Kuliah Utama (Target)</TableHead>
                      <TableHead>Sinonim / Keyword</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dictionary.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-bold text-slate-700">{d.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {d.keywords && d.keywords.length > 0 ? d.keywords.map((k: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{k}</Badge>
                            )) : <span className="text-xs text-slate-400 italic">Belum ada sinonim</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => {
                            setActiveCourse(d);
                            setKeywordInput(d.keywords ? d.keywords.join(", ") : "");
                            setOpenDictModal(true);
                          }}>Edit Sinonim</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* MODALS */}
      <Dialog open={openProdiModal} onOpenChange={setOpenProdiModal}>
        <DialogContent>
            {/* Modal Tambah Prodi Dibiarin Sama */}
        </DialogContent>
      </Dialog>

      {/* Modal Edit Dictionary */}
      <Dialog open={openDictModal} onOpenChange={setOpenDictModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Sinonim: {activeCourse?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Variasi Nama (Pisahkan dengan koma)</label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 min-h-[100px]" 
                value={keywordInput} 
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Contoh: Alpro, Dasar Pemrograman, Logic Programming"
              />
              <p className="text-[10px] text-slate-400 mt-1">Sistem akan otomatis memberikan skor 100% jika nama MK di transkrip pendaftar cocok dengan salah satu kata di atas.</p>
            </div>
            <Button onClick={handleSaveDictionary} className="w-full bg-blue-600">Simpan Sinonim</Button> {/* REVISI TEKS */}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}