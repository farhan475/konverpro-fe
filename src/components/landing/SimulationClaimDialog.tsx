"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  FileArrowUp,
  FilePdf,
  GraduationCap,
  ListChecks,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import type { ConversionResult, LandingResultMetrics } from "./types";

interface SimulationClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ConversionResult | null;
  metrics: LandingResultMetrics | null;
  name: string;
  email: string;
  phone: string;
  originCampus: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onOriginCampusChange: (value: string) => void;
  onOpenDetail: () => void;
  onDownloadPdf: () => void;
  onSubmitWhatsApp: () => void;
  formatCurrency: (value: number) => string;
}

const CLAIM_ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_CLAIM_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const getAttachmentValidationError = (selectedFile: File) => {
  const fileName = selectedFile.name.toLowerCase();
  const isValidExtension = CLAIM_ACCEPTED_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension),
  );

  if (!isValidExtension) {
    return "Lampiran harus berupa PDF, JPG, JPEG, atau PNG.";
  }

  if (selectedFile.size > MAX_CLAIM_FILE_SIZE_BYTES) {
    return "Ukuran lampiran maksimal 5MB.";
  }

  return null;
};

export default function SimulationClaimDialog({
  open,
  onOpenChange,
  result,
  metrics,
  name,
  email,
  phone,
  originCampus,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onOriginCampusChange,
  onOpenDetail,
  onDownloadPdf,
  onSubmitWhatsApp,
  formatCurrency,
}: SimulationClaimDialogProps) {
  const [attachment, setAttachment] = useState<File | null>(null);

  const isClaimReady = useMemo(
    () =>
      Boolean(
        result &&
        metrics &&
        name.trim() &&
        email.trim() &&
        phone.trim() &&
        originCampus.trim(),
      ),
    [email, metrics, name, originCampus, phone, result],
  );

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      setAttachment(null);
      return;
    }

    const validationError = getAttachmentValidationError(selectedFile);

    if (validationError) {
      toast.error("Lampiran tidak valid", { description: validationError });
      event.target.value = "";
      setAttachment(null);
      return;
    }

    setAttachment(selectedFile);
    toast.success("Lampiran diterima", {
      description: selectedFile.name,
    });
    event.target.value = "";
  };

  const handleWhatsAppClick = () => {
    if (!isClaimReady) {
      toast.info("Lengkapi data pendaftaran dulu.");
      return;
    }

    if (attachment) {
      toast.info("Lampiran belum ikut terkirim otomatis", {
        description:
          "File transkrip masih disiapkan untuk backend claim. Saat ini hanya biodata dan summary yang dikirim ke WhatsApp.",
      });
    }

    onSubmitWhatsApp();
  };

  const campusInitial = result?.university?.name?.charAt(0) ?? "K";
  const logoPath = result?.university?.logo_path;

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAttachment(null);
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] border-none bg-white p-0 shadow-2xl sm:max-w-2xl">
        <div className="h-1.5 bg-brand-600" />

        <div className="p-6 sm:p-7">
          <DialogHeader className="mb-6 text-left">
            <div className="flex items-start gap-4 pr-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white text-xl font-black text-brand-900 shadow-sm">
                {logoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element -- logo kampus berasal dari URL dinamis backend
                  <img
                    src={logoPath}
                    alt={result?.university?.name ?? "Logo kampus"}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span>{campusInitial}</span>
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                  Konfirmasi Pendaftaran
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-slate-500">
                  Lengkapi biodata Anda sebelum lanjut ke konsultasi dan
                  follow-up pendaftaran.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {result && metrics ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
                <div className="space-y-3 border-b border-slate-200 pb-3">
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-500">
                      Kampus Tujuan
                    </span>
                    <span className="max-w-[55%] text-right font-bold text-slate-800">
                      {result.university?.name ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-500">
                      Program Studi
                    </span>
                    <span className="max-w-[55%] text-right font-bold text-slate-800">
                      {result.study_program?.name ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-500">
                      Biaya Daftar
                    </span>
                    <span className="max-w-[55%] text-right font-bold text-slate-800">
                      {formatCurrency(metrics.registrationFee)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Diakui
                    </span>
                    <span className="mt-1 block text-sm font-black text-emerald-600">
                      {metrics.accepted} SKS
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Estimasi
                    </span>
                    <span className="mt-1 block text-sm font-black text-brand-600">
                      {metrics.estimatedSemesters} Sem
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Biaya Kuliah
                    </span>
                    <span className="mt-1 block text-sm font-black text-slate-700">
                      {formatCurrency(metrics.tuitionPerSemester)}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenDetail}
                  className="mt-3 h-11 w-full rounded-xl border-brand-200 text-xs font-bold text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                >
                  <ListChecks weight="bold" className="mr-2 h-4 w-4" />
                  Lihat Detail SKS
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Nama Lengkap*
                  </label>
                  <Input
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                    placeholder="Nama Anda"
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 font-semibold shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Asal Kampus*
                  </label>
                  <Input
                    value={originCampus}
                    onChange={(event) =>
                      onOriginCampusChange(event.target.value)
                    }
                    placeholder="Kampus asal"
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 font-semibold shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Email*
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="email@domain.id"
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 font-semibold shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    No. WhatsApp*
                  </label>
                  <Input
                    value={phone}
                    onChange={(event) => onPhoneChange(event.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 font-semibold shadow-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Upload Transkrip Asli (Opsional)
                </label>
                <label className="group relative flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-brand-50/60">
                  <input
                    type="file"
                    accept={CLAIM_ACCEPTED_EXTENSIONS.join(",")}
                    className="absolute inset-0 opacity-0"
                    onChange={handleAttachmentChange}
                  />
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition group-hover:text-brand-600">
                    <FileArrowUp size={22} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-700 transition group-hover:text-brand-700">
                      {attachment?.name ?? "Klik untuk pilih file"}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                      PDF atau gambar, maksimal 5MB
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isClaimReady}
                  onClick={onDownloadPdf}
                  className="h-14 flex-1 rounded-xl border-slate-200 text-sm font-bold disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <FilePdf weight="bold" className="mr-2 h-5 w-5" />
                  Download PDF
                </Button>
                <Button
                  type="button"
                  disabled={!isClaimReady}
                  onClick={handleWhatsAppClick}
                  className="h-14 flex-[2] rounded-xl bg-green-600 text-sm font-black text-white shadow-xl shadow-green-600/20 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <WhatsappLogo weight="fill" className="mr-2 h-5 w-5" />
                  Kirim &amp; Daftar
                </Button>
              </div>

              <div className="rounded-[1.35rem] border border-brand-100 bg-brand-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                    <GraduationCap weight="fill" className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-brand-900">
                      Ringkasan yang ikut dibawa ke follow-up
                    </p>
                    <p className="text-sm leading-relaxed text-brand-900/80">
                      Biodata Anda, kampus tujuan, program studi, estimasi SKS,
                      dan sisa studi akan otomatis dimasukkan ke pesan WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Isi semua field bertanda bintang (*) untuk mengaktifkan tombol.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-500">
                Jalankan simulasi terlebih dahulu sebelum membuka popup
                pendaftaran.
              </p>
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="bg-brand-600 text-white hover:bg-brand-700"
              >
                Tutup
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
