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
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "campus_admin",
    university_id: ""
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      const [resUsers, resCampuses] = await Promise.all([
        axios.get('/super-admin/users'),
        axios.get('/super-admin/campuses')
      ]);
      setUsers(resUsers.data.data);
      setCampuses(resCampuses.data.data);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Create User
  const handleCreate = async () => {
    try {
      await axios.post('/super-admin/users', formData);
      toast.success("User berhasil dibuat!");
      setOpenDialog(false);
      setFormData({ name: "", email: "", password: "", role: "campus_admin", university_id: "" }); // Reset
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat user");
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if(!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await axios.delete(`/super-admin/users/${id}`);
      toast.success("User dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus user");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h2>
            <p className="text-slate-500">Kelola akses Super Admin & Admin Kampus.</p>
        </div>
        
        {/* MODAL CREATE USER */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Tambah User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Tambah User Baru</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500">Nama Lengkap</label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nama User" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">Email Login</label>
                        <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="admin@kampus.ac.id" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">Password</label>
                        <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="******" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">Role</label>
                        <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                            <SelectTrigger><SelectValue placeholder="Pilih Role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="campus_admin">Admin Kampus</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* HANYA MUNCUL JIKA ROLE = CAMPUS ADMIN */}
                    {formData.role === 'campus_admin' && (
                        <div>
                            <label className="text-xs font-bold text-slate-500">Afiliasi Kampus</label>
                            <Select value={formData.university_id} onValueChange={(val) => setFormData({...formData, university_id: val})}>
                                <SelectTrigger><SelectValue placeholder="Pilih Kampus Mitra" /></SelectTrigger>
                                <SelectContent>
                                    {campuses.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button onClick={handleCreate} className="w-full bg-blue-600 mt-2">Simpan User</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun Admin</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Kampus</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-bold">{u.name}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={u.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                            {u.role === 'super_admin' ? 'Super Admin' : 'Admin Kampus'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {u.university ? u.university.name : <span className="text-slate-400 italic">- Global -</span>}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(u.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
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