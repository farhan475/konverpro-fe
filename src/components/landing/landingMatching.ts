"use client";

import * as XLSX from "xlsx";

import type {
  ConversionResult,
  LandingComparisonMatch,
  LandingComparisonResult,
  LandingResultMetrics,
  LandingTranscriptCourse,
  MarketplaceCourse,
  MarketplaceProgramListing,
} from "./types";

const FAIL_GRADES = new Set(["E", "TL", "K", "D", "D+"]);
const DEFAULT_TOTAL_REQUIRED_SKS = 144;
const PASSING_SCORE = 0.6;

const ABBREVIATIONS: Record<string, string> = {
  peng: "pengantar",
  mnj: "manajemen",
  man: "manajemen",
  bhs: "bahasa",
  tek: "teknologi",
  tekn: "teknologi",
  sis: "sistem",
  syst: "sistem",
  info: "informasi",
  inf: "informasi",
  kom: "komputer",
  komp: "komputer",
  akt: "akuntansi",
  algo: "algoritma",
  prog: "pemrograman",
  struk: "struktur",
  dat: "data",
};

const cleanString = (value: unknown) =>
  typeof value === "string" ? value.trim() : value ? String(value).trim() : "";

const normalizeCourse = (course: MarketplaceCourse): MarketplaceCourse => ({
  ...course,
  name: cleanString(course.name),
  code: cleanString(course.code) || undefined,
  sks:
    typeof course.sks === "number"
      ? course.sks
      : Number(cleanString(course.sks)) || 0,
});

const getRowField = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (key in row) {
      return cleanString(row[key]);
    }
  }

  return "";
};

export const expandAbbreviation = (value: string) => {
  let nextValue = cleanString(value).toLowerCase();

  Object.entries(ABBREVIATIONS).forEach(([short, full]) => {
    nextValue = nextValue.replace(
      new RegExp(`\\b${short}\\b|\\b${short}\\.`, "g"),
      full,
    );
  });

  return nextValue;
};

export const calculateSimilarity = (source: string, target: string) => {
  const normalizedSource = expandAbbreviation(source).replace(/[^a-z0-9]/g, "");
  const normalizedTarget = expandAbbreviation(target).replace(/[^a-z0-9]/g, "");

  if (!normalizedSource || !normalizedTarget) {
    return 0;
  }

  if (normalizedSource === normalizedTarget) {
    return 1;
  }

  if (
    normalizedSource.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedSource)
  ) {
    return 0.8;
  }

  let intersection = 0;
  const sourceBigrams = new Set<string>();

  for (let index = 0; index < normalizedSource.length - 1; index += 1) {
    sourceBigrams.add(normalizedSource.substring(index, index + 2));
  }

  for (let index = 0; index < normalizedTarget.length - 1; index += 1) {
    if (sourceBigrams.has(normalizedTarget.substring(index, index + 2))) {
      intersection += 1;
    }
  }

  const score =
    (2 * intersection) /
    (normalizedSource.length + normalizedTarget.length - 2);

  return score > 0.45 ? score : 0;
};

export const calculateStudyDuration = (
  recognizedSks: number,
  totalRequiredSks: number = DEFAULT_TOTAL_REQUIRED_SKS,
) => {
  const remainingSKS = Math.max(totalRequiredSks - recognizedSks, 0);
  const estSemesters = remainingSKS > 0 ? Math.ceil(remainingSKS / 20) : 0;

  return {
    estSemesters,
    remainingSKS,
    totalRequiredSks,
  };
};

export const parseTranscriptFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!firstSheet) {
    throw new Error("Sheet transkrip tidak ditemukan.");
  }

  const fullName = cleanString(firstSheet.B1?.v);
  const originCampus = cleanString(firstSheet.B2?.v);

  let rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    range: 6,
    defval: "",
  });

  if (rows.length === 0) {
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
      defval: "",
    });
  }

  const transcript: LandingTranscriptCourse[] = [];

  rows.forEach((row) => {
    const courseName = getRowField(row, [
      "Nama_Mata_Kuliah_Asal",
      "Nama Mata Kuliah Asal",
      "Nama Mata Kuliah",
      "Mata Kuliah",
      "Course",
      "Nama MK",
    ]);
    const grade = getRowField(row, [
      "Nilai_Huruf",
      "Nilai Huruf",
      "Nilai",
      "Grade",
      "Huruf",
    ]);
    const sksRaw = getRowField(row, ["SKS_Asal", "SKS Asal", "SKS", "Credit"]);
    const sks = Number(sksRaw) || 0;
    const isPass = grade && !FAIL_GRADES.has(grade.toUpperCase());

    if (courseName && isPass) {
      transcript.push({
        name: courseName,
        grade,
        sks,
      });
    }
  });

  return {
    fullName,
    originCampus,
    transcript,
  };
};

