"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  FileSearch,
  Files,
  GraduationCap,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import type { ConversionDetailResponse } from "./types";

interface TranscriptPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ConversionDetailResponse | null;
}

type TranscriptTab = "extraction" | "file";

const isAcceptedStatus = (status: string) =>
  status === "approved" ||
  status === "auto_accepted" ||
  status === "manual_accepted" ||
  status === "accepted";

const isRejectedStatus = (status: string) =>
  status === "rejected" || status === "ditolak";

const getGroupStatus = (statuses: string[]) => {
  if (statuses.some((status) => isAcceptedStatus(status))) return "accepted";
  if (statuses.every((status) => isRejectedStatus(status))) return "rejected";
  return "pending";
};

export function TranscriptPreviewDialog({
  open,
  onOpenChange,
  data,
}: TranscriptPreviewDialogProps) {
  const [activeTab, setActiveTab] = useState<TranscriptTab>("extraction");

  const previewUrl =
    data?.transcript_url ||
    data?.document_url ||
    data?.student?.transcript_url ||
    null;

  const transcriptRows = useMemo(() => {
    const groups = new Map<
      string,
      {
        id: string;
        name: string;
        grade: string;
        sks: number;
        statuses: string[];
        targets: string[];
      }
    >();

    (data?.details ?? []).forEach((item) => {
      const key = `${item.src_name}-${item.src_grade}-${item.src_sks}`;
      const existing = groups.get(key);

      if (existing) {
        existing.statuses.push(item.status);
        if (item.target_course?.name) {
          existing.targets.push(item.target_course.name);
        }
        return;
      }

      groups.set(key, {
        id: item.id,
        name: item.src_name,
        grade: item.src_grade,
        sks: item.src_sks,
        statuses: [item.status],
        targets: item.target_course?.name ? [item.target_course.name] : [],
      });
    });

    return Array.from(groups.values()).map((row) => ({
      ...row,
      targets: Array.from(new Set(row.targets)),
      status: getGroupStatus(row.statuses),
    }));
  }, [data?.details]);

  const acceptedCount = transcriptRows.filter((row) => row.status === "accepted").length;
  const pendingCount = transcriptRows.filter((row) => row.status === "pending").length;
  const transcriptSks = transcriptRows.reduce((total, row) => total + (row.sks || 0), 0);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setActiveTab("extraction");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden border-none p-0 shadow-2xl sm:max-w-6xl">
        <div className="border-b border-slate-100 bg-slate-50/80 p-6">
          <DialogHeader>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Badge className="bg-[#001a33] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-[#001a33]">
                Preview Transkrip
              </Badge>
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700"
              >
                {previewUrl ? "File Asli Tersedia" : "Berbasis Hasil Ekstraksi"}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
              Preview Transkrip Mahasiswa
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Tampilan ini meniru lembar transkrip referensi dan tetap usable
              meskipun backend belum mengirim file sumber asli.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(92vh-112px)] overflow-y-auto bg-white">
          <div className="space-y-6 p-6">
            <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-[2rem] border border-[#001a33]/10 bg-[#001a33] p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">
                      Dokumen Sumber
                    </p>
                    <h3 className="mt-3 text-2xl font-black">
                      {data?.student?.name || "Mahasiswa belum teridentifikasi"}
                    </h3>
                    <p className="mt-2 text-sm text-blue-100/85">
                      {data?.student?.origin_university ||
                        data?.origin_campus ||
                        data?.origin ||
                        "Asal kampus belum tersedia"}{" "}
                      menuju {data?.study_program?.name || "program studi tujuan"}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                      TRX ID
                    </p>
                    <p className="mt-2 text-sm font-black text-white">
                      {data?.trx_id || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200">
                      Baris Terdeteksi
                    </p>
                    <p className="mt-2 text-2xl font-black">{transcriptRows.length}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200">
                      Total SKS
                    </p>
                    <p className="mt-2 text-2xl font-black">{transcriptSks}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200">
                      Siap Dikonversi
                    </p>
                    <p className="mt-2 text-2xl font-black">{acceptedCount}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Ringkasan Review
                </p>
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.4rem] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          {data?.total_sks_accepted ?? 0} SKS Diakui
                        </p>
                        <p className="text-xs text-slate-500">
                          Berdasarkan hasil review saat ini
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          {pendingCount} baris masih butuh verifikasi
                        </p>
                        <p className="text-xs text-slate-500">
                          Cocok untuk cross-check cepat sebelum finalisasi
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
                    Jika backend nanti mengirim `transcript_url`, tab file asli akan
                    langsung aktif tanpa perlu ubah UI lagi.
                  </div>
                </div>
              </div>
            </section>

            {previewUrl ? (
              <section className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("extraction")}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition",
                      activeTab === "extraction"
                        ? "bg-[#001a33] text-white"
                        : "bg-white text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <ScrollText className="mr-2 inline h-4 w-4" />
                    Hasil Ekstraksi
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("file")}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition",
                      activeTab === "file"
                        ? "bg-[#001a33] text-white"
                        : "bg-white text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <Files className="mr-2 inline h-4 w-4" />
                    File Asli
                  </button>
                </div>
                <Button asChild variant="outline" className="border-slate-200 bg-white">
                  <a href={previewUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Buka File di Tab Baru
                  </a>
                </Button>
              </section>
            ) : null}

            {activeTab === "file" && previewUrl ? (
              <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <h4 className="text-sm font-black text-slate-900">Viewer File Transkrip Asli</h4>
                </div>
                <div className="h-[62vh] bg-slate-100">
                  <iframe
                    src={previewUrl}
                    title="Preview file transkrip asal"
                    className="h-full w-full"
                  />
                </div>
              </section>
            ) : (
              <section className="rounded-[2rem] border border-slate-100 bg-slate-100/80 p-4 shadow-sm">
                <div className="mx-auto max-w-[980px] rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/30">
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                        Lembar Ekstraksi Transkrip
                      </p>
                      <h4 className="mt-2 text-xl font-black text-slate-900">
                        Preview Data Nilai Asal
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Menampilkan mata kuliah sumber yang terdeteksi dari transkrip
                        mahasiswa.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Status Data
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-900">
                        {previewUrl ? "Sinkron dengan file asli" : "Mode ekstraksi lokal"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-slate-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Mata Kuliah Asal
                          </th>
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Nilai
                          </th>
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            SKS
                          </th>
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Padanan Kurikulum
                          </th>
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transcriptRows.length ? (
                          transcriptRows.map((row) => (
                            <tr key={row.id} className="align-top">
                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-900">{row.name}</p>
                                  <p className="text-xs text-slate-400">
                                    Baris ekstraksi transkrip
                                  </p>
                                </div>
                              </td>
                              <td className="px-5 py-4 font-bold text-slate-700">{row.grade}</td>
                              <td className="px-5 py-4 font-medium text-slate-600">
                                {row.sks}
                              </td>
                              <td className="px-5 py-4">
                                {row.targets.length ? (
                                  <div className="flex flex-wrap gap-2">
                                    {row.targets.slice(0, 3).map((target) => (
                                      <span
                                        key={target}
                                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                                      >
                                        {target}
                                      </span>
                                    ))}
                                    {row.targets.length > 3 ? (
                                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                        +{row.targets.length - 3} padanan
                                      </span>
                                    ) : null}
                                  </div>
                                ) : (
                                  <span className="text-xs italic text-slate-400">
                                    Belum ada padanan
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full px-3 py-1 text-[11px] font-black",
                                    row.status === "accepted"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : row.status === "rejected"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-amber-100 text-amber-700",
                                  )}
                                >
                                  {row.status === "accepted"
                                    ? "Diterima"
                                    : row.status === "rejected"
                                      ? "Ditolak"
                                      : "Perlu Review"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-12 text-center text-sm font-medium italic text-slate-400"
                            >
                              Belum ada data transkrip yang bisa dipreview.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-100 bg-white/95 p-6 backdrop-blur sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-200"
            >
              Tutup Preview
            </Button>
            {previewUrl ? (
              <Button asChild className="bg-[#094E8B] hover:bg-[#073e6f]">
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  <FileSearch className="mr-2 h-4 w-4" />
                  Buka Dokumen Sumber
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
