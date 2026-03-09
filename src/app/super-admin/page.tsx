"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { 
  Buildings, 
  Users, 
  CurrencyCircleDollar, 
  ListChecks, 
  CircleNotch,
  TrendUp,
  MapPin,
  Star,
  CaretRight,
  ChartLineUp,
  Clock,
  ArrowRight
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [campuses, setCampuses] = useState<any[]>([]);

  const [chartData] = useState([
    { name: 'Jan', mitra: 3 },
    { name: 'Feb', mitra: 8 },
    { name: 'Mar', mitra: 14 },
    { name: 'Apr', mitra: 22 },
    { name: 'Mei', mitra: 28 },
    { name: 'Jun', mitra: 35 },
  ]);

  const fetchDashboardData = async () => {
    try {
      const [resCampuses, resTopups] = await Promise.all([
        axios.get('/super-admin/campuses'),
        axios.get('/super-admin/topups?status=pending').catch(() => ({ data: { data: [] } }))
      ]);

      const campusList = resCampuses.data.data || [];
      const pendingTopups = resTopups.data.data || [];

      let totalConversions = 0;
      let revenue = 0;

      campusList.forEach((c: any) => {
        totalConversions += (c.conversions_count || 0);
        revenue += (c.conversions_count || 0) * 150000;
      });

      setStats({
        total_campus: campusList.length,
        pending_topups: pendingTopups.length,
        revenue: revenue,
        total_conversions: totalConversions
      });
      setCampuses(campusList.slice(0, 5)); // Top 5 for performance heatmap

    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
        <CircleNotch weight="bold" className="animate-spin text-[#094E8B] w-12 h-12" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Menganalisis Data Global...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10 animate-fade-in-quick">
      <header>
        <h2 className="font-heading text-lg lg:text-xl font-black tracking-tight text-[#001a33] uppercase">
            Global Analytics Control
        </h2>
        <p className="text-slate-400 text-xs lg:text-sm">
            Ikhtisar performa ekosistem KonverPro secara real-time.
        </p>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mitra Kampus</p>
                <Buildings weight="duotone" className="text-2xl text-blue-500" />
            </div>
            <h3 className="text-4xl font-black text-[#001a33]">{stats?.total_campus || 0}</h3>
            <div className="mt-4 flex items-center gap-2">
                <TrendUp weight="bold" className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">+12% Bulan ini</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ring-2 ring-emerald-100 bg-emerald-50/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-200 transition"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Antrean Top Up</p>
                <Clock weight="duotone" className="text-2xl text-emerald-500" />
            </div>
            <h3 className="text-4xl font-black text-emerald-600">{stats?.pending_topups || 0}</h3>
            <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest">Butuh Konfirmasi</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#094E8B] p-8 rounded-[2rem] border border-blue-800 shadow-xl shadow-blue-900/20 hover:shadow-2xl transition-all group relative overflow-hidden col-span-1 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6 text-blue-200">
                <p className="text-[10px] font-black uppercase tracking-widest">Global Revenue</p>
                <CurrencyCircleDollar weight="duotone" className="text-3xl text-amber-400" />
            </div>
            <h3 className="text-2xl font-black text-white">Rp {(stats?.revenue || 0).toLocaleString('id-ID')}</h3>
            <div className="mt-4">
                <button className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">Laporan Detil &rarr;</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-slate-100 transition"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aktivitas Konversi</p>
                <ListChecks weight="duotone" className="text-2xl text-slate-400" />
            </div>
            <h3 className="text-4xl font-black text-[#001a33]">{stats?.total_conversions || 0}</h3>
            <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total SKS Diproses</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Growth Chart */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <h4 className="text-xs font-black uppercase text-[#001a33] tracking-widest flex items-center gap-3">
                    <ChartLineUp weight="bold" className="text-blue-600 text-xl" /> 
                    Pertumbuhan Kampus Mitra
                </h4>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Proyeksi</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorMitra" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#094E8B" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#094E8B" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                        itemStyle={{ color: '#094E8B' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="mitra" 
                        stroke="#094E8B" 
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorMitra)"
                        dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#094E8B' }}
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#FDD824 shadow-lg' }}
                    />
                </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Performance Sidebar */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col">
                <h4 className="text-xs font-black uppercase text-[#001a33] tracking-widest mb-10">Leaderboard Kampus</h4>
                <div className="space-y-8 flex-1">
                    {campuses.length === 0 ? (
                        <div className="text-center py-20 text-slate-300 italic text-sm font-medium uppercase tracking-widest">No Active Data</div>
                    ) : (
                        campuses.map((campus, idx) => {
                            const maxVal = campuses[0]?.conversions_count || 1;
                            const currentVal = campus.conversions_count || 0;
                            const widthPercent = Math.max(15, (currentVal / maxVal) * 100);

                            return (
                                <div key={campus.id} className="group cursor-pointer">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 font-black text-[10px] text-slate-400 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                                                0{idx + 1}
                                            </div>
                                            <span className="font-bold text-xs text-[#001a33] truncate pr-4">{campus.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Star weight="fill" className="text-amber-400" size={12} />
                                            <span className="font-black text-xs text-slate-700">{currentVal}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-blue-900' : 'bg-blue-400 opacity-60'}`} 
                                          style={{ width: `${widthPercent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="mt-10 pt-10 border-t border-slate-50">
                    <button className="w-full py-4 bg-slate-50 text-[#094E8B] rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-50 transition active:scale-95">
                        Lihat Data Seluruh Institusi <ArrowRight weight="bold" />
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}