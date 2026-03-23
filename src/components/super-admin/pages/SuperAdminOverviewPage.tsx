"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  Buildings,
  ChartBar,
  ChartLineUp,
  Money,
  SealCheck,
  Users,
  Wallet,
} from "@phosphor-icons/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { getSuperAdminOverviewCollection } from "../api";
import ControlHero from "../shared/ControlHero";
import LoadingState from "../shared/LoadingState";
import PageHeader from "../shared/PageHeader";
import StatCard from "../shared/StatCard";
import { formatCurrency, getErrorMessage } from "../utils";
import type { SuperAdminOverviewReport } from "../types";

const initialOverview: SuperAdminOverviewReport = {
  stats: {
    totalCampuses: 0,
    activeCampuses: 0,
    partnerCampuses: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingTopups: 0,
    totalConversions: 0,
    approvedConversions: 0,
    totalRevenue: 0,
  },
  growth: [],
  campus_heatmap: [],
  insights: {
    needs_attention: [],
    recent_topups: [],
    latest_conversions: [],
  },
};

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  if (!year || !month) return period;

  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function formatShortDate(dateString?: string) {
  if (!dateString) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateString));
}

export default function SuperAdminOverviewPage() {
  const [overview, setOverview] = useState<SuperAdminOverviewReport>(initialOverview);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const overviewResponse = await getSuperAdminOverviewCollection();
      setOverview(overviewResponse.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat dashboard."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOverview();
  }, []);

  const growthData = useMemo(() => overview.growth, [overview.growth]);

  const campusHeatmap = useMemo(
    () => overview.campus_heatmap,
    [overview.campus_heatmap],
  );

  const averageRevenuePerCampus = useMemo(() => {
    if (overview.stats.totalCampuses === 0) {
      return 0;
    }

    return Math.round(
      overview.stats.totalRevenue / overview.stats.totalCampuses,
    );
  }, [overview.stats.totalCampuses, overview.stats.totalRevenue]);

  const activeCampusRate = useMemo(() => {
    if (overview.stats.totalCampuses === 0) {
      return 0;
    }

    return Math.round(
      (overview.stats.activeCampuses / overview.stats.totalCampuses) * 100,
    );
  }, [overview.stats.activeCampuses, overview.stats.totalCampuses]);

  const approvalRate = useMemo(() => {
    if (overview.stats.totalConversions === 0) {
      return 0;
    }

    return Math.round(
      (overview.stats.approvedConversions / overview.stats.totalConversions) *
        100,
    );
  }, [overview.stats.approvedConversions, overview.stats.totalConversions]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Super Admin"
        description="Pantau keseluruhan aktivitas platform, pengguna, kampus, arus transaksi, dan performa jaringan mitra."
        action={
          <button
            type="button"
            onClick={fetchOverview}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-[#001a33]"
          >
            <ArrowsClockwise size={18} weight="bold" />
            Refresh
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Mengumpulkan ringkasan dashboard..." />
      ) : (
        <>
          <ControlHero
            badge="KonverPro Central"
            title="Command center untuk memantau jaringan kampus, transaksi, dan kualitas operasional platform."
            description="Seluruh overview utama dirangkum dalam satu control room agar prioritas transaksi, kampus partner, dan performa operasional langsung terbaca dalam satu layar."
            metrics={[
              {
                label: "Active Campus Rate",
                value: `${activeCampusRate}%`,
                description: "Kampus aktif dari seluruh institusi yang terdaftar.",
              },
              {
                label: "Conversion Approval",
                value: `${approvalRate}%`,
                description: "Rasio konversi yang sudah lolos approval di platform.",
              },
              {
                label: "Revenue Pulse",
                value: formatCurrency(overview.stats.totalRevenue),
                description:
                  "Akumulasi pendapatan yang sudah terbaca di pusat kontrol.",
                tone: "accent",
              },
            ]}
            aside={[
              {
                eyebrow: "Prioritas Cepat",
                title: `${overview.stats.pendingTopups} top up pending, ${overview.stats.partnerCampuses} kampus partner, ${overview.stats.activeUsers} user aktif.`,
                description:
                  "Ringkasan cepat ini membantu operator membaca kondisi pusat tanpa harus turun ke tabel atau chart lebih dulu.",
              },
              {
                eyebrow: "Central Insight",
                title:
                  overview.stats.pendingTopups > 0
                    ? "Ada antrean transaksi yang layak diprioritaskan hari ini."
                    : "Pusat kontrol sedang dalam kondisi relatif stabil.",
                description:
                  "Menjaga approval transaksi, kesehatan kampus partner, dan distribusi user tetap rapi akan membuat dashboard pusat ini benar-benar terasa seperti control room operasional.",
                tone: "amber",
              },
            ]}
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Kampus"
              value={overview.stats.totalCampuses}
              helper="Institusi terdaftar"
              icon={<Buildings size={22} weight="bold" />}
            />
            <StatCard
              label="Total Pengguna"
              value={overview.stats.totalUsers}
              helper="Admin aktif platform"
              icon={<Users size={22} weight="bold" />}
            />
            <StatCard
              label="Top Up Antrean"
              value={overview.stats.pendingTopups}
              helper="Menunggu approval"
              icon={<Money size={22} weight="bold" />}
            />
            <StatCard
              label="Total Revenue"
              value={formatCurrency(overview.stats.totalRevenue)}
              helper="Akumulasi pendapatan"
              icon={<ChartBar size={22} weight="bold" />}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <SealCheck size={22} weight="duotone" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Official Partner
              </p>
              <p className="mt-2 text-3xl font-black text-[#001a33]">
                {overview.stats.partnerCampuses}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {overview.stats.totalCampuses > 0
                  ? `${Math.round((overview.stats.partnerCampuses / overview.stats.totalCampuses) * 100)}% dari total kampus`
                  : "Belum ada kampus terdaftar"}
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Wallet size={22} weight="duotone" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Revenue / Kampus
              </p>
              <p className="mt-2 text-3xl font-black text-[#001a33]">
                {formatCurrency(averageRevenuePerCampus)}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Estimasi rerata berbasis total kampus aktif saat ini.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-[#001a33] p-6 text-white shadow-xl shadow-brand-900/15">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-accent-500">
                <ChartLineUp size={22} weight="duotone" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Total Konversi
              </p>
              <p className="mt-2 text-3xl font-black">
                {overview.stats.totalConversions}
              </p>
              <p className="mt-2 text-sm text-white/60">
                Semua data konversi yang terpantau oleh pusat kontrol.
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <ChartLineUp size={22} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#001a33]">
                    Tren Pertumbuhan
                  </h3>
                  <p className="text-sm text-slate-400">
                    Visualisasi pertumbuhan revenue per periode dari data yang
                    berhasil dikumpulkan.
                  </p>
                </div>
              </div>

              <div className="h-80">
                {growthData.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                    Belum ada data growth yang bisa divisualisasikan.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="overviewRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#094E8B" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#094E8B" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="period"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#64748b", fontWeight: 700 }}
                        tickFormatter={formatPeriod}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#64748b", fontWeight: 700 }}
                        tickFormatter={(value: number) => `${Math.round(value / 1_000_000)}jt`}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value ?? 0))}
                        labelFormatter={(value) => formatPeriod(String(value))}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#094E8B"
                        strokeWidth={3}
                        fill="url(#overviewRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Buildings size={22} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#001a33]">
                    Heatmap Performa Kampus
                  </h3>
                  <p className="text-sm text-slate-400">
                    Skor komposit dari konversi, partner status, saldo, dan
                    antrean top up.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {campusHeatmap.length === 0 ? (
                  <div className="flex min-h-[320px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                    Data kampus belum cukup untuk membentuk heatmap.
                  </div>
                ) : (
                  campusHeatmap.map((campus) => (
                    <div
                      key={campus.id}
                      className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#001a33]">
                            {campus.name}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                              {campus.statusLabel}
                            </span>
                            {campus.isPartner ? (
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">
                                Partner
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                            Skor
                          </p>
                          <p className="text-lg font-black text-brand-900">
                            {campus.score}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[#094E8B] via-[#0f6ab8] to-[#FDD824]"
                          style={{ width: `${campus.score}%` }}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl bg-white px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Konversi
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-800">
                            {campus.conversions}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Saldo
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-800">
                            {campus.balance > 0
                              ? formatCurrency(campus.balance)
                              : "Rp 0"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Pending
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-800">
                            {campus.pendingTopups}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <ChartBar size={22} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#001a33]">
                    Prioritas Operasional
                  </h3>
                  <p className="text-sm text-slate-400">
                    Kampus yang perlu segera ditindaklanjuti oleh super admin.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {overview.insights.needs_attention.length === 0 ? (
                  <div className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                    Tidak ada kampus yang masuk prioritas perhatian saat ini.
                  </div>
                ) : (
                  overview.insights.needs_attention.map((campus) => (
                    <div
                      key={campus.id}
                      className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-[#001a33]">
                            {campus.name}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {campus.reasons.map((reason) => (
                              <span
                                key={`${campus.id}-${reason}`}
                                className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-rose-50 px-3 py-2 text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-500">
                            Prioritas
                          </p>
                          <p className="mt-1 text-sm font-black text-rose-700">
                            {campus.priority}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Money size={22} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#001a33]">
                    Aktivitas Terkini
                  </h3>
                  <p className="text-sm text-slate-400">
                    Ringkasan top up dan konversi terbaru yang masuk ke pusat kontrol.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Top Up Terbaru
                  </p>
                  <div className="space-y-3">
                    {overview.insights.recent_topups.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-400">
                        Belum ada aktivitas top up terbaru.
                      </div>
                    ) : (
                      overview.insights.recent_topups.slice(0, 4).map((topup) => (
                        <div
                          key={topup.id}
                          className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-slate-100 bg-slate-50/70 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#001a33]">
                              {topup.university?.name || "Kampus"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {topup.trx_id || topup.id} • {formatShortDate(topup.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-600">
                              {formatCurrency(topup.amount)}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                              {topup.status}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Konversi Terbaru
                  </p>
                  <div className="space-y-3">
                    {overview.insights.latest_conversions.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-400">
                        Belum ada aktivitas konversi terbaru.
                      </div>
                    ) : (
                      overview.insights.latest_conversions.slice(0, 4).map((conversion) => (
                        <div
                          key={conversion.id}
                          className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-slate-100 bg-slate-50/70 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#001a33]">
                              {conversion.student_name || "Mahasiswa"} •{" "}
                              {conversion.university_name || "Kampus"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {conversion.study_program_name || "Program Studi"} •{" "}
                              {formatShortDate(conversion.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-brand-900">
                              {conversion.total_sks_accepted ?? 0} SKS
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                              {conversion.status || "unknown"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
