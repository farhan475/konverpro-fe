"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, Wallet, Loader2, DollarSign } from "lucide-react";

export default function SuperAdminDashboard() {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

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
      await axios.post(`/super-admin/campuses/${selectedCampus.id}/topup`, {
        amount: Number(topupAmount)
      });
      toast.success("Top Up Berhasil!");
      setOpenDialog(false);
      setTopupAmount("");
      fetchCampuses(); // Refresh data saldo
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal Top Up");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pusat Kendali Kampus</h2>
        <p className="text-slate-500">Kelola mitra perguruan tinggi dan saldo deposit mereka.</p>
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
                    <TableCell className="font-bold">{c.name}</TableCell>
                    <TableCell>
                      <Badge variant={c.billing_mode === 'subsidy' ? 'default' : 'outline'} className={c.billing_mode === 'subsidy' ? 'bg-blue-600' : 'text-slate-500'}>
                        {c.billing_mode === 'subsidy' ? 'Subsidi Kampus' : 'Mahasiswa Bayar'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-green-600">
                      Rp {Number(c.balance).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-center">{c.conversions_count} Mhs</TableCell>
                    <TableCell className="text-right">
                      {/* Tombol Top Up */}
                      <Dialog open={openDialog && selectedCampus?.id === c.id} onOpenChange={(isOpen) => {
                        setOpenDialog(isOpen);
                        if(isOpen) setSelectedCampus(c);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
                            <Wallet className="w-4 h-4" /> Top Up
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Top Up Saldo - {c.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Nominal Top Up (Rp)</label>
                                <Input 
                                    type="number" 
                                    placeholder="Contoh: 5000000" 
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleTopup} className="w-full bg-green-600 hover:bg-green-700">
                                <DollarSign className="w-4 h-4 mr-2" /> Konfirmasi Top Up
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}