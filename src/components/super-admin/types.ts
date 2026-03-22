export type UserRole = "super_admin" | "campus_admin" | "prodi_admin";

export interface CampusStudyProgram {
  id: string;
  name: string;
  level: string;
}

export interface UniversitySettings {
  email?: string;
  plan?: string;
  status?: "active" | "pending" | "suspended" | string;
  province?: string;
  city?: string;
  type?: string;
  lecture?: string;
  custom_rates?: Record<string, number>;
  study_programs?: CampusStudyProgram[];
}

export interface University {
  id: string;
  name: string;
  status?: "active" | "pending" | "suspended" | string;
  slug?: string | null;
  code?: string | null;
  website?: string | null;
  logo_path?: string | null;
  billing_mode?: "subsidy" | "independent" | string | null;
  balance?: number | null;
  cost_per_check?: number | null;
  student_registration_fee?: number | null;
  student_fee?: number | null;
  is_active?: boolean;
  is_partner?: boolean;
  settings?: UniversitySettings | null;
  conversions_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  university_id?: string | null;
  university?: University | null;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalCampuses: number;
  totalUsers: number;
  totalTopups: number;
  totalConversions: number;
  totalRevenue: number;
}

export interface TopupItem {
  id: string;
  trx_id?: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | string;
  university_id?: string | null;
  university?: University | null;
  university_name?: string;
  created_at?: string;
}

export interface AuditLogItem {
  id: string;
  action?: string;
  event?: string;
  actor_name?: string;
  actor_role?: string;
  description?: string;
  created_at?: string;
  user?: Pick<AdminUser, "id" | "name" | "role"> | null;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiSingleResponse<T> {
  data: T;
}

export interface ApiCollectionResult<T> {
  data: T[];
  source: "remote" | "local";
}

export interface ApiSingleResult<T> {
  data: T;
  source: "remote" | "local";
}

export interface ApiMutationResult<T = unknown> {
  data: T | null;
}

export interface UserFormValues {
  name: string;
  email: string;
  role: UserRole;
  university_id?: string | null;
}

export interface CampusFormValues {
  name: string;
  email: string;
  plan: string;
  status?: "active" | "pending" | "suspended";
  is_partner?: boolean;
  regFee?: number;
  tuitionFee?: number;
}

export interface CampusWorkspaceForm {
  name: string;
  email: string;
  plan: string;
  status: "active" | "pending" | "suspended";
  is_partner: boolean;
  website: string;
  city: string;
  province: string;
  type: string;
  lecture: string;
  regFee: string;
  tuitionFee: string;
  internalRate: string;
  leadRate: string;
  billingMode: "subsidy" | "independent" | string;
  studyPrograms: CampusStudyProgram[];
}

export interface RevenueChartItem {
  period: string;
  type: string;
  total: number;
}

export interface RevenueSummary {
  total_conversions: number;
  total_internal: number;
  total_lead: number;
  total_revenue: number;
}

export interface RevenueReport {
  chart: RevenueChartItem[];
  summary: RevenueSummary;
}

export interface SuperAdminOverviewStats {
  totalCampuses: number;
  activeCampuses: number;
  partnerCampuses: number;
  totalUsers: number;
  activeUsers: number;
  pendingTopups: number;
  totalConversions: number;
  approvedConversions: number;
  totalRevenue: number;
}

export interface SuperAdminOverviewGrowthItem {
  period: string;
  revenue: number;
  conversions: number;
}

export interface SuperAdminOverviewHeatmapItem {
  id: string;
  name: string;
  score: number;
  statusLabel: string;
  conversions: number;
  balance: number;
  pendingTopups: number;
  isPartner: boolean;
  isActive: boolean;
  activeUsers: number;
}

export interface SuperAdminOverviewAttentionItem {
  id: string;
  name: string;
  priority: number;
  reasons: string[];
}

export interface SuperAdminOverviewRecentTopup {
  id: string;
  trx_id?: string;
  amount: number;
  status: string;
  created_at?: string;
  university?: {
    id?: string | null;
    name?: string | null;
  } | null;
}

export interface SuperAdminOverviewRecentConversion {
  id: string;
  trx_id?: string;
  status?: string;
  payment_status?: string;
  created_at?: string;
  student_name?: string | null;
  university_name?: string | null;
  study_program_name?: string | null;
  total_sks_accepted?: number;
}

export interface SuperAdminOverviewReport {
  stats: SuperAdminOverviewStats;
  growth: SuperAdminOverviewGrowthItem[];
  campus_heatmap: SuperAdminOverviewHeatmapItem[];
  insights: {
    needs_attention: SuperAdminOverviewAttentionItem[];
    recent_topups: SuperAdminOverviewRecentTopup[];
    latest_conversions: SuperAdminOverviewRecentConversion[];
  };
}

export interface NotificationTemplateItem {
  id: string;
  name: string;
  trigger: string;
  subject: string;
  body: string;
  created_at?: string;
  updated_at?: string;
}

export interface GlobalSettingsForm {
  internal_rate: string;
  lead_rate: string;
  partner_surcharge: string;
  tax: string;
  min_topup: string;
  maintenance_mode: boolean;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  mail_from_name: string;
  mail_from_address: string;
  support_email: string;
  support_whatsapp: string;
}
