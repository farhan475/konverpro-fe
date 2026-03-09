"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { AxiosError } from "axios";
import {
  UploadSimple,
  FileArrowUp,
  CircleNotch,
  MagnifyingGlass,
  DownloadSimple,
  ListChecks,
  Buildings,
  MapPin,
  Star,
  SlidersHorizontal,
  List,
  X,
  ShieldCheck,
  Calculator,
  PlayCircle,
  WhatsappLogo,
  Checks,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { generateConversionPDF } from "@/lib/generatePdf";
import Link from "next/link";

interface Campus {
  id: string;
  name: string;
  study_programs?: { id: string; name: string }[];
}

interface ConversionResult {
  university?: { name: string };
  study_program?: { name: string };
  total_sks_accepted: number;
  total_sks_target?: number;
}

export default function LandingPage() {
  // State Form
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [originCampus, setOriginCampus] = useState("");

  // State Data
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [univId, setUnivId] = useState("");
  const [prodiId, setProdiId] = useState("");

  // State UI
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCampuses, setIsFetchingCampuses] = useState(true);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Fetch Daftar Kampus
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const response = await axios.get("/public/campuses");
        const campusData = response.data.data;
        setCampuses(campusData);

        if (campusData.length > 0) {
          setUnivId(campusData[0].id);
          if (campusData[0].study_programs?.length > 0) {
            setProdiId(campusData[0].study_programs[0].id);
          }
        }
      } catch {
        toast.error("Gagal memuat daftar kampus mitra.");
      } finally {
        setIsFetchingCampuses(false);
      }
    };
    fetchCampuses();
  }, []);

  // Update daftar Prodi
  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnivId = e.target.value;
    setUnivId(selectedUnivId);
    const selectedCampus = campuses.find((c) => c.id === selectedUnivId);
    if (selectedCampus && selectedCampus.study_programs?.length > 0) {
      setProdiId(selectedCampus.study_programs[0].id);
    } else {
      setProdiId("");
    }
  };

  // Upload Logic
  const handleUpload = async () => {
    if (!file || !email || !name || !univId || !prodiId) {
      toast.error("Data Belum Lengkap", {
        description: "Mohon lengkapi semua form.",
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
      const response = await axios.post("/conversions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const trxId = response.data.data.id;
      toast.info("Sedang Memproses...", {
        description: "AI sedang mencocokkan transkrip Anda.",
      });

      setTimeout(async () => {
        try {
          const detailResponse = await axios.get(`/conversions/${trxId}`);
          setResult(detailResponse.data.data);
          setIsLoading(false);
          toast.success("Selesai!", {
            description: "Hasil pencocokan ditampilkan.",
          });
          // Scroll to results
          document
            .getElementById("results-header")
            ?.scrollIntoView({ behavior: "smooth" });
        } catch (err: unknown) {
          setIsLoading(false);
          if (
            err instanceof Error &&
            "response" in err &&
            err.response &&
            typeof err.response === "object" &&
            "status" in err.response &&
            err.response.status === 402
          ) {
            toast.warning("Pembayaran Diperlukan");
          } else {
            toast.error("Gagal Mengambil Data");
          }
        }
      }, 4000);
    } catch (error: unknown) {
      setIsLoading(false);
      const message =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : "Error sistem.";
      toast.error("Gagal Upload", { description: message });
    }
  };

  const handleWhatsApp = () => {
    const text = `Halo Admin KonverPro,\nSaya tertarik mendaftar.\n\nNama: ${name}\nAsal Kampus: ${originCampus || "-"}\n\nKampus Tujuan: ${result?.university?.name}\nProdi Tujuan: ${result?.study_program?.name}\nEstimasi SKS Diakui: ${result?.total_sks_accepted} SKS`;
    window.open(
      `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const activeStudyPrograms =
    campuses.find((c) => c.id === univId)?.study_programs || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 flex flex-col selection:bg-brand-100 selection:text-brand-900">
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-60">
        <div className="max-w-350 mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-11 h-11 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-600/20 group-hover:scale-105 transition-transform">
                K
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-xl text-brand-900 tracking-tight leading-none">
                  KonverPro
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                  Campus Marketplace
                </span>
              </div>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-bold text-brand-600">
                Beranda
              </Link>
              <Link
                href="#kampus"
                className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors"
              >
                Mitra Kampus
              </Link>
              <Link
                href="#prosedur"
                className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors"
              >
                Cara Kerja
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-brand-600 font-black text-xs uppercase tracking-widest hover:bg-brand-50"
              >
                Masuk
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 h-11 shadow-xl shadow-brand-600/10">
                Daftar Mitra
              </Button>
            </Link>
          </div>
          {/* Mobile Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-brand-900"
            >
              {mobileMenuOpen ? (
                <X size={24} weight="bold" />
              ) : (
                <List size={24} weight="bold" />
              )}
            </Button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-6 space-y-6 shadow-2xl absolute w-full animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-sm font-bold text-brand-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                href="#kampus"
                className="text-sm font-bold text-slate-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mitra Kampus
              </Link>
              <Link
                href="#prosedur"
                className="text-sm font-bold text-slate-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cara Kerja
              </Link>
            </div>
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
              <Link href="/login">
                <Button variant="outline" className="w-full h-12 font-bold">
                  Masuk Portal
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full bg-brand-600 h-12 font-bold shadow-lg shadow-brand-600/20">
                  Registrasi Mitra
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="bg-brand-900 text-white relative overflow-hidden py-24 md:py-32">
        {/* Background Image Effect */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>

        <div className="max-w-350 mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-accent-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md animate-fade-in shadow-2xl">
            <Star weight="fill" className="w-4 h-4 text-accent-500" /> Platform
            Konversi RPL Nasional
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight animate-fade-in">
            Transfer Kredit Kuliah
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-500 to-amber-300">
              Cepat, Pasti & Transparan
            </span>
          </h1>
          <p className="text-brand-100/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed animate-fade-in">
            Bandingkan peluang transfer kredit di puluhan universitas mitra
            unggulan. Hemat waktu dan biaya kuliah Anda sekarang dengan
            teknologi AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Button
              onClick={() =>
                document
                  .getElementById("simulation-area")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="h-14 px-10 bg-white text-brand-900 hover:bg-accent-500 hover:text-brand-900 transition-all font-black uppercase text-xs tracking-widest rounded-2xl shadow-2xl shadow-black/20 group"
            >
              <Calculator
                weight="bold"
                className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
              />{" "}
              Mulai Simulasi SKS
            </Button>
            <Button
              variant="ghost"
              className="h-14 px-8 text-white hover:bg-white/10 font-bold rounded-2xl flex items-center gap-2"
            >
              <PlayCircle weight="bold" className="w-6 h-6 text-accent-500" />{" "}
              Lihat Video Panduan
            </Button>
          </div>
        </div>
      </section>

      {/* MAIN APP AREA */}
      <main
        id="simulation-area"
        className="flex-1 py-12 md:py-20 px-6 bg-slate-50"
      >
        <div className="max-w-350 mx-auto grid lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR FILTER */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-card border border-slate-100 p-6 sticky top-28 z-10">
            <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
              <h4 className="font-black text-brand-900 text-[10px] uppercase tracking-[0.15em] flex items-center gap-3">
                <SlidersHorizontal
                  weight="bold"
                  className="text-lg text-brand-600"
                />{" "}
                Filter Kampus
              </h4>
              <button className="text-[10px] text-brand-600 font-bold hover:underline opacity-50 hover:opacity-100">
                Reset
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">
                  Wilayah / Provinsi
                </label>
                <select className="w-full text-xs font-bold p-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 appearance-none bg-no-repeat bg-position-[right_12px_center]">
                  <option>Semua Wilayah</option>
                  <option>DKI Jakarta</option>
                  <option>Jawa Barat</option>
                  <option>Di Yogyakarta</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">
                  Jenis Perguruan Tinggi
                </label>
                <select className="w-full text-xs font-bold p-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700">
                  <option>Semua Jenis</option>
                  <option>PTN - Negeri</option>
                  <option>PTS - Swasta</option>
                </select>
              </div>
              <div className="pt-4">
                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                  <p className="text-[9px] font-black text-brand-600 uppercase mb-2">
                    Info RPL
                  </p>
                  <p className="text-[11px] font-medium leading-relaxed text-brand-900/70">
                    Sistem ini memfasilitasi jalur Rekognisi Pembelajaran Lampau
                    (RPL) untuk transfer kredit formal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-9 space-y-8">
            {/* UPLOAD PANEL */}
            <div className="bg-white rounded-[2.5rem] shadow-card border border-slate-100 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full blur-[100px] -mr-32 -mt-32"></div>

              <div className="relative z-10">
                <h3 className="font-heading font-black text-brand-900 text-xl md:text-2xl flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-inner">
                    <UploadSimple weight="bold" className="w-6 h-6" />
                  </div>
                  Kalkulator Simulasi Konversi
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Nama */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                      Nama Lengkap
                    </label>
                    <Input
                      placeholder="Masukkan nama Anda..."
                      className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold px-6 focus:ring-brand-500/10 focus:border-brand-500 transition-all shadow-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                      Email Aktif
                    </label>
                    <Input
                      placeholder="email@example.com"
                      className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold px-6 focus:ring-brand-500/10 focus:border-brand-500 transition-all shadow-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Kampus Tujuan */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                      Institusi Tujuan
                    </label>
                    <select
                      className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none focus:ring-brand-500/10 focus:border-brand-500 shadow-sm"
                      value={univId}
                      onChange={handleCampusChange}
                      disabled={isFetchingCampuses}
                    >
                      {isFetchingCampuses ? (
                        <option>Memuat data...</option>
                      ) : (
                        campuses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {/* Prodi Tujuan */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                      Program Studi Tujuan
                    </label>
                    <select
                      className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none focus:ring-brand-500/10 focus:border-brand-500 shadow-sm"
                      value={prodiId}
                      onChange={(e) => setProdiId(e.target.value)}
                      disabled={activeStudyPrograms.length === 0}
                    >
                      {activeStudyPrograms.length === 0 ? (
                        <option>Tidak ada prodi...</option>
                      ) : (
                        activeStudyPrograms.map(
                          (p: { id: string; name: string }) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ),
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="mb-8">
                  <label
                    className={`relative group w-full min-h-40 border-2 border-dashed rounded-[2rem] cursor-pointer flex flex-col items-center justify-center p-8 transition-all duration-300 ${file ? "border-emerald-400 bg-emerald-50/50" : "border-slate-200 bg-slate-50/50 hover:border-brand-400 hover:bg-white"}`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const selected = e.target.files?.[0] || null;
                        setFile(selected);
                        if (selected)
                          toast.success("File diterima", {
                            description: selected.name,
                          });
                      }}
                    />

                    <div className="flex flex-col items-center text-center gap-3">
                      <div
                        className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 ${file ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-white text-brand-600 shadow-brand-900/5"}`}
                      >
                        {file ? (
                          <Checks size={32} weight="bold" />
                        ) : (
                          <FileArrowUp size={32} weight="bold" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {file
                            ? file.name
                            : "Klik atau seret file transkrip SKS di sini"}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Hanya mendukung format .xlsx atau .xls (Maks 5MB)
                        </p>
                      </div>
                    </div>
                  </label>
                  <div className="mt-4 flex justify-between items-center px-4">
                    <button className="text-[11px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                      <DownloadSimple weight="bold" /> Download Template Excel
                    </button>
                    <p className="text-[10px] italic text-slate-400">
                      *Gunakan template agar hasil mapping akurat 100%
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleUpload}
                  disabled={isLoading || !file}
                  className="w-full h-16 bg-brand-900 hover:bg-brand-900 text-white font-black uppercase text-sm tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-brand-900/30 group"
                >
                  {isLoading ? (
                    <>
                      <CircleNotch
                        className="w-6 h-6 animate-spin mr-3"
                        weight="bold"
                      />
                      Memproses AI Matching...
                    </>
                  ) : (
                    <>
                      <ShieldCheck
                        className="w-6 h-6 mr-3 group-hover:rotate-6 transition-transform"
                        weight="bold"
                      />
                      Jalankan Analisis Konversi
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* HASIL REKOMENDASI */}
            <div id="results-header" className="space-y-6 pt-4 scroll-mt-28">
              <div className="flex items-center gap-3 px-4">
                <ListChecks
                  size={22}
                  weight="bold"
                  className="text-brand-600"
                />
                <h3 className="font-heading font-black text-brand-900 text-lg uppercase tracking-widest">
                  Hasil Rekomendasi SKS
                </h3>
              </div>

              {!result ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center shadow-card border-dashed">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MagnifyingGlass
                      size={40}
                      weight="light"
                      className="text-slate-300"
                    />
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mb-2">
                    Belum ada data analisis
                  </h4>
                  <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-loose">
                    Silakan upload transkrip di atas untuk melihat estimasi
                    pengakuan mata kuliah.
                  </p>
                </div>
              ) : (
                <Card className="bg-white rounded-[2.5rem] shadow-card-hover border border-brand-100 overflow-hidden animate-fade-in relative group transition-all">
                  {/* BADGE OFFICIAL */}
                  <div className="absolute top-0 right-0 bg-accent-500 text-brand-900 text-[10px] font-black px-6 py-2 rounded-bl-[1.5rem] z-10 flex items-center gap-2 shadow-lg shadow-accent-500/20">
                    <Star weight="fill" className="w-3.5 h-3.5" /> Official
                    Partner
                  </div>

                  <CardContent className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10 pb-10 border-b border-slate-50">
                      <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 font-black shrink-0 text-3xl shadow-inner outline outline outline-brand-50/50">
                        {result.university?.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-heading font-black text-brand-900 text-2xl md:text-3xl leading-tight mb-2 tracking-tight">
                          {result.study_program?.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Buildings
                              weight="bold"
                              className="text-brand-600"
                            />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                              {result.university?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border-none rounded-lg"
                            >
                              <MapPin weight="fill" className="mr-1" /> Jakarta
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider bg-brand-50 text-brand-600 border-none rounded-lg"
                            >
                              Online Learning
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                      <div className="text-center md:text-left group/stat">
                        <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 group-hover/stat:text-green-500 transition-colors">
                          SKS Diakui
                        </span>
                        <span className="text-4xl md:text-5xl font-black text-brand-900 group-hover/stat:scale-110 inline-block transition-transform">
                          {result.total_sks_accepted}{" "}
                          <span className="text-lg font-bold text-slate-300">
                            / 144
                          </span>
                        </span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                          Sisa Target
                        </span>
                        <span className="text-4xl md:text-5xl font-black text-orange-500">
                          {result.total_sks_target}
                        </span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                          Estimasi Waktu
                        </span>
                        <span className="text-4xl md:text-5xl font-black text-slate-900">
                          3.5{" "}
                          <span className="text-sm font-bold text-slate-300">
                            Thn
                          </span>
                        </span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                          Biaya Administrasi
                        </span>
                        <span className="text-[10px] font-black text-slate-900 block mt-2">
                          FREE*
                        </span>
                        <span className="text-[8px] text-slate-400 uppercase">
                          *Subsidi Kampus
                        </span>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                      <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                          UKT Per Semester Mulai Dari
                        </p>
                        <h5 className="text-xl font-black text-brand-900">
                          Rp 4.500.000{" "}
                          <span className="text-xs font-normal text-slate-400">
                            / All In
                          </span>
                        </h5>
                      </div>
                      <div className="flex gap-4 w-full md:w-auto">
                        <Button
                          variant="outline"
                          className="flex-1 md:flex-none h-14 px-8 border-slate-200 hover:bg-white rounded-2xl font-bold text-xs"
                          onClick={() => generateConversionPDF(result, false)}
                        >
                          <DownloadSimple
                            weight="bold"
                            className="mr-2 text-lg"
                          />{" "}
                          PDF
                        </Button>
                        <Button
                          className="flex-1 md:flex-none h-14 px-10 bg-brand-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-900/20"
                          onClick={() => setIsClaimModalOpen(true)}
                        >
                          Ambil Kursi Sekarang
                        </Button>
                      </div>
                    </div>
                    <p className="text-center text-[10px] font-medium text-slate-300 italic">
                      *Hasil di atas adalah estimasi sistem berdasarkan data
                      transkrip asal dan kurikulum tujuan yang terdaftar.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MITRA KAMPUS SECTION */}
      <section id="kampus" className="py-24 bg-white border-y border-slate-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-brand-900 mb-2">
            Mitra Kampus Nasional
          </h2>
          <p className="text-slate-500 font-medium mb-16">
            Jaringan perguruan tinggi digital terbaik yang mendukung jalur
            konversi RPL.
          </p>
          {isFetchingCampuses ? (
            <div className="flex justify-center">
              <CircleNotch
                className="animate-spin text-brand-400 w-10 h-10"
                weight="bold"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
              {campuses.map((c: Campus) => (
                <div
                  key={c.id}
                  className="flex flex-col items-center gap-4 group cursor-pointer transition-all hover:-translate-y-2"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 font-black text-4xl group-hover:bg-brand-50 group-hover:text-brand-600 transition-all border border-slate-50 group-hover:border-brand-100 shadow-sm group-hover:shadow-xl group-hover:shadow-brand-600/10">
                    {c.name.charAt(0)}
                  </div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-brand-900 transition-colors leading-relaxed px-2">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROSEDUR */}
      <section
        id="prosedur"
        className="py-24 bg-slate-50 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-brand-900 mb-4">
              Integrasi Tanpa Hambatan
            </h2>
            <p className="text-slate-500 font-medium">
              Lalui 4 langkah mudah untuk memulai jenjang pendidikan baru Anda.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                num: "01",
                title: "Ambil Template",
                desc: "Download format Excel standar transkrip dari dashboard portal.",
              },
              {
                num: "02",
                title: "Input Nilai",
                desc: "Isi data nilai mata kuliah Anda dari kampus lama secara lengkap.",
              },
              {
                num: "03",
                title: "AI Mapping",
                desc: "Upload file & biarkan AI kami mencocokkan dengan kurikulum tujuan.",
              },
              {
                num: "04",
                title: "Daftar",
                desc: "Dapatkan estimasi kelulusan & sampaikan ke admin kampus tujuan.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 relative group transition-all hover:shadow-2xl"
              >
                <span className="text-4xl font-black text-brand-50 group-hover:text-brand-100 transition-colors absolute top-6 right-8">
                  {step.num}
                </span>
                <div className="w-14 h-14 bg-brand-50 text-brand-900 rounded-2xl flex items-center justify-center font-black text-xl mb-6 shadow-inner group-hover:rotate-6 transition-transform">
                  {idx + 1}
                </div>
                <h4 className="font-heading font-black text-brand-900 text-lg mb-3 tracking-tight">
                  {step.title}
                </h4>
                <p className="text-[11px] font-medium leading-relaxed text-slate-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-brand-900 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 border-b border-white/5 pb-20 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-900 font-bold text-xl">
                K
              </div>
              <h2 className="text-white font-black text-2xl tracking-tighter">
                KonverPro
              </h2>
            </div>
            <p className="text-brand-100/40 text-sm max-w-sm leading-relaxed">
              Platform marketplace konversi RPL terbaik di Indonesia. Memberikan
              transparansi dan kemudahan akses pendidikan tinggi bagi
              profesional dan mahasiswa transfer.
            </p>
          </div>
          <div>
            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-6">
              Navigasi
            </h5>
            <ul className="space-y-4 text-sm font-medium text-brand-100/60">
              <li>
                <Link
                  href="#"
                  className="hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="#kampus"
                  className="hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Mitra Kampus
                </Link>
              </li>
              <li>
                <Link
                  href="#prosedur"
                  className="hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Cara Kerja SKS
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Login Admin
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-6">
              Hubungi Kami
            </h5>
            <ul className="space-y-4 text-sm font-medium text-brand-100/60">
              <li className="flex items-center gap-2">
                <MapPin size={18} weight="bold" /> Jakarta Pusat, Indonesia
              </li>
              <li className="flex items-center gap-2">
                <PlayCircle size={18} weight="bold" /> @konverpro.central
              </li>
              <li>support@konverpro.id</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-brand-100/20 text-[10px] font-black uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} KonverPro Systems Group. All
            Rights Reserved.
          </p>
          <div className="flex gap-6 text-brand-100/20 text-[10px] font-black uppercase tracking-widest">
            <Link href="#" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>

      {/* MODAL CLAIM */}
      <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-10">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black text-brand-900 tracking-tight">
                Klaim Hasil & Konsultasi
              </DialogTitle>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Hampir Selesai! Hubungi Konselor Kami.
              </p>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100/50">
                <p className="text-[10px] font-black text-brand-600 mb-3 uppercase tracking-widest">
                  Pendaftaran Tujuan
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-brand-900 shadow-sm">
                    {result?.university?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-brand-900 text-sm leading-none mb-1">
                      {result?.university?.name}
                    </p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                      {result?.study_program?.name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-[0.15em] ml-1">
                  Nomor WhatsApp
                </label>
                <Input
                  placeholder="081234567..."
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold px-6"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-[0.15em] ml-1">
                  Asal Institusi Sebelumnya
                </label>
                <Input
                  placeholder="Contoh: Universitas Gadjah Mada"
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold px-6"
                  value={originCampus}
                  onChange={(e) => setOriginCampus(e.target.value)}
                />
              </div>
              <Button
                onClick={handleWhatsApp}
                disabled={!phone}
                className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 transition-all"
              >
                <WhatsappLogo size={24} weight="fill" /> Chat via WhatsApp
              </Button>
              <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-50">
                Data Anda akan diproses untuk verifikasi pendaftaran mitra.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
