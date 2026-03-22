"use client";

import Image from "next/image";
import type { AcademicSettings } from "@/components/campus-admin/types";
import type { OfficialDocumentMeta } from "@/lib/generatePdf";
import {
  getOfficialDocumentTemplateMeta,
  officialDocumentTemplates,
  type OfficialDocumentTemplate,
} from "@/lib/officialDocumentTemplates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

interface OfficialPreviewDetailItem {
  id: string;
  src_name: string;
  src_grade: string;
  src_sks: number;
  status: string;
  target_course?: {
    code?: string;
    name?: string;
  } | null;
}

export interface OfficialDocumentPreviewData {
  trx_id: string;
  status: string;
  created_at?: string;
  total_sks_accepted: number;
  student?: {
    name?: string;
    email?: string;
  } | null;
  study_program?: {
    name?: string;
    code?: string;
  } | null;
  details?: OfficialPreviewDetailItem[];
}

interface OfficialDocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: OfficialDocumentPreviewData | null;
  academicSettings: AcademicSettings | null;
  officialMeta: OfficialDocumentMeta;
  template: OfficialDocumentTemplate;
  onTemplateChange: (template: OfficialDocumentTemplate) => void;
  canDownload: boolean;
  onDownload: () => void;
}

const isAcceptedStatus = (status: string) =>
  status === "approved" ||
  status === "auto_accepted" ||
  status === "manual_accepted" ||
  status === "accepted";