export const downloadLandingTemplate = () => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Nama Mahasiswa", "[Isi Nama]"],
    ["Asal Kampus", "[Isi Kampus]"],
    [],
    ["Nama Mata Kuliah Asal", "Nilai Huruf", "SKS Asal"],
    ["Algoritma Pemrograman", "A", 3],
  ]);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  XLSX.writeFile(workbook, "Template_Konversi.xlsx");
};

export const buildComparisonResults = (
  listings: MarketplaceProgramListing[],
  transcript: LandingTranscriptCourse[],
) => {
  const nextResults: LandingComparisonResult[] = listings.map((listing) => {
    const matches: LandingComparisonMatch[] = [];
    const matchedSources = new Set<string>();
    let totalSKS = 0;

    const courses = (listing.courses ?? []).map((course) =>
      normalizeCourse(course),
    );

    courses.forEach((targetCourse) => {
      let bestMatch: LandingTranscriptCourse | null = null;
      let bestScore = 0;

      transcript.forEach((sourceCourse) => {
        if (matchedSources.has(sourceCourse.name)) {
          return;
        }

        const score = calculateSimilarity(sourceCourse.name, targetCourse.name);

        if (score > PASSING_SCORE && score > bestScore) {
          bestScore = score;
          bestMatch = sourceCourse;
        }
      });

      if (bestMatch) {
        const matchedCourse = bestMatch as LandingTranscriptCourse;

        matches.push({
          target: targetCourse,
          source: matchedCourse,
          score: bestScore,
        });
        totalSKS += Number(targetCourse.sks ?? 0);
        matchedSources.add(matchedCourse.name);
      }
    });

    const { estSemesters, remainingSKS } = calculateStudyDuration(totalSKS);

    return {
      id: `${listing.id}-${listing.study_program_id}`,
      campusId: listing.id,
      studyProgramId: listing.study_program_id,
      campus: listing.campus,
      logoPath: listing.logoPath ?? null,
      province: listing.province,
      city: listing.city,
      type: listing.type,
      lecture: listing.lecture,
      prodiName: listing.prodiName,
      strata: listing.strata,
      tuition: listing.tuition,
      registrationFee: listing.registrationFee,
      totalSKS,
      remainingSKS,
      duration: estSemesters,
      isOfficial: listing.isOfficial,
      matches,
      allCourses: courses,
    };
  });

  return nextResults.sort((left, right) => {
    if (left.isOfficial !== right.isOfficial) {
      return left.isOfficial ? -1 : 1;
    }

    return right.totalSKS - left.totalSKS;
  });
};

export const comparisonResultToConversionPayload = (
  item: LandingComparisonResult,
): ConversionResult => {
  const matchedCourseMap = new Map(
    item.matches.map((match) => [match.target.name, match]),
  );
  const notes: string[] = [];

  if (item.totalSKS >= 80) {
    notes.push("Potensi pengakuan SKS tinggi untuk jalur transfer kredit.");
  }

  if (item.isOfficial) {
    notes.push(
      "Program studi ini termasuk listing official partner KonverPro.",
    );
  }

  if (item.registrationFee > 0) {
    notes.push(
      "Periksa biaya daftar konversi sebelum melanjutkan pendaftaran.",
    );
  }

  return {
    id: item.id,
    university: {
      id: item.campusId,
      name: item.campus,
      logo_path: item.logoPath ?? null,
      city: item.city,
      province: item.province,
      learning_method: item.lecture,
      is_official_partner: item.isOfficial,
    },
    study_program: {
      id: item.studyProgramId,
      name: item.prodiName,
      total_sks: DEFAULT_TOTAL_REQUIRED_SKS,
    },
    total_sks_accepted: item.totalSKS,
    total_sks_target: item.remainingSKS,
    total_sks_required: DEFAULT_TOTAL_REQUIRED_SKS,
    estimated_semesters: item.duration,
    estimated_years: Number((item.duration / 2).toFixed(1)),
    tuition_per_semester: item.tuition,
    registration_fee: item.registrationFee,
    notes,
    details: item.allCourses.map((course, index) => {
      const match = matchedCourseMap.get(course.name);

      return {
        id: course.id ?? `${item.id}-${course.code ?? index}`,
        status: match ? "approved" : "rejected",
        src_name: match?.source.name,
        src_sks: match?.source.sks ?? Number(course.sks ?? 0),
        src_grade: match?.source.grade,
        target_course: {
          code: course.code,
          name: course.name,
        },
      };
    }),
  };
};

export const comparisonResultToMetrics = (
  item: LandingComparisonResult,
): LandingResultMetrics => ({
  accepted: item.totalSKS,
  required: DEFAULT_TOTAL_REQUIRED_SKS,
  remaining: item.remainingSKS,
  estimatedSemesters: item.duration,
  estimatedYears: Number((item.duration / 2).toFixed(1)),
  tuitionPerSemester: item.tuition,
  registrationFee: item.registrationFee,
  location:
    [item.city, item.province].filter(Boolean).join(", ") || "Indonesia",
  learningMethod: item.lecture || "Online",
  isOfficialPartner: item.isOfficial,
});
