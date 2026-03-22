"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowsClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "sonner";

import axios from "@/lib/axios";
import type { AuditLogItem } from "../types";
import EmptyState from "../shared/EmptyState";
import LoadingState from "../shared/LoadingState";
import PageHeader from "../shared/PageHeader";
import SectionCard from "../shared/SectionCard";
import { formatDate, getErrorMessage } from "../utils";

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/super-admin/reports/audit-logs");
      setLogs(response.data?.data?.data ?? response.data?.data ?? []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat audit logs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return logs;

    return logs.filter((log) =>
      [
        log.action,
        log.event,
        log.actor_name,
        log.user?.name,
        log.description,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [logs, query]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Audit Logs"
        description="Pantau aktivitas administratif dan histori perubahan sistem."
        action={
          <button
            type="button"
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-[#001a33]"
          >
            <ArrowsClockwise size={18} weight="bold" />
            Refresh
          </button>
        }
      />

      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <MagnifyingGlass
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari aksi, aktor, atau deskripsi..."
            className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-200"
          />
        </div>

        <p className="text-sm text-slate-400">
          Total log: <span className="font-bold text-[#001a33]">{filteredLogs.length}</span>
        </p>
      </div>

      <SectionCard>
        {loading ? (
          <LoadingState label="Memuat audit logs..." />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            title="Belum ada audit log"
            description="Aktivitas sistem belum tersedia atau belum tercatat."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Aksi
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Aktor
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Deskripsi
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30">
                    <td className="px-8 py-6 text-sm font-black text-[#001a33]">
                      {log.action ?? log.event ?? "-"}
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">
                      {log.actor_name ?? log.user?.name ?? "-"}
                    </td>
                    <td className="px-8 py-6 text-sm leading-relaxed text-slate-500">
                      {log.description ?? "-"}
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
