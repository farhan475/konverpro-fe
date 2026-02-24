"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios"; // Pastikan ini mengarah ke file axios yang sudah kita buat
import Link from "next/link"; // <--- 1. INI TAMBAHAN PENTING
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ConversionListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data dari API Laravel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/conversions`);
        // Handle pagination structure (Laravel default: response.data.data.data)
        // Atau jika Anda tidak pakai pagination di controller: response.data.data
        const listData = response.data.data.data || response.data.data; 
        setData(listData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Gagal mengambil data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Validasi Konversi</h2>
          <p className="text-slate-500">Daftar pengajuan masuk yang perlu diperiksa.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Antrean Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trx ID</TableHead>
                  <TableHead>Nama Mahasiswa</TableHead>
                  <TableHead>Prodi Tujuan</TableHead>
                  <TableHead className="text-center">SKS Diakui</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.trx_id}</TableCell>
                    <TableCell>
                        <div className="font-bold">{item.student?.name}</div>
                        <div className="text-xs text-slate-500">{item.student?.email}</div>
                    </TableCell>
                    <TableCell>{item.study_program?.name}</TableCell>
                    <TableCell className="text-center font-bold text-lg">{item.total_sks_accepted}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={item.status === 'approved' ? 'default' : item.status === 'review_needed' || item.status === 'review' ? 'secondary' : 'destructive'}>
                            {item.status === 'review_needed' || item.status === 'review' ? 'Butuh Review' : item.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {/* 2. INI PERBAIKANNYA: DIBUNGKUS LINK */}
                        <Link href={`/campus-admin/conversions/${item.id}`}>
                            <Button size="sm" variant="outline" className="gap-2 cursor-pointer">
                                <Eye className="w-4 h-4" /> Detail
                            </Button>
                        </Link>
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