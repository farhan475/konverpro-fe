"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import * as XLSX from "xlsx";
import { 
    UploadCloud, FileSpreadsheet, ArrowRight, Loader2, Search, 
    Download, ListChecks, Building2, MapPin, Calculator, PlayCircle, Star, SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { generateConversionPDF } from "@/lib/generatePdf";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

// --- FUNGSI AI MATCHING LOKAL ---
const expandAbbr = (str: string) => {
  let s = String(str || "").toLowerCase().trim().replace(/[^a-z0-9\s]/g, " ");
  const mappings: any = { "peng": "pengantar", "tek": "teknologi", "sis": "sistem", "info": "informasi", "algo": "algoritma", "bhs": "bahasa", "ing": "inggris", "prog": "pemrograman", "dat": "data" };
  return s.split(/\s+/).map(w => mappings[w] || w).join(" ");
};

const levenshtein = (a: string, b: string) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
    }
  }
  return matrix[b.length][a.length];
};

const calculateSimilarity = (source: string, target: string) => {
  let s = expandAbbr(source).replace(/[^a-z0-9]/g, '');
  let t = expandAbbr(target).replace(/[^a-z0-9]/g, '');
  if (s === t) return 1.0;
  if (s.includes(t) || t.includes(s)) return 0.8;
  const distance = levenshtein(s, t);
  const maxLength = Math.max(s.length, t.length);
  if (maxLength === 0) return 0;
  return 1 - (distance / maxLength); 
};

