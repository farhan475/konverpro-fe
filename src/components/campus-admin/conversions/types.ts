import type { AcademicSettings } from "@/components/campus-admin/types";
import type { OfficialDocumentMeta } from "@/lib/generatePdf";

export interface ConversionDetailItem {
  id: string;
  src_name: string;
  src_grade: string;
  src_sks: number;
  match_score: number;
  status: string;
  target_course?: {
    code?: string;
    name?: string;
  } | null;
}

export interface ConversionDetailResponse {
  id?: string;
  trx_id: string;
  status: string;
  created_at?: string;
  total_sks_accepted: number;
  transcript_url?: string;
  document_url?: string;
  origin?: string;
  origin_campus?: string;
  student?: {
    name?: string;
    email?: string;
    phone?: string;
    origin_university?: string;
    transcript_url?: string;
  } | null;
  university?: {
    name?: string;
  } | null;
  study_program?: {
    code?: string;
    name?: string;
  } | null;
  details?: ConversionDetailItem[];
}

export interface OfficialDocumentPayloadResponse {
  conversion?: {
    id?: string;
    trx_id?: string;
    status?: string;
    payment_status?: string;
    created_at?: string;
    admin_notes?: string | null;
  };
  student?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string | null;
    source_campus?: string | null;
  } | null;
  university?: {
    id?: string;
    name?: string;
    logo_path?: string | null;
    city?: string | null;
    province?: string | null;
  } | null;
  study_program?: {
    id?: string;
    code?: string;
    name?: string;
    level?: string;
  } | null;
  summary?: {
    acceptedSks?: number;
    requiredSks?: number;
    remainingSks?: number;
    acceptedCourses?: number;
    pendingCourses?: number;
    rejectedCourses?: number;
  };
  academic_settings?: AcademicSettings | null;
  official_document_meta?: OfficialDocumentMeta | null;
  files?: {
    originalTranscriptPath?: string | null;
    generatedResultPath?: string | null;
  };
  details?: ConversionDetailItem[];
}
