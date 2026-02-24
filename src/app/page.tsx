"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { UploadCloud, FileSpreadsheet, ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; 

export default function LandingPage() {
  
  // State Form
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  
  // State API Data (Dinamis)
  const [campuses, setCampuses] = useState<any[]>([]);
  const [univId, setUnivId] = useState(""); 
  const [prodiId, setProdiId] = useState(""); 
  
  // State Proses
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCampuses, setIsFetchingCampuses] = useState(true);
  const [result, setResult] = useState<any>(null);

  // 1. Fetch Daftar Kampus saat halaman dimuat
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/public/campuses`);
        const campusData = response.data.data;
        setCampuses(campusData);
        
        // Auto-select kampus pertama jika ada
        if (campusData.length > 0) {
          setUnivId(campusData[0].id);
          if (campusData[0].study_programs?.length > 0) {
            setProdiId(campusData[0].study_programs[0].id);
          }
        }
      } catch (error) {
        console.error("Gagal load kampus:", error);
        toast.error("Gagal memuat daftar kampus mitra.");
      } finally {
        setIsFetchingCampuses(false);
      }
    };

    fetchCampuses();
  }, []);

  // Update daftar Prodi saat Kampus berubah
  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnivId = e.target.value;
    setUnivId(selectedUnivId);
    
    const selectedCampus = campuses.find(c => c.id === selectedUnivId);
    if (selectedCampus && selectedCampus.study_programs?.length > 0) {
      setProdiId(selectedCampus.study_programs[0].id);
    } else {
      setProdiId("");
    }
  };

  // Handle Upload ke Laravel
  const handleUpload = async () => {
    if (!file || !email || !name || !univId || !prodiId) {
      toast.error("Data Belum Lengkap", {
        description: "Mohon isi semua form dan pilih prodi yang tersedia."
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("university_id", univId);
    formData.append("study_program_id", prodiId);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("file", file);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/conversions`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const trxId = response.data.data.id;
      
      toast.info("Sedang Memproses...", {
        description: "Sistem sedang mencocokkan transkrip Anda. Mohon tunggu."
      });

      // Polling Hasil
      setTimeout(async () => {
        try {
            const detailResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/conversions/${trxId}`);
            setResult(detailResponse.data.data);
            setIsLoading(false);
            toast.success("Selesai!", { description: "Hasil pencocokan berhasil ditampilkan." });
        } catch (err: any) {
            console.error(err);
            setIsLoading(false);
            if (err.response && err.response.status === 402) {
                toast.warning("Pembayaran Diperlukan", {
                    description: "Hasil sudah ada, silakan selesaikan pembayaran untuk melihat detail."
                });
            } else {
                toast.error("Gagal Mengambil Data", {
                    description: "Terjadi kesalahan saat mengambil hasil konversi."
                });
            }
        }
      }, 4000);

    } catch (error: any) {
      console.error(error);
      setIsLoading(false);
      toast.error("Gagal Upload", {
        description: error.response?.data?.message || "Terjadi kesalahan sistem."
      });
    }
  };

  // Mendapatkan list prodi dari kampus yang sedang dipilih
  const activeStudyPrograms = campuses.find(c => c.id === univId)?.study_programs || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">K</div>
            <div>
              <h1 className="font-bold text-xl tracking-tight leading-none text-slate-900">KonverPro</h1>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Campus Marketplace</span>
            </div>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition">Beranda</a>
            <a href="#" className="hover:text-blue-600 transition">Mitra Kampus</a>
            <a href="#" className="hover:text-blue-600 transition">Cara Kerja</a>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20">
            Daftar Mitra
          </Button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 mb-6 px-4 py-1 uppercase tracking-widest text-[10px]">
            Platform No. 1 Konversi SKS Indonesia
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Transfer Kredit Kuliah <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Lebih Cepat & Transparan</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Unggah transkrip nilai Anda, biarkan sistem cerdas kami mencocokkan mata kuliah dengan puluhan universitas mitra secara instan.
          </p>
        </div>
      </section>

      {/* SIMULATION AREA */}
      <main className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-12 min-h-[500px]">
              
              {/* LEFT: FORM INPUT */}
              <div className="md:col-span-5 p-8 bg-slate-50 border-r border-slate-100 flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Data Mahasiswa</h3>
                  <p className="text-sm text-slate-500">Isi data untuk memulai simulasi.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Nama Lengkap</label>
                    <Input 
                      placeholder="Contoh: Budi Santoso" 
                      className="bg-white"
                      value={name} onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Alamat Email</label>
                    <Input 
                      type="email" placeholder="budi@gmail.com" 
                      className="bg-white"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  {/* SELECT KAMPUS DINAMIS */}
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Tujuan Kampus</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      value={univId}
                      onChange={handleCampusChange}
                      disabled={isFetchingCampuses || campuses.length === 0}
                    >
                      {isFetchingCampuses ? (
                        <option>Memuat daftar kampus...</option>
                      ) : campuses.length === 0 ? (
                        <option>Tidak ada kampus aktif</option>
                      ) : (
                        campuses.map(campus => (
                          <option key={campus.id} value={campus.id}>{campus.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* SELECT PRODI DINAMIS */}
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Program Studi</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      value={prodiId}
                      onChange={(e) => setProdiId(e.target.value)}
                      disabled={isFetchingCampuses || activeStudyPrograms.length === 0}
                    >
                      {activeStudyPrograms.length === 0 ? (
                        <option>Pilih Kampus terlebih dahulu</option>
                      ) : (
                        activeStudyPrograms.map((prodi: any) => (
                          <option key={prodi.id} value={prodi.id}>
                            {prodi.level} - {prodi.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* RIGHT: UPLOAD & RESULT */}
              <div className="md:col-span-7 p-8 flex flex-col">
                {!result ? (
                  // STATE 1: UPLOAD AREA
                  <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                    <div className="w-full max-w-md">
                      <label 
                        htmlFor="file-upload" 
                        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 
                        ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400'}`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {file ? (
                            <>
                              <FileSpreadsheet className="w-12 h-12 text-green-600 mb-3" />
                              <p className="mb-2 text-sm font-bold text-green-700">{file.name}</p>
                              <p className="text-xs text-green-600">Siap untuk dianalisis</p>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-12 h-12 text-slate-400 mb-3 group-hover:text-blue-500 transition-colors" />
                              <p className="mb-2 text-sm text-slate-500 font-medium">Klik untuk upload <span className="font-bold text-slate-700">Excel Transkrip</span></p>
                              <p className="text-xs text-slate-400">Format .xlsx atau .csv (Max 5MB)</p>
                            </>
                          )}
                        </div>
                        <input id="file-upload" type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>

                    <Button 
                        size="lg" 
                        className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20"
                        onClick={handleUpload}
                        disabled={isLoading || !file || !univId || !prodiId}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menganalisis Transkrip...</>
                      ) : (
                        <><Search className="mr-2 h-4 w-4" /> Hitung Estimasi SKS</>
                      )}
                    </Button>
                    
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Dengan mengklik tombol di atas, Anda menyetujui kebijakan privasi data KonverPro.
                    </p>
                  </div>
                ) : (
                  // STATE 2: RESULT AREA
                  <div className="flex-1 flex flex-col h-full animate-fade-in">
                    <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">Hasil Pencocokan SKS</h3>
                            <p className="text-sm text-slate-500">ID Transaksi: <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{result.trx_id}</span></p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 text-xs">Selesai</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                            <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">SKS Diakui</p>
                            <p className="text-4xl font-black text-blue-700">{result.total_sks_accepted}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">SKS Target</p>
                            <p className="text-4xl font-black text-slate-700">{result.total_sks_target}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[300px] border rounded-xl border-slate-100 bg-slate-50/50 p-2 space-y-2 mb-6 custom-scrollbar">
                        {/* List Mata Kuliah */}
                        {result.details?.map((item: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-bold text-slate-700">{item.target_course?.name}</p>
                                    <p className="text-xs text-slate-400">Asal: {item.src_name} ({item.src_grade})</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className={
                                        item.status === 'auto_accepted' ? 'bg-green-50 text-green-600 border-green-200' :
                                        item.status === 'manual_accepted' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                                        'bg-red-50 text-red-600 border-red-200'
                                    }>
                                        {item.status === 'auto_accepted' ? 'Diakui' : item.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-green-600/20">
                            Lanjut Pendaftaran <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full mt-2 text-slate-500"
                            onClick={() => { setResult(null); setFile(null); }}
                        >
                            Coba Upload Ulang
                        </Button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>
      </main>

    </div>
  );
}