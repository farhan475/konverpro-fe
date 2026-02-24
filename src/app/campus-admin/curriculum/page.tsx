"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, BookOpen, Loader2 } from "lucide-react"; // Pastikan Upload ada di sini
import { toast } from "sonner";

export default function CurriculumPage() {
  const [prodis, setProdis] = useState<any[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // 1. Load Daftar Prodi
  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const res = await axios.get("/curriculum/prodi");
        const prodiData = res.data.data;
        setProdis(prodiData);
        
        // Pilih prodi pertama otomatis jika ada
        if (prodiData && prodiData.length > 0) {
          setSelectedProdi(prodiData[0].id);
        } else {
          toast.info("Tidak ada data Program Studi untuk akun ini.");
        }
      } catch (err) {
        console.error(err);
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
      .then((res) => {
        setCourses(res.data.data);
      })
      .catch(() => {
        toast.error("Gagal memuat mata kuliah");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedProdi]);

  // 3. Handle Upload Excel
  const handleImport = async () => {
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
      setOpenDialog(false);
      setFile(null);
      
      // Reload data mata kuliah
      const res = await axios.get(`/curriculum/prodi/${selectedProdi}/courses`);
      setCourses(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal import");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* HEADER SECTION - Diperbaiki agar tombol pasti muncul */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manajemen Kurikulum</h2>
          <p className="text-slate-500 text-sm">Atur mata kuliah target untuk pencocokan.</p>
        </div>
        
        {/* Tombol Upload */}
        <div className="flex-shrink-0">
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <Upload size={18} /> 
                  <span>Import Excel</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Kurikulum (Excel)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="p-4 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200">
                        Pastikan format Excel Anda memiliki urutan kolom berikut:<br/>
                        <span className="font-mono text-xs font-bold mt-2 block">
                          [No] [Kode MK] [Nama MK] [SKS] [Semester] [Wajib: Y/N] [Keywords]
                        </span>
                    </div>
                    <Input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    <Button onClick={handleImport} disabled={uploading || !file} className="w-full bg-blue-600">
                        {uploading ? <><Loader2 className="animate-spin mr-2"/> Mengupload...</> : "Proses Import"}
                    </Button>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SIDEBAR MINI: PILIH PRODI */}
        <Card className="md:col-span-1 h-fit shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 mb-3">
                <CardTitle className="text-sm font-bold">Program Studi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-4">
                {prodis.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Tidak ada prodi.</p>
                ) : (
                    prodis.map((p) => (
                        <div 
                            key={p.id}
                            onClick={() => setSelectedProdi(p.id)}
                            className={`p-3 rounded-lg cursor-pointer text-sm font-medium transition-all flex justify-between items-center ${
                                selectedProdi === p.id 
                                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                                : "hover:bg-slate-50 text-slate-600 border border-transparent"
                            }`}
                        >
                            <span className="truncate pr-2">{p.name}</span>
                            <Badge variant="secondary" className="text-[10px] shrink-0">{p.level}</Badge>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>

        {/* MAIN CONTENT: TABEL MK */}
        <Card className="md:col-span-3 shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Daftar Mata Kuliah</CardTitle>
                <Badge variant="outline" className="bg-slate-50">{courses.length} MK Terdaftar</Badge>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 h-8 w-8"/></div>
                ) : courses.length === 0 ? (
                    <div className="text-center p-16 text-slate-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium text-slate-600">Belum ada data mata kuliah.</p>
                        <p className="text-sm mt-1">Silakan gunakan tombol Import Excel di atas.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Nama Mata Kuliah</TableHead>
                                    <TableHead className="text-center">SKS</TableHead>
                                    <TableHead className="text-center">Sem</TableHead>
                                    <TableHead className="text-center">Sifat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map((c) => (
                                    <TableRow key={c.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-mono text-xs font-bold text-slate-500">{c.code}</TableCell>
                                        <TableCell>
                                            <div className="font-bold text-slate-700">{c.name}</div>
                                            {c.keywords && c.keywords.length > 0 && (
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                    Sinonim: <span className="italic">{c.keywords.join(", ")}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center font-medium">{c.sks}</TableCell>
                                        <TableCell className="text-center font-medium">{c.semester}</TableCell>
                                        <TableCell className="text-center">
                                            {c.is_mandatory ? (
                                                <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200 shadow-none">Wajib</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 border-slate-200">Pilihan</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}