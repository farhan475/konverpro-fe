export interface StudyProgram {
  id: string;
  name: string;
  total_sks?: number;
  level?: string;
  courses?: MarketplaceCourse[];
}

export interface MarketplaceCourse {
  id?: string;
  code?: string;
  name: string;
  sks?: number;
  keywords?: string[] | string | null;
  is_mandatory?: boolean;
}

export interface ConversionTargetCourse {
  code?: string;
  name?: string;
}

export interface ConversionDetailItem {
  id?: string;
  status?: string;
  src_name?: string;
  src_sks?: number;
  src_grade?: string;
  target_course?: ConversionTargetCourse | null;
}

export interface Campus {
  id: string;
  name: string;
  logo_path?: string | null;
  city?: string;
  province?: string;
  campus_type?: string;
  learning_method?: string;
  student_fee?: number;
  student_registration_fee?: number;
  is_official_partner?: boolean;
  study_programs?: StudyProgram[];
  settings?: {
    province?: string;
    city?: string;
    type?: string;
    lecture?: string;
    [key: string]: unknown;
  };
}

export interface UniversitySummary {
  id?: string;
  name?: string;
  logo_path?: string | null;
  city?: string;
  province?: string;
  learning_method?: string;
  is_official_partner?: boolean;
}

export interface StudyProgramSummary {
  id?: string;
  name?: string;
  total_sks?: number;
}

export interface ConversionResult {
  id?: string;
  status?: string;
  university?: UniversitySummary;
  study_program?: StudyProgramSummary;
  total_sks_accepted: number;
  total_sks_target?: number;
  total_sks_required?: number;
  estimated_semesters?: number;
  estimated_years?: number;
  tuition_per_semester?: number;
  registration_fee?: number;
  notes?: string[];
  details?: ConversionDetailItem[];
}

export interface LandingResultMetrics {
  accepted: number;
  required: number;
  remaining: number;
  estimatedSemesters: number;
  estimatedYears: number;
  tuitionPerSemester: number;
  registrationFee: number;
  location: string;
  learningMethod: string;
  isOfficialPartner: boolean;
}

export interface MarketplaceProgramListing {
  id: string;
  study_program_id: string;
  campus: string;
  isOfficial: boolean;
  logoPath?: string | null;
  province?: string;
  city?: string;
  type?: string;
  lecture?: string;
  prodiName: string;
  strata?: string;
  tuition: number;
  registrationFee: number;
  courses: MarketplaceCourse[];
}

export interface LandingTranscriptCourse {
  name: string;
  grade: string;
  sks: number;
}

export interface LandingComparisonMatch {
  target: MarketplaceCourse;
  source: LandingTranscriptCourse;
  score: number;
}

export interface LandingComparisonResult {
  id: string;
  campusId: string;
  studyProgramId: string;
  campus: string;
  logoPath?: string | null;
  province?: string;
  city?: string;
  type?: string;
  lecture?: string;
  prodiName: string;
  strata?: string;
  tuition: number;
  registrationFee: number;
  totalSKS: number;
  remainingSKS: number;
  duration: number;
  isOfficial: boolean;
  matches: LandingComparisonMatch[];
  allCourses: MarketplaceCourse[];
}
