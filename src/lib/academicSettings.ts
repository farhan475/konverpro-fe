import type {
  AcademicRequiredCourse,
  AcademicSettings,
  CurriculumCourse,
  StudyProgramOption,
} from "@/components/campus-admin/types";

const ACADEMIC_SETTINGS_STORAGE_KEY = "kp_academic_settings_v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readSettingsMap(): Record<string, AcademicSettings> {
  if (!canUseStorage()) {
    return {};
  }

  const stored = window.localStorage.getItem(ACADEMIC_SETTINGS_STORAGE_KEY);
  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored) as Record<string, AcademicSettings>;
  } catch {
    return {};
  }
}

function writeSettingsMap(nextMap: Record<string, AcademicSettings>) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    ACADEMIC_SETTINGS_STORAGE_KEY,
    JSON.stringify(nextMap),
  );
}

export function createDefaultAcademicSettings(
  prodi: StudyProgramOption,
  courses: CurriculumCourse[] = [],
): AcademicSettings {
  const requiredCourses: AcademicRequiredCourse[] = courses
    .filter((course) => course.is_mandatory)
    .slice(0, 8)
    .map((course) => ({
      id: course.id,
      code: course.code,
      name: course.name,
      semester: course.semester,
      sks: course.sks,
    }));

  return {
    prodiId: prodi.id,
    prodiName: prodi.name,
    kaprodiName: `Ketua Prodi ${prodi.name}`,
    kaprodiTitle: "Ketua Program Studi",
    letterFormat: "BA/{YEAR}/{NO}/{PRODI}",
    minPassingGrade: "C",
    maxAcceptedSks: 72,
    maxStudyYears: 5,
    semesterRules: [
      { semester: 1, maxSks: 20 },
      { semester: 2, maxSks: 24 },
    ],
    requiredCourses,
    notes:
      "Mahasiswa wajib menyelesaikan seluruh mata kuliah inti yang belum dapat dikonversi sebelum yudisium.",
  };
}

export function getAcademicSettings(
  prodi: StudyProgramOption,
  courses: CurriculumCourse[] = [],
): AcademicSettings {
  const map = readSettingsMap();
  const stored = map[prodi.id];

  if (!stored) {
    return createDefaultAcademicSettings(prodi, courses);
  }

  return {
    ...createDefaultAcademicSettings(prodi, courses),
    ...stored,
    prodiId: prodi.id,
    prodiName: prodi.name,
    requiredCourses:
      stored.requiredCourses && stored.requiredCourses.length > 0
        ? stored.requiredCourses
        : createDefaultAcademicSettings(prodi, courses).requiredCourses,
  };
}

export function saveAcademicSettings(settings: AcademicSettings) {
  const map = readSettingsMap();
  map[settings.prodiId] = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  writeSettingsMap(map);
}

export function findAcademicSettingsByProdiName(prodiName?: string | null) {
  if (!prodiName) {
    return null;
  }

  const values = Object.values(readSettingsMap());
  return (
    values.find(
      (item) => item.prodiName.toLowerCase() === prodiName.toLowerCase(),
    ) ?? null
  );
}

export function buildLetterNumber(
  settings: Pick<AcademicSettings, "letterFormat" | "prodiName">,
  prodiCode?: string,
  sequenceSeed?: string | number,
) {
  const year = new Date().getFullYear().toString();
  const sequence = String(sequenceSeed ?? Date.now()).slice(-4);

  return settings.letterFormat
    .replace("{YEAR}", year)
    .replace("{NO}", sequence)
    .replace("{PRODI}", prodiCode || settings.prodiName.toUpperCase().slice(0, 6));
}