export default function MarketplacePage() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // STATE BARU: Menyimpan data dinamis dari Backend
  const [marketplaceData, setMarketplaceData] = useState<any[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(true);

  // Modals State
  const [activeItem, setActiveItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  
  // Claim Form State
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", originCampus: "" });
  const [isRegistering, setIsRegistering] = useState(false);
  const [backendTrxId, setBackendTrxId] = useState<string | null>(null);

  // MENGAMBIL DATA DARI BACKEND SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/public/marketplace`);
        setMarketplaceData(response.data.data);
      } catch (error) {
        toast.error("Gagal memuat data kampus mitra dari server.");
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchMarketplace();
  }, []);

  // Download Template Excel
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([["NO", "KODE_MK", "NAMA_MATAKULIAH", "SKS", "NILAI"], [1, "COMP101", "Algoritma dan Pemrograman", 3, "A"]]);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_KonverPro.xlsx");
  };

  // Handle File Upload & Parsing (Frontend)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        let headerIdx = json.findIndex(r => JSON.stringify(r).toLowerCase().includes('nama_matakuliah'));
        if(headerIdx === -1) headerIdx = 0; 

        const parsedCourses = json.slice(headerIdx + 1).map(r => ({
          name: r[2] || r[1], sks: parseInt(r[3] || 0), grade: String(r[4] || '').toUpperCase()
        })).filter(c => c.name && c.sks > 0);
        
        setTranscript(parsedCourses);
      } catch (err) {
        toast.error("Format Excel tidak sesuai.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Jalankan AI Matching ke SELURUH KAMPUS DARI DATABASE
  const runSimulation = () => {
    if (transcript.length === 0) return toast.error("Silakan upload file transkrip terlebih dahulu");
    if (marketplaceData.length === 0) return toast.error("Belum ada data kampus mitra di sistem.");
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const generatedResults = marketplaceData.map(campus => {
        let totalSKS = 0;
        let matches: any[] = [];
        let matchedSources = new Set();

        campus.courses.forEach((target: any) => {
          let bestMatch: any = null;
          let bestScore = 0;
          
          transcript.forEach(source => {
            if(matchedSources.has(source.name)) return;
            const score = calculateSimilarity(source.name, target.name);
            if (score > 0.6 && score > bestScore) { bestScore = score; bestMatch = source; }
          });
          
          if (bestMatch && ['A','A-','B+','B'].includes(bestMatch.grade)) {
            matches.push({ target, source: bestMatch, score: bestScore });
            totalSKS += target.sks;
            matchedSources.add(bestMatch.name);
          }
        });

        const remainingSKS = Math.max(144 - totalSKS, 0);
        const estSemesters = Math.ceil(remainingSKS / 20);

        return { ...campus, totalSKS, remainingSKS, duration: estSemesters, matches };
      });

      // Hilangkan prodi yang SKS diakuinya 0 agar hasil lebih relevan
      const filteredResults = generatedResults.filter(r => r.totalSKS > 0);

      setResults(filteredResults.sort((a,b) => b.totalSKS - a.totalSKS));
      setIsProcessing(false);
      document.getElementById('results-header')?.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
  };

  // PENDAFTARAN REAL KE BACKEND (Saat klik tombol Kirim via WA/Daftar)
  const handleRegisterToCampus = async () => {
    if (!formData.name || !formData.email || !formData.phone) return toast.error("Lengkapi data diri!");
    if (!file) return toast.error("File transkrip hilang.");

    setIsRegistering(true);
    const apiData = new FormData();
    // Gunakan ID kampus dan prodi dari item yang dipilih (activeItem)
    apiData.append("university_id", activeItem.id); 
    apiData.append("study_program_id", activeItem.study_program_id);
    apiData.append("name", formData.name);
    apiData.append("email", formData.email);
    apiData.append("file", file);

    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/conversions`, apiData, { headers: { "Content-Type": "multipart/form-data" } });
        setBackendTrxId(response.data.data.id);
        toast.success("Berhasil didaftarkan ke kampus!");
    } catch (error) {
        toast.error("Gagal mendaftar ke server. Pastikan Kampus adalah Mitra Aktif dan memiliki Saldo.");
    } finally {
        setIsRegistering(false);
    }
  };

  const handleCetakPDF = () => {
      if(!activeItem) return;
      const pdfData = {
          trx_id: backendTrxId || "SIMULASI-001",
          student: { name: formData.name, email: formData.email },
          university: { name: activeItem.campus },
          study_program: { name: activeItem.prodiName },
          total_sks_target: 144,
          total_sks_accepted: activeItem.totalSKS,
          details: activeItem.matches.map((m:any) => ({
              target_course: m.target, src_name: m.source.name, src_sks: m.source.sks, src_grade: m.source.grade, status: 'auto_accepted'
          }))
      };
      generateConversionPDF(pdfData, false);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-brand-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-800/80 border border-brand-700 text-accent-500 text-xs font-bold uppercase tracking-wider mb-6">
                  <Star className="w-4 h-4 fill-accent-500" /> Platform No. 1 Konversi SKS Indonesia
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                  Transfer Kredit Kuliah <span className="text-accent-500">Lebih Cepat</span>
              </h1>
              <p className="text-brand-100 text-base max-w-2xl mx-auto mb-8 opacity-90 font-light">
                  Bandingkan peluang transfer kredit di puluhan universitas mitra. Hemat waktu dan biaya kuliah Anda sekarang.
              </p>
          </div>
      </section>

      <main className="flex-1 py-10 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-[1400px] mx-auto space-y-8">
            
            {/* UPLOAD PANEL (LAYOUT HORIZONTAL) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-brand-900 text-lg flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600"><UploadCloud className="w-4 h-4" /></div>
                    Simulasi Konversi Massal
                </h3>
                
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    <button onClick={downloadTemplate} className="w-full md:w-48 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-4 rounded-xl border border-dashed border-slate-300 transition flex flex-col items-center justify-center gap-2 group shrink-0">
                        <FileSpreadsheet className="w-8 h-8 text-slate-400 group-hover:text-green-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Download Template</span>
                    </button>
                    
                    <label className={`relative flex-1 border border-dashed rounded-xl transition cursor-pointer flex items-center px-6 py-4 ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
                        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                        <div className="flex items-center gap-4 w-full">
                            <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center shrink-0 text-brand-600">
                                <UploadCloud className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">{file ? file.name : "Template_Transkrip_Mahasiswa.xlsx"}</p>
                                <p className="text-xs text-slate-400">Format .xlsx atau .csv (Maks 5MB)</p>
                            </div>
                        </div>
                    </label>

                    <Button onClick={runSimulation} disabled={isProcessing || !file || isFetchingData} className="w-full md:w-48 bg-brand-900 hover:bg-brand-800 text-white font-bold h-auto rounded-xl shadow-lg shrink-0 text-sm">
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />} 
                        Hitung SKS
                    </Button>
                </div>
            </div>

            {/* AREA BAWAH (SIDEBAR + GRID) */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
                
                {/* SIDEBAR FILTER */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2"><SlidersHorizontal className="w-4 h-4"/> FILTER DATA</h4>
                    </div>
                    <div className="space-y-4">
                        <p className="text-xs text-slate-400 italic">Filter sedang dalam pengembangan.</p>
                    </div>
                </div>

                {/* AREA HASIL REKOMENDASI (CARD GRID) */}
                <div className="lg:col-span-9" id="results-header">
                    <div className="flex justify-between items-center mb-4 bg-white p-3 px-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-brand-900 text-sm flex items-center gap-2"><ListChecks className="w-4 h-4 text-brand-600"/> Hasil Rekomendasi</h3>
                    </div>

                    {isFetchingData ? (
                         <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
                            <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2 text-brand-600" />
                            Memuat data kampus mitra dari server...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
                            Lakukan upload dan klik Hitung SKS untuk melihat rekomendasi kampus.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.map((item, idx) => (
                                <Card key={idx} className="border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-300 transition">
                                    {item.isOfficial && (
                                        <div className="absolute top-0 right-0 bg-accent-500 text-brand-900 text-[9px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                                            <Star className="w-3 h-3 fill-brand-900"/> Official Partner
                                        </div>
                                    )}
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 font-bold shrink-0">
                                                {item.logoPath ? <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${item.logoPath}`} className="w-full h-full object-contain p-1" /> : <Building2 className="w-5 h-5"/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-brand-600 transition">{item.strata} {item.prodiName}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase">{item.campus}</p>
                                                <div className="flex gap-1 mt-1 text-[9px]">
                                                    <span className="bg-slate-100 text-slate-500 px-1 rounded"><MapPin className="w-2 h-2 inline"/> {item.province}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 mb-4 border-t border-b border-slate-50 py-3">
                                            <div className="text-center"><span className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Diakui</span><span className="text-xl font-black text-green-600">{item.totalSKS}</span></div>
                                            <div className="text-center"><span className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Sisa</span><span className="text-xl font-black text-orange-500">{item.remainingSKS}</span></div>
                                            <div className="text-center"><span className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Estimasi</span><span className="text-xl font-black text-slate-700">{item.duration} <span className="text-[9px]">Sem</span></span></div>
                                        </div>

                                        <div className="space-y-1 mb-4 text-[10px]">
                                            <div className="flex justify-between"><span className="text-slate-400">Biaya Daftar Konversi:</span><span className="font-bold text-slate-600">Rp {Number(item.registrationFee).toLocaleString()}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-400">Biaya Kuliah (Est):</span><span className="font-bold text-brand-600">Rp {Number(item.tuition).toLocaleString()}</span></div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" className="flex-1 text-xs h-9 border-slate-200" onClick={() => { setActiveItem(item); setShowDetailModal(true); }}>Detail SKS</Button>
                                            <Button className="flex-1 text-xs h-9 bg-brand-900 hover:bg-brand-800 text-white" onClick={() => { setActiveItem(item); setShowClaimModal(true); }}>Daftar</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>

      {/* MODAL DETAIL SKS */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Detail Pengakuan SKS - {activeItem?.prodiName}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="text-xs">MK Tujuan</TableHead>
                            <TableHead className="text-xs text-center">SKS</TableHead>
                            <TableHead className="text-xs text-center">Status</TableHead>
                            <TableHead className="text-xs">MK Asal Transkrip</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeItem?.matches?.map((m:any, i:number) => (
                            <TableRow key={i}>
                                <TableCell className="font-bold text-xs">{m.target.name}</TableCell>
                                <TableCell className="text-center text-xs">{m.target.sks}</TableCell>
                                <TableCell className="text-center"><Badge className="bg-green-100 text-green-700 border-none shadow-none text-[10px]">Diakui</Badge></TableCell>
                                <TableCell className="text-xs text-slate-500">{m.source.name} ({m.source.grade})</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DAFTAR (KIRIM KE BACKEND) */}
      <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
        <DialogContent>
            <DialogHeader><DialogTitle>Selesaikan Pendaftaran</DialogTitle></DialogHeader>
            {!backendTrxId ? (
                <div className="space-y-4 py-2">
                    <div className="bg-brand-50 p-3 rounded-lg border border-brand-100 text-sm">
                        Anda akan mendaftar ke <b>{activeItem?.campus}</b> prodi <b>{activeItem?.prodiName}</b> dengan potensi <b>{activeItem?.totalSKS} SKS diakui</b>.
                    </div>
                    <div><label className="text-xs font-bold text-slate-500">Nama Lengkap</label><Input value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-slate-500">Email Aktif</label><Input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-slate-500">Nomor WhatsApp</label><Input value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} /></div>
                    <Button onClick={handleRegisterToCampus} disabled={isRegistering} className="w-full bg-brand-600 hover:bg-brand-700 text-white mt-2">
                        {isRegistering ? <Loader2 className="animate-spin w-4 h-4" /> : "Kirim Data Pendaftaran"}
                    </Button>
                </div>
            ) : (
                <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2"><ListChecks className="w-8 h-8"/></div>
                    <h3 className="font-bold text-xl text-slate-900">Pendaftaran Berhasil!</h3>
                    <p className="text-sm text-slate-500">Data Anda telah dikirim ke Kampus Mitra. Silakan download PDF Estimasi di bawah.</p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button variant="outline" className="text-brand-600 border-brand-200" onClick={handleCetakPDF}><Download className="w-4 h-4 mr-2"/> Unduh PDF</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => window.location.reload()}><ArrowRight className="w-4 h-4 mr-2"/> Selesai</Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}