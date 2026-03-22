"use client";

import { useMemo, useState } from "react";
import {
  Buildings,
  Check,
  CircleNotch,
  GraduationCap,
  Plus,
  SlidersHorizontal,
  Trash,
  UsersThree,
  Wallet,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  getCampusWorkspaceForm,
  saveCampusWorkspace,
} from "../api";
import type {
  AdminUser,
  CampusStudyProgram,
  CampusWorkspaceForm,
  TopupItem,
  University,
} from "../types";
import { formatCurrency, formatDate, getErrorMessage } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CampusManageTab =
  | "info"
  | "prodi"
  | "config"
  | "campus-users"
  | "billing";

interface CampusManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  campus: University | null;
  users: AdminUser[];
  topups: TopupItem[];
}

const manageTabs: Array<{
  key: CampusManageTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; weight?: "fill" | "bold" | "duotone" }>;
}> = [
  {
    key: "info",
    label: "Profil Dasar",
    description: "Identitas institusi dan status kemitraan utama.",
    icon: Buildings,
  },
  {
    key: "prodi",
    label: "Program Studi",
    description: "Kelengkapan portofolio prodi yang tampil ke operator.",
    icon: GraduationCap,
  },
  {
    key: "config",
    label: "Config & Tarif",
    description: "Atur billing mode, tarif, dan konfigurasi operasional kampus.",
    icon: SlidersHorizontal,
  },
  {
    key: "campus-users",
    label: "Manajemen Akun",
    description: "Pantau admin kampus dan prodi yang terhubung.",
    icon: UsersThree,
  },
  {
    key: "billing",
    label: "Billing",
    description: "Ringkasan saldo, top up, dan histori transaksi kampus.",
    icon: Wallet,
  },
];

const getCampusStatusLabel = (status: CampusWorkspaceForm["status"]) => {
  if (status === "active") {
    return "Active";
  }

  if (status === "pending") {
    return "Pending";
  }

  return "Suspended";
};

const getCampusStatusClassName = (status: CampusWorkspaceForm["status"]) => {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
};

