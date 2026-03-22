"use client";

import { useMemo, useState } from "react";
import {
  ArrowsLeftRight,
  Buildings,
  CheckCircle,
  GraduationCap,
  ListChecks,
  MagnifyingGlass,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  ConversionDetailItem,
  ConversionResult,
  LandingResultMetrics,
} from "./types";

type ResultTab = "all" | "accepted" | "remaining";

interface SimulationResultDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ConversionResult | null;
  metrics: LandingResultMetrics | null;
  onProceed: () => void;
}

const isAcceptedStatus = (status?: string) =>
  status === "approved" ||
  status === "accepted" ||
  status === "auto_accepted" ||
  status === "manual_accepted";

const getStatusLabel = (status?: string) => {
  if (isAcceptedStatus(status)) {
    return "Diterima";
  }

  if (status === "rejected") {
    return "Belum Cocok";
  }

  if (status === "pending") {
    return "Menunggu";
  }

  return "Perlu Review";
};

const getStatusClassName = (status?: string) => {
  if (isAcceptedStatus(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

export default function SimulationResultDetailDialog({
  open,
  onOpenChange,
  result,
  metrics,
  onProceed,
}: SimulationResultDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>("accepted");
  const logoPath = result?.university?.logo_path;

  const allDetails = useMemo(() => result?.details ?? [], [result?.details]);
  const acceptedDetails = useMemo(
    () => allDetails.filter((item) => isAcceptedStatus(item.status)),
    [allDetails],
  );
  const remainingDetails = useMemo(
    () => allDetails.filter((item) => !isAcceptedStatus(item.status)),
    [allDetails],
  );

  const visibleDetails: ConversionDetailItem[] =
    activeTab === "all"
      ? allDetails
      : activeTab === "accepted"
        ? acceptedDetails
        : remainingDetails;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden rounded-[2rem] border-none p-0 shadow-2xl sm:max-w-5xl">
        <div className="border-b border-slate-100 bg-slate-50 p-6">
          <DialogHeader>
            <div className="mb-5 flex items-start gap-4 pr-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-xl font-black text-brand-900 shadow-sm">
                {logoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element -- logo kampus berasal dari URL dinamis backend
                  <img
                    src={logoPath}
                    alt={result?.university?.name ?? "Logo kampus"}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span>{result?.university?.name?.charAt(0) ?? "K"}</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand-600 hover:bg-brand-50">
                    Detail Konversi
                  </Badge>
                  {metrics?.isOfficialPartner && (
                    <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 hover:bg-amber-50">
                      Official Partner
                    </Badge>
                  )}
                </div>

                <DialogTitle className="text-2xl font-black tracking-tight text-brand-900">
                  {result?.study_program?.name || "Rincian Konversi SKS"}
                </DialogTitle>
                <DialogDescription className="mt-2 space-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Buildings
                      weight="fill"
                      className="h-4 w-4 text-brand-500"
                    />
                    {result?.university?.name || "Kampus tujuan"}
                  </span>
                  <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">
                    {metrics?.location || "Indonesia"}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                SKS Diakui
              </p>
              <p className="mt-2 text-xl font-black text-emerald-600">
                {metrics?.accepted ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Sisa SKS
              </p>
              <p className="mt-2 text-xl font-black text-orange-600">
                {metrics?.remaining ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Lama Studi
              </p>
              <p className="mt-2 text-xl font-black text-slate-700">
                {metrics?.estimatedSemesters ?? 0} Sem
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-white px-6">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`border-b-2 px-4 py-4 text-xs font-black uppercase tracking-[0.18em] transition ${
                activeTab === "all"
                  ? "border-brand-900 text-brand-900"
                  : "border-transparent text-slate-400 hover:text-brand-700"
              }`}
            >
              Semua SKS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("accepted")}
              className={`border-b-2 px-4 py-4 text-xs font-black uppercase tracking-[0.18em] transition ${
                activeTab === "accepted"
                  ? "border-brand-900 text-brand-900"
                  : "border-transparent text-slate-400 hover:text-brand-700"
              }`}
            >
              SKS Diakui
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("remaining")}
              className={`border-b-2 px-4 py-4 text-xs font-black uppercase tracking-[0.18em] transition ${
                activeTab === "remaining"
                  ? "border-brand-900 text-brand-900"
                  : "border-transparent text-slate-400 hover:text-brand-700"
              }`}
            >
              Sisa SKS
            </button>
          </div>
        </div>

        <div className="max-h-[calc(88vh-248px)] overflow-y-auto bg-slate-50">
          <div className="space-y-6 p-6">
            {visibleDetails.length > 0 ? (
              <div className="space-y-3">
                {visibleDetails.map((item, index) => (
                  <div
                    key={item.id ?? `${item.src_name}-${index}`}
                    className="grid gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-5 lg:grid-cols-[1.15fr_auto_1.15fr_auto]"
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Mata Kuliah Asal
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-900">
                        {item.src_name || "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.src_grade || "-"} • {item.src_sks ?? 0} SKS
                      </p>
                    </div>

                    <div className="flex items-center justify-center text-brand-500">
                      <ArrowsLeftRight weight="bold" className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Mata Kuliah Tujuan
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-900">
                        {item.target_course?.name || "Belum ditemukan padanan"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.target_course?.code || "Kode belum tersedia"}
                      </p>
                    </div>

                    <div className="flex items-start justify-end">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${getStatusClassName(item.status)}`}
                      >
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 shadow-sm">
                  <MagnifyingGlass weight="duotone" className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">
                  Detail mata kuliah belum tersedia
                </h4>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                  Backend saat ini sudah mengembalikan ringkasan hasil, tetapi
                  rincian per mata kuliah belum selalu tersedia di semua
                  skenario.
                </p>
              </div>
            )}

            {result?.notes && result.notes.length > 0 && (
              <div className="rounded-[2rem] border border-brand-100 bg-brand-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
                    <GraduationCap weight="fill" className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-brand-900">
                      Catatan Simulasi
                    </h4>
                    <p className="text-sm text-brand-900/70">
                      Rekomendasi tambahan dari sistem sebelum lanjut daftar.
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm leading-relaxed text-brand-900/80">
                  {result.notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <CheckCircle
                        weight="fill"
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                      />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-slate-200"
              >
                Tutup
              </Button>
              <Button
                type="button"
                onClick={onProceed}
                className="rounded-xl bg-brand-900 text-white hover:bg-brand-950"
              >
                <ListChecks weight="bold" className="mr-2 h-4 w-4" />
                Daftar Sekarang
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
