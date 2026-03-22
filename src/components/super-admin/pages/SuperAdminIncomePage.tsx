"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowsClockwise, ChartBar, GraduationCap, Lightning } from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { getRevenueReport } from "../api";
import type { RevenueChartItem, RevenueReport } from "../types";
import { formatCurrency, getErrorMessage } from "../utils";
import LoadingState from "../shared/LoadingState";
import PageHeader from "../shared/PageHeader";
import SectionCard from "../shared/SectionCard";
import StatCard from "../shared/StatCard";

const initialReport: RevenueReport = {
  chart: [],
  summary: {
    total_conversions: 0,
    total_internal: 0,
    total_lead: 0,
    total_revenue: 0,
  },
};

interface RevenueBucket {
  period: string;
  total: number;
  topup: number;
  conversion_fee: number;
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  if (!year || !month) return period;

  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function buildChartBuckets(items: RevenueChartItem[]): RevenueBucket[] {
  const grouped = new Map<string, RevenueBucket>();

  items.forEach((item) => {
    const current = grouped.get(item.period) ?? {
      period: item.period,
      total: 0,
      topup: 0,
      conversion_fee: 0,
    };

    current.total += item.total ?? 0;
    if (item.type === "topup") {
      current.topup += item.total ?? 0;
    }
    if (item.type === "conversion_fee") {
      current.conversion_fee += item.total ?? 0;
    }

    grouped.set(item.period, current);
  });

  return [...grouped.values()]
    .sort((left, right) => left.period.localeCompare(right.period))
    .slice(-6);
}

export default function SuperAdminIncomePage() {
  const [report, setReport] = useState<RevenueReport>(initialReport);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getRevenueReport();
      setReport(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat report pemasukan."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const chartData = useMemo(() => buildChartBuckets(report.chart), [report.chart]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Report Pemasukan"
        description="Pantau distribusi revenue global dari transaksi conversion fee dan top up kampus."
        action={
          <button
            type="button"
            onClick={fetchReport}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-[#001a33]"
          >
            <ArrowsClockwise size={18} weight="bold" />
            Refresh
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Memuat report pemasukan..." />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              label="Total Pemasukan"
              value={formatCurrency(report.summary.total_revenue)}
              helper="Akumulasi seluruh revenue tercatat"
              icon={<ChartBar size={22} weight="bold" />}
            />
            <StatCard
              label="Internal Conversion"
              value={report.summary.total_internal}
              helper="Total konversi kampus subsidi"
              icon={<GraduationCap size={22} weight="bold" />}
            />
            <StatCard
              label="Lead Generation"
              value={report.summary.total_lead}
              helper="Total konversi kampus independent"
              icon={<Lightning size={22} weight="bold" />}
            />
          </div>

          <SectionCard title="Distribusi Revenue 6 Periode Terakhir">
            <div className="h-80 px-4 py-6 sm:px-8">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Belum ada data revenue yang bisa divisualisasikan.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
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
                        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Bar dataKey="topup" fill="#094E8B" radius={[8, 8, 0, 0]} maxBarSize={34} />
                    <Bar dataKey="conversion_fee" fill="#FDD824" radius={[8, 8, 0, 0]} maxBarSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Ringkasan Revenue Mentah">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Periode
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Tipe
                    </th>
                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {report.chart.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-16 text-center text-sm text-slate-400">
                        Belum ada transaksi sukses untuk dilaporkan.
                      </td>
                    </tr>
                  ) : (
                    report.chart.map((item) => (
                      <tr key={`${item.period}-${item.type}`}>
                        <td className="px-8 py-6 text-sm font-black text-[#001a33]">
                          {formatPeriod(item.period)}
                        </td>
                        <td className="px-8 py-6 text-sm font-medium capitalize text-slate-500">
                          {item.type.replaceAll("_", " ")}
                        </td>
                        <td className="px-8 py-6 text-right text-sm font-black text-emerald-700">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
