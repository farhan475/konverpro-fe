"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  Buildings,
  CircleNotch,
  FadersHorizontal,
  GraduationCap,
  List,
  MapPin,
  MagnifyingGlass,
  SealCheck,
  SquaresFour,
  TrendUp,
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
import { Input } from "@/components/ui/input";

import type { Campus, StudyProgram } from "./types";

type ViewMode = "grid" | "list";
type CampusTypeFilter = "all" | "PTN" | "PTS";
type LectureFilter = "all" | "Online" | "Offline" | "Hybrid";
type SortMode = "featured" | "name" | "programs" | "location" | "fee_asc";

interface EnrichedCampus extends Campus {
  campusType: "PTN" | "PTS";
  locationLabel: string;
  studyProgramCount: number;
  featuredPrograms: string[];
  learningMethodLabel: string;
  tuitionFee: number;
  registrationFee: number;
}

interface MarketplaceExplorerProps {
  campuses: Campus[];
  isLoading: boolean;
  selectedCampusId?: string;
  onSelectCampus: (campus: Campus, studyProgramId?: string) => void;
}

interface FilterPanelProps {
  searchQuery: string;
  provinceFilter: string;
  campusTypeFilter: CampusTypeFilter;
  lectureFilter: LectureFilter;
  campusFilter: string;
  programFilter: string;
  provinceOptions: string[];
  campusOptions: string[];
  programOptions: string[];
  onSearchChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onCampusTypeChange: (value: CampusTypeFilter) => void;
  onLectureChange: (value: LectureFilter) => void;
  onCampusChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onReset: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const inferCampusType = (campusName: string) => {
  const normalized = campusName.toLowerCase();

  if (
    normalized.includes("negeri") ||
    normalized.startsWith("uin ") ||
    normalized.startsWith("ia") ||
    normalized.startsWith("politeknik negeri")
  ) {
    return "PTN";
  }

  return "PTS";
};

const normalizeLectureMethod = (lecture?: string) => {
  if (!lecture) {
    return "Online";
  }

  const normalized = lecture.toLowerCase();

  if (normalized.includes("hybrid")) {
    return "Hybrid";
  }

  if (
    normalized.includes("offline") ||
    normalized.includes("tatap muka") ||
    normalized.includes("luring")
  ) {
    return "Offline";
  }

  if (normalized.includes("online") || normalized.includes("daring")) {
    return "Online";
  }

  return lecture;
};

const enrichCampus = (campus: Campus): EnrichedCampus => ({
  ...campus,
  campusType:
    campus.campus_type === "PTN" || campus.campus_type === "PTS"
      ? campus.campus_type
      : inferCampusType(campus.name),
  locationLabel:
    [campus.city, campus.province].filter(Boolean).join(", ") || "Indonesia",
  studyProgramCount: campus.study_programs?.length ?? 0,
  featuredPrograms:
    campus.study_programs?.slice(0, 4).map((program) => program.name) ?? [],
  learningMethodLabel: normalizeLectureMethod(campus.learning_method),
  tuitionFee: Number(campus.student_fee ?? 0),
  registrationFee: Number(campus.student_registration_fee ?? 0),
});

function FilterPanel({
  searchQuery,
  provinceFilter,
  campusTypeFilter,
  lectureFilter,
  campusFilter,
  programFilter,
  provinceOptions,
  campusOptions,
  programOptions,
  onSearchChange,
  onProvinceChange,
  onCampusTypeChange,
  onLectureChange,
  onCampusChange,
  onProgramChange,
  onReset,
}: FilterPanelProps) {
  return (
    <div className="space-y-5 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-brand-900">
            <FadersHorizontal
              weight="bold"
              className="h-4 w-4 text-brand-600"
            />
            Filter Kampus
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Gunakan filter untuk menemukan kampus dan prodi yang paling relevan.
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 transition hover:text-brand-700"
        >
          <ArrowsClockwise weight="bold" className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Cari Kampus atau Prodi
        </label>
        <div className="relative">
          <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Mis. Informatika, Jakarta"
            className="h-12 rounded-2xl border-slate-100 bg-slate-50 pl-11 font-semibold shadow-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Provinsi
        </label>
        <select
          value={provinceFilter}
          onChange={(event) => onProvinceChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500"
        >
          <option value="all">Semua Provinsi</option>
          {provinceOptions.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Jenis Kampus
          </label>
          <select
            value={campusTypeFilter}
            onChange={(event) =>
              onCampusTypeChange(event.target.value as CampusTypeFilter)
            }
            className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500"
          >
            <option value="all">Semua Jenis</option>
            <option value="PTS">Swasta (PTS)</option>
            <option value="PTN">Negeri (PTN)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Metode Kuliah
          </label>
          <select
            value={lectureFilter}
            onChange={(event) =>
              onLectureChange(event.target.value as LectureFilter)
            }
            className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500"
          >
            <option value="all">Semua Metode</option>
            <option value="Online">Online (Daring)</option>
            <option value="Offline">Tatap Muka</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Nama Kampus
        </label>
        <select
          value={campusFilter}
          onChange={(event) => onCampusChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500"
        >
          <option value="all">Semua Kampus</option>
          {campusOptions.map((campus) => (
            <option key={campus} value={campus}>
              {campus}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Program Studi
        </label>
        <select
          value={programFilter}
          onChange={(event) => onProgramChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500"
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
  );
}

function StudyProgramPill({ program }: { program: StudyProgram }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-sm font-black text-slate-900">{program.name}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        {program.total_sks ? `${program.total_sks} SKS total` : "Data publik"}
      </p>
    </div>
  );
}

export default function MarketplaceExplorer({
  campuses,
  isLoading,
  selectedCampusId,
  onSelectCampus,
}: MarketplaceExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [campusTypeFilter, setCampusTypeFilter] =
    useState<CampusTypeFilter>("all");
  const [lectureFilter, setLectureFilter] = useState<LectureFilter>("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [detailCampus, setDetailCampus] = useState<EnrichedCampus | null>(null);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const enrichedCampuses = useMemo(
    () => campuses.map((campus) => enrichCampus(campus)),
    [campuses],
  );

  const provinceOptions = useMemo(
    () =>
      Array.from(
        new Set(
          enrichedCampuses
            .map((campus) => campus.province)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [enrichedCampuses],
  );

  const programOptions = useMemo(
    () =>
      Array.from(
        new Set(
          enrichedCampuses.flatMap(
            (campus) =>
              campus.study_programs?.map((program) => program.name) ?? [],
          ),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [enrichedCampuses],
  );

  const campusOptions = useMemo(
    () =>
      Array.from(new Set(enrichedCampuses.map((campus) => campus.name))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [enrichedCampuses],
  );

  const filteredCampuses = useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

    const nextCampuses = enrichedCampuses.filter((campus) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        campus.name.toLowerCase().includes(normalizedSearch) ||
        campus.locationLabel.toLowerCase().includes(normalizedSearch) ||
        campus.featuredPrograms.some((program) =>
          program.toLowerCase().includes(normalizedSearch),
        );

      const matchesProvince =
        provinceFilter === "all" || campus.province === provinceFilter;
      const matchesCampusType =
        campusTypeFilter === "all" || campus.campusType === campusTypeFilter;
      const matchesLecture =
        lectureFilter === "all" || campus.learningMethodLabel === lectureFilter;
      const matchesCampus =
        campusFilter === "all" || campus.name === campusFilter;
      const matchesProgram =
        programFilter === "all" ||
        (campus.study_programs ?? []).some(
          (program) => program.name === programFilter,
        );

      return (
        matchesSearch &&
        matchesProvince &&
        matchesCampusType &&
        matchesLecture &&
        matchesCampus &&
        matchesProgram
      );
    });

    return nextCampuses.sort((left, right) => {
      if (sortMode === "name") {
        return left.name.localeCompare(right.name);
      }

      if (sortMode === "programs") {
        return right.studyProgramCount - left.studyProgramCount;
      }

      if (sortMode === "location") {
        return left.locationLabel.localeCompare(right.locationLabel);
      }

      if (sortMode === "fee_asc") {
        return left.tuitionFee - right.tuitionFee;
      }

      if (left.is_official_partner !== right.is_official_partner) {
        return (
          (right.is_official_partner ? 1 : 0) -
          (left.is_official_partner ? 1 : 0)
        );
      }

      return right.studyProgramCount - left.studyProgramCount;
    });
  }, [
    campusTypeFilter,
    campusFilter,
    deferredSearchQuery,
    enrichedCampuses,
    programFilter,
    provinceFilter,
    lectureFilter,
    sortMode,
  ]);

  const totalStudyPrograms = useMemo(
    () =>
      enrichedCampuses.reduce(
        (total, campus) => total + (campus.study_programs?.length ?? 0),
        0,
      ),
    [enrichedCampuses],
  );

  const officialPartnerCount = useMemo(
    () =>
      enrichedCampuses.filter((campus) => campus.is_official_partner).length,
    [enrichedCampuses],
  );

  const resetFilters = () => {
    setSearchQuery("");
    setProvinceFilter("all");
    setCampusTypeFilter("all");
    setLectureFilter("all");
    setCampusFilter("all");
    setProgramFilter("all");
    setSortMode("featured");
  };

  return (
    <section id="kampus" className="border-y border-slate-100 bg-white py-24">
      <div className="mx-auto max-w-[95%] px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge className="mb-4 rounded-full bg-brand-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 hover:bg-brand-50">
              Marketplace Kampus
            </Badge>
            <h2 className="text-3xl font-black tracking-tight text-brand-900 md:text-4xl">
              Mitra Kampus Kami
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              Temukan universitas terbaik yang telah terintegrasi dengan sistem
              KonverPro untuk kemudahan transfer kredit Anda.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Total Kampus
              </p>
              <p className="mt-2 text-3xl font-black text-brand-900">
                {enrichedCampuses.length}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Official Partner
              </p>
              <p className="mt-2 text-3xl font-black text-amber-500">
                {officialPartnerCount}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Program Studi
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-600">
                {totalStudyPrograms}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="space-y-5 lg:col-span-3">
            <div className="rounded-[2rem] border border-brand-100 bg-brand-50 p-5 text-brand-900">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-600">
                Cara Pakai Cepat
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brand-900/80">
                Pilih kampus yang menarik, cek prodi yang tersedia, lalu klik
                tombol daftar untuk langsung membawa pilihan itu ke form
                simulasi.
              </p>
            </div>

            <div className="hidden lg:block">
              <FilterPanel
                searchQuery={searchQuery}
                provinceFilter={provinceFilter}
                campusTypeFilter={campusTypeFilter}
                lectureFilter={lectureFilter}
                campusFilter={campusFilter}
                programFilter={programFilter}
                provinceOptions={provinceOptions}
                campusOptions={campusOptions}
                programOptions={programOptions}
                onSearchChange={setSearchQuery}
                onProvinceChange={setProvinceFilter}
                onCampusTypeChange={setCampusTypeFilter}
                onLectureChange={setLectureFilter}
                onCampusChange={setCampusFilter}
                onProgramChange={setProgramFilter}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-9">
            <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black text-brand-900">
                  <TrendUp weight="bold" className="h-5 w-5 text-brand-600" />
                  Hasil Browser Kampus
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredCampuses.length} kampus cocok dengan filter aktif
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMobileFiltersOpen((current) => !current)}
                  className="rounded-xl border-slate-200 lg:hidden"
                >
                  <FadersHorizontal weight="bold" className="mr-2 h-4 w-4" />
                  Filter
                </Button>

                <select
                  value={sortMode}
                  onChange={(event) =>
                    setSortMode(event.target.value as SortMode)
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500"
                >
                  <option value="featured">Urutkan: Featured</option>
                  <option value="name">Nama A-Z</option>
                  <option value="programs">Prodi Terbanyak</option>
                  <option value="location">Lokasi</option>
                  <option value="fee_asc">Biaya Termurah</option>
                </select>

                <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
                      viewMode === "grid"
                        ? "bg-brand-900 text-white"
                        : "text-slate-400 hover:text-brand-600"
                    }`}
                  >
                    <SquaresFour weight="bold" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
                      viewMode === "list"
                        ? "bg-brand-900 text-white"
                        : "text-slate-400 hover:text-brand-600"
                    }`}
                  >
                    <List weight="bold" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {mobileFiltersOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Tutup filter"
                />
                <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-[2rem] border-t border-slate-200 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:hidden">
                  <div className="max-h-[85vh] overflow-y-auto p-6">
                    <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-200" />
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">
                        Filter Data
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setMobileFiltersOpen(false)}
                        className="h-8 rounded-full px-3 text-slate-500"
                      >
                        Tutup
                      </Button>
                    </div>
                    <FilterPanel
                      searchQuery={searchQuery}
                      provinceFilter={provinceFilter}
                      campusTypeFilter={campusTypeFilter}
                      lectureFilter={lectureFilter}
                      campusFilter={campusFilter}
                      programFilter={programFilter}
                      provinceOptions={provinceOptions}
                      campusOptions={campusOptions}
                      programOptions={programOptions}
                      onSearchChange={setSearchQuery}
                      onProvinceChange={setProvinceFilter}
                      onCampusTypeChange={setCampusTypeFilter}
                      onLectureChange={setLectureFilter}
                      onCampusChange={setCampusFilter}
                      onProgramChange={setProgramFilter}
                      onReset={resetFilters}
                    />
                    <Button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="mt-5 h-12 w-full rounded-xl bg-brand-600 text-sm font-black text-white hover:bg-brand-700"
                    >
                      Terapkan Filter
                    </Button>
                  </div>
                </div>
              </>
            )}

            {isLoading ? (
              <div className="flex min-h-[340px] items-center justify-center rounded-[2rem] border border-slate-100 bg-white">
                <CircleNotch
                  weight="bold"
                  className="h-10 w-10 animate-spin text-brand-600"
                />
              </div>
            ) : filteredCampuses.length === 0 ? (
              <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white p-14 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                  <MagnifyingGlass className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900">
                  Tidak ada kampus yang cocok
                </h4>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                  Coba ubah kombinasi filter atau reset pencarian untuk melihat
                  daftar kampus publik yang tersedia.
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4"
                }
              >
                {filteredCampuses.map((campus) => {
                  const firstStudyProgram = campus.study_programs?.[0];
                  const isSelected = selectedCampusId === campus.id;

                  return (
                    <article
                      key={campus.id}
                      className={`group rounded-[2rem] border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
                        isSelected
                          ? "border-brand-200 shadow-lg shadow-brand-900/5"
                          : "border-slate-100"
                      } ${
                        viewMode === "list"
                          ? "md:flex md:items-start md:justify-between md:gap-8"
                          : ""
                      }`}
                    >
                      <div className={viewMode === "list" ? "md:flex-1" : ""}>
                        <div className="mb-5 flex items-start gap-4">
                          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.5rem] bg-slate-50 text-2xl font-black text-brand-600 shadow-inner">
                            {campus.logo_path ? (
                              // eslint-disable-next-line @next/next/no-img-element -- logo kampus berasal dari URL dinamis backend
                              <img
                                src={campus.logo_path}
                                alt={campus.name}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <span>{campus.name.charAt(0)}</span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              {campus.is_official_partner && (
                                <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 hover:bg-amber-50">
                                  <SealCheck
                                    weight="fill"
                                    className="mr-1 h-3.5 w-3.5"
                                  />
                                  Official Partner
                                </Badge>
                              )}

                              <Badge className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:bg-slate-100">
                                {campus.campusType}
                              </Badge>
                            </div>

                            <h4 className="text-lg font-black tracking-tight text-brand-900">
                              {campus.name}
                            </h4>
                            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                              <MapPin
                                weight="fill"
                                className="h-4 w-4 text-brand-500"
                              />
                              {campus.locationLabel}
                            </p>
                          </div>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-2">
                          <Badge className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-600 hover:bg-brand-50">
                            {campus.studyProgramCount} Program Studi
                          </Badge>
                          <Badge className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:bg-slate-100">
                            {campus.learningMethodLabel}
                          </Badge>
                          {campus.featuredPrograms.map((program) => (
                            <Badge
                              key={program}
                              className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:bg-slate-100"
                            >
                              {program}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                              Biaya Kuliah
                            </p>
                            <p className="mt-2 text-sm font-black text-brand-900">
                              {campus.tuitionFee > 0
                                ? formatCurrency(campus.tuitionFee)
                                : "Hubungi Kampus"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                              Biaya Daftar
                            </p>
                            <p className="mt-2 text-sm font-black text-brand-900">
                              {campus.registrationFee > 0
                                ? formatCurrency(campus.registrationFee)
                                : "Gratis"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={
                          viewMode === "list"
                            ? "md:flex md:min-w-[260px] md:flex-col md:items-end"
                            : ""
                        }
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDetailCampus(campus)}
                            className="h-12 rounded-xl border-slate-200 text-xs font-bold"
                          >
                            Detail
                          </Button>
                          <Button
                            type="button"
                            onClick={() =>
                              onSelectCampus(campus, firstStudyProgram?.id)
                            }
                            className="h-12 rounded-xl bg-brand-900 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-brand-900/15 hover:bg-brand-950"
                          >
                            Daftar
                          </Button>
                        </div>

                        {isSelected && (
                          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                            Kampus ini sedang aktif di form simulasi
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={Boolean(detailCampus)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailCampus(null);
          }
        }}
      >
        <DialogContent className="max-h-[88vh] overflow-hidden rounded-[2rem] border-none p-0 shadow-2xl sm:max-w-3xl">
          {detailCampus && (
            <>
              <div className="border-b border-slate-100 bg-slate-50/80 p-6">
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-xl font-black text-brand-900 shadow-sm">
                      {detailCampus.logo_path ? (
                        // eslint-disable-next-line @next/next/no-img-element -- logo kampus berasal dari URL dinamis backend
                        <img
                          src={detailCampus.logo_path}
                          alt={detailCampus.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span>{detailCampus.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        {detailCampus.is_official_partner && (
                          <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 hover:bg-amber-50">
                            <SealCheck
                              weight="fill"
                              className="mr-1 h-3.5 w-3.5"
                            />
                            Official Partner
                          </Badge>
                        )}
                        <Badge className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:bg-slate-100">
                          {detailCampus.campusType}
                        </Badge>
                      </div>
                      <DialogTitle className="text-2xl font-black tracking-tight text-brand-900">
                        {detailCampus.name}
                      </DialogTitle>
                      <DialogDescription className="text-sm text-slate-500">
                        {detailCampus.locationLabel} •{" "}
                        {detailCampus.studyProgramCount} program studi tersedia
                        pada endpoint publik.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="max-h-[calc(88vh-120px)] space-y-6 overflow-y-auto p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Lokasi
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {detailCampus.locationLabel}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Metode Kuliah
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {detailCampus.learningMethodLabel}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Biaya Kuliah
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {detailCampus.tuitionFee > 0
                        ? formatCurrency(detailCampus.tuitionFee)
                        : "Hubungi Kampus"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Tipe Kampus
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {detailCampus.campusType}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Biaya Daftar
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {detailCampus.registrationFee > 0
                        ? formatCurrency(detailCampus.registrationFee)
                        : "Gratis"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <GraduationCap weight="fill" className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">
                        Program Studi Tersedia
                      </h4>
                      <p className="text-sm text-slate-500">
                        Pilih kampus ini untuk otomatis memakai prodi pertama,
                        atau lanjut sesuaikan lagi di form simulasi.
                      </p>
                    </div>
                  </div>

                  {detailCampus.study_programs?.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {detailCampus.study_programs.map((program) => (
                        <StudyProgramPill key={program.id} program={program} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      Data program studi belum tersedia.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDetailCampus(null)}
                    className="rounded-xl border-slate-200"
                  >
                    Tutup
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      onSelectCampus(
                        detailCampus,
                        detailCampus.study_programs?.[0]?.id,
                      );
                      setDetailCampus(null);
                    }}
                    className="rounded-xl bg-brand-900 text-white hover:bg-brand-950"
                  >
                    <Buildings weight="bold" className="mr-2 h-4 w-4" />
                    Daftar Sekarang
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
