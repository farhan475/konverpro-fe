"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-3 rounded-2xl bg-[#094E8B] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/10 transition hover:bg-[#073e6f]"
          >
            <Plus weight="bold" />
            Tambah Administrator
          </button>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-[#031f37] p-8 text-white shadow-[0_28px_80px_rgba(3,31,55,0.22)] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(253,216,36,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.14),_transparent_30%)]" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
              Access Control
            </p>
            <h3 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-white lg:text-4xl">
              Atur siapa yang mengelola platform pusat, kampus, dan prodi dari
              satu pusat akses.
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              Halaman ini saya arahkan menjadi panel otorisasi yang lebih jelas:
              role pengguna, afiliasi institusi, dan tindakan edit/hapus langsung
              terbaca dari atas.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Super Admin
                </p>
                <p className="mt-3 text-4xl font-black text-white">
                  {userSummary.superAdmins}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Pengelola pusat dengan kontrol global.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Admin Kampus
                </p>
                <p className="mt-3 text-4xl font-black text-amber-300">
                  {userSummary.campusAdmins}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Operator institusi yang mengelola workflow kampus.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Admin Prodi
                </p>
                <p className="mt-3 text-4xl font-black text-white">
                  {userSummary.prodiAdmins}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Role akademik untuk level program studi.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              User Coverage
            </p>
            <p className="mt-4 text-3xl font-black text-[#001a33]">
              {users.length}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Total akun administrator yang saat ini tercatat di seluruh ekosistem.
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-amber-100 bg-amber-50/70 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Access Tip
            </p>
            <h4 className="mt-3 text-xl font-black tracking-tight text-[#001a33]">
              Pastikan role dan afiliasi user tetap presisi agar jalur portal tidak membingungkan.
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Struktur role yang rapi akan mempermudah login portal dan
              pemisahan akses kampus vs pusat.
            </p>
          </div>
        </div>
      </section>

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