export function OfficialDocumentPreviewDialog({
  open,
  onOpenChange,
  data,
  academicSettings,
  officialMeta,
  template,
  onTemplateChange,
  canDownload,
  onDownload,
}: OfficialDocumentPreviewDialogProps) {
  const acceptedCourses =
    data?.details?.filter((item) => isAcceptedStatus(item.status)) ?? [];
  const templateMeta = getOfficialDocumentTemplateMeta(template);
  const createdAt = new Date(data?.created_at || new Date()).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden border-none p-0 shadow-2xl sm:max-w-5xl">
        <div className="border-b border-slate-100 bg-slate-50/70 p-6">
          <DialogHeader>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Badge className="bg-[#094E8B] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-[#094E8B]">
                Preview Dokumen
              </Badge>
              <Badge
                variant="outline"
                className={
                  canDownload
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }
              >
                {canDownload ? "Siap Dicetak" : "Masih Draft Review"}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
              {templateMeta.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {templateMeta.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(88vh-96px)] overflow-y-auto bg-white">
          <div className="space-y-6 p-6">
            <section className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Template Dokumen
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {officialDocumentTemplates.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onTemplateChange(item.value)}
                    className={
                      item.value === template
                        ? "rounded-full bg-[#001a33] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                        : "rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 transition hover:text-slate-900"
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section
              className={`rounded-[2rem] border p-6 text-white ${
                template === "surat_keputusan"
                  ? "border-amber-200 bg-gradient-to-br from-[#4a2900] to-[#8d5a04]"
                  : template === "lampiran_studi"
                    ? "border-emerald-200 bg-gradient-to-br from-[#0f3b2d] to-[#1f7a5b]"
                    : "border-slate-100 bg-[#001a33]"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">
                    Nomor Dokumen
                  </p>
                  <h3 className="mt-2 text-xl font-black">
                    {officialMeta.documentNumber || "-"}
                  </h3>
                  <p className="mt-3 text-sm text-blue-100/80">
                    {officialMeta.campusName || "KonverPro Campus Admin"} •{" "}
                    {data?.study_program?.name || "-"}
                  </p>
                  <p className="mt-4 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/90">
                    {templateMeta.shortLabel} • {templateMeta.label}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                      Tanggal
                    </p>
                    <p className="mt-2 text-sm font-bold">{createdAt}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                      SKS Diakui
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {data?.total_sks_accepted ?? 0} SKS
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {!canDownload && (
              <section className="flex items-start gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-black">Dokumen belum final</p>
                  <p className="text-xs leading-relaxed text-amber-700">
                    Preview tetap bisa dilihat untuk pengecekan kebijakan akademik,
                    tetapi tombol unduh baru aktif setelah status konversi disetujui.
                  </p>
                </div>
              </section>
            )}

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Identitas Mahasiswa
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {data?.student?.name || "-"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Email: {data?.student?.email || "-"}</p>
                  <p>TRX ID: {data?.trx_id || "-"}</p>
                  <p>Prodi tujuan: {data?.study_program?.name || "-"}</p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Policy Akademik
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {academicSettings?.minPassingGrade || "C"} minimum
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    Maksimum konversi:{" "}
                    {academicSettings?.maxAcceptedSks ?? data?.total_sks_accepted ?? 0}{" "}
                    SKS
                  </p>
                  <p>
                    Batas studi: {academicSettings?.maxStudyYears ?? "-"} tahun
                  </p>
                  <p>
                    Penandatangan: {officialMeta.signatoryName || "Ketua Prodi"}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Mata Kuliah Wajib
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {academicSettings?.requiredCourses.length ?? 0} mata kuliah
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  {academicSettings?.requiredCourses.slice(0, 4).map((course) => (
                    <p key={course.id} className="rounded-xl bg-white px-3 py-2">
                      {course.code} • {course.name}
                    </p>
                  ))}
                  {!academicSettings?.requiredCourses.length && (
                    <p className="text-slate-400">
                      Belum ada policy lokal tersimpan untuk prodi ini.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {template === "surat_keputusan" ? (
              <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Dasar Penetapan
                    </h4>
                    <p className="text-xs text-slate-400">
                      Poin keputusan yang membingkai surat resmi program studi.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600">
                    Mahasiswa memenuhi batas minimum nilai{" "}
                    <span className="font-black text-slate-900">
                      {academicSettings?.minPassingGrade || "C"}
                    </span>{" "}
                    sesuai policy prodi.
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600">
                    Total pengakuan saat ini mencapai{" "}
                    <span className="font-black text-slate-900">
                      {data?.total_sks_accepted ?? 0} SKS
                    </span>{" "}
                    dari batas maksimum{" "}
                    <span className="font-black text-slate-900">
                      {academicSettings?.maxAcceptedSks ?? 0} SKS.
                    </span>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {template === "lampiran_studi"
                      ? "Ringkasan Mata Kuliah Terkonversi"
                      : "Rincian Mata Kuliah Disetujui"}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {template === "lampiran_studi"
                      ? "Daftar ini membantu menyusun rencana studi lanjutan mahasiswa."
                      : "Hanya mata kuliah berstatus diterima yang masuk ke dokumen resmi."}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {acceptedCourses.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-400">
                    Belum ada mata kuliah yang disetujui.
                  </div>
                ) : (
                  acceptedCourses.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4 lg:grid-cols-[1.2fr_auto_1.2fr_auto]"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Mata Kuliah Asal
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {item.src_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.src_grade} • {item.src_sks} SKS
                        </p>
                      </div>
                      <div className="flex items-center justify-center text-xs font-black uppercase tracking-[0.18em] text-blue-500">
                        Konversi
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Mata Kuliah Tujuan
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {item.target_course?.name || "Belum dipetakan"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.target_course?.code || "-"}
                        </p>
                      </div>
                      <div className="flex items-center justify-end">
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                          Diterima
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {template === "lampiran_studi" ? (
              <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        Rule Semester Lanjutan
                      </h4>
                      <p className="text-xs text-slate-400">
                        Distribusi beban studi yang tersimpan di `Akad Settings`.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {academicSettings?.semesterRules.map((rule) => (
                      <div
                        key={rule.semester}
                        className="flex items-center justify-between rounded-[1.4rem] bg-white px-4 py-3"
                      >
                        <p className="text-sm font-black text-slate-900">
                          Semester {rule.semester}
                        </p>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                          Maks {rule.maxSks} SKS
                        </p>
                      </div>
                    ))}
                    {!academicSettings?.semesterRules.length && (
                      <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-400">
                        Rule semester belum tersimpan untuk prodi ini.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-3 text-blue-700 shadow-sm">
                      <ScrollText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        Rekomendasi Studi
                      </h4>
                      <p className="text-xs text-slate-400">
                        Digunakan sebagai lampiran saat konsultasi akademik.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] bg-white p-4 text-sm leading-relaxed text-slate-600">
                    Mahasiswa masih disarankan memprioritaskan mata kuliah inti
                    yang belum terpetakan dan menjaga total studi maksimal{" "}
                    <span className="font-black text-slate-900">
                      {academicSettings?.maxStudyYears ?? "-"} tahun.
                    </span>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                    <ScrollText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Catatan Akademik
                    </h4>
                    <p className="text-xs text-slate-400">
                      Catatan ini akan dibawa ke dokumen resmi cetak.
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {officialMeta.notes ||
                    academicSettings?.notes ||
                    "Belum ada catatan akademik tambahan untuk dokumen ini."}
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Penandatangan
                </p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  {officialMeta.signatoryName || "-"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {officialMeta.signatoryTitle || "Ketua Program Studi"}
                </p>

                {officialMeta.signatureDataUrl ? (
                  <Image
                    src={officialMeta.signatureDataUrl}
                    alt="Tanda tangan penandatangan"
                    width={180}
                    height={96}
                    unoptimized
                    className="mt-5 h-24 rounded-2xl border border-slate-200 bg-white p-3"
                  />
                ) : (
                  <div className="mt-5 flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
                    Tanda tangan belum diunggah
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-100 bg-white/95 p-6 backdrop-blur sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-200"
            >
              Tutup Preview
            </Button>
            <Button
              onClick={onDownload}
              disabled={!canDownload}
              className="bg-[#094E8B] hover:bg-[#073e6f]"
            >
              <Download className="mr-2 h-4 w-4" />
              Unduh {templateMeta.label}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
