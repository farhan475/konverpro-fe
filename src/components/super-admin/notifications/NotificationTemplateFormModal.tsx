"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BracketsCurly,
  ChatsCircle,
  Check,
  CircleNotch,
  EnvelopeSimple,
  Lightning,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  createNotificationTemplate,
  updateNotificationTemplate,
} from "../api";
import type { NotificationTemplateItem } from "../types";
import { getErrorMessage } from "../utils";

interface NotificationTemplateFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: NotificationTemplateItem | null;
}

export default function NotificationTemplateFormModal({
  open,
  onClose,
  onSuccess,
  initialData,
}: NotificationTemplateFormModalProps) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const placeholderTokens = useMemo(
    () => [
      "{{campus_name}}",
      "{{student_name}}",
      "{{program_name}}",
      "{{topup_amount}}",
      "{{trx_id}}",
    ],
    [],
  );

  const isEdit = useMemo(() => Boolean(initialData), [initialData]);
  const triggerMeta = useMemo(() => {
    const normalized = trigger.toLowerCase();

    if (normalized.includes("topup")) {
      return {
        label: "Top Up Flow",
        description: "Dipakai untuk approval, rejection, atau reminder pembayaran saldo kampus.",
        accent: "text-amber-200",
        icon: Bell,
      };
    }

    if (normalized.includes("wa") || normalized.includes("whatsapp")) {
      return {
        label: "WhatsApp Delivery",
        description: "Gunakan copy yang singkat, jelas, dan langsung ke aksi berikutnya.",
        accent: "text-emerald-200",
        icon: ChatsCircle,
      };
    }

    if (
      normalized.includes("mail") ||
      normalized.includes("email") ||
      Boolean(subject.trim())
    ) {
      return {
        label: "Email Delivery",
        description: "Cocok untuk copy yang butuh subject kuat dan isi pesan lebih panjang.",
        accent: "text-blue-200",
        icon: EnvelopeSimple,
      };
    }

    return {
      label: "System Event",
      description: "Template umum untuk trigger platform, onboarding, dan event internal.",
      accent: "text-slate-200",
      icon: Lightning,
    };
  }, [subject, trigger]);

  useEffect(() => {
    if (!open) return;

    setName(initialData?.name ?? "");
    setTrigger(initialData?.trigger ?? "");
    setSubject(initialData?.subject ?? "");
    setBody(initialData?.body ?? "");
  }, [initialData, open]);

  if (!open) return null;

  const TriggerIcon = triggerMeta.icon;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      name,
      trigger,
      subject,
      body,
    };

    try {
      if (isEdit && initialData) {
        await updateNotificationTemplate(initialData.id, payload);
        toast.success("Template notifikasi berhasil diperbarui.");
      } else {
        await createNotificationTemplate(payload);
        toast.success("Template notifikasi berhasil dibuat.");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan template notifikasi."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white shadow-2xl">
        <div className="bg-[#001a33] px-10 py-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
                  Messaging Studio
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                  {triggerMeta.label}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-black tracking-tight">
                {isEdit ? "Update" : "Buat"} Template Notifikasi
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Rapikan trigger, subject, dan body pesan dalam satu composer
                agar flow notifikasi kampus lebih mudah diaudit.
              </p>
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
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Delivery Type
              </p>
              <p className={`mt-2 text-sm font-black ${triggerMeta.accent}`}>
                {triggerMeta.label}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Trigger
              </p>
              <p className="mt-2 text-sm font-black text-white">
                {trigger || "Belum ditentukan"}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Composer Mode
              </p>
              <p className="mt-2 text-sm font-black text-white">
                {isEdit ? "Update existing copy" : "Create new automation copy"}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 bg-slate-50 p-10 xl:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#094E8B]">
                  <TriggerIcon size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Metadata Template
                  </p>
                  <p className="text-sm font-black text-[#001a33]">
                    Identitas dan trigger utama
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Nama Template
                  </label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold"
                    placeholder="Contoh: Topup Approved"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Trigger
                  </label>
                  <input
                    value={trigger}
                    onChange={(event) => setTrigger(event.target.value)}
                    required
                    className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold"
                    placeholder="Contoh: topup_approved"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold"
                  placeholder="Subjek email"
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ChatsCircle size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Body Composer
                  </p>
                  <p className="text-sm font-black text-[#001a33]">
                    Isi pesan untuk channel yang dipilih
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Isi Pesan
                </label>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  required
                  rows={12}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-medium outline-none"
                  placeholder="Isi body template notifikasi..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#094E8B] shadow-sm">
                  <BracketsCurly size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                    Placeholder Cepat
                  </p>
                  <p className="text-sm font-black text-[#001a33]">
                    Sisipkan variabel dinamis ke body
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {placeholderTokens.map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() =>
                      setBody(
                        (current) => `${current}${current ? " " : ""}${token}`,
                      )
                    }
                    className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-[#001a33]">
                  <TriggerIcon size={20} weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Flow Context
                  </p>
                  <p className="text-sm font-black text-[#001a33]">
                    {triggerMeta.label}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {triggerMeta.description}
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Preview Template
              </p>
              <div className="space-y-3 rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Subject
                </p>
                <p className="text-sm font-black text-[#001a33]">
                  {subject || "Subjek email / notifikasi akan tampil di sini"}
                </p>
                <div className="border-t border-slate-100 pt-3">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Body
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {body ||
                      "Isi pesan template akan tampil sebagai preview di area ini."}
                  </p>
                </div>
              </div>
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
                  Simpan Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
