"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Download, Search, RefreshCw } from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Mock endpoint if backend not ready
      const res = await axios.get('/super-admin/audit-logs').catch(() => ({ 
          data: { data: [
              { id: 1, created_at: "2024-03-01 10:20", user: "Super Admin", action: "UPDATE_CONFIG", target: "Global Settings", status: "success" },
              { id: 2, created_at: "2024-03-01 09:15", user: "System", action: "AUTO_BACKUP", target: "Database", status: "success" },
              { id: 3, created_at: "2024-02-28 14:30", user: "Admin UGM", action: "LOGIN_FAILED", target: "Auth", status: "danger" },
              { id: 4, created_at: "2024-02-28 11:00", user: "Super Admin", action: "APPROVE_TOPUP", target: "UI UX College", status: "success" },
              { id: 5, created_at: "2024-02-27 16:45", user: "Super Admin", action: "CREATE_CAMPUS", target: "Telkom Univ", status: "success" },
          ] }
      }));
      setLogs(res.data.data);
    } catch (error) {
      toast.error("Gagal memuat audit log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">System Audit Log</h2>
                <p className="text-sm font-bold text-slate-500 mt-1">Gunakan log ini untuk melacak aktivitas seluruh user dan sistem.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="text-xs font-bold uppercase text-slate-600 bg-white" onClick={fetchLogs}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
                <Button className="bg-slate-900 hover:bg-black text-xs font-bold uppercase">
                    <Download className="w-4 h-4 mr-2" /> Download CSV
                </Button>
            </div>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50 relative">
                <Search className="absolute left-7 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="Cari berdasarkan user, aksi, atau target..." 
                    className="pl-10 font-bold border-none bg-white shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="text-[10px] uppercase font-black text-slate-400 py-4">Waktu (WIB)</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-slate-400 py-4">User / Actor</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-slate-400 py-4">Aktivitas</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-slate-400 py-4">Target / Objek</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-slate-400 py-4 text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin text-blue-600 mx-auto" /></TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400 italic">No logs found.</TableCell></TableRow>
                    ) : (
                        filtered.map((log) => (
                            <TableRow key={log.id} className="hover:bg-slate-50">
                                <TableCell className="text-xs font-bold text-slate-500">{log.created_at}</TableCell>
                                <TableCell className="font-bold text-slate-900">{log.user}</TableCell>
                                <TableCell className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-2">{log.action}</TableCell>
                                <TableCell className="text-sm font-bold text-slate-700">{log.target}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className={`text-[9px] uppercase font-black ${
                                        log.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                        {log.status === 'success' ? 'SUCCESS' : 'FAILED'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    </div>
  );
}
