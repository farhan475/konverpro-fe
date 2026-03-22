"use client";

import { ArrowLeft, Check, Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { ConversionDetailResponse } from "./types";

interface ConversionReviewTableProps {
  data: ConversionDetailResponse;
  processingId: string | null;
  onReviewItem: (detailId: string, status: "approved" | "rejected") => void;
}

const isAcceptedStatus = (status: string) =>
  status === "approved" ||
  status === "auto_accepted" ||
  status === "manual_accepted" ||
  status === "accepted";

const getStatusLabel = (status: string) => {
  if (status === "auto_accepted") return "Otomatis";
  if (status === "manual_accepted") return "Menunggu Final";
  if (status === "approved") return "Disetujui";
  if (status === "rejected") return "Ditolak";
  return status;
};

const getStatusClassName = (status: string) => {
  if (isAcceptedStatus(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
};

export function ConversionReviewTable({
  data,
  processingId,
  onReviewItem,
}: ConversionReviewTableProps) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border-slate-100 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg font-black text-slate-900">
              Rincian Mata Kuliah Konversi
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Bandingkan hasil ekstraksi transkrip dengan kurikulum tujuan,
              lalu finalkan hanya baris yang benar-benar layak dikonversi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              Disetujui:{" "}
              {data.details?.filter((item) => isAcceptedStatus(item.status)).length ?? 0}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              Pending:{" "}
              {data.details?.filter(
                (item) => !isAcceptedStatus(item.status) && item.status !== "rejected",
              ).length ?? 0}
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
              Ditolak:{" "}
              {data.details?.filter((item) => item.status === "rejected").length ?? 0}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="min-w-64">MK Asal</TableHead>
                <TableHead className="min-w-28">Nilai / SKS</TableHead>
                <TableHead className="w-12 text-center" />
                <TableHead className="min-w-64">MK Tujuan</TableHead>
                <TableHead className="text-center">Kemiripan</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.details?.length ? (
                data.details.map((item) => (
                  <TableRow
                    key={item.id}
                    className={
                      item.status === "rejected"
                        ? "bg-rose-50/40"
                        : "transition-colors hover:bg-slate-50/70"
                    }
                  >
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">{item.src_name}</p>
                        <p className="text-xs text-slate-400">
                          Sumber dari ekstraksi transkrip mahasiswa
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">
                      {item.src_grade} ({item.src_sks} SKS)
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <ArrowLeft className="h-4 w-4 text-slate-300" />
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      {item.target_course ? (
                        <div className="space-y-1">
                          <p className="font-bold text-blue-700">{item.target_course.name}</p>
                          <p className="text-xs text-slate-400">
                            {item.target_course.code || "Kode belum tersedia"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm italic text-slate-400">
                          Tidak ditemukan padanan kurikulum
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${
                          item.match_score >= 0.8
                            ? "bg-emerald-100 text-emerald-700"
                            : item.match_score >= 0.55
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {Math.round(item.match_score * 100)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={getStatusClassName(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {data.status !== "approved" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon-sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => onReviewItem(item.id, "approved")}
                            disabled={processingId === item.id}
                            title="Terima / Validasi"
                          >
                            {processingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            onClick={() => onReviewItem(item.id, "rejected")}
                            disabled={processingId === item.id}
                            title="Tolak"
                          >
                            {processingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          Dokumen sudah final
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm font-medium italic text-slate-400"
                  >
                    Belum ada rincian mata kuliah untuk direview.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
