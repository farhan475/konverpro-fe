"use client";

import { BookOpenText, FileBadge2, FileCheck2, ShieldCheck, XCircle } from "lucide-react";

import type { AcademicSettings } from "@/components/campus-admin/types";
import { Badge } from "@/components/ui/badge";
import type { OfficialDocumentMeta } from "@/lib/generatePdf";

import type { ConversionDetailResponse } from "./types";

interface ConversionReviewSummaryCardsProps {
  data: ConversionDetailResponse;
  academicSettings: AcademicSettings | null;
  officialMeta: OfficialDocumentMeta;
  campusName: string;
}

const isAcceptedStatus = (status: string) =>
  status === "approved" ||
  status === "auto_accepted" ||
  status === "manual_accepted" ||
  status === "accepted";

const isRejectedStatus = (status: string) =>
  status === "rejected" || status === "ditolak";

const formatDateTime = (value?: string) =>
  new Date(value || new Date()).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function ConversionReviewSummaryCards({
  data,
  academicSettings,
  officialMeta,
  campusName,
}: ConversionReviewSummaryCardsProps) {
  const detailItems = data.details ?? [];
  const acceptedCount = detailItems.filter((item) => isAcceptedStatus(item.status)).length;
  const rejectedCount = detailItems.filter((item) => isRejectedStatus(item.status)).length;
  const pendingCount = detailItems.length - acceptedCount - rejectedCount;
  const transcriptSks = detailItems.reduce((total, item) => total + (item.src_sks || 0), 0);
  const originCampus =
    data.origin_campus || data.origin || data.student?.origin_university || "Belum tersedia";

  const statusTone =
    data.status === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : data.status === "rejected"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  const statCards = [
    {
      label: "Mata Kuliah Sumber",
      value: detailItems.length,
      helper: `${transcriptSks} SKS terdeteksi`,
      icon: BookOpenText,
      className: "bg-white text-slate-900",
      iconClassName: "bg-blue-50 text-blue-700",
    },
    {
      label: "Diterima",
      value: acceptedCount,
      helper: `${data.total_sks_accepted} SKS diakui`,
      icon: FileCheck2,
      className: "bg-emerald-50 text-emerald-900",
      iconClassName: "bg-white text-emerald-700",
    },
    {
      label: "Perlu Review",
      value: pendingCount,
      helper: "Menunggu keputusan admin",
      icon: ShieldCheck,
      className: "bg-amber-50 text-amber-900",
      iconClassName: "bg-white text-amber-700",
    },
    {
      label: "Ditolak",
      value: rejectedCount,
      helper: "Tidak masuk berita acara",
      icon: XCircle,
      className: "bg-rose-50 text-rose-900",
      iconClassName: "bg-white text-rose-700",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="overflow-hidden rounded-[2rem] border border-[#001a33]/10 bg-[#001a33] p-7 text-white shadow-xl shadow-slate-950/10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100 hover:bg-white/10">
              Workspace Review
            </Badge>
            <Badge variant="outline" className={statusTone}>
              {data.status === "approved"
                ? "Tersetujui"
                : data.status === "rejected"
                  ? "Ditolak"
                  : "Menunggu Finalisasi"}
            </Badge>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-200">
                Mahasiswa
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                {data.student?.name || "Mahasiswa belum teridentifikasi"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/85">
                Review hasil pemetaan transkrip menuju{" "}
                <span className="font-bold text-white">
                  {data.study_program?.name || "program studi tujuan"}
                </span>{" "}
                di {data.university?.name || campusName}.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Asal Kampus
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">{originCampus}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Tanggal Review
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {formatDateTime(data.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/[0.12] p-3 text-blue-100">
                  <FileBadge2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Dokumen Resmi
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {officialMeta.documentNumber || "Nomor belum dibentuk"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-blue-100/80">
                <p>TRX ID: {data.trx_id || "-"}</p>
                <p>Email mahasiswa: {data.student?.email || "-"}</p>
                <p>Penandatangan: {officialMeta.signatoryName || "Ketua Program Studi"}</p>
                <p>
                  Batas minimum nilai: {academicSettings?.minPassingGrade || "C"} • Maksimal{" "}
                  {academicSettings?.maxAcceptedSks ?? data.total_sks_accepted ?? 0} SKS
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Identitas Pendaftar
          </p>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Nama Lengkap
              </p>
              <p className="mt-2 text-lg font-black text-slate-900">
                {data.student?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Program Studi Tujuan
              </p>
              <p className="mt-2 text-sm font-bold text-slate-700">
                {data.study_program?.code ? `${data.study_program.code} • ` : ""}
                {data.study_program?.name || "-"}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Kampus Tujuan
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700">
                  {data.university?.name || campusName}
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Total SKS Diakui
                </p>
                <p className="mt-2 text-sm font-black text-blue-700">
                  {data.total_sks_accepted ?? 0} SKS
                </p>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Catatan Policy
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {officialMeta.notes ||
                  academicSettings?.notes ||
                  "Belum ada catatan akademik tambahan. Dokumen masih bisa dipreview untuk verifikasi internal."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`rounded-[1.75rem] border border-slate-100 p-5 shadow-sm ${item.className}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-black leading-none">{item.value}</p>
                  <p className="mt-3 text-xs font-medium opacity-75">{item.helper}</p>
                </div>
                <div className={`rounded-2xl p-3 ${item.iconClassName}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
