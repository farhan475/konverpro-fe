"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  Bell,
  ChatsCircle,
  EnvelopeSimple,
  Lightning,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  deleteNotificationTemplate,
  getNotificationTemplates,
} from "../api";
import ConfirmDialog from "../shared/ConfirmDialog";
import EmptyState from "../shared/EmptyState";
import LoadingState from "../shared/LoadingState";
import PageHeader from "../shared/PageHeader";
import SectionCard from "../shared/SectionCard";
import StatusBadge from "../shared/StatusBadge";
import { formatDate, getErrorMessage } from "../utils";
import type { NotificationTemplateItem } from "../types";
import NotificationTemplateFormModal from "../notifications/NotificationTemplateFormModal";

export default function SuperAdminNotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplateItem | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<NotificationTemplateItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getNotificationTemplates();
      setTemplates(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat template notifikasi."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return templates;

    return templates.filter((item) =>
      [item.name, item.trigger, item.subject, item.body]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [templates, query]);

  const templateSummary = useMemo(() => {
    const topupTemplates = templates.filter((item) =>
      item.trigger.toLowerCase().includes("topup"),
    ).length;
    const conversionTemplates = templates.filter((item) => {
      const trigger = item.trigger.toLowerCase();
      return (
        trigger.includes("conversion") ||
        trigger.includes("konversi") ||
        trigger.includes("document")
      );
    }).length;
    const emailTemplates = templates.filter((item) => {
      const trigger = item.trigger.toLowerCase();
      return trigger.includes("mail") || trigger.includes("email");
    }).length;

    return {
      total: templates.length,
      topupTemplates,
      conversionTemplates,
      emailTemplates,
    };
  }, [templates]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await deleteNotificationTemplate(deleteTarget.id);
      toast.success("Template notifikasi berhasil dihapus.");
      setDeleteTarget(null);
      fetchTemplates();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus template."));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Template Notifikasi"
        description="Kelola template email, WhatsApp, dan notifikasi sistem."
        action={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchTemplates}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-[#001a33]"
            >
              <ArrowsClockwise size={18} weight="bold" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTemplate(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center gap-3 rounded-2xl bg-[#094E8B] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/10 transition hover:bg-[#073e6f]"
            >
              <Plus weight="bold" />
              Tambah Template
            </button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-[2.25rem] bg-[#001a33] p-7 text-white shadow-2xl shadow-brand-900/10">
          <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
                  Message Control
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                  Backend Active
                </span>
              </div>
          <h3 className="mt-4 text-3xl font-black tracking-tight">
            Notification orchestration untuk top up, konversi, dan follow-up
            operasional.
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
            Halaman ini saya rapikan supaya lebih terasa seperti message command
            center. Operator sekarang lebih mudah membaca coverage trigger dan
            kondisi data aktif.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <EnvelopeSimple size={20} className="text-blue-200" weight="bold" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    Email Ready
                  </p>
                  <p className="text-lg font-black text-white">
                    {templateSummary.emailTemplates}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-amber-200" weight="bold" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    Top Up Flow
                  </p>
                  <p className="text-lg font-black text-white">
                    {templateSummary.topupTemplates}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <ChatsCircle size={20} className="text-emerald-200" weight="bold" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    Conversion Flow
                  </p>
                  <p className="text-lg font-black text-white">
                    {templateSummary.conversionTemplates}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Coverage Saat Ini
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Total Template
                </p>
                <p className="mt-2 text-2xl font-black text-[#001a33]">
                  {templateSummary.total}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Filter Aktif
                </p>
                <p className="mt-2 text-2xl font-black text-[#001a33]">
                  {filteredTemplates.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#094E8B] shadow-sm">
                <Lightning size={20} weight="bold" />
              </div>
              <div>
                <p className="text-sm font-black text-[#001a33]">
                  Saran penataan template
                </p>
                <p className="text-xs leading-relaxed text-blue-900/75">
                  Pisahkan trigger top up, onboarding kampus, dan konversi agar
                  operator lebih mudah audit copywriting per flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <MagnifyingGlass
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, trigger, atau subject..."
            className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-200"
          />
        </div>

        <p className="text-sm text-slate-400">
          Total template:{" "}
          <span className="font-bold text-[#001a33]">
            {filteredTemplates.length}
          </span>
        </p>
      </div>

      <SectionCard>
        {loading ? (
          <LoadingState label="Memuat template notifikasi..." />
        ) : filteredTemplates.length === 0 ? (
          <EmptyState
            title="Belum ada template notifikasi"
            description="Tambahkan template baru untuk notifikasi email, WhatsApp, atau sistem."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Template
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Trigger
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Update
                  </th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTemplates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30">
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400">
                          <Bell size={22} weight="duotone" />
                        </div>
                        <div className="max-w-[420px]">
                          <p className="text-sm font-black text-[#001a33]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {item.trigger}
                          </p>
                          <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                            Subject: {item.subject}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <StatusBadge variant="blue">{item.trigger}</StatusBadge>
                    </td>

                    <td className="px-8 py-6 text-sm font-medium text-slate-500">
                      {formatDate(item.updated_at)}
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplate(item);
                            setFormOpen(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-amber-200 hover:text-amber-500"
                        >
                          <PencilSimple size={18} weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-rose-200 hover:text-rose-500"
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

      <NotificationTemplateFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchTemplates}
        initialData={selectedTemplate}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus template?"
        description={`Template ${deleteTarget?.name ?? "-"} akan dihapus dari sistem.`}
        confirmLabel="Ya, hapus"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