function buildLocalStudyProgram(): CampusStudyProgram {
  return {
    id: `draft-prodi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    level: "S1",
  };
}

export default function CampusManagementModal({
  open,
  onClose,
  onSuccess,
  campus,
  users,
  topups,
}: CampusManagementModalProps) {
  const [activeTab, setActiveTab] = useState<CampusManageTab>("info");
  const [form, setForm] = useState<CampusWorkspaceForm | null>(() =>
    campus ? getCampusWorkspaceForm(campus) : null,
  );
  const [saving, setSaving] = useState(false);

  const activeCampus = campus;

  const campusUsers = useMemo(
    () =>
      activeCampus
        ? users.filter(
            (user) =>
              user.university_id === activeCampus.id ||
              user.university?.id === activeCampus.id,
          )
        : [],
    [activeCampus, users],
  );

  const campusTopups = useMemo(
    () =>
      activeCampus
        ? [...topups]
            .filter(
              (item) =>
                item.university_id === activeCampus.id ||
                item.university?.id === activeCampus.id,
            )
            .sort((left, right) =>
              String(right.created_at ?? "").localeCompare(
                String(left.created_at ?? ""),
              ),
            )
        : [],
    [activeCampus, topups],
  );

  const pendingTopups = useMemo(
    () => campusTopups.filter((item) => item.status === "pending"),
    [campusTopups],
  );

  const approvedTotal = useMemo(
    () =>
      campusTopups
        .filter((item) => item.status === "approved")
        .reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [campusTopups],
  );

  const activeTabMeta = useMemo(
    () => manageTabs.find((tab) => tab.key === activeTab) ?? manageTabs[0],
    [activeTab],
  );

  if (!open || !activeCampus || !form) {
    return null;
  }

  const handleFieldChange = <K extends keyof CampusWorkspaceForm>(
    key: K,
    value: CampusWorkspaceForm[K],
  ) => {
    setForm((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  };

  const handleProgramChange = (
    id: string,
    key: keyof CampusStudyProgram,
    value: string,
  ) => {
    setForm((current) =>
      current
        ? {
            ...current,
            studyPrograms: current.studyPrograms.map((program) =>
              program.id === id
                ? {
                    ...program,
                    [key]: value,
                  }
                : program,
            ),
          }
        : current,
    );
  };

  const handleAddProgram = () => {
    setForm((current) =>
      current
        ? {
            ...current,
            studyPrograms: [...current.studyPrograms, buildLocalStudyProgram()],
          }
        : current,
    );
  };

  const handleRemoveProgram = (id: string) => {
    setForm((current) =>
      current
        ? {
            ...current,
            studyPrograms: current.studyPrograms.filter(
              (program) => program.id !== id,
            ),
          }
        : current,
    );
  };

  const handleSave = async () => {
    const invalidProgram = form.studyPrograms.find(
      (program) => !program.name.trim() || !program.level.trim(),
    );

    if (invalidProgram) {
      toast.error("Lengkapi semua program studi sebelum menyimpan.");
      return;
    }

    setSaving(true);

    try {
      await saveCampusWorkspace(activeCampus.id, form);
      toast.success("Workspace kampus berhasil diperbarui.");
      await onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan workspace kampus."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-[#001a33] px-8 py-7 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-black text-white shadow-sm ring-1 ring-white/10">
                {activeCampus.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
                    Campus Control
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${getCampusStatusClassName(form.status)}`}
                  >
                    {getCampusStatusLabel(form.status)}
                  </span>
                  {form.is_partner ? (
                    <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
                      Official Partner
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-white">
                  {activeCampus.name}
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  Kelola profil dasar, prodi, config kampus, akun administrator,
                  dan billing dalam satu workspace.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X size={22} weight="bold" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.6fr_0.95fr]">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Status
                </p>
                <p className="mt-2 text-sm font-black text-white">
                  {getCampusStatusLabel(form.status)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Program Studi
                </p>
                <p className="mt-2 text-sm font-black text-white">
                  {form.studyPrograms.length} Prodi
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Admin Kampus
                </p>
                <p className="mt-2 text-sm font-black text-white">
                  {campusUsers.length} Akun
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Saldo
                </p>
                <p className="mt-2 text-sm font-black text-emerald-300">
                  {formatCurrency(activeCampus.balance)}
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                Operational Pulse
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-xs font-bold text-white/65">Plan</span>
                  <span className="text-sm font-black text-white">{form.plan}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-xs font-bold text-white/65">
                    Pending Top Up
                  </span>
                  <span className="text-sm font-black text-amber-200">
                    {pendingTopups.length} Request
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-xs font-bold text-white/65">
                    Billing Mode
                  </span>
                  <span className="text-sm font-black text-white">
                    {form.billingMode === "subsidy" ? "Subsidy" : "Independent"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-white px-6 py-4">
          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
            <div className="flex flex-wrap items-center gap-1">
              {manageTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                      isActive
                        ? "border-brand-900 bg-brand-900 text-white shadow-lg shadow-brand-900/10"
                        : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    <Icon size={16} weight="bold" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Fokus Tab
              </p>
              <p className="mt-1 text-sm font-black text-[#001a33]">
                {activeTabMeta.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {activeTabMeta.description}
              </p>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(9,78,139,0.10),_transparent_48%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] px-6 py-6">
          {activeTab === "info" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-[0.16em] text-[#001a33]">
                  Profil Institusi
                </h4>
                <div className="mt-5 grid gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Nama Kampus
                    </label>
                    <Input
                      value={form.name}
                      onChange={(event) =>
                        handleFieldChange("name", event.target.value)
                      }
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Email PIC
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        handleFieldChange("email", event.target.value)
                      }
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Website
                    </label>
                    <Input
                      value={form.website}
                      onChange={(event) =>
                        handleFieldChange("website", event.target.value)
                      }
                      placeholder="https://kampus.ac.id"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Kota
                      </label>
                      <Input
                        value={form.city}
                        onChange={(event) =>
                          handleFieldChange("city", event.target.value)
                        }
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Provinsi
                      </label>
                      <Input
                        value={form.province}
                        onChange={(event) =>
                          handleFieldChange("province", event.target.value)
                        }
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-[0.16em] text-[#001a33]">
                  Kemitraan & Operasional
                </h4>
                <div className="mt-5 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Paket
                      </label>
                      <select
                        value={form.plan}
                        onChange={(event) =>
                          handleFieldChange("plan", event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
                      >
                        <option value="Starter">Starter</option>
                        <option value="Growth">Growth</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(event) =>
                          handleFieldChange(
                            "status",
                            event.target.value as CampusWorkspaceForm["status"],
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Tipe Kampus
                      </label>
                      <Input
                        value={form.type}
                        onChange={(event) =>
                          handleFieldChange("type", event.target.value)
                        }
                        placeholder="PTS / PTN / Politeknik"
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Mode Perkuliahan
                      </label>
                      <Input
                        value={form.lecture}
                        onChange={(event) =>
                          handleFieldChange("lecture", event.target.value)
                        }
                        placeholder="Online / Hybrid / Reguler"
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.is_partner}
                      onChange={(event) =>
                        handleFieldChange("is_partner", event.target.checked)
                      }
                      className="h-5 w-5 rounded"
                    />
                    Jadikan sebagai Official Partner
                  </label>

                  <div className="rounded-[1.5rem] border border-brand-100 bg-brand-50 p-4 text-sm leading-relaxed text-brand-900/80">
                    Perubahan di tab ini langsung memperbarui workspace kampus,
                    metadata institusi, dan payload yang dibaca ulang oleh
                    dashboard super-admin sesudah refresh data.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "prodi" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-[0.16em] text-[#001a33]">
                    Program Studi Kampus
                  </h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Tambah atau rapikan daftar prodi untuk meniru workflow
                    referensi dashboard super admin.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAddProgram}
                  className="rounded-xl bg-brand-900 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-brand-800"
                >
                  <Plus size={16} weight="bold" className="mr-2" />
                  Tambah Prodi
                </Button>
              </div>

              <div className="space-y-4">
                {form.studyPrograms.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
                    Belum ada program studi. Tambahkan prodi baru untuk kampus
                    ini.
                  </div>
                ) : (
                  form.studyPrograms.map((program) => (
                    <div
                      key={program.id}
                      className="grid gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm md:grid-cols-[1.3fr_180px_auto]"
                    >
                      <Input
                        value={program.name}
                        onChange={(event) =>
                          handleProgramChange(
                            program.id,
                            "name",
                            event.target.value,
                          )
                        }
                        placeholder="Nama program studi"
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                      />
                      <select
                        value={program.level}
                        onChange={(event) =>
                          handleProgramChange(
                            program.id,
                            "level",
                            event.target.value,
                          )
                        }
                        className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
                      >
                        <option value="D3">D3</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveProgram(program.id)}
                        className="h-12 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash size={16} weight="bold" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "config" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-[0.16em] text-[#001a33]">
                  Tarif Kampus
                </h4>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Registrasi Mahasiswa
                    </label>
                    <Input
                      type="number"
                      value={form.regFee}
                      onChange={(event) =>
                        handleFieldChange("regFee", event.target.value)
                      }
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Tuition Fee
                    </label>
                    <Input
                      type="number"
                      value={form.tuitionFee}
                      onChange={(event) =>
                        handleFieldChange("tuitionFee", event.target.value)
                      }
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Internal Rate
                    </label>
                    <Input
                      type="number"
                      value={form.internalRate}
                      onChange={(event) =>
                        handleFieldChange("internalRate", event.target.value)
                      }
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Lead Rate
                    </label>
                    <Input
                      type="number"
                      value={form.leadRate}
                      onChange={(event) =>
                        handleFieldChange("leadRate", event.target.value)
                      }
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold shadow-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-[0.16em] text-[#001a33]">
                  Billing & Skema
                </h4>
                <div className="mt-5 grid gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Billing Mode
                    </label>
                    <select
                      value={form.billingMode}
                      onChange={(event) =>
                        handleFieldChange("billingMode", event.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
                    >
                      <option value="independent">Independent</option>
                      <option value="subsidy">Subsidy</option>
                    </select>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Snapshot Saat Ini
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Saldo
                        </p>
                        <p className="mt-1 text-sm font-black text-emerald-700">
                          {formatCurrency(activeCampus.balance)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Pending Top Up
                        </p>
                        <p className="mt-1 text-sm font-black text-[#001a33]">
                          {pendingTopups.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "campus-users" && (
            <div className="space-y-4">
              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-[0.16em] text-[#001a33]">
                  Daftar Akun Administrator
                </h4>
                <p className="mt-2 text-sm text-slate-400">
                  Data ini otomatis membaca user yang terhubung ke kampus ini
                  dari direktori user global.
                </p>
              </div>

              {campusUsers.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
                  Belum ada admin terdaftar untuk kampus ini.
                </div>
              ) : (
                campusUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-4 rounded-[1.6rem] border border-slate-100 bg-white p-5 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-black text-[#001a33]">
                        {user.name}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {user.email}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                        user.role === "prodi_admin"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {user.role === "prodi_admin"
                        ? "Admin Prodi"
                        : "Admin Kampus"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-[2rem] border border-slate-100 bg-[#001a33] p-6 text-white shadow-xl shadow-brand-900/15">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                    Saldo Saat Ini
                  </p>
                  <p className="mt-3 text-3xl font-black">
                    {formatCurrency(activeCampus.balance)}
                  </p>
                </div>
                <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Top Up Pending
                  </p>
                  <p className="mt-3 text-3xl font-black text-amber-600">
                    {pendingTopups.length}
                  </p>
                </div>
                <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Top Up Approved
                  </p>
                  <p className="mt-3 text-3xl font-black text-emerald-700">
                    {formatCurrency(approvedTotal)}
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h4 className="text-sm font-black uppercase tracking-[0.16em] text-[#001a33]">
                    Histori Billing Kampus
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Tanggal
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Status
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Ref
                        </th>
                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Nominal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {campusTopups.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-16 text-center text-sm text-slate-400"
                          >
                            Belum ada histori billing untuk kampus ini.
                          </td>
                        </tr>
                      ) : (
                        campusTopups.map((topup) => (
                          <tr key={topup.id}>
                            <td className="px-6 py-4 text-sm font-medium text-slate-500">
                              {formatDate(topup.created_at)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                                  topup.status === "approved"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : topup.status === "pending"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {topup.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-[#001a33]">
                              {topup.trx_id ?? topup.id}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-black text-emerald-700">
                              {formatCurrency(topup.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-brand-900 text-white hover:bg-brand-800"
          >
            {saving ? (
              <>
                <CircleNotch size={18} className="mr-2 animate-spin" />
                Menyimpan
              </>
            ) : (
              <>
                <Check size={18} weight="bold" className="mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
