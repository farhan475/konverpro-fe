"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Buildings,
  Check,
  CircleNotch,
  EnvelopeSimple,
  GraduationCap,
  ShieldCheck,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { createSuperAdminUser, updateSuperAdminUser } from "../api";
import type { AdminUser, University, UserRole } from "../types";
import { getErrorMessage } from "../utils";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campuses: University[];
  initialData?: AdminUser | null;
}

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: "campus_admin", label: "Admin Kampus" },
  { value: "prodi_admin", label: "Admin Prodi" },
  { value: "super_admin", label: "Super Admin" },
];

const roleGuides: Record<
  UserRole,
  { title: string; description: string; accent: string }
> = {
  campus_admin: {
    title: "Operator level kampus",
    description:
      "Cocok untuk pengelola utama kampus yang menangani top up, konversi, dan profil institusi.",
    accent: "text-blue-200",
  },
  prodi_admin: {
    title: "Operator level prodi",
    description:
      "Ideal untuk kaprodi atau admin akademik yang fokus pada review padanan mata kuliah.",
    accent: "text-amber-200",
  },
  super_admin: {
    title: "Operator platform pusat",
    description:
      "Memiliki kontrol lintas kampus untuk pengaturan global, finance, dan governance sistem.",
    accent: "text-emerald-200",
  },
};

export default function UserFormModal({
  open,
  onClose,
  onSuccess,
  campuses,
  initialData,
}: UserFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("campus_admin");
  const [universityId, setUniversityId] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = useMemo(() => Boolean(initialData), [initialData]);
  const selectedCampus = useMemo(
    () => campuses.find((campus) => campus.id === universityId) ?? null,
    [campuses, universityId],
  );
  const activeRoleGuide = useMemo(() => roleGuides[role], [role]);

  useEffect(() => {
    if (!open) return;

    setName(initialData?.name ?? "");
    setEmail(initialData?.email ?? "");
    setRole(initialData?.role ?? "campus_admin");
    setUniversityId(initialData?.university_id ?? "");
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        role,
        university_id: role === "super_admin" ? null : universityId || null,
      };

      if (isEdit && initialData) {
        await updateSuperAdminUser(initialData.id, payload);
        toast.success("User berhasil diperbarui.");
      } else {
        await createSuperAdminUser(payload);
        toast.success("User baru berhasil dibuat dengan password default.");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan user."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white shadow-2xl">
        <div className="bg-[#001a33] px-10 py-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
                  Access Control
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                  {roleOptions.find((option) => option.value === role)?.label}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">
                  {isEdit ? "Update" : "Registrasi"} Profil User
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  Atur identitas, level akses, dan afiliasi operator supaya
                  distribusi kontrol antar kampus tetap rapi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              <X weight="bold" size={24} />
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Role Scope
              </p>
              <p className={`mt-2 text-sm font-black ${activeRoleGuide.accent}`}>
                {activeRoleGuide.title}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Afiliasi
              </p>
              <p className="mt-2 text-sm font-black text-white">
                {role === "super_admin"
                  ? "Kontrol lintas kampus"
                  : selectedCampus?.name || "Belum dipilih"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Provisioning
              </p>
              <p className="mt-2 text-sm font-black text-white">
                {isEdit ? "Update akun eksisting" : "Password default backend"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 p-10 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#094E8B]">
                  <EnvelopeSimple size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Identitas Login
                  </p>
                  <p className="text-sm font-black text-[#001a33]">
                    Data profil utama operator
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Nama Lengkap
                  </label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold"
                    placeholder="Nama administrator"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Email Login
                  </label>
                  <div className="relative">
                    <EnvelopeSimple
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-14 pr-6 text-sm font-bold"
                      placeholder="user@domain.id"
                    />
                  </div>
                  {!isEdit ? (
                    <p className="mt-2 px-1 text-[10px] italic text-slate-400">
                      Password awal mengikuti default backend:{" "}
                      <span className="font-black">password123</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Otorisasi
                  </p>
                  <p className="text-sm font-black text-[#001a33]">
                    Tentukan peran dan afiliasi kerja
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Level Akses
                  </label>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as UserRole)}
                    className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold outline-none"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Afiliasi Kampus
                  </label>
                  <div className="relative">
                    <Buildings
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                      size={18}
                    />
                    <select
                      value={universityId}
                      onChange={(event) => setUniversityId(event.target.value)}
                      disabled={role === "super_admin"}
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-14 pr-6 text-sm font-bold outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">Pilih kampus</option>
                      {campuses.map((campus) => (
                        <option key={campus.id} value={campus.id}>
                          {campus.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#094E8B] shadow-sm">
                  {role === "super_admin" ? (
                    <ShieldCheck size={20} weight="bold" />
                  ) : role === "prodi_admin" ? (
                    <GraduationCap size={20} weight="bold" />
                  ) : (
                    <Buildings size={20} weight="bold" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Ringkasan Akses
                  </p>
                  <p className="text-sm font-black text-[#001a33]">
                    {activeRoleGuide.title}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {activeRoleGuide.description}
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Binding Kampus
              </p>
              <p className="mt-2 text-base font-black text-[#001a33]">
                {role === "super_admin"
                  ? "Tidak membutuhkan afiliasi kampus"
                  : selectedCampus?.name || "Pilih kampus tujuan"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Untuk admin kampus dan admin prodi, afiliasi ini akan dipakai
                sebagai batas akses data dan scope operasional.
              </p>
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                Provisioning Note
              </p>
              <p className="mt-2 text-sm font-black text-[#001a33]">
                {isEdit
                  ? "Perubahan ini memperbarui akses user yang sudah aktif."
                  : "Akun baru akan dibuat mengikuti password default backend."}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-blue-900/75">
                Pastikan email valid dan role benar agar onboarding operator tidak
                perlu diulang setelah akun dibuat.
              </p>
            </div>
          </div>

          <div className="flex gap-4 xl:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="h-14 flex-1 rounded-xl bg-slate-100 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-16 flex-1 items-center justify-center gap-4 rounded-2xl bg-[#094E8B] text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 transition hover:bg-[#073e6f] disabled:opacity-50"
            >
              {loading ? (
                <CircleNotch className="animate-spin" size={20} />
              ) : (
                <>
                  <Check weight="bold" size={20} />
                  Simpan User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
