"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  CheckCircle,
  Money,
  Wallet,
  XCircle,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  getSuperAdminTopupsCollection,
  processTopup,
} from "../api";
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

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-[#031f37] p-8 text-white shadow-[0_28px_80px_rgba(3,31,55,0.22)] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(253,216,36,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.14),_transparent_30%)]" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
              Transaction Queue
            </p>
            <h3 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-white lg:text-4xl">
              Verifikasi top up kampus dan jaga aliran saldo tetap sehat dari
              panel pusat.
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              Halaman ini saya buat lebih terasa seperti control room keuangan:
              antrean top up, nominal tertunda, dan aksi approve/reject langsung
              terbaca dari atas.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Pending Requests
                </p>
                <p className="mt-3 text-4xl font-black text-white">
                  {pendingTopups.length}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Request yang menunggu approval pusat.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Pending Amount
                </p>
                <p className="mt-3 text-2xl font-black text-amber-300">
                  {formatCurrency(pendingTotalAmount)}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Akumulasi nilai transaksi yang belum diproses.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Decision Flow
                </p>
                <p className="mt-3 text-2xl font-black text-white">Manual Review</p>
                <p className="mt-2 text-sm text-white/60">
                  Super admin memutuskan approve atau reject langsung dari panel pusat.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Finance Snapshot
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Wallet weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#001a33]">
                    Nominal tertunda
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {formatCurrency(pendingTotalAmount)} masih berada di antrean proses.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Money weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#001a33]">
                    Keputusan cepat
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Approve dan reject sekarang tampil lebih jelas untuk kerja operasional harian.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-amber-100 bg-amber-50/70 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Finance Tip
            </p>
            <h4 className="mt-3 text-xl font-black tracking-tight text-[#001a33]">
              Menjaga antrean top up tetap rendah akan membuat pengalaman kampus jauh lebih mulus.
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Setelah request diproses, saldo kampus ikut bergerak dan billing history menjadi lebih mudah diaudit.
            </p>
          </div>
        </div>
      </section>

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
