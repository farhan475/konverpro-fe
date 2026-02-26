"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Wallet, Loader2, DollarSign, Plus, Trash2 } from "lucide-react";

export default function SuperAdminDashboard() {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States Modal
  const [topupAmount, setTopupAmount] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<any>(null);
  const [openTopupDialog, setOpenTopupDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // Form New Campus
  const [newCampus, setNewCampus] = useState({
    name: "", slug: "", billing_mode: "independent", student_fee: "50000", cost_per_check: "15000"
  });

  const fetchCampuses = async () => {
    try {
      const res = await axios.get('/super-admin/campuses');
      setCampuses(res.data.data);
    } catch (error) {
      toast.error("Gagal memuat data kampus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  const handleTopup = async () => {
    if (!topupAmount || isNaN(Number(topupAmount))) return toast.error("Masukkan nominal yang valid");
    try {
      await axios.post(`/super-admin/campuses/${selectedCampus.id}/topup`, { amount: Number(topupAmount) });
      toast.success("Top Up Berhasil!");
      setOpenTopupDialog(false);
      setTopupAmount("");
      fetchCampuses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal Top Up");
    }
  };

  const handleCreateCampus = async () => {
    try {
      await axios.post('/super-admin/campuses', newCampus);
      toast.success("Kampus berhasil didaftarkan!");
      setOpenCreateDialog(false);
      setNewCampus({ name: "", slug: "", billing_mode: "independent", student_fee: "50000", cost_per_check: "15000" });
      fetchCampuses();
    } catch (error: any) {
        console.log(error);
      toast.error(error.response?.data?.message || "Gagal membuat kampus");
    }
  };

  const handleDeleteCampus = async (id: string) => {
    if(!confirm("Yakin hapus kampus ini? Data terkait akan hilang.")) return;
    try {
        await axios.delete(`/super-admin/campuses/${id}`);
        toast.success("Kampus dihapus");
        fetchData(); // Refresh data
    } catch (error) {
        toast.error("Gagal menghapus kampus");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Pusat Kendali Kampus</h2>
            <p className="text-slate-500">Kelola mitra perguruan tinggi dan saldo deposit mereka.</p>
        </div>
        
        {/* MODAL TAMBAH KAMPUS */}
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Mitra Baru
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Registrasi Kampus Mitra</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500">Nama Kampus</label>
                        <Input value={newCampus.name} onChange={e => setNewCampus({...newCampus, name: e.target.value})} placeholder="Universitas X" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">Slug / URL (Unik)</label>
                        <Input value={newCampus.slug} onChange={e => setNewCampus({...newCampus, slug: e.target.value})} placeholder="univ-x" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">Model Pembayaran</label>
                        <Select value={newCampus.billing_mode} onValueChange={(val) => setNewCampus({...newCampus, billing_mode: val})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="independent">Mandiri (Mahasiswa Bayar)</SelectItem>
                                <SelectItem value="subsidy">Subsidi (Kampus Bayar)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500">Biaya Mhs (Rp)</label>
                            <Input type="number" value={newCampus.student_fee} onChange={e => setNewCampus({...newCampus, student_fee: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Potongan Saldo (Rp)</label>
                            <Input type="number" value={newCampus.cost_per_check} onChange={e => setNewCampus({...newCampus, cost_per_check: e.target.value})} />
                        </div>
                    </div>
                    <Button onClick={handleCreateCampus} className="w-full bg-blue-600 mt-2">Simpan Kampus</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Daftar Mitra Perguruan Tinggi</CardTitle>
          <Badge className="bg-blue-100 text-blue-700">{campuses.length} Kampus</Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kampus</TableHead>
                  <TableHead>Mode Billing</TableHead>
                  <TableHead className="text-right">Sisa Saldo</TableHead>
                  <TableHead className="text-center">Total Konversi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campuses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold">
                        {c.name}
                        <div className="text-[10px] text-slate-400 font-mono">/{c.slug}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.billing_mode === 'subsidy' ? 'default' : 'outline'} className={c.billing_mode === 'subsidy' ? 'bg-blue-600' : 'text-slate-500'}>
                        {c.billing_mode === 'subsidy' ? 'Subsidi' : 'Mandiri'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-green-600">
                      Rp {Number(c.balance).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-center">{c.conversions_count} Mhs</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Tombol Top Up */}
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => { setSelectedCampus(c); setOpenTopupDialog(true); }}
                        >
                            <Wallet className="w-4 h-4" /> Top Up
                        </Button>
                        
                        {/* Tombol Hapus */}
                        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteCampus(c.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL TOPUP (DI LUAR LOOP) */}
      <Dialog open={openTopupDialog} onOpenChange={setOpenTopupDialog}>
        <DialogContent>
            <DialogHeader><DialogTitle>Top Up Saldo - {selectedCampus?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
            <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Nominal Top Up (Rp)</label>
                <Input type="number" placeholder="Contoh: 5000000" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} />
            </div>
            <Button onClick={handleTopup} className="w-full bg-green-600 hover:bg-green-700">
                <DollarSign className="w-4 h-4 mr-2" /> Konfirmasi Top Up
            </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}