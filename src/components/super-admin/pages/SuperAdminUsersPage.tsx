"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  Buildings,
  IdentificationBadge,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  Trash,
  Users,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  deleteSuperAdminUser,
  getSuperAdminCampusesCollection,
  getSuperAdminUsersCollection,
} from "../api";
import ConfirmDialog from "../shared/ConfirmDialog";
import ControlHero from "../shared/ControlHero";
import EmptyState from "../shared/EmptyState";
import LoadingState from "../shared/LoadingState";
import PageHeader from "../shared/PageHeader";
import SectionCard from "../shared/SectionCard";
import StatusBadge from "../shared/StatusBadge";
import type { AdminUser, University } from "../types";
import { getErrorMessage } from "../utils";
import UserFormModal from "../users/UserFormModal";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [campuses, setCampuses] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, campusesResponse] = await Promise.all([
        getSuperAdminUsersCollection(),
        getSuperAdminCampusesCollection(),
      ]);
      setUsers(usersResponse.data);
      setCampuses(campusesResponse.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat data pengguna."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) =>
      [user.name, user.email, user.role, user.university?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [query, users]);

  const userSummary = useMemo(
    () => ({
      superAdmins: users.filter((user) => user.role === "super_admin").length,
      campusAdmins: users.filter((user) => user.role === "campus_admin").length,
      prodiAdmins: users.filter((user) => user.role === "prodi_admin").length,
    }),
    [users],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await deleteSuperAdminUser(deleteTarget.id);
      toast.success("Akses user berhasil dicabut.");
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus user."));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manajemen Akses & Pengguna"
        description="Kelola kredensial dan hak akses seluruh administrator platform."
        action={
          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <button
              type="button"
              onClick={fetchData}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-[#001a33]"
            >
              <ArrowsClockwise size={18} weight="bold" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setFormOpen(true);
              }}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl bg-[#094E8B] px-8 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/10 transition hover:bg-[#073e6f]"
            >
              <Plus weight="bold" />
              Tambah Administrator
            </button>
          </div>
        }
      />

      <ControlHero
        badge="Access Control"
        title="Atur siapa yang mengelola platform pusat, kampus, dan prodi dari satu pusat akses."
        description="Halaman ini saya selaraskan ke pola control room yang sama, sehingga role pengguna, afiliasi institusi, dan tindakan edit atau hapus langsung terbaca dari bagian teratas."
        metrics={[
          {
            label: "Super Admin",
            value: userSummary.superAdmins,
            description: "Pengelola pusat dengan kontrol global.",
          },
          {
            label: "Admin Kampus",
            value: userSummary.campusAdmins,
            description: "Operator institusi yang mengelola workflow kampus.",
            tone: "accent",
          },
          {
            label: "Admin Prodi",
            value: userSummary.prodiAdmins,
            description: "Role akademik untuk level program studi.",
          },
        ]}
        aside={[
          {
            eyebrow: "User Coverage",
            title: `${users.length} akun administrator aktif tercatat di ekosistem saat ini.`,
            description:
              "Ringkasan ini membantu membaca skala akses sebelum operator masuk ke filter dan tabel pengguna.",
          },
          {
            eyebrow: "Access Tip",
            title: "Pastikan role dan afiliasi user tetap presisi agar jalur portal tidak membingungkan.",
            description:
              "Struktur role yang rapi mempermudah login portal dan pemisahan akses kampus versus pusat.",
            tone: "amber",
          },
        ]}
      />

      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <MagnifyingGlass
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, email, role, atau afiliasi..."
            className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-200"
          />
        </div>
        <p className="text-sm text-slate-400">
          Total pengguna: <span className="font-bold text-[#001a33]">{filteredUsers.length}</span>
        </p>
      </div>

      <SectionCard>
        {loading ? (
          <LoadingState label="Memetakan pengguna..." />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="Belum ada data pengguna"
            description="Data user super admin atau admin kampus belum tersedia."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Identitas User
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Level Akses
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Afiliasi Institusi
                  </th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-slate-50/30"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white text-slate-400 transition-colors group-hover:border-blue-900">
                          <Users
                            size={24}
                            weight="duotone"
                            className="transition-colors group-hover:text-blue-900"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#001a33]">
                            {user.name}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      {user.role === "super_admin" ? (
                        <StatusBadge variant="purple">
                          <ShieldCheck weight="fill" />
                          Super Admin
                        </StatusBadge>
                      ) : user.role === "prodi_admin" ? (
                        <StatusBadge variant="amber">
                          <ShieldCheck weight="fill" />
                          Admin Prodi
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="blue">
                          <ShieldCheck weight="fill" />
                          Admin Kampus
                        </StatusBadge>
                      )}
                    </td>

                    <td className="px-8 py-6 text-sm font-bold text-slate-500">
                      {user.university ? (
                        <div className="flex items-center gap-2">
                          <Buildings
                            size={16}
                            weight="duotone"
                            className="text-slate-300"
                          />
                          <span>{user.university.name}</span>
                        </div>
                      ) : (
                        <p className="font-medium italic text-slate-300">
                          Global Platform Admin
                        </p>
                      )}
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setFormOpen(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-amber-200 hover:text-amber-500"
                        >
                          <IdentificationBadge size={20} weight="bold" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-rose-200 hover:text-rose-500"
                        >
                          <Trash size={20} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchData}
        campuses={campuses}
        initialData={selectedUser}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Cabut akses user?"
        description={`Anda akan menghapus akses untuk ${deleteTarget?.name ?? "user ini"}. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, hapus"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
