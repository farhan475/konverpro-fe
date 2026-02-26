"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios"; // Pakai axios custom kita
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, AlertCircle, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_conversions: 0,
    pending_review: 0,
    approved: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);

  // FETCH DATA DARI API LARAVEL
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/admin/dashboard-stats');
        setStats(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Gagal load stats:", error);
        toast.error("Gagal memuat statistik dashboard");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500">Statistik real-time aktivitas konversi SKS.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* TOTAL PENDAFTAR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Pendaftar</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_conversions}</div>
            <p className="text-xs text-slate-500 mt-1">Mahasiswa</p>
          </CardContent>
        </Card>
        
        {/* MENUNGGU REVIEW */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Menunggu Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending_review}</div>
            <p className="text-xs text-slate-500 mt-1">Butuh tindakan segera</p>
          </CardContent>
        </Card>

        {/* SUKSES / APPROVED */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Selesai/Approved</CardTitle>
            <FileCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-slate-500 mt-1">Konversi valid</p>
          </CardContent>
        </Card>

        {/* SISA SALDO */}
        <Card className="bg-slate-900 text-white border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Sisa Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                Rp {Number(stats.balance).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-400 mt-1">
                {stats.balance > 15000 
                    ? "Saldo aman" 
                    : "Segera Top-Up!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY PLACEHOLDER (Bisa dikembangkan nanti pakai Chart.js) */}
      <Card className="min-h-[300px] flex flex-col items-center justify-center border-dashed bg-slate-50/50">
        <p className="text-slate-400 text-sm font-medium">Grafik Pendaftaran & Konversi</p>
        <p className="text-slate-400 text-xs mt-1">(Data visualisasi akan muncul di sini)</p>
      </Card>
    </div>
  );
}