import axios from "@/lib/axios";
import type {
  AdminUser,
  AuditLogItem,
  BackupRestoreSummary,
  ApiCollectionResult,
  ApiListResponse,
  ApiMutationResult,
  ApiSingleResult,
  CampusFormValues,
  CampusStudyProgram,
  CampusWorkspaceForm,
  CurrentUser,
  DashboardStats,
  GlobalSettingsForm,
  NotificationTemplateItem,
  RevenueReport,
  RevenueSummary,
  SuperAdminOverviewReport,
  TopupItem,
  University,
  UserFormValues,
} from "./types";
import { toSafeNumber } from "./utils";

const CAMPUSES_STORAGE_KEY = "kp_super_admin_campuses_v1";
const SETTINGS_STORAGE_KEY = "kp_super_admin_settings_v1";
const TOPUPS_STORAGE_KEY = "kp_super_admin_topups_v1";
const NOTIFICATION_TEMPLATE_STORAGE_KEY = "kp_super_admin_notification_templates_v1";
const USERS_STORAGE_KEY = "kp_super_admin_users_v1";

const initialGlobalSettings: GlobalSettingsForm = {
  internal_rate: "",
  lead_rate: "",
  partner_surcharge: "",
  tax: "",
  min_topup: "",
  maintenance_mode: false,
  smtp_host: "",
  smtp_port: "587",
  smtp_username: "",
  smtp_password: "",
  smtp_encryption: "tls",
  mail_from_name: "KonverPro",
  mail_from_address: "",
  support_email: "",
  support_whatsapp: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readEnvelopeData<T>(payload: unknown): T | undefined {
  if (isRecord(payload) && "data" in payload) {
    return payload.data as T | undefined;
  }

  return payload as T | undefined;
}

function readCollectionData<T>(payload: unknown): T[] {
  const data = readEnvelopeData<unknown>(payload);

  return Array.isArray(data) ? (data as T[]) : [];
}

function readPaginatedCollectionData<T>(payload: unknown): T[] {
  const data = readEnvelopeData<unknown>(payload);

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data as T[];
  }

  return [];
}

function parseDownloadFilename(contentDispositionHeader?: string): string | null {
  if (!contentDispositionHeader) {
    return null;
  }

  const utfMatch = contentDispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]).replace(/["']/g, "");
  }

  const filenameMatch = contentDispositionHeader.match(/filename="?([^"]+)"?/i);
  return filenameMatch?.[1] ? filenameMatch[1].trim() : null;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function getStoredGlobalSettings() {
  return readStorage<GlobalSettingsForm>(
    SETTINGS_STORAGE_KEY,
    initialGlobalSettings,
  );
}

function saveStoredGlobalSettings(settings: GlobalSettingsForm) {
  writeStorage(SETTINGS_STORAGE_KEY, settings);
}

function saveStoredNotificationTemplates(templates: NotificationTemplateItem[]) {
  writeStorage(NOTIFICATION_TEMPLATE_STORAGE_KEY, templates);
}

function getStoredCampuses() {
  return readStorage<University[]>(CAMPUSES_STORAGE_KEY, []);
}

function saveStoredCampuses(campuses: University[]) {
  writeStorage(CAMPUSES_STORAGE_KEY, campuses);
}

function saveStoredTopups(topups: TopupItem[]) {
  writeStorage(TOPUPS_STORAGE_KEY, topups);
}

function saveStoredUsers(users: AdminUser[]) {
  writeStorage(USERS_STORAGE_KEY, users);
}

