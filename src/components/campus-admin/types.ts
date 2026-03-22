export interface StudyProgramOption {
  id: string;
  code?: string;
  name: string;
  level: string;
  courses_count?: number;
}

export interface CurriculumCourse {
  id: string;
  code: string;
  name: string;
  sks: number;
  semester: number;
  is_mandatory: boolean;
  keywords?: string[];
}

export interface CurriculumSemester {
  semester: number;
  courses: CurriculumCourse[];
}

export interface RawTranscriptItem {
  name: string;
  grade: string;
  sks: number;
}

export interface SelectedCourse {
  sks: number;
  matchedName: string;
  grade: string;
}

export interface StudentBio {
  name: string;
  univ: string;
  email: string;
  phone: string;
}

export interface AcademicSemesterRule {
  semester: number;
  maxSks: number;
}

export interface AcademicRequiredCourse {
  id: string;
  code: string;
  name: string;
  semester: number;
  sks: number;
}

export interface AcademicSettings {
  prodiId: string;
  prodiName: string;
  kaprodiName: string;
  kaprodiTitle: string;
  letterFormat: string;
  minPassingGrade: string;
  maxAcceptedSks: number;
  maxStudyYears: number;
  semesterRules: AcademicSemesterRule[];
  requiredCourses: AcademicRequiredCourse[];
  notes: string;
  signatureDataUrl?: string;
  updatedAt?: string;
}
