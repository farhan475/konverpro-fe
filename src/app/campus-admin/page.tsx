"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
  BookOpen,
  ChartBar,
  TrendUp,
  CircleNotch,
  CheckCircle,
  Clock,
  ArrowRight,
  Student,
  CurrencyCircleDollar,
  Briefcase,
  ListChecks,
  Warning,
  ShieldCheck,
  Scan,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_conversions: 0,
    pending_review: 0,
    approved: 0,
    balance: 0,
    prodi_aktif: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/admin/dashboard-stats');
        setStats({
          total_conversions: response.data?.data?.total_conversions || 0,
          pending_review: response.data?.data?.pending_review || 0,
          approved: response.data?.data?.approved || 0,
          balance: response.data?.data?.balance || 0,
          prodi_aktif: response.data?.data?.prodi_aktif || 3
        });
      } catch (error) {
        console.error("Gagal load stats:", error);
        toast.error("Gagal memuat statistik dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const mainChartData = [
    { name: 'S1 Informatika', pendaftar: 42 },
    { name: 'S1 Sistem Informasi', pendaftar: 29 },
    { name: 'S1 Manajemen', pendaftar: 18 },
    { name: 'D3 Akuntansi', pendaftar: 12 },
    { name: 'S1 Psikologi', pendaftar: 8 },
  ];

  const trendData = [
    { month: 'Jan', pendaftar: 15 },
    { month: 'Feb', pendaftar: 22 },
    { month: 'Mar', pendaftar: 31 },
    { month: 'Apr', pendaftar: 28 },
    { month: 'Mei', pendaftar: 45 },
    { month: 'Jun', pendaftar: 52 },
  ];

  const recentActivity = [
    { id: 1, name: "Budi Santoso", prodi: "Teknik Informatika", time: "5 menit yang lalu", status: "Pending" },
    { id: 2, name: "Siti Aminah", prodi: "Sistem Informasi", time: "2 jam yang lalu", status: "Approved" },
    { id: 3, name: "Andi Wijaya", prodi: "Manajemen", time: "5 jam yang lalu", status: "Draft" },
  ];

  const approvalRate =
    stats.total_conversions > 0
      ? Math.round((stats.approved / stats.total_conversions) * 100)
      : 0;

  const queueStatus =
    stats.pending_review === 0
      ? "Stabil"
      : stats.pending_review <= 5
        ? "Perlu Review"
        : "Butuh Atensi";

  if (loading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
        <CircleNotch weight="bold" className="animate-spin text-[#094E8B] w-12 h-12" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Menyipakan Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10 animate-fade-in-quick">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-heading text-lg lg:text-xl font-black tracking-tight text-[#001a33] uppercase">
            Dashboard Analytics
          </h2>
          <p className="text-slate-400 text-xs lg:text-sm">
            Pemantauan validasi SKS dan pendaftaran institusi secara real-time.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link
            href="/campus-admin/curriculum"
            className="flex-1 md:flex-none w-full bg-white border border-slate-100 text-[#094E8B] px-6 py-3.5 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <BookOpen weight="bold" className="text-lg" /> Kelola Kurikulum
          </Link>
          <Link
            href="/campus-admin/akad-settings"
            className="flex-1 md:flex-none w-full bg-white border border-slate-100 text-slate-700 px-6 py-3.5 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <CheckCircle weight="bold" className="text-lg text-emerald-600" /> Akad Settings
          </Link>
          <Link
            href="/campus-admin/conversions"
            className="flex-1 md:flex-none w-full bg-[#094E8B] text-white px-6 py-3.5 rounded-xl text-xs font-black shadow-xl shadow-blue-900/20 hover:bg-[#073e6f] transition flex items-center justify-center gap-2"
          >
            <ListChecks weight="bold" className="text-lg" /> Validasi Berkas
          </Link>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-[#031f37] p-8 text-white shadow-[0_28px_80px_rgba(3,31,55,0.2)] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(253,216,36,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.14),_transparent_30%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              <ShieldCheck weight="fill" className="h-4 w-4" />
              Campus Control Room
            </div>
            <h3 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-white lg:text-4xl">
              Pantau validasi konversi, kesiapan prodi, dan operasional kampus
              dari satu dashboard.
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              Lihat pipeline review, kesehatan operasional, dan aksi cepat tim
              akademik dalam tampilan yang lebih ringkas dan mudah dipantau.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Approval Rate
                </p>
                <p className="mt-3 text-4xl font-black text-white">
                  {approvalRate}%
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Berdasarkan konversi yang sudah masuk ke sistem.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Pipeline Aktif
                </p>
                <p className="mt-3 text-4xl font-black text-white">
                  {stats.total_conversions}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Total berkas konversi terpantau untuk kampus Anda.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Queue Status
                </p>
                <p className="mt-3 text-2xl font-black text-amber-300">
                  {queueStatus}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  {stats.pending_review} input sedang menunggu tindakan admin.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/campus-admin/input-konversi"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-[11px] font-black uppercase tracking-[0.18em] text-[#031f37] transition hover:bg-amber-300"
              >
                <Scan weight="bold" className="text-lg" />
                Mulai Input Baru
              </Link>
              <Link
                href="/campus-admin/conversions"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
              >
                <ListChecks weight="bold" className="text-lg" />
                Buka Antrean Review
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Fokus Hari Ini
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Warning weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#001a33]">
                    Antrean review
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {stats.pending_review} data masih menunggu validasi atau
                    keputusan final dari admin kampus.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <BookOpen weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#001a33]">
                    Kesiapan prodi
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {stats.prodi_aktif} prodi aktif sudah bisa dipakai untuk
                    simulasi dan proses review awal.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CurrencyCircleDollar weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#001a33]">
                    Saldo operasional
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Saldo saat ini Rp {Number(stats.balance || 0).toLocaleString("id-ID")} siap
                    dipakai untuk proses konversi berikutnya.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-amber-100 bg-amber-50/70 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Insight Akademik
            </p>
            <h4 className="mt-3 text-xl font-black tracking-tight text-[#001a33]">
              {approvalRate >= 70
                ? "Pipeline kampus sedang dalam kondisi sehat."
                : "Ada peluang besar untuk mempercepat approval minggu ini."}
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Menjaga antrean review tetap rendah akan membuat pengalaman admin
              prodi dan mahasiswa jauh lebih rapi, terutama saat volume
              pendaftaran meningkat.
            </p>
          </div>
        </div>
      </section>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Selesai</p>
                <Student weight="duotone" className="text-xl text-blue-500" />
            </div>
            <h4 className="text-3xl lg:text-4xl font-black text-[#001a33]">{stats.approved || 0}</h4>
            <div className="mt-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-black text-emerald-600 uppercase">Terverifikasi</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-100 transition"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Prodi Aktif</p>
                <Briefcase weight="duotone" className="text-xl text-purple-500" />
            </div>
            <h4 className="text-3xl lg:text-4xl font-black text-[#001a33]">{stats.prodi_aktif || 0}</h4>
            <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Database Kurikulum</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative ring-2 ring-orange-100 bg-orange-50/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-orange-200 transition"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase text-orange-400 tracking-widest">Perlu Atensi</p>
                <Warning weight="duotone" className="text-xl text-orange-500" />
            </div>
            <h4 className="text-3xl lg:text-4xl font-black text-orange-500">{stats.pending_review || 0}</h4>
            <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[9px] font-black text-orange-600 uppercase">Input Review Baru</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#094E8B] p-6 lg:p-8 rounded-3xl border border-blue-800 shadow-xl shadow-blue-900/20 hover:shadow-2xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4 text-blue-200">
                <p className="text-[10px] font-black uppercase tracking-widest">Saldo Quota</p>
                <CurrencyCircleDollar weight="duotone" className="text-xl text-amber-400" />
            </div>
            <h4 className="text-xl lg:text-2xl font-black text-white truncate">
              Rp {Number(stats.balance || 0).toLocaleString('id-ID')}
            </h4>
            <div className="mt-3 flex items-center gap-1.5">
                <Link href="/campus-admin/settings?tab=billing" className="text-[9px] font-black text-white hover:text-amber-400 transition-colors uppercase tracking-widest border-b border-white/20">
                  Top Up Sekarang &rarr;
                </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-heading font-black text-xs uppercase text-[#001a33] flex items-center gap-3">
                        <ChartBar weight="bold" className="text-blue-600 text-xl" /> 
                        Distribusi Peminat Berdasarkan Prodi
                    </h3>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">6 Bulan Terakhir</span>
                    </div>
                </div>
                <div className="h-[250px] md:h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} 
                        />
                        <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
                        />
                        <RechartsTooltip 
                        cursor={{ fill: '#F8FAFC' }} 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="pendaftar" fill="#094E8B" radius={[12, 12, 4, 4]} maxBarSize={50} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-50 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-heading font-black text-xs uppercase text-[#001a33] flex items-center gap-3">
                        <TrendUp weight="bold" className="text-emerald-500 text-xl" /> 
                        Tren Pertumbuhan Pendaftaran RPL
                    </h3>
                </div>
                <div className="h-[200px] md:h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPendaftar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} />
                        <Area 
                          type="monotone" 
                          dataKey="pendaftar" 
                          stroke="#10B981" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorPendaftar)" 
                          dot={{ r: 4, fill: '#fff', stroke: '#10B981', strokeWidth: 2 }}
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Sidebar Activity */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm h-full flex flex-col">
                <h4 className="font-black text-[#001a33] text-xs uppercase tracking-widest mb-8 flex items-center justify-between">
                    Aktivitas Terbaru
                    <span className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">Lihat Semua</span>
                </h4>
                
                <div className="space-y-8 relative">
                    <div className="absolute left-[19px] top-2 bottom-8 w-0.5 bg-slate-100"></div>
                    
                    {recentActivity.map((act) => (
                        <div key={act.id} className="relative flex gap-5 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center relative z-10 shrink-0 group-hover:border-blue-500 transition-colors">
                                <Clock weight="duotone" className="text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-[#001a33] truncate">{act.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate mt-0.5">{act.prodi}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-[9px] font-black text-blue-600/50 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">{act.status}</span>
                                    <span className="text-[9px] font-medium text-slate-300 italic">{act.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-10">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/50 rounded-full blur-xl -mr-6 -mt-6 group-hover:scale-125 transition-transform"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-[#094E8B] rounded-lg flex items-center justify-center text-white"><CheckCircle weight="fill" /></div>
                                <h5 className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-none">Status Autentikasi</h5>
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Sistem Anda terhubung ke API Gateway dalam mode sinkronisasi berkala.</p>
                            <button className="mt-4 flex items-center gap-2 text-[10px] font-black text-[#094E8B] uppercase tracking-[0.15em] hover:gap-4 transition-all">
                                Cek Konektivitas <ArrowRight weight="bold" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
