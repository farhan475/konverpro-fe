"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  Buildings,
  GearSix,
  MagnifyingGlass,
  Money,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  deleteSuperAdminCampus,
  getSuperAdminCampusesCollection,
  getSuperAdminTopupsCollection,
  getSuperAdminUsersCollection,
} from "../api";
import type { AdminUser, TopupItem, University } from "../types";
import { formatCurrency, getErrorMessage } from "../utils";
import CampusManagementModal from "../campuses/CampusManagementModal";
import CampusFormModal from "../campuses/CampusFormModal";
import AdjustBalanceModal from "../campuses/AdjustBalanceModal";
import ConfirmDialog from "../shared/ConfirmDialog";
import ControlHero from "../shared/ControlHero";
import EmptyState from "../shared/EmptyState";
import LoadingState from "../shared/LoadingState";
import PageHeader from "../shared/PageHeader";
import SectionCard from "../shared/SectionCard";

export default function SuperAdminCampusesPage() {
  const [campuses, setCampuses] = useState<University[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [topups, setTopups] = useState<TopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [manageKey, setManageKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<University | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [manageCampus, setManageCampus] = useState<University | null>(null);

  const [balanceOpen, setBalanceOpen] = useState(false);
  const [balanceCampus, setBalanceCampus] = useState<University | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<University | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCampuses = async () => {
    try {
      setLoading(true);
      const [campusesResponse, usersResponse, topupsResponse] =
        await Promise.all([
          getSuperAdminCampusesCollection(),
          getSuperAdminUsersCollection(),
          getSuperAdminTopupsCollection(),
        ]);

      setCampuses(campusesResponse.data);
      setUsers(usersResponse.data);
      setTopups(topupsResponse.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat data kampus."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  const filteredCampuses = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return campuses;

    return campuses.filter((campus) =>
      [
        campus.name,
        campus.settings?.email,
        campus.settings?.plan,
        campus.status,
        campus.is_partner ? "partner" : "non-partner",
        campus.status ?? (campus.is_active ? "active" : "pending"),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [campuses, query]);

  const campusSummary = useMemo(
    () => ({
      active: campuses.filter((campus) => campus.is_active).length,
      partners: campuses.filter((campus) => campus.is_partner).length,
      balance: campuses.reduce((sum, campus) => sum + Number(campus.balance), 0),
      pendingTopups: topups.filter((topup) => topup.status === "pending").length,
    }),
    [campuses, topups],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await deleteSuperAdminCampus(deleteTarget.id);
      toast.success("Kampus berhasil dihapus.");
      setDeleteTarget(null);
      await fetchCampuses();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus kampus."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCampusStatus = (campus: University) =>
    campus.status === "active" ||
    campus.status === "pending" ||
    campus.status === "suspended"
      ? campus.status
      : campus.is_active
        ? "active"
        : "pending";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manajemen Kampus"
        description="Kelola daftar institusi, lokasi, dan penyesuaian saldo mitra."
        action={
          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <button
              type="button"
              onClick={fetchCampuses}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-[#001a33]"
            >
              <ArrowsClockwise size={18} weight="bold" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCampus(null);
                setFormOpen(true);
              }}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl bg-[#094E8B] px-8 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/10 transition hover:bg-[#073e6f]"
            >
              <Plus weight="bold" />
              Tambah Kampus
            </button>
          </div>
        }
      />

      <ControlHero
        badge="Campus Network"
        title="Pantau kesehatan mitra kampus, status partner, dan saldo institusi dari satu panel kontrol."
        description="Area ini saya seragamkan ke pola control room yang sama dengan halaman super admin lain, jadi status kampus, aksi saldo, dan proses manajemen institusi langsung terbaca dari bagian atas."
        metrics={[
          {
            label: "Active Campuses",
            value: campusSummary.active,
            description: "Institusi dengan status aktif di platform.",
          },
          {
            label: "Official Partner",
            value: campusSummary.partners,
            description: "Kampus yang sudah masuk skema partner resmi.",
            tone: "accent",
          },
          {
            label: "Portfolio Balance",
            value: formatCurrency(campusSummary.balance),
            description: "Total saldo yang sedang tersebar di jaringan kampus.",
            tone: "success",
          },
        ]}
        aside={[
          {
            eyebrow: "Pending Queue",
            title: `${campusSummary.pendingTopups} permintaan saldo masih menunggu keputusan pusat.`,
            description:
              "Antrean top up membantu membaca kampus mana yang butuh atensi sebelum operator turun ke tabel detail.",
          },
          {
            eyebrow: "Mitra Insight",
            title: "Gunakan tombol kelola dan adjust saldo untuk menjaga kampus tetap sehat secara operasional.",
            description:
              "Tabel di bawah tetap menjadi pusat aksi, tetapi ringkasan ini mempercepat pembacaan kondisi jaringan kampus secara keseluruhan.",
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
            placeholder="Cari nama kampus, email PIC, atau paket..."
            className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-200"
          />
        </div>

        <p className="text-sm text-slate-400">
          Total kampus:{" "}
          <span className="font-bold text-[#001a33]">
            {filteredCampuses.length}
          </span>
        </p>
      </div>

      <SectionCard>
        {loading ? (
          <LoadingState label="Memuat data kampus..." />
        ) : filteredCampuses.length === 0 ? (
          <EmptyState
            title="Belum ada data kampus"
            description="Data kampus tidak ditemukan atau belum tersedia."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Institusi
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Paket & PIC
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Saldo
                  </th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCampuses.map((campus) => (
                  <tr
                    key={campus.id}
                    className="group transition-colors hover:bg-slate-50/30"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400">
                          <Buildings size={24} weight="duotone" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#001a33]">
                            {campus.name}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                            {campus.conversions_count ?? 0} total konversi
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-sm font-bold text-slate-500">
                      <div className="space-y-2">
                        <p>{campus.settings?.plan ?? "Paket belum diatur"}</p>
                        <p className="text-xs font-medium text-slate-400">
                          {campus.settings?.email ?? "Email PIC belum tersedia"}
                        </p>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            getCampusStatus(campus) === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : getCampusStatus(campus) === "suspended"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {getCampusStatus(campus) === "active"
                            ? "Active"
                            : getCampusStatus(campus) === "suspended"
                              ? "Suspended"
                              : "Pending"}
                        </span>
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            campus.is_partner
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {campus.is_partner ? "Official Partner" : "Regular"}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                        {formatCurrency(campus.balance)}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setManageCampus(campus);
                            setManageKey((current) => current + 1);
                            setManageOpen(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
                          title="Kelola detail kampus"
                        >
                          <GearSix size={18} weight="bold" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCampus(campus);
                            setFormOpen(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-amber-200 hover:text-amber-500"
                          title="Edit kampus"
                        >
                          <PencilSimple size={18} weight="bold" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBalanceCampus(campus);
                            setBalanceOpen(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600"
                          title="Adjust saldo"
                        >
                          <Money size={18} weight="bold" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(campus)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-rose-200 hover:text-rose-500"
                          title="Hapus kampus"
                        >
                          <Trash size={18} weight="bold" />
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

      <CampusFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchCampuses}
        initialData={selectedCampus}
      />

      <CampusManagementModal
        key={manageKey}
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        onSuccess={fetchCampuses}
        campus={manageCampus}
        users={users}
        topups={topups}
      />

      <AdjustBalanceModal
        open={balanceOpen}
        onClose={() => setBalanceOpen(false)}
        onSuccess={fetchCampuses}
        campus={balanceCampus}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus kampus?"
        description={`Anda akan menghapus ${deleteTarget?.name ?? "kampus ini"} dari sistem.`}
        confirmLabel="Ya, hapus"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
