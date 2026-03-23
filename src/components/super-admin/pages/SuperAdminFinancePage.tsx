"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  getSuperAdminTopupsCollection,
  processTopup,
} from "../api";
import ControlHero from "../shared/ControlHero";
import type { TopupItem } from "../types";
import { formatCurrency, formatDate, getErrorMessage } from "../utils";
import ConfirmDialog from "../shared/ConfirmDialog";
import EmptyState from "../shared/EmptyState";
import LoadingState from "../shared/LoadingState";
import PageHeader from "../shared/PageHeader";
import SectionCard from "../shared/SectionCard";
import StatusBadge from "../shared/StatusBadge";

export default function SuperAdminFinancePage() {
  const [topups, setTopups] = useState<TopupItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [approveTarget, setApproveTarget] = useState<TopupItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TopupItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTopups = async () => {
    try {
      setLoading(true);
      const response = await getSuperAdminTopupsCollection();
      setTopups(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat data topup."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopups();
  }, []);

  const pendingTopups = useMemo(
    () => topups.filter((item) => item.status === "pending"),
    [topups],
  );

  const pendingTotalAmount = useMemo(
    () =>
      pendingTopups.reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [pendingTopups],
  );

  const handleProcess = async (target: TopupItem, action: "approve" | "reject") => {
    try {
      setActionLoading(true);
      await processTopup(target.id, action);
      toast.success(
        action === "approve"
          ? "Topup berhasil disetujui."
          : "Topup berhasil ditolak.",
      );
      setApproveTarget(null);
      setRejectTarget(null);
      await fetchTopups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memproses topup."));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Top Up & Saldo"
        description="Verifikasi antrean topup dan kelola aliran saldo mitra kampus."
        action={
          <button
            type="button"
            onClick={fetchTopups}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-[#001a33]"
          >
            <ArrowsClockwise size={18} weight="bold" />
            Refresh
          </button>
        }
      />

      <ControlHero
        badge="Transaction Queue"
        title="Verifikasi top up kampus dan jaga aliran saldo tetap sehat dari panel pusat."
        description="Halaman ini sekarang memakai pola control room yang sama dengan area system lain, jadi antrean top up, nominal tertunda, dan keputusan approve atau reject langsung terbaca dari atas."
        metrics={[
          {
            label: "Pending Requests",
            value: pendingTopups.length,
            description: "Request yang menunggu approval pusat.",
            tone: "default",
          },
          {
            label: "Pending Amount",
            value: formatCurrency(pendingTotalAmount),
            description: "Akumulasi nilai transaksi yang belum diproses.",
            tone: "accent",
          },
          {
            label: "Decision Flow",
            value: "Manual Review",
            description:
              "Super admin memutuskan approve atau reject langsung dari panel pusat.",
            tone: "success",
          },
        ]}
        aside={[
          {
            eyebrow: "Finance Snapshot",
            title: `${formatCurrency(pendingTotalAmount)} masih berada di antrean proses.`,
            description:
              "Ringkasan ini membantu operator membaca beban transaksi sebelum masuk ke daftar approval.",
          },
          {
            eyebrow: "Finance Tip",
            title:
              "Menjaga antrean top up tetap rendah akan membuat pengalaman kampus jauh lebih mulus.",
            description:
              "Setelah request diproses, saldo kampus ikut bergerak dan billing history menjadi lebih mudah diaudit.",
            tone: "amber",
          },
        ]}
      />

      <SectionCard>
        {loading ? (
          <LoadingState label="Memuat antrean topup..." />
        ) : pendingTopups.length === 0 ? (
          <EmptyState
            title="Tidak ada antrean topup"
            description="Semua request topup sudah diproses atau belum ada request baru."
          />
        ) : (
          <div className="space-y-4 p-6">
            {pendingTopups.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-5 rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-black text-[#001a33]">
                    {item.university?.name ?? item.university_name ?? "Kampus tidak diketahui"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <StatusBadge variant="amber">Pending</StatusBadge>
                    <span className="text-xs font-medium text-slate-400">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      Nominal
                    </p>
                    <p className="mt-1 text-lg font-black text-emerald-700">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setApproveTarget(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-emerald-700"
                    >
                      <CheckCircle size={18} weight="fill" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectTarget(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-rose-700"
                    >
                      <XCircle size={18} weight="fill" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={Boolean(approveTarget)}
        title="Setujui topup?"
        description={`Topup untuk ${approveTarget?.university?.name ?? approveTarget?.university_name ?? "kampus ini"} akan diproses dan saldo akan bertambah.`}
        confirmLabel="Ya, approve"
        loading={actionLoading}
        onConfirm={() => approveTarget && handleProcess(approveTarget, "approve")}
        onCancel={() => setApproveTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="Tolak topup?"
        description={`Topup untuk ${rejectTarget?.university?.name ?? rejectTarget?.university_name ?? "kampus ini"} akan ditolak.`}
        confirmLabel="Ya, reject"
        loading={actionLoading}
        onConfirm={() => rejectTarget && handleProcess(rejectTarget, "reject")}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
