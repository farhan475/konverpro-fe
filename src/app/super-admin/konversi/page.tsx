"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { University } from "@/components/super-admin/types";

interface CampusConversionStats extends University {
  total: number;
  internal: number;
  leads: number;
  chart_name: string;
}

type ChartFilter = "total" | "internal" | "leads";

export default function KonversiDataPage() {
  const [campuses, setCampuses] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState<ChartFilter>("total");
  const [chartData, setChartData] = useState<CampusConversionStats[]>([]);

  // Modal Detail
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<CampusConversionStats | null>(null);

  const buildCampusStats = useCallback((campus: University): CampusConversionStats => {
    const total = campus.conversions_count || 0;
    const isInternalCampus = campus.billing_mode === "subsidy";

    return {
      ...campus,
      total,
      internal: isInternalCampus ? total : 0,
      leads: isInternalCampus ? 0 : total,
      chart_name: campus.name.length > 15 ? `${campus.name.substring(0, 15)}...` : campus.name,
    };
  }, []);

  const updateChart = useCallback((data: University[], filterType: ChartFilter) => {
    const sorted = data
      .map(buildCampusStats)
      .sort((a, b) => {
        if (filterType === "total") return b.total - a.total;
        if (filterType === "internal") return b.internal - a.internal;
        return b.leads - a.leads;
      })
      .slice(0, 10);

    setChartData(sorted);
  }, [buildCampusStats]);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("/super-admin/campuses");
      const data = (res.data.data ?? []) as University[];
      setCampuses(data);
    } catch {
      toast.error("Gagal memuat data konversi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    updateChart(campuses, chartFilter);
  }, [campuses, chartFilter, updateChart]);

  const handleFilterChange = (val: string) => {
    setChartFilter(val as ChartFilter);
  };

  const openDetail = (campus: University) => {
    setSelectedCampus(buildCampusStats(campus));
    setIsDetailOpen(true);
  };

  const handleExport = () => {
    if (campuses.length === 0) return;

    const rows = campuses.map((campus) => {
      const stats = buildCampusStats(campus);
      return [
        `"${stats.name.replace(/"/g, '""')}"`,
        stats.internal,
        stats.leads,
        stats.total,
      ].join(",");
    });

    const csvContent = [
      "Institusi,Konversi Internal,Lead Acquisition,Total Konversi",
      ...rows,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "laporan-konversi-kampus.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
        
       {/* CHART */}
       <Card className="border-slate-200 shadow-sm">
           <CardContent className="p-6">
               <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Top Kampus - Konversi Terbanyak</h4>
                    <Select value={chartFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-48 bg-slate-50 font-bold text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="total">Total Konversi</SelectItem>
                            <SelectItem value="internal">Konversi Internal</SelectItem>
                            <SelectItem value="leads">Lead Acquisition</SelectItem>
                        </SelectContent>
                    </Select>
               </div>
               
               <div className="h-64 w-full">
                    {loading ? (
                       <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
                    ) : chartData.length === 0 ? (
                       <div className="flex h-full items-center justify-center text-slate-400 text-xs italic">Data tidak tersedia</div>
                    ) : (
                       <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="chart_name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey={chartFilter} fill="#094E8B" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
               </div>
           </CardContent>
       </Card>

       {/* TABLE */}
       <Card className="border-slate-200 shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-100 flex justify-end bg-white">
               <Button
                 variant="outline"
                 className="text-xs font-bold uppercase text-slate-600 bg-slate-50"
                 onClick={handleExport}
                 disabled={campuses.length === 0}
               >
                   <Download className="w-4 h-4 mr-2" /> Export Data
               </Button>
           </div>
           
           <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-100">
                    <TableRow>
                        <TableHead className="text-[10px] uppercase font-black text-slate-500 py-4">Institusi</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-blue-600 py-4 text-center">Internal</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-amber-600 py-4 text-center">Leads</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-slate-900 py-4 text-center">Total</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-slate-500 py-4 text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin w-6 h-6 mx-auto text-blue-600" /></TableCell></TableRow>
                    ) : campuses.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400 italic">Tidak ada data.</TableCell></TableRow>
                    ) : (
                        campuses.map(c => {
                            const stats = buildCampusStats(c);

                            return (
                                <TableRow key={c.id} className="hover:bg-slate-50">
                                    <TableCell className="font-bold text-slate-900">{c.name}</TableCell>
                                    <TableCell className="text-center text-blue-600 font-bold">{stats.internal}</TableCell>
                                    <TableCell className="text-center text-amber-600 font-bold">{stats.leads}</TableCell>
                                    <TableCell className="text-center font-black text-lg">{stats.total}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="secondary" className="text-[10px] font-black tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => openDetail(c)}>
                                            DETAIL
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
           </Table>
       </Card>

       {/* MODAL DETAIL */}
       <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
           <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                   <DialogTitle className="text-base font-black text-slate-900 uppercase">Data Mahasiswa Konversi</DialogTitle>
                   <p className="text-xs text-slate-400 font-bold mt-1">{selectedCampus?.name}</p>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Internal Column */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                                <h4 className="text-xs font-black uppercase text-blue-800 flex items-center gap-2">Konversi Internal</h4>
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{selectedCampus?.internal} Mhs</span>
                            </div>
                            
                            <div className="space-y-3 h-[300px] overflow-y-auto pr-2">
                                {/* Dummy mock data matching count */}
                                {selectedCampus?.internal === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-10">Kosong</p>
                                ) : (
                                    Array.from({length: Math.min(selectedCampus?.internal || 0, 50)}).map((_, i) => (
                                        <div key={i} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm flex justify-between items-center">
                                            <div>
                                                <span className="font-bold text-slate-700 block text-xs">Mahasiswa Internal #{i+1}</span>
                                                <span className="text-[10px] text-slate-400">Teknik Informatika</span>
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-bold block text-xs ${i % 3 === 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                    {i % 3 === 0 ? 'Pending' : 'Selesai'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Leads Column */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                                <h4 className="text-xs font-black uppercase text-amber-700 flex items-center gap-2">Lead Acquisition</h4>
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-3 py-1 rounded-full">{selectedCampus?.leads} Mhs</span>
                            </div>
                            
                            <div className="space-y-3 h-[300px] overflow-y-auto pr-2">
                                {selectedCampus?.leads === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-10">Kosong</p>
                                ) : (
                                    Array.from({length: Math.min(selectedCampus?.leads || 0, 50)}).map((_, i) => (
                                        <div key={i} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm flex justify-between items-center">
                                            <div>
                                                <span className="font-bold text-slate-700 block text-xs">Lead Eksternal #{i+1}</span>
                                                <span className="text-[10px] text-slate-400">Sistem Informasi</span>
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-bold block text-xs ${i % 2 === 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                    {i % 2 === 0 ? 'Selesai' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
               </div>
           </DialogContent>
       </Dialog>

    </div>
  );
}