function buildLocalCampusId() {
  return `local-campus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildLocalStudyProgramId() {
  return `local-study-program-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildLocalUserId() {
  return `local-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeStudyPrograms(
  studyPrograms?: CampusStudyProgram[] | null,
): CampusStudyProgram[] {
  return (studyPrograms ?? []).map((item) => ({
    id: String(item.id ?? buildLocalStudyProgramId()),
    name: String(item.name ?? "Program Studi"),
    level: String(item.level ?? "S1"),
  }));
}

function sortByCreatedAtDesc<T extends { created_at?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const rightDate = new Date(right.created_at ?? 0).getTime();
    const leftDate = new Date(left.created_at ?? 0).getTime();
    return rightDate - leftDate;
  });
}

function normalizeCampusRecord(campus: Partial<University> & { id?: string }): University {
  const resolvedStatus =
    typeof campus.status === "string"
      ? campus.status
      : typeof campus.settings?.status === "string"
        ? campus.settings.status
        : campus.is_active
          ? "active"
          : "pending";

  return {
    id: String(campus.id ?? buildLocalCampusId()),
    name: String(campus.name ?? "Kampus Tanpa Nama"),
    status: resolvedStatus,
    slug: campus.slug ?? null,
    code: campus.code ?? null,
    website: campus.website ?? null,
    logo_path: campus.logo_path ?? null,
    billing_mode: campus.billing_mode ?? "independent",
    balance: Number(campus.balance ?? 0),
    cost_per_check:
      campus.cost_per_check !== undefined && campus.cost_per_check !== null
        ? Number(campus.cost_per_check)
        : null,
    student_registration_fee:
      campus.student_registration_fee !== undefined &&
      campus.student_registration_fee !== null
        ? Number(campus.student_registration_fee)
        : null,
    student_fee:
      campus.student_fee !== undefined && campus.student_fee !== null
        ? Number(campus.student_fee)
        : null,
    is_active: Boolean(campus.is_active ?? true),
    is_partner: Boolean(campus.is_partner ?? false),
    settings: campus.settings
      ? {
          ...campus.settings,
          study_programs: normalizeStudyPrograms(campus.settings.study_programs),
        }
      : null,
    conversions_count: Number(campus.conversions_count ?? 0),
    created_at: campus.created_at,
    updated_at: campus.updated_at,
  };
}

function campusToWorkspaceForm(campus: University): CampusWorkspaceForm {
  return {
    name: campus.name,
    email: campus.settings?.email ?? "",
    plan: campus.settings?.plan ?? "Growth",
    status:
      campus.status === "active" ||
      campus.status === "pending" ||
      campus.status === "suspended"
        ? campus.status
        : campus.is_active
          ? "active"
          : "pending",
    is_partner: Boolean(campus.is_partner),
    website: campus.website ?? "",
    city: campus.settings?.city ?? "",
    province: campus.settings?.province ?? "",
    type: campus.settings?.type ?? "",
    lecture: campus.settings?.lecture ?? "",
    regFee:
      campus.student_registration_fee !== undefined &&
      campus.student_registration_fee !== null
        ? String(campus.student_registration_fee)
        : "",
    tuitionFee:
      campus.student_fee !== undefined && campus.student_fee !== null
        ? String(campus.student_fee)
        : "",
    internalRate:
      campus.settings?.custom_rates?.internal !== undefined
        ? String(campus.settings.custom_rates.internal)
        : "",
    leadRate:
      campus.settings?.custom_rates?.lead !== undefined
        ? String(campus.settings.custom_rates.lead)
        : "",
    billingMode: campus.billing_mode ?? "independent",
    studyPrograms: normalizeStudyPrograms(campus.settings?.study_programs),
  };
}

function normalizeUserRecord(
  user: Partial<AdminUser> & { id?: string },
  campuses = getStoredCampuses(),
): AdminUser {
  const universityId = user.university_id ?? user.university?.id ?? null;
  const university =
    user.university ??
    campuses.find((campus) => campus.id === universityId) ??
    null;

  return {
    id: String(user.id ?? buildLocalUserId()),
    name: String(user.name ?? "Administrator"),
    email: String(user.email ?? ""),
    role: (user.role ?? "campus_admin") as AdminUser["role"],
    university_id: universityId,
    university,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function normalizeTopupItem(topup: Partial<TopupItem> & { id: string }): TopupItem {
  const campuses = getStoredCampuses();
  const relatedCampus =
    topup.university ??
    campuses.find((campus) => campus.id === topup.university_id) ??
    (topup.university_name
      ? {
          id: topup.university_id ?? "",
          name: topup.university_name,
        }
      : null);

  return {
    id: String(topup.id),
    trx_id: topup.trx_id ? String(topup.trx_id) : undefined,
    amount: Number(topup.amount ?? 0),
    status: String(topup.status ?? "pending"),
    university_id: topup.university_id ?? relatedCampus?.id ?? null,
    university: relatedCampus,
    university_name: relatedCampus?.name ?? topup.university_name,
    created_at: topup.created_at ?? new Date().toISOString(),
  };
}

function normalizeOverviewReport(
  data: Partial<SuperAdminOverviewReport> | undefined,
): SuperAdminOverviewReport {
  return {
    stats: {
      totalCampuses: Number(data?.stats?.totalCampuses ?? 0),
      activeCampuses: Number(data?.stats?.activeCampuses ?? 0),
      partnerCampuses: Number(data?.stats?.partnerCampuses ?? 0),
      totalUsers: Number(data?.stats?.totalUsers ?? 0),
      activeUsers: Number(data?.stats?.activeUsers ?? 0),
      pendingTopups: Number(data?.stats?.pendingTopups ?? 0),
      totalConversions: Number(data?.stats?.totalConversions ?? 0),
      approvedConversions: Number(data?.stats?.approvedConversions ?? 0),
      totalRevenue: Number(data?.stats?.totalRevenue ?? 0),
    },
    growth: (data?.growth ?? []).map((item) => ({
      period: String(item.period ?? ""),
      revenue: Number(item.revenue ?? 0),
      conversions: Number(item.conversions ?? 0),
    })),
    campus_heatmap: (data?.campus_heatmap ?? []).map((item) => ({
      id: String(item.id ?? ""),
      name: String(item.name ?? "Kampus"),
      score: Number(item.score ?? 0),
      statusLabel: String(item.statusLabel ?? "Atensi"),
      conversions: Number(item.conversions ?? 0),
      balance: Number(item.balance ?? 0),
      pendingTopups: Number(item.pendingTopups ?? 0),
      isPartner: Boolean(item.isPartner),
      isActive: Boolean(item.isActive),
      activeUsers: Number(item.activeUsers ?? 0),
    })),
    insights: {
      needs_attention: (data?.insights?.needs_attention ?? []).map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? "Kampus"),
        priority: Number(item.priority ?? 0),
        reasons: (item.reasons ?? []).map((reason) => String(reason)),
      })),
      recent_topups: (data?.insights?.recent_topups ?? []).map((item) => ({
        id: String(item.id ?? ""),
        trx_id: item.trx_id ? String(item.trx_id) : undefined,
        amount: Number(item.amount ?? 0),
        status: String(item.status ?? "pending"),
        created_at: item.created_at,
        university: item.university
          ? {
              id: item.university.id ? String(item.university.id) : null,
              name: item.university.name ? String(item.university.name) : null,
            }
          : null,
      })),
      latest_conversions: (data?.insights?.latest_conversions ?? []).map((item) => ({
        id: String(item.id ?? ""),
        trx_id: item.trx_id ? String(item.trx_id) : undefined,
        status: item.status ? String(item.status) : undefined,
        payment_status: item.payment_status
          ? String(item.payment_status)
          : undefined,
        created_at: item.created_at,
        student_name: item.student_name ? String(item.student_name) : null,
        university_name: item.university_name
          ? String(item.university_name)
          : null,
        study_program_name: item.study_program_name
          ? String(item.study_program_name)
          : null,
        total_sks_accepted: Number(item.total_sks_accepted ?? 0),
      })),
    },
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const response = await axios.get("/user");

  return readEnvelopeData<CurrentUser>(response.data) ?? null;
}

export async function logoutRequest() {
  return axios.post("/logout");
}

export async function getSuperAdminUsers() {
  const response = await getSuperAdminUsersCollection();
  return response.data;
}

export async function createSuperAdminUser(payload: UserFormValues) {
  const response = await axios.post("/super-admin/users", payload);
  return {
    data: response.data,
  } satisfies ApiMutationResult;
}

export async function updateSuperAdminUser(id: string, payload: UserFormValues) {
  const response = await axios.put(`/super-admin/users/${id}`, payload);
  return {
    data: response.data,
  } satisfies ApiMutationResult;
}

export async function deleteSuperAdminUser(id: string) {
  const response = await axios.delete(`/super-admin/users/${id}`);
  return {
    data: response.data,
  } satisfies ApiMutationResult;
}

export async function getSuperAdminCampuses() {
  const response = await getSuperAdminCampusesCollection();
  return response.data;
}

export async function getSuperAdminTopups() {
  const response = await getSuperAdminTopupsCollection();
  return response.data;
}

export async function processTopup(id: string, action: "approve" | "reject") {
  const response = await axios.post(`/super-admin/topups/${id}/process`, {
    status: action === "approve" ? "approved" : "rejected",
  });
  return {
    data: response.data,
  } satisfies ApiMutationResult;
}

export async function getSuperAdminUsersCollection(): Promise<
  ApiCollectionResult<AdminUser>
> {
  const response = await axios.get<ApiListResponse<AdminUser>>("/super-admin/users");
  const remoteUsers = readCollectionData<AdminUser>(response.data).map((item) =>
    normalizeUserRecord(item),
  );
  saveStoredUsers(remoteUsers);
  return {
    data: remoteUsers,
    source: "remote",
  };
}

export async function getSuperAdminCampusesCollection(): Promise<
  ApiCollectionResult<University>
> {
  const response = await axios.get<ApiListResponse<University>>("/super-admin/campuses");
  const remoteCampuses = readCollectionData<University>(response.data).map((item) =>
    normalizeCampusRecord(item),
  );
  saveStoredCampuses(remoteCampuses);
  return {
    data: remoteCampuses,
    source: "remote",
  };
}

export async function createSuperAdminCampus(payload: CampusFormValues) {
  const response = await axios.post("/super-admin/campuses", payload);
  return {
    data: response.data,
  } satisfies ApiMutationResult;
}

export async function updateSuperAdminCampus(id: string, payload: CampusFormValues) {
  const response = await axios.put(`/super-admin/campuses/${id}`, payload);
  return {
    data: response.data,
  } satisfies ApiMutationResult;
}

export function getCampusWorkspaceForm(campus: University): CampusWorkspaceForm {
  return campusToWorkspaceForm(campus);
}

export async function saveCampusWorkspace(
  id: string,
  payload: CampusWorkspaceForm,
) {
  const basicPayload: CampusFormValues = {
    name: payload.name,
    email: payload.email,
    plan: payload.plan,
    status: payload.status,
    is_partner: payload.is_partner,
    regFee: payload.regFee ? Number(payload.regFee) : undefined,
    tuitionFee: payload.tuitionFee ? Number(payload.tuitionFee) : undefined,
  };

  await axios.put(`/super-admin/campuses/${id}`, {
    ...basicPayload,
    website: payload.website || undefined,
    city: payload.city || undefined,
    province: payload.province || undefined,
    type: payload.type || undefined,
    lecture: payload.lecture || undefined,
    billingMode: payload.billingMode,
    internalRate: payload.internalRate ? Number(payload.internalRate) : undefined,
    leadRate: payload.leadRate ? Number(payload.leadRate) : undefined,
    studyPrograms: normalizeStudyPrograms(payload.studyPrograms),
  });

  const now = new Date().toISOString();

  saveStoredCampuses(
    getStoredCampuses().map((campus) =>
      campus.id === id
        ? normalizeCampusRecord({
            ...campus,
            name: payload.name,
            status: payload.status,
            website: payload.website || null,
            billing_mode: payload.billingMode,
            is_active: payload.status === "active",
            is_partner: payload.is_partner,
            student_registration_fee: payload.regFee
              ? Number(payload.regFee)
              : null,
            student_fee: payload.tuitionFee ? Number(payload.tuitionFee) : null,
            settings: {
              ...(campus.settings ?? {}),
              email: payload.email,
              plan: payload.plan,
              status: payload.status,
              city: payload.city,
              province: payload.province,
              type: payload.type,
              lecture: payload.lecture,
              custom_rates: {
                ...(campus.settings?.custom_rates ?? {}),
                ...(payload.internalRate
                  ? { internal: Number(payload.internalRate) }
                  : {}),
                ...(payload.leadRate
                  ? { lead: Number(payload.leadRate) }
                  : {}),
              },
              study_programs: normalizeStudyPrograms(payload.studyPrograms),
            },
            updated_at: now,
          })
        : campus,
    ),
  );

  return {
    data: null,
  } satisfies ApiMutationResult;
}

export async function deleteSuperAdminCampus(id: string) {
  const response = await axios.delete(`/super-admin/campuses/${id}`);
  return {
    data: response.data,
  } satisfies ApiMutationResult;
}

export async function adjustCampusBalance(id: string, amount: number) {
  const response = await axios.post(`/super-admin/campuses/${id}/adjust-balance`, {
    amount,
  });
  return {
    data: response.data,
  } satisfies ApiMutationResult;
}

export async function getSuperAdminTopupsCollection(): Promise<
  ApiCollectionResult<TopupItem>
> {
  const response = await axios.get<ApiListResponse<TopupItem>>("/super-admin/topups");
  const remoteTopups = sortByCreatedAtDesc(
    readCollectionData<TopupItem>(response.data).map((item) =>
      normalizeTopupItem(item),
    ),
  );
  saveStoredTopups(remoteTopups);
  return {
    data: remoteTopups,
    source: "remote",
  };
}

export async function getSuperAdminOverviewCollection(): Promise<
  ApiSingleResult<SuperAdminOverviewReport>
> {
  const response = await axios.get("/super-admin/reports/overview");
  return {
    data: normalizeOverviewReport(
      readEnvelopeData<Partial<SuperAdminOverviewReport>>(response.data),
    ),
    source: "remote",
  };
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const [usersData, campusesData, topupsData, conversions, revenue] = await Promise.all([
    getSuperAdminUsers(),
    getSuperAdminCampuses(),
    getSuperAdminTopups(),
    axios.get("/admin/conversions").catch(() => ({ data: { data: [] } })),
    getRevenueReport().catch(() => ({
      chart: [],
      summary: {
        total_conversions: 0,
        total_internal: 0,
        total_lead: 0,
        total_revenue: 0,
      },
    })),
  ]);

  const conversionsData = readPaginatedCollectionData(conversions.data);

  return {
    totalCampuses: campusesData.length,
    totalUsers: usersData.length,
    totalTopups: topupsData.length,
    totalConversions: conversionsData.length,
    totalRevenue: revenue.summary.total_revenue,
  };
}

export async function getRevenueReport(): Promise<RevenueReport> {
  const response = await axios.get("/super-admin/reports/revenue");
  const payload = readEnvelopeData<Record<string, unknown>>(response.data) ?? {};
  const chartSource = (Array.isArray(payload.chart)
    ? payload.chart
    : []) as RevenueReport["chart"];
  const chart = chartSource.map(
    (item) => ({
      ...item,
      total: toSafeNumber(item.total),
    }),
  );
  const summary = (
    isRecord(payload.summary) ? payload.summary : {}
  ) as Partial<RevenueSummary>;

  return {
    chart,
    summary: {
      total_conversions: toSafeNumber(summary.total_conversions),
      total_internal: toSafeNumber(summary.total_internal),
      total_lead: toSafeNumber(summary.total_lead),
      total_revenue: chart.reduce((sum, item) => sum + toSafeNumber(item.total), 0),
    },
  };
}

export async function getSuperAdminSettings(): Promise<GlobalSettingsForm> {
  const localSettings = getStoredGlobalSettings();
  const response = await axios.get("/super-admin/settings");
  const data = readEnvelopeData<
    Partial<Record<keyof GlobalSettingsForm, unknown>>
  >(response.data);

  const nextSettings: GlobalSettingsForm = {
    internal_rate: String(data?.internal_rate ?? localSettings.internal_rate),
    lead_rate: String(data?.lead_rate ?? localSettings.lead_rate),
    partner_surcharge: String(
      data?.partner_surcharge ?? localSettings.partner_surcharge,
    ),
    tax: String(data?.tax ?? localSettings.tax),
    min_topup: String(data?.min_topup ?? localSettings.min_topup),
    maintenance_mode: Boolean(
      data?.maintenance_mode ?? localSettings.maintenance_mode,
    ),
    smtp_host: String(data?.smtp_host ?? localSettings.smtp_host),
    smtp_port: String(data?.smtp_port ?? localSettings.smtp_port),
    smtp_username: String(data?.smtp_username ?? localSettings.smtp_username),
    smtp_password: String(data?.smtp_password ?? localSettings.smtp_password),
    smtp_encryption: String(
      data?.smtp_encryption ?? localSettings.smtp_encryption,
    ),
    mail_from_name: String(data?.mail_from_name ?? localSettings.mail_from_name),
    mail_from_address: String(
      data?.mail_from_address ?? localSettings.mail_from_address,
    ),
    support_email: String(data?.support_email ?? localSettings.support_email),
    support_whatsapp: String(
      data?.support_whatsapp ?? localSettings.support_whatsapp,
    ),
  };

  saveStoredGlobalSettings(nextSettings);
  return nextSettings;
}

export async function saveSuperAdminSettings(settings: GlobalSettingsForm) {
  const response = await axios.post("/super-admin/settings", {
    settings,
  });

  saveStoredGlobalSettings(settings);
  return {
    data: response.data,
  };
}

export async function getNotificationTemplates() {
  const response = await axios.get<ApiListResponse<NotificationTemplateItem>>(
    "/super-admin/notification-templates",
  );
  const items = readCollectionData<NotificationTemplateItem>(response.data);
  saveStoredNotificationTemplates(items);
  return {
    data: items,
    source: "remote" as const,
  };
}

export async function getSuperAdminAuditLogsCollection(): Promise<
  ApiCollectionResult<AuditLogItem>
> {
  const response = await axios.get("/super-admin/reports/audit-logs");
  const items = readPaginatedCollectionData<AuditLogItem>(response.data);

  return {
    data: items,
    source: "remote",
  };
}

export async function downloadSystemBackup() {
  const response = await axios.get("/super-admin/system/backup", {
    responseType: "blob",
  });

  const blob =
    response.data instanceof Blob
      ? response.data
      : new Blob([response.data], {
          type: response.headers["content-type"] ?? "application/json",
        });

  return {
    blob,
    filename:
      parseDownloadFilename(response.headers["content-disposition"]) ??
      `konverpro-backup-${Date.now()}.json`,
  };
}

export async function restoreSystemBackup(
  file: File,
): Promise<BackupRestoreSummary> {
  const formData = new FormData();
  formData.append("backup_file", file);

  const response = await axios.post("/super-admin/system/restore", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return (
    readEnvelopeData<BackupRestoreSummary>(response.data) ?? {
      restored_sections: [],
      global_settings_count: 0,
      notification_templates_count: 0,
    }
  );
}

export async function createNotificationTemplate(
  payload: Omit<NotificationTemplateItem, "id" | "created_at" | "updated_at">,
) {
  const response = await axios.post("/super-admin/notification-templates", payload);
  return {
    data: response.data,
  };
}

export async function updateNotificationTemplate(
  id: string,
  payload: Omit<NotificationTemplateItem, "id" | "created_at" | "updated_at">,
) {
  const response = await axios.put(
    `/super-admin/notification-templates/${id}`,
    payload,
  );
  return {
    data: response.data,
  };
}

export async function deleteNotificationTemplate(id: string) {
  const response = await axios.delete(`/super-admin/notification-templates/${id}`);
  return {
    data: response.data,
  };
}
