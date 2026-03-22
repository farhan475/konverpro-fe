"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CaretDown,
  FadersHorizontal,
  List,
  MagnifyingGlass,
  SealCheck,
  SortAscending,
  SquaresFour,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

import type {
  LandingComparisonResult,
  MarketplaceProgramListing,
} from "./types";

type ViewMode = "grid" | "list";
type SortMode = "sks-desc" | "sks-asc" | "sem-asc" | "fee-asc";

interface LandingResultsBoardProps {
  catalog: MarketplaceProgramListing[];
  results: LandingComparisonResult[];
  isLoading: boolean;
  hasProcessed: boolean;
  onOpenDetail: (item: LandingComparisonResult) => void;
  onOpenClaim: (item: LandingComparisonResult) => void;
  onStatsChange: (stats: { matchCount: number; maxSks: number }) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

function FilterSidebar({
  provinceFilter,
  typeFilter,
  lectureFilter,
  campusFilter,
  programFilter,
  provinceOptions,
  campusOptions,
  programOptions,
  onProvinceChange,
  onTypeChange,
  onLectureChange,
  onCampusChange,
  onProgramChange,
  onReset,
}: {
  provinceFilter: string;
  typeFilter: string;
  lectureFilter: string;
  campusFilter: string;
  programFilter: string;
  provinceOptions: string[];
  campusOptions: string[];
  programOptions: string[];
  onProvinceChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onLectureChange: (value: string) => void;
  onCampusChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-800">
          <FadersHorizontal weight="bold" className="h-4 w-4" />
          Filter Data
        </h4>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-brand-600 transition hover:text-brand-800"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Lokasi
          </label>
          <select
            value={provinceFilter}
            onChange={(event) => onProvinceChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Semua Provinsi</option>
            {provinceOptions.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Jenis Kampus
          </label>
          <select
            value={typeFilter}
            onChange={(event) => onTypeChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Semua Jenis</option>
            <option value="PTS">Swasta (PTS)</option>
            <option value="PTN">Negeri (PTN)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Metode Kuliah
          </label>
          <select
            value={lectureFilter}
            onChange={(event) => onLectureChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Semua Metode</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <hr className="border-slate-100" />

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Nama Kampus
          </label>
          <select
            value={campusFilter}
            onChange={(event) => onCampusChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Semua Kampus</option>
            {campusOptions.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Program Studi
          </label>
          <select
            value={programFilter}
            onChange={(event) => onProgramChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Semua Program Studi</option>
            {programOptions.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function LandingResultsBoard({
  catalog,
  results,
  isLoading,
  hasProcessed,
  onOpenDetail,
  onOpenClaim,
  onStatsChange,
}: LandingResultsBoardProps) {
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [lectureFilter, setLectureFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("sks-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const provinceOptions = useMemo(
    () =>
      Array.from(
        new Set(
          catalog
            .map((item) => item.province)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [catalog],
  );

  const campusOptions = useMemo(
    () =>
      Array.from(new Set(catalog.map((item) => item.campus))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [catalog],
  );

  const programOptions = useMemo(
    () =>
      Array.from(new Set(catalog.map((item) => item.prodiName))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [catalog],
  );

  const visibleResults = useMemo(() => {
    const nextResults = results.filter((item) => {
      if (programFilter !== "all" && item.prodiName !== programFilter) {
        return false;
      }

      if (provinceFilter !== "all" && item.province !== provinceFilter) {
        return false;
      }

      if (typeFilter !== "all" && item.type !== typeFilter) {
        return false;
      }

      if (lectureFilter !== "all" && item.lecture !== lectureFilter) {
        return false;
      }

      if (campusFilter !== "all" && item.campus !== campusFilter) {
        return false;
      }

      return true;
    });

    return nextResults.sort((left, right) => {
      if (left.isOfficial !== right.isOfficial) {
        return left.isOfficial ? -1 : 1;
      }

      if (sortMode === "sks-desc") {
        return right.totalSKS - left.totalSKS;
      }

      if (sortMode === "sks-asc") {
        return left.totalSKS - right.totalSKS;
      }

      if (sortMode === "sem-asc") {
        return left.duration - right.duration;
      }

      return left.tuition - right.tuition;
    });
  }, [
    campusFilter,
    lectureFilter,
    programFilter,
    provinceFilter,
    results,
    sortMode,
    typeFilter,
  ]);

  useEffect(() => {
    onStatsChange({
      matchCount: new Set(visibleResults.map((item) => item.campus)).size,
      maxSks: visibleResults.length
        ? Math.max(...visibleResults.map((item) => item.totalSKS))
        : 0,
    });
  }, [onStatsChange, visibleResults]);

  const resetFilters = () => {
    setProvinceFilter("all");
    setTypeFilter("all");
    setLectureFilter("all");
    setCampusFilter("all");
    setProgramFilter("all");
    setSortMode("sks-desc");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {mobileFiltersOpen && (
        <>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            aria-label="Tutup filter"
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-hidden rounded-t-3xl border-t border-slate-200 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:hidden">
            <div className="max-h-[85vh] overflow-y-auto p-6">
              <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-200" />
              <FilterSidebar
                provinceFilter={provinceFilter}
                typeFilter={typeFilter}
                lectureFilter={lectureFilter}
                campusFilter={campusFilter}
                programFilter={programFilter}
                provinceOptions={provinceOptions}
                campusOptions={campusOptions}
                programOptions={programOptions}
                onProvinceChange={setProvinceFilter}
                onTypeChange={setTypeFilter}
                onLectureChange={setLectureFilter}
                onCampusChange={setCampusFilter}
                onProgramChange={setProgramFilter}
                onReset={resetFilters}
              />
              <Button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-6 h-12 w-full rounded-xl bg-brand-600 text-sm font-bold text-white hover:bg-brand-700"
              >
                Terapkan Filter
              </Button>
            </div>
          </div>
        </>
      )}

      <aside className="hidden lg:col-span-3 lg:block">
        <FilterSidebar
          provinceFilter={provinceFilter}
          typeFilter={typeFilter}
          lectureFilter={lectureFilter}
          campusFilter={campusFilter}
          programFilter={programFilter}
          provinceOptions={provinceOptions}
          campusOptions={campusOptions}
          programOptions={programOptions}
          onProvinceChange={setProvinceFilter}
          onTypeChange={setTypeFilter}
          onLectureChange={setLectureFilter}
          onCampusChange={setCampusFilter}
          onProgramChange={setProgramFilter}
          onReset={resetFilters}
        />
      </aside>

      <div className="lg:col-span-9">
        <div
          id="results-header"
          className="scroll-mt-28 rounded-2xl border border-slate-100 bg-white p-4 px-6 shadow-sm"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-brand-900">
                <MagnifyingGlass className="h-5 w-5 text-brand-600" />
                Hasil Rekomendasi
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-400">
                {hasProcessed
                  ? `${visibleResults.length} rekomendasi tampil setelah filter diterapkan.`
                  : "Unggah transkrip untuk membandingkan hasil ke semua program studi mitra."}
              </p>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMobileFiltersOpen(true)}
                className="rounded-xl border-slate-200 lg:hidden"
              >
                <FadersHorizontal weight="bold" className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <div className="relative w-full sm:w-56">
                <SortAscending
                  weight="bold"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={sortMode}
                  onChange={(event) =>
                    setSortMode(event.target.value as SortMode)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:ring-2 focus:ring-brand-500"
                >
                  <option value="sks-desc">SKS Terbanyak</option>
                  <option value="sks-asc">SKS Terendah</option>
                  <option value="sem-asc">Waktu Tercepat</option>
                  <option value="fee-asc">Biaya Termurah</option>
                </select>
                <CaretDown
                  weight="bold"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
              </div>
              <div className="hidden rounded-xl border border-slate-200 bg-slate-100 p-1 sm:flex">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-white text-brand-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <SquaresFour weight="bold" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-white text-brand-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <List weight="bold" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="rounded-3xl border border-slate-100 bg-white py-24 text-center">
              <div className="mx-auto mb-6 h-2 w-64 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-3/4 animate-pulse rounded-full bg-brand-600" />
              </div>
              <h4 className="mb-2 text-xl font-bold text-slate-700">
                Menganalisis Transkrip...
              </h4>
              <p className="text-slate-400">
                Mencocokkan mata kuliah dengan 50+ Program Studi Mitra.
              </p>
            </div>
          ) : visibleResults.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <MagnifyingGlass className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-800">
                {hasProcessed ? "Tidak Ada Hasil" : "Belum Ada Hasil"}
              </h3>
              <p className="mx-auto max-w-md text-slate-500">
                {hasProcessed
                  ? "Coba ubah filter pencarian Anda."
                  : "Unggah transkrip nilai Anda di panel atas untuk melihat hasil konversi otomatis ke semua program studi mitra."}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 md:grid-cols-2"
                  : "flex flex-col gap-4"
              }
            >
              {visibleResults.map((item) => {
                const logoContent = item.logoPath ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- logo kampus berasal dari URL dinamis backend */}
                    <img
                      src={item.logoPath}
                      alt={item.campus}
                      className="h-full w-full object-contain"
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
                    {item.campus.charAt(0)}
                  </div>
                );

                if (viewMode === "grid") {
                  return (
                    <div
                      key={item.id}
                      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                        item.isOfficial
                          ? "border-accent-200"
                          : "border-slate-200"
                      }`}
                    >
                      {item.isOfficial && (
                        <div className="absolute right-0 top-0 z-10">
                          <div className="flex items-center gap-1 rounded-bl-xl bg-accent-500 px-3 py-1 text-[10px] font-bold text-brand-900 shadow-sm">
                            <SealCheck weight="fill" className="h-3.5 w-3.5" />
                            Official Partner
                          </div>
                        </div>
                      )}

                      <div className="mb-4 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
                          {logoContent}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-base font-bold leading-tight text-slate-800">
                            {item.prodiName}
                          </h4>
                          <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-500">
                            {item.campus}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.strata && (
                              <span className="rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
                                {item.strata}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              {item.city || item.province || "Indonesia"}
                            </span>
                            <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                              {item.type || "PTS"}
                            </span>
                            <span className="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">
                              {item.lecture || "Online"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 mt-auto grid grid-cols-3 gap-2">
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
                          <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">
                            Diakui
                          </span>
                          <span className="text-3xl font-black text-green-600">
                            {item.totalSKS}
                          </span>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
                          <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">
                            Sisa
                          </span>
                          <span className="text-3xl font-black text-orange-600">
                            {item.remainingSKS}
                          </span>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
                          <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">
                            Estimasi
                          </span>
                          <span className="text-3xl font-black text-slate-700">
                            {item.duration}
                            <span className="ml-0.5 text-xs font-normal text-slate-400">
                              Sem
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="mb-1 flex flex-col gap-2 border-t border-slate-50 pb-3 pt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-400">
                            Biaya Daftar Konversi:
                          </span>
                          <span className="font-bold text-slate-600">
                            {formatCurrency(item.registrationFee)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-400">
                            Biaya Kuliah / Semester:
                          </span>
                          <span className="text-sm font-bold text-brand-600">
                            {formatCurrency(item.tuition)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(item)}
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                          Detail SKS
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenClaim(item)}
                          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                        >
                          Daftar
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md md:flex-row ${
                      item.isOfficial ? "border-accent-200" : "border-slate-200"
                    }`}
                  >
                    {item.isOfficial && (
                      <div className="absolute right-0 top-0 z-10">
                        <div className="flex items-center gap-1 rounded-bl-xl bg-accent-500 px-3 py-1 text-[10px] font-bold text-brand-900 shadow-sm">
                          <SealCheck weight="fill" className="h-3.5 w-3.5" />
                          Official Partner
                        </div>
                      </div>
                    )}

                    <div className="flex w-full min-w-0 flex-1 items-center gap-4 md:w-auto">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2">
                        {logoContent}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-lg font-bold leading-tight text-slate-800 transition group-hover:text-brand-600">
                          {item.prodiName}
                        </h4>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          {item.campus}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.strata && (
                            <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                              {item.strata}
                            </span>
                          )}
                          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                            {item.city || item.province || "Indonesia"}
                          </span>
                          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                            {item.type || "PTS"}
                          </span>
                          <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">
                            {item.lecture || "Online"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden items-center gap-8 border-l border-r border-slate-100 px-8 md:flex">
                      <div className="text-center">
                        <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                          Diakui
                        </span>
                        <span className="text-lg font-black text-green-600">
                          {item.totalSKS}{" "}
                          <span className="text-xs font-bold text-slate-400">
                            SKS
                          </span>
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                          Sisa
                        </span>
                        <span className="text-lg font-black text-orange-600">
                          {item.remainingSKS}{" "}
                          <span className="text-xs font-bold text-slate-400">
                            SKS
                          </span>
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                          Lama
                        </span>
                        <span className="text-lg font-black text-slate-700">
                          {item.duration}
                          <span className="ml-0.5 text-xs font-normal text-slate-400">
                            Sem
                          </span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="mb-0.5 block text-[10px] font-bold uppercase text-slate-400">
                          Biaya Daftar
                        </span>
                        <span className="mb-1 block text-xs font-bold text-slate-600">
                          {formatCurrency(item.registrationFee)}
                        </span>
                        <span className="mb-0.5 block text-[10px] font-bold uppercase text-slate-400">
                          Biaya Kuliah / Semester
                        </span>
                        <span className="whitespace-nowrap text-sm font-bold text-brand-600">
                          {formatCurrency(item.tuition)}
                        </span>
                      </div>
                    </div>

                    <div className="my-2 flex w-full flex-wrap justify-between gap-2 border-y border-slate-100 py-3 md:hidden">
                      <div className="w-[30%] text-center">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">
                          Diakui
                        </span>
                        <span className="text-base font-black text-green-600">
                          {item.totalSKS}
                        </span>
                      </div>
                      <div className="w-[30%] text-center">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">
                          Sisa
                        </span>
                        <span className="text-base font-black text-orange-600">
                          {item.remainingSKS}
                        </span>
                      </div>
                      <div className="w-[30%] text-center">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">
                          Lama
                        </span>
                        <span className="text-base font-black text-slate-700">
                          {item.duration} Sem
                        </span>
                      </div>
                      <div className="mt-2 w-[45%] border-t border-slate-50 pt-2 text-center">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">
                          Biaya Daftar
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {formatCurrency(item.registrationFee)}
                        </span>
                      </div>
                      <div className="mt-2 w-[45%] border-t border-slate-50 pt-2 text-center">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">
                          Biaya Kuliah / Semester
                        </span>
                        <span className="text-xs font-bold text-brand-600">
                          {formatCurrency(item.tuition)}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full shrink-0 gap-2 md:w-auto">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(item)}
                        className="whitespace-nowrap rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                      >
                        Detail SKS
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenClaim(item)}
                        className="whitespace-nowrap rounded-lg bg-brand-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-brand-700"
                      >
                        Daftar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
