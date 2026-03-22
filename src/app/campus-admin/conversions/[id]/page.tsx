"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  Download,
  FileText,
  Loader2,
  Save,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateConversionPDF,
  type OfficialDocumentMeta,
} from "@/lib/generatePdf";
import {
  buildLetterNumber,
  findAcademicSettingsByProdiName,
} from "@/lib/academicSettings";
import {
  getOfficialDocumentTemplateMeta,
  officialDocumentTemplates,
  type OfficialDocumentTemplate,
} from "@/lib/officialDocumentTemplates";
import { OfficialDocumentPreviewDialog } from "@/components/campus-admin/conversions/OfficialDocumentPreviewDialog";
import { ConversionReviewSummaryCards } from "@/components/campus-admin/conversions/ConversionReviewSummaryCards";
import { ConversionReviewTable } from "@/components/campus-admin/conversions/ConversionReviewTable";
import { TranscriptPreviewDialog } from "@/components/campus-admin/conversions/TranscriptPreviewDialog";
import type {
  ConversionDetailResponse,
  OfficialDocumentPayloadResponse,
} from "@/components/campus-admin/conversions/types";

interface CampusProfileSummary {
  name?: string;
}

const toPreviewUrl = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return undefined;
};

export default function ReviewConversionPage() {
  const params = useParams();
  const router = useRouter();
  const conversionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState<ConversionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [transcriptPreviewOpen, setTranscriptPreviewOpen] = useState(false);
  const [campusName, setCampusName] = useState("KonverPro Campus Admin");
  const [selectedTemplate, setSelectedTemplate] =
    useState<OfficialDocumentTemplate>("berita_acara");
  const [officialDocumentPayload, setOfficialDocumentPayload] =
    useState<OfficialDocumentPayloadResponse | null>(null);

  const fetchData = useCallback(async () => {
    if (!conversionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [response, officialResponse, profileResponse] = await Promise.all([
        axios.get(`/admin/conversions/${conversionId}`),
        axios.get(`/admin/conversions/${conversionId}/official-document`).catch(() => null),
        axios.get("/campus/settings/profile").catch(() => null),
      ]);

      const officialData = (officialResponse?.data?.data ??
        null) as OfficialDocumentPayloadResponse | null;
      const baseData = response.data.data as ConversionDetailResponse;

      setData({
        ...baseData,
        created_at:
          baseData.created_at ?? officialData?.conversion?.created_at ?? undefined,
        total_sks_accepted:
          baseData.total_sks_accepted ??
          officialData?.summary?.acceptedSks ??
          0,
        transcript_url:
          baseData.transcript_url ??
          toPreviewUrl(officialData?.files?.originalTranscriptPath) ??
          undefined,
        document_url:
          baseData.document_url ??
          toPreviewUrl(officialData?.files?.generatedResultPath) ??
          undefined,
      });
      setOfficialDocumentPayload(officialData);
      setCampusName(
        (profileResponse?.data?.data as CampusProfileSummary | undefined)?.name ||
          "KonverPro Campus Admin",
      );
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil detail data");
    } finally {
      setLoading(false);
    }
  }, [conversionId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const fallbackAcademicSettings = useMemo(
    () => findAcademicSettingsByProdiName(data?.study_program?.name),
    [data?.study_program?.name],
  );

  const academicSettings =
    officialDocumentPayload?.academic_settings ?? fallbackAcademicSettings;

  const officialMeta = useMemo<OfficialDocumentMeta>(
    () => ({
      campusName:
        officialDocumentPayload?.official_document_meta?.campusName ||
        data?.university?.name ||
        campusName,
      documentNumber:
        officialDocumentPayload?.official_document_meta?.documentNumber ??
        (academicSettings
          ? buildLetterNumber(
              academicSettings,
              data?.study_program?.code,
              data?.trx_id || conversionId,
            )
          : undefined),
      signatoryName:
        officialDocumentPayload?.official_document_meta?.signatoryName ??
        academicSettings?.kaprodiName,
      signatoryTitle:
        officialDocumentPayload?.official_document_meta?.signatoryTitle ??
        academicSettings?.kaprodiTitle,
      notes:
        officialDocumentPayload?.official_document_meta?.notes ??
        academicSettings?.notes,
      signatureDataUrl:
        officialDocumentPayload?.official_document_meta?.signatureDataUrl ??
        academicSettings?.signatureDataUrl,
    }),
    [
      academicSettings,
      campusName,
      conversionId,
      data?.study_program?.code,
      data?.trx_id,
      data?.university?.name,
      officialDocumentPayload,
    ],
  );

  const selectedTemplateMeta = getOfficialDocumentTemplateMeta(selectedTemplate);
  const acceptedCount = useMemo(
    () =>
      data?.details?.filter((item) =>
        ["approved", "accepted", "auto_accepted", "manual_accepted"].includes(
          item.status,
        ),
      ).length ?? 0,
    [data?.details],
  );
  const rejectedCount = useMemo(
    () => data?.details?.filter((item) => item.status === "rejected").length ?? 0,
    [data?.details],
  );
  const pendingCount = useMemo(
    () =>
      Math.max(
        0,
        (data?.details?.length ?? 0) - acceptedCount - rejectedCount,
      ),
    [acceptedCount, data?.details, rejectedCount],
  );
  const reviewStats = [
    {
      label: "MK Sumber",
      value: data?.details?.length ?? 0,
      helper: "siap divalidasi admin",
    },
    {
      label: "Diterima",
      value: acceptedCount,
      helper: `${data?.total_sks_accepted ?? 0} SKS diakui`,
    },
    {
      label: "Pending",
      value: pendingCount,
      helper: "masih butuh keputusan",
    },
  ];

  // Handle Review per Item (Approve/Reject)
  const handleReviewItem = async (detailId: string, status: 'approved' | 'rejected') => {
    setProcessingId(detailId);
    try {
      // PERBAIKAN 2
      await axios.post(`/admin/review-detail/${detailId}`, {
        status: status,
        admin_notes: "Reviewed by Admin"
      });
      
      toast.success(status === 'approved' ? "Mata kuliah disetujui" : "Mata kuliah ditolak");
      await fetchData();
    } catch (error: unknown) {
      console.error(isAxiosError(error) ? error.response?.data : error);
      toast.error(
        isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Gagal melakukan review",
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Finalisasi (Ketuk Palu)
  const handleFinalize = async () => {
    if (!confirm("Apakah Anda yakin ingin menyetujui seluruh hasil konversi ini?")) return;
    if (!conversionId) return;
    
    try {
      await axios.post(`/admin/finalize/${conversionId}`, {
        notes: "Selamat, hasil konversi Anda telah disetujui."
      });
      toast.success("Dokumen berhasil difinalisasi!");
      
      await fetchData();
    } catch (error: unknown) {
      // PERBAIKAN DI SINI: Tangkap pesan error asli dari backend
      console.error(
        "Detail Error:",
        isAxiosError(error) ? error.response?.data : error,
      );
      toast.error(
        isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Gagal memproses finalisasi",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-400">
            Menyinkronkan detail hasil konversi...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl py-20">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">
            Data hasil konversi tidak ditemukan
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            ID transaksi ini belum tersedia atau belum bisa dibaca dari backend saat
            ini.
          </p>
          <Button
            onClick={() => router.push("/campus-admin/conversions")}
            className="mt-6 bg-[#094E8B] hover:bg-[#073e6f]"
          >
            Kembali ke daftar hasil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 bg-[radial-gradient(circle_at_top,_rgba(9,78,139,0.08),_transparent_42%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] pb-20">
      <section className="overflow-hidden rounded-[2.5rem] border border-[#001a33]/10 bg-[#001a33] p-7 text-white shadow-2xl shadow-slate-950/10">
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-11 w-11 rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
                Review Workspace
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                {data.status === "approved"
                  ? "Final Document Ready"
                  : "Needs Validation"}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-200">
                Mahasiswa & Dokumen
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                {data.student?.name || "Workspace Review Konversi"}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-blue-100/80">
                Review padanan transkrip dari{" "}
                <span className="font-bold text-white">
                  {data.origin_campus || data.origin || "kampus asal"}
                </span>{" "}
                menuju{" "}
                <span className="font-bold text-white">
                  {data.study_program?.name || "program studi tujuan"}
                </span>{" "}
                di {data.university?.name || campusName}. Setelah valid, dokumen
                resmi siap dicetak memakai template akademik yang dipilih.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {reviewStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                  <p className="mt-2 text-xs font-medium text-white/65">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-200">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                    Official Composer
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {selectedTemplateMeta.label}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-white/65">
                    Nomor dokumen: {officialMeta.documentNumber || "Belum dibentuk"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    Signatory
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {officialMeta.signatoryName || "Ketua Program Studi"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    TRX ID
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-white">
                    {data.trx_id || conversionId}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                Quick Actions
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                  onClick={() => setTranscriptPreviewOpen(true)}
                >
                  <ScrollText className="mr-2 h-4 w-4" /> Preview Transkrip
                </Button>
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                  onClick={() => setPreviewOpen(true)}
                >
                  <FileText className="mr-2 h-4 w-4" /> Preview Dokumen
                </Button>
                {data.status === "approved" ? (
                  <Button
                    variant="outline"
                    className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                    onClick={() =>
                      generateConversionPDF(data, true, officialMeta, {
                        template: selectedTemplate,
                      })
                    }
                  >
                    <Download className="mr-2 h-4 w-4" /> Cetak {selectedTemplateMeta.label}
                  </Button>
                ) : (
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleFinalize}>
                    <Save className="mr-2 h-4 w-4" /> Finalisasi & Approve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
              Template Dokumen
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Ganti format berita acara / lampiran
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {officialDocumentTemplates.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSelectedTemplate(item.value)}
                className={
                  item.value === selectedTemplate
                    ? "rounded-full bg-[#001a33] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white"
                    : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-900"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Operational Context
              </p>
              <p className="mt-1 text-sm font-black text-[#001a33]">
                {data.student?.email || "Email mahasiswa belum tersedia"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Kampus tujuan: {data.university?.name || campusName} • Penanggung
                jawab dokumen: {officialMeta.signatoryTitle || "Ketua Program Studi"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ConversionReviewSummaryCards
        data={data}
        academicSettings={academicSettings}
        officialMeta={officialMeta}
        campusName={campusName}
      />

      <ConversionReviewTable
        data={data}
        processingId={processingId}
        onReviewItem={handleReviewItem}
      />

      <OfficialDocumentPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={data}
        academicSettings={academicSettings}
        officialMeta={officialMeta}
        template={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
        canDownload={data.status === "approved"}
        onDownload={() =>
          generateConversionPDF(data, true, officialMeta, {
            template: selectedTemplate,
          })
        }
      />

      <TranscriptPreviewDialog
        open={transcriptPreviewOpen}
        onOpenChange={setTranscriptPreviewOpen}
        data={data}
      />

    </div>
  );
}
