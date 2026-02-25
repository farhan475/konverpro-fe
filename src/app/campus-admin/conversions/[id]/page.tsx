"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios"; 
import { ArrowLeft, Check, X, Save, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { generateConversionPDF } from "@/lib/generatePdf";

export default function ReviewConversionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id; 

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // PERBAIKAN 2: URL jadi lebih pendek karena baseURL sudah di-set di lib/axios
      const response = await axios.get(`/conversions/${id}`);
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil detail data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // Handle Review per Item (Approve/Reject)
  const handleReviewItem = async (detailId: string, status: 'approved' | 'rejected') => {
    setProcessingId(detailId);
    try {
      // PERBAIKAN 2
      await axios.post(`/admin/review-detail/${detailId}`, {
        status: status,
        admin_notes: "Reviewed by Admin"
      });
      
      toast.success(status === 'approved' ? "Mata kuliah disetujui" : "Mata kuliah ditolak");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error(error.response);
      toast.error("Gagal melakukan review");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Finalisasi (Ketuk Palu)
  const handleFinalize = async () => {
    if (!confirm("Apakah Anda yakin ingin menyetujui seluruh hasil konversi ini?")) return;
    
    try {
      await axios.post(`/admin/finalize/${id}`, {
        notes: "Selamat, hasil konversi Anda telah disetujui."
      });
      toast.success("Dokumen berhasil difinalisasi!");
      
      fetchData(); // Refresh data
    } catch (error: any) {
      // PERBAIKAN DI SINI: Tangkap pesan error asli dari backend
      console.error("Detail Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Gagal memproses finalisasi");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!data) return <div className="p-8">Data tidak ditemukan.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Review Mahasiswa</h2>
          <p className="text-slate-500 text-sm">TRX ID: <span className="font-mono">{data.trx_id}</span></p>
        </div>
        <div className="ml-auto flex gap-3">
            {/* JIKA SUDAH APPROVED, MUNCUL TOMBOL CETAK PDF */}
            {data.status === 'approved' && (
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-white" onClick={() => generateConversionPDF(data, true)}>
                    <Download className="w-4 h-4 mr-2" /> Cetak Berita Acara
                </Button>
            )}

            {/* JIKA BELUM APPROVED, MUNCUL TOMBOL FINALISASI */}
            {data.status !== 'approved' && (
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleFinalize}>
                    <Save className="w-4 h-4 mr-2" /> Finalisasi & Approve
                </Button>
            )}
        </div>
      </div>

      {/* STUDENT INFO CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm border-slate-200">
            <CardHeader><CardTitle className="text-sm text-slate-500">Informasi Mahasiswa</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-400">Nama Lengkap</p>
                        <p className="font-bold text-lg">{data.student?.name}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-400">Email</p>
                        <p className="font-medium">{data.student?.email}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-400">Program Studi Tujuan</p>
                        <p className="font-medium">{data.study_program?.name}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-400">Total SKS Diakui</p>
                        <p className="font-black text-2xl text-blue-600">{data.total_sks_accepted} <span className="text-sm text-slate-400 font-normal">SKS</span></p>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* STATUS CARD */}
        <Card className={`shadow-sm ${data.status === 'approved' ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
            <CardHeader><CardTitle className="text-sm opacity-70">Status Dokumen</CardTitle></CardHeader>
            <CardContent className="text-center py-8">
                <Badge className={`text-lg px-4 py-1 mb-2 ${data.status === 'approved' ? "bg-green-600 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-500"}`}>
                    {data.status.toUpperCase()}
                </Badge>
                <p className="text-xs opacity-70">
                    {data.status === 'approved' ? "Dokumen telah valid." : "Menunggu keputusan admin."}
                </p>
            </CardContent>
        </Card>
      </div>

      {/* TABLE REVIEW */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
            <CardTitle>Rincian Mata Kuliah</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead>MK Asal (Transkrip)</TableHead>
                        <TableHead>Nilai/SKS</TableHead>
                        <TableHead></TableHead>
                        <TableHead>MK Tujuan (Kurikulum)</TableHead>
                        <TableHead className="text-center">Skor Kemiripan</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.details?.map((item: any) => (
                        <TableRow key={item.id} className={item.status === 'rejected' ? 'bg-red-50/50' : ''}>
                            <TableCell className="font-medium text-slate-700">{item.src_name}</TableCell>
                            <TableCell>{item.src_grade} ({item.src_sks})</TableCell>
                            <TableCell>
                                <div className="flex items-center justify-center">
                                    <ArrowLeft className="w-4 h-4 text-slate-300" />
                                </div>
                            </TableCell>
                            <TableCell>
                                {item.target_course ? (
                                    <span className="text-blue-700 font-bold">{item.target_course.name}</span>
                                ) : (
                                    <span className="text-slate-400 italic">Tidak ditemukan</span>
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${item.match_score >= 0.8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {Math.round(item.match_score * 100)}%
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className={
                                    item.status.includes('accepted') ? 'bg-green-50 text-green-700 border-green-200' : 
                                    item.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                }>
                                    {item.status === 'auto_accepted' ? 'Otomatis' : item.status === 'manual_accepted' ? 'Menunggu' : item.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {/* HANYA TAMPILKAN TOMBOL JIKA STATUS BELUM FINAL */}
                                {data.status !== 'approved' && (
                                    <div className="flex justify-end gap-1">
                                        <Button 
                                            size="sm" 
                                            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700" 
                                            onClick={() => handleReviewItem(item.id, 'approved')}
                                            disabled={processingId === item.id}
                                            title="Terima / Validasi"
                                        >
                                            {processingId === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />}
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleReviewItem(item.id, 'rejected')}
                                            disabled={processingId === item.id}
                                            title="Tolak"
                                        >
                                            {processingId === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <X className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}