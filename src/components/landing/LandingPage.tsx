"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import axios from "@/lib/axios";
import { generateConversionPDF } from "@/lib/generatePdf";

import Footer from "./Footer";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import LandingResultsBoard from "./LandingResultsBoard";
import LandingSimulationWorkspace from "./LandingSimulationWorkspace";
import MarketplaceExplorer from "./MarketplaceExplorer";
import Navbar from "./Navbar";
import SimulationClaimDialog from "./SimulationClaimDialog";
import SimulationResultDetailDialog from "./SimulationResultDetailDialog";
import {
  buildComparisonResults,
  comparisonResultToConversionPayload,
  downloadLandingTemplate,
  parseTranscriptFile,
} from "./landingMatching";
import type {
  Campus,
  ConversionResult,
  LandingComparisonResult,
  LandingResultMetrics,
  MarketplaceCourse,
  MarketplaceProgramListing,
} from "./types";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const FALLBACK_TOTAL_SKS = 144;
const FALLBACK_TUITION_PER_SEMESTER = 4_500_000;
const FALLBACK_ADMIN_WHATSAPP = "6281234567890";

const TEMPLATE_FILE_URL = process.env.NEXT_PUBLIC_CONVERSION_TEMPLATE_URL ?? "";
const ADMIN_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER ?? FALLBACK_ADMIN_WHATSAPP;

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

interface MarketplaceCampusRow {
  id: string;
  study_program_id?: string;
  campus?: string;
  isOfficial?: boolean;
  logoPath?: string | null;
  province?: string;
  city?: string;
  type?: string;
  lecture?: string;
  prodiName?: string;
  strata?: string;
  tuition?: number;
  registrationFee?: number;
  courses?: MarketplaceCourse[];
}

const asStudyProgramList = (value: Campus["study_programs"]) =>
  Array.isArray(value) ? value : [];

const getCampusSettings = (campus: Campus) => {
  const settings = campus.settings;

  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return {};
  }

  return settings;
};

const normalizeMarketplaceCatalog = (rows: MarketplaceCampusRow[]) =>
  rows
    .filter(
      (
        row,
      ): row is MarketplaceCampusRow & {
        study_program_id: string;
        prodiName: string;
      } => Boolean(row.study_program_id && row.prodiName),
    )
    .map((row) => ({
      id: row.id,
      study_program_id: row.study_program_id,
      campus: row.campus ?? "Kampus Mitra",
      isOfficial: Boolean(row.isOfficial),
      logoPath: row.logoPath ?? null,
      province: row.province,
      city: row.city,
      type: row.type,
      lecture: row.lecture,
      prodiName: row.prodiName,
      strata: row.strata,
      tuition: Number(row.tuition ?? 0),
      registrationFee: Number(row.registrationFee ?? 0),
      courses: Array.isArray(row.courses) ? row.courses : [],
    }))
    .sort((left, right) => left.campus.localeCompare(right.campus));

const mergeCampusesFromSources = (
  baseCampuses: Campus[],
  marketplaceRows: MarketplaceCampusRow[],
) => {
  const campusMap = new Map<string, Campus>();

  baseCampuses.forEach((campus) => {
    const settings = getCampusSettings(campus);

    campusMap.set(campus.id, {
      ...campus,
      city: campus.city ?? settings.city,
      province: campus.province ?? settings.province,
      campus_type: campus.campus_type ?? settings.type,
      learning_method: campus.learning_method ?? settings.lecture,
      logo_path: campus.logo_path ?? null,
      study_programs: asStudyProgramList(campus.study_programs),
    });
  });

  marketplaceRows.forEach((row) => {
    const existingCampus = campusMap.get(row.id);
    const nextStudyPrograms = [
      ...asStudyProgramList(existingCampus?.study_programs),
    ];

    if (
      row.study_program_id &&
      row.prodiName &&
      !nextStudyPrograms.some((program) => program.id === row.study_program_id)
    ) {
      nextStudyPrograms.push({
        id: row.study_program_id,
        name: row.prodiName,
        level: row.strata,
      });
    }

    campusMap.set(row.id, {
      id: row.id,
      name: row.campus ?? existingCampus?.name ?? "Kampus Mitra",
      logo_path: row.logoPath ?? existingCampus?.logo_path ?? null,
      city: row.city ?? existingCampus?.city,
      province: row.province ?? existingCampus?.province,
      campus_type: row.type ?? existingCampus?.campus_type,
      learning_method: row.lecture ?? existingCampus?.learning_method,
      student_fee:
        typeof row.tuition === "number"
          ? row.tuition
          : existingCampus?.student_fee,
      student_registration_fee:
        typeof row.registrationFee === "number"
          ? row.registrationFee
          : existingCampus?.student_registration_fee,
      is_official_partner:
        row.isOfficial ?? existingCampus?.is_official_partner ?? false,
      study_programs: nextStudyPrograms,
      settings: existingCampus?.settings,
    });
  });

  return Array.from(campusMap.values()).sort((left, right) => {
    if (left.is_official_partner !== right.is_official_partner) {
      return (
        (right.is_official_partner ? 1 : 0) - (left.is_official_partner ? 1 : 0)
      );
    }

    return left.name.localeCompare(right.name);
  });
};

const scrollToSection = (sectionId: string) => {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const getFileValidationError = (selectedFile: File) => {
  const fileName = selectedFile.name.toLowerCase();
  const isValidExtension = ACCEPTED_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension),
  );

  if (!isValidExtension) {
    return "Format file harus .xlsx, .xls, atau .csv.";
  }

  if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
    return "Ukuran file maksimal 5MB.";
  }

  return null;
};

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      "Terjadi kesalahan pada sistem."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan pada sistem.";
};

const buildWhatsAppMessage = ({
  name,
  email,
  phone,
  originCampus,
  result,
  metrics,
}: {
  name: string;
  email: string;
  phone: string;
  originCampus: string;
  result: ConversionResult;
  metrics: LandingResultMetrics;
}) => {
  return [
    "Halo Admin KonverPro,",
    "Saya tertarik melanjutkan proses pendaftaran.",
    "",
    `Nama: ${name || "-"}`,
    `Email: ${email || "-"}`,
    `WhatsApp: ${phone || "-"}`,
    `Asal Kampus: ${originCampus || "-"}`,
    "",
    "Tujuan Pendaftaran:",
    `Kampus: ${result.university?.name ?? "-"}`,
    `Program Studi: ${result.study_program?.name ?? "-"}`,
    `Estimasi SKS Diakui: ${result.total_sks_accepted} SKS`,
    `Sisa SKS: ${metrics.remaining} SKS`,
    `Estimasi Lama Studi: ${metrics.estimatedSemesters} semester`,
    `Biaya Kuliah / Semester: ${formatCurrency(metrics.tuitionPerSemester)}`,
    `Biaya Administrasi: ${formatCurrency(metrics.registrationFee)}`,
    "",
    "Mohon bantuannya untuk tindak lanjut pendaftaran.",
  ].join("\n");
};

export default function LandingPage() {
  const [activeView, setActiveView] = useState<"home" | "kampus">("home");
  const [pendingScrollTarget, setPendingScrollTarget] = useState<
    "top" | "prosedur" | "simulation-area" | null
  >(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [originCampus, setOriginCampus] = useState("");

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [marketplaceCatalog, setMarketplaceCatalog] = useState<
    MarketplaceProgramListing[]
  >([]);
  const [comparisonResults, setComparisonResults] = useState<
    LandingComparisonResult[]
  >([]);
  const [hasProcessedTranscript, setHasProcessedTranscript] = useState(false);
  const [visibleStats, setVisibleStats] = useState({
    matchCount: 0,
    maxSks: 0,
  });
  const [univId, setUnivId] = useState("");

  const [isFetchingCampuses, setIsFetchingCampuses] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isResultDetailOpen, setIsResultDetailOpen] = useState(false);
  const [claimDialogKey, setClaimDialogKey] = useState(0);
  const [resultDetailDialogKey, setResultDetailDialogKey] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const selectedCampus = useMemo(
    () => campuses.find((campus) => campus.id === univId) ?? null,
    [campuses, univId],
  );

  const resultMetrics = useMemo<LandingResultMetrics | null>(() => {
    if (!result) {
      return null;
    }

    const accepted = result.total_sks_accepted ?? 0;
    const required =
      result.total_sks_required ??
      result.study_program?.total_sks ??
      FALLBACK_TOTAL_SKS;
    const remaining =
      typeof result.total_sks_target === "number"
        ? result.total_sks_target
        : Math.max(required - accepted, 0);
    const estimatedSemesters =
      result.estimated_semesters ??
      (remaining > 0 ? Math.ceil(remaining / 20) : 0);
    const estimatedYears =
      result.estimated_years ??
      (estimatedSemesters > 0
        ? Number((estimatedSemesters / 2).toFixed(1))
        : 0);
    const tuitionPerSemester =
      result.tuition_per_semester ??
      selectedCampus?.student_fee ??
      FALLBACK_TUITION_PER_SEMESTER;
    const registrationFee =
      result.registration_fee ?? selectedCampus?.student_registration_fee ?? 0;
    const location =
      [result.university?.city, result.university?.province]
        .filter(Boolean)
        .join(", ") ||
      [selectedCampus?.city, selectedCampus?.province]
        .filter(Boolean)
        .join(", ") ||
      "Indonesia";
    const learningMethod =
      result.university?.learning_method ??
      selectedCampus?.learning_method ??
      "Online";
    const isOfficialPartner =
      result.university?.is_official_partner ??
      selectedCampus?.is_official_partner ??
      true;

    return {
      accepted,
      required,
      remaining,
      estimatedSemesters,
      estimatedYears,
      tuitionPerSemester,
      registrationFee,
      location,
      learningMethod,
      isOfficialPartner,
    };
  }, [result, selectedCampus]);

  const officialPartnerCount = useMemo(
    () => campuses.filter((campus) => campus.is_official_partner).length,
    [campuses],
  );

  const totalStudyProgramCount = useMemo(
    () =>
      campuses.reduce(
        (total, campus) => total + (campus.study_programs?.length ?? 0),
        0,
      ),
    [campuses],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchCampuses = async () => {
      try {
        setIsFetchingCampuses(true);
        const [campusResponse, marketplaceResponse] = await Promise.allSettled([
          axios.get("/public/campuses"),
          axios.get("/public/marketplace"),
        ]);

        const baseCampuses =
          campusResponse.status === "fulfilled"
            ? ((campusResponse.value.data?.data ?? []) as Campus[]).map(
                (campus) => ({
                  ...campus,
                  is_official_partner:
                    campus.is_official_partner ??
                    Boolean(
                      (
                        campus as Campus & {
                          is_partner?: boolean;
                        }
                      ).is_partner,
                    ),
                }),
              )
            : [];
        const marketplaceRows =
          marketplaceResponse.status === "fulfilled"
            ? ((marketplaceResponse.value.data?.data ??
                []) as MarketplaceCampusRow[])
            : [];
        const normalizedMarketplaceCatalog =
          normalizeMarketplaceCatalog(marketplaceRows);
        const campusData = mergeCampusesFromSources(
          baseCampuses,
          marketplaceRows,
        );

        if (!isMounted) {
          return;
        }

        if (campusData.length === 0) {
          throw new Error("Daftar kampus mitra belum tersedia.");
        }

        setCampuses(campusData);
        setMarketplaceCatalog(normalizedMarketplaceCatalog);

        if (campusData.length > 0) {
          const firstCampus = campusData[0];
          setUnivId((currentValue) => currentValue || firstCampus.id);
        }
      } catch {
        if (isMounted) {
          toast.error("Gagal memuat daftar kampus mitra.");
        }
      } finally {
        if (isMounted) {
          setIsFetchingCampuses(false);
        }
      }
    };

    fetchCampuses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!pendingScrollTarget) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (pendingScrollTarget === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        scrollToSection(pendingScrollTarget);
      }
      setPendingScrollTarget(null);
    }, 60);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeView, pendingScrollTarget]);

  const handleMarketplaceSelect = (
    campus: Campus,
    preferredStudyProgramId?: string,
  ) => {
    setActiveView("home");
    setUnivId(campus.id);
    toast.success("Kampus dipilih", {
      description:
        preferredStudyProgramId && comparisonResults.length > 0
          ? `${campus.name} siap difokuskan dari hasil rekomendasi.`
          : `${campus.name} dibuka ke workspace simulasi.`,
    });
    setPendingScrollTarget("simulation-area");
  };

  const handleNavigate = (
    target: "home" | "kampus" | "prosedur" | "simulation-area",
  ) => {
    setMobileMenuOpen(false);

    if (target === "home") {
      setActiveView("home");
      setPendingScrollTarget("top");
      return;
    }

    if (target === "kampus") {
      setActiveView("kampus");
      setPendingScrollTarget("top");
      return;
    }

    setActiveView("home");
    setPendingScrollTarget(target);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError = getFileValidationError(selectedFile);

    if (validationError) {
      toast.error("File tidak valid", { description: validationError });
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setResult(null);
    toast.success("File diterima", { description: selectedFile.name });
  };

  const handleTemplateDownload = () => {
    const fallbackTemplateUrl = axios.defaults.baseURL
      ? `${axios.defaults.baseURL.replace(/\/$/, "")}/public/template`
      : "";
    const templateUrl = TEMPLATE_FILE_URL || fallbackTemplateUrl;

    if (!templateUrl) {
      downloadLandingTemplate();
      toast.success("Template berhasil diunduh", {
        description:
          "Template Excel lokal dipakai agar simulasi tetap bisa langsung digunakan.",
      });
      return;
    }

    window.open(templateUrl, "_blank", "noopener,noreferrer");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("File belum dipilih", {
        description: "Unggah template atau transkrip terlebih dahulu.",
      });
      return;
    }

    if (marketplaceCatalog.length === 0) {
      toast.error("Marketplace belum siap", {
        description: "Data kampus publik belum selesai dimuat.",
      });
      return;
    }

    setIsLoading(true);
    setHasProcessedTranscript(false);
    setComparisonResults([]);
    setVisibleStats({ matchCount: 0, maxSks: 0 });
    setResult(null);
    setIsClaimModalOpen(false);
    setIsResultDetailOpen(false);

    try {
      const parsedTranscript = await parseTranscriptFile(file);

      if (parsedTranscript.fullName && !name.trim()) {
        setName(parsedTranscript.fullName);
      }

      if (parsedTranscript.originCampus && !originCampus.trim()) {
        setOriginCampus(parsedTranscript.originCampus);
      }

      if (parsedTranscript.transcript.length === 0) {
        throw new Error(
          "Mata kuliah lulus tidak ditemukan pada file. Gunakan template KonverPro agar struktur kolom terbaca.",
        );
      }

      const nextResults = buildComparisonResults(
        marketplaceCatalog,
        parsedTranscript.transcript,
      );

      setComparisonResults(nextResults);
      setHasProcessedTranscript(true);

      toast.success("Simulasi selesai", {
        description: "Hasil rekomendasi lintas kampus sudah siap ditampilkan.",
      });

      scrollToSection("results-header");
    } catch (error) {
      toast.error("Gagal memproses transkrip", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!result) {
      return;
    }

    generateConversionPDF(result, false);
  };

  const openResultDetailDialog = () => {
    if (!result) {
      return;
    }

    setResultDetailDialogKey((current) => current + 1);
    setIsResultDetailOpen(true);
  };

  const handleOpenDetailForComparisonResult = (
    item: LandingComparisonResult,
  ) => {
    setResult(comparisonResultToConversionPayload(item));
    setResultDetailDialogKey((current) => current + 1);
    setIsResultDetailOpen(true);
  };

  const handleOpenClaimForComparisonResult = (
    item: LandingComparisonResult,
  ) => {
    setResult(comparisonResultToConversionPayload(item));
    setClaimDialogKey((current) => current + 1);
    setIsClaimModalOpen(true);
  };

  const handleWhatsApp = () => {
    if (!result || !resultMetrics) {
      return;
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !originCampus.trim()
    ) {
      toast.error("Lengkapi biodata pendaftaran terlebih dahulu.");
      return;
    }

    const message = buildWhatsAppMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      originCampus: originCampus.trim(),
      result,
      metrics: resultMetrics,
    });

    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 selection:bg-brand-100 selection:text-brand-900">
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((previous) => !previous)}
        activeView={activeView}
        onNavigate={handleNavigate}
      />

      {activeView === "home" && (
        <>
          <Hero
            onPrimaryAction={() => handleNavigate("simulation-area")}
            onSecondaryAction={() => handleNavigate("prosedur")}
            campusCount={campuses.length}
            officialPartnerCount={officialPartnerCount}
            programCount={totalStudyProgramCount}
          />

          <HowItWorks />

          <main
            id="simulation-area"
            className="flex-1 bg-slate-50 px-4 py-16 sm:px-6"
          >
            <div className="mx-auto max-w-[95%] space-y-8">
              <LandingSimulationWorkspace
                file={file}
                accept={ACCEPTED_EXTENSIONS.join(",")}
                isLoading={isLoading}
                visibleStats={visibleStats}
                detectedName={name}
                detectedOriginCampus={originCampus}
                onTemplateDownload={handleTemplateDownload}
                onFileChange={handleFileChange}
                onProcess={handleUpload}
              />

              <LandingResultsBoard
                catalog={marketplaceCatalog}
                results={comparisonResults}
                isLoading={isLoading}
                hasProcessed={hasProcessedTranscript}
                onOpenDetail={handleOpenDetailForComparisonResult}
                onOpenClaim={handleOpenClaimForComparisonResult}
                onStatsChange={setVisibleStats}
              />
            </div>
          </main>
        </>
      )}

      {activeView === "kampus" && (
        <div className="min-h-[70vh] bg-slate-50">
          <MarketplaceExplorer
            campuses={campuses}
            isLoading={isFetchingCampuses}
            selectedCampusId={univId}
            onSelectCampus={handleMarketplaceSelect}
          />
        </div>
      )}

      <Footer onNavigate={handleNavigate} />

      <SimulationResultDetailDialog
        key={`detail-${resultDetailDialogKey}`}
        open={isResultDetailOpen}
        onOpenChange={setIsResultDetailOpen}
        result={result}
        metrics={resultMetrics}
        onProceed={() => {
          setIsResultDetailOpen(false);
          setClaimDialogKey((current) => current + 1);
          setIsClaimModalOpen(true);
        }}
      />

      <SimulationClaimDialog
        key={`claim-${claimDialogKey}`}
        open={isClaimModalOpen}
        onOpenChange={setIsClaimModalOpen}
        result={result}
        metrics={resultMetrics}
        name={name}
        email={email}
        phone={phone}
        originCampus={originCampus}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
        onOriginCampusChange={setOriginCampus}
        onOpenDetail={() => {
          setIsClaimModalOpen(false);
          openResultDetailDialog();
        }}
        onDownloadPdf={handleDownloadPdf}
        onSubmitWhatsApp={handleWhatsApp}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
