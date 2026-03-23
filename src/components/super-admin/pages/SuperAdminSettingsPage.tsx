"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  Check,
  CircleNotch,
  ShieldCheck,
  Wrench,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { getSuperAdminSettings, saveSuperAdminSettings } from "../api";
import ControlHero from "../shared/ControlHero";
import PageHeader from "../shared/PageHeader";
import SectionCard from "../shared/SectionCard";
import StatusBadge from "../shared/StatusBadge";
import type { GlobalSettingsForm } from "../types";
import { formatCurrency, getErrorMessage } from "../utils";

const initialForm: GlobalSettingsForm = {
  internal_rate: "",
  lead_rate: "",
  partner_surcharge: "",
  tax: "",
  min_topup: "",
  maintenance_mode: false,
  smtp_host: "",
  smtp_port: "587",
  smtp_username: "",
  smtp_password: "",
  smtp_encryption: "tls",
  mail_from_name: "KonverPro",
  mail_from_address: "",
  support_email: "",
  support_whatsapp: "",
};

export default function SuperAdminSettingsPage() {
  const [form, setForm] = useState<GlobalSettingsForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const inputClassName =
    "h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold outline-none transition focus:border-blue-200";
  const labelClassName =
    "mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400";

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const nextSettings = await getSuperAdminSettings();
      setForm(nextSettings);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat pengaturan."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (
    key: keyof GlobalSettingsForm,
    value: string | boolean,
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      await saveSuperAdminSettings(form);
      toast.success("Pengaturan global berhasil disimpan.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan pengaturan."));
    } finally {
      setSaving(false);
    }
  };

  const activeSupportChannels = useMemo(
    () =>
      [form.support_email, form.support_whatsapp, form.mail_from_address].filter(
        (value) => value.trim().length > 0,
      ).length,
    [form.mail_from_address, form.support_email, form.support_whatsapp],
  );

  const configReadiness = useMemo(() => {
    const checkpoints = [
      form.internal_rate,
      form.lead_rate,
      form.min_topup,
      form.smtp_host,
      form.smtp_port,
      form.mail_from_name,
      form.mail_from_address,
      form.support_email,
    ];
    const completed = checkpoints.filter((item) => item.trim().length > 0).length;

    return Math.round((completed / checkpoints.length) * 100);
  }, [
    form.internal_rate,
    form.lead_rate,
    form.mail_from_address,
    form.mail_from_name,
    form.min_topup,
    form.smtp_host,
    form.smtp_port,
    form.support_email,
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Config Global"
        description="Kelola pricing global, minimum topup, pajak, dan mode maintenance."
        action={
          <button
            type="button"
            onClick={fetchSettings}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-[#001a33]"
          >
            <ArrowsClockwise size={18} weight="bold" />
            Refresh
          </button>
        }
      />

      {loading ? (
        <div className="rounded-[2rem] border border-slate-100 bg-white p-10 shadow-sm">
          <div className="flex items-center justify-center py-16">
            <CircleNotch className="h-10 w-10 animate-spin text-[#094E8B]" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <ControlHero
            badge="System Control"
            title="Atur pricing global, jalur support, dan kesiapan gateway sistem dari satu workspace."
            description="Halaman ini saya rapikan menjadi control room konfigurasi agar perubahan biaya, mode maintenance, dan mail gateway lebih mudah dibaca sebelum disimpan ke sistem."
            metrics={[
              {
                label: "Readiness",
                value: `${configReadiness}%`,
                description: "Progress konfigurasi field inti platform.",
                tone: "accent",
              },
              {
                label: "Min Topup",
                value: form.min_topup
                  ? formatCurrency(form.min_topup)
                  : "Belum diatur",
                description: "Batas minimum nominal top up kampus.",
                tone: "default",
              },
              {
                label: "Support Channels",
                value: `${activeSupportChannels}/3`,
                description: "Email, WhatsApp, dan sender address yang aktif.",
                tone: "success",
              },
            ]}
            aside={[
              {
                eyebrow: "Mode Operasional",
                title: form.maintenance_mode
                  ? "Maintenance mode sedang aktif."
                  : "Platform dalam mode operasional normal.",
                description:
                  "Gunakan toggle maintenance saat ada aktivitas deployment atau perubahan besar di level sistem.",
                tone: form.maintenance_mode ? "amber" : "default",
              },
              {
                eyebrow: "Mail Gateway",
                title: form.smtp_host
                  ? `SMTP host siap: ${form.smtp_host}`
                  : "Gateway email belum lengkap.",
                description:
                  "Lengkapi host, port, sender, dan support contact agar flow notifikasi berjalan stabil.",
                tone: form.smtp_host ? "blue" : "default",
              },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <SectionCard title="Konfigurasi Harga & Sistem">
                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <div>
                    <label className={labelClassName}>Biaya Internal</label>
                    <input
                      type="number"
                      value={form.internal_rate}
                      onChange={(event) =>
                        handleChange("internal_rate", event.target.value)
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>Biaya Lead</label>
                    <input
                      type="number"
                      value={form.lead_rate}
                      onChange={(event) =>
                        handleChange("lead_rate", event.target.value)
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>Surcharge Partner (%)</label>
                    <input
                      type="number"
                      value={form.partner_surcharge}
                      onChange={(event) =>
                        handleChange("partner_surcharge", event.target.value)
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>Pajak / PPN (%)</label>
                    <input
                      type="number"
                      value={form.tax}
                      onChange={(event) => handleChange("tax", event.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>Minimum Topup</label>
                    <input
                      type="number"
                      value={form.min_topup}
                      onChange={(event) =>
                        handleChange("min_topup", event.target.value)
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Maintenance Switch
                    </p>
                    <label className="mt-4 flex items-center gap-3 text-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.maintenance_mode}
                        onChange={(event) =>
                          handleChange("maintenance_mode", event.target.checked)
                        }
                        className="h-5 w-5 rounded"
                      />
                      Maintenance Mode
                    </label>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                      Aktifkan hanya ketika sistem memang perlu dibatasi untuk
                      maintenance atau rollout besar.
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="SMTP & Mail Gateway">
                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <div>
                    <label className={labelClassName}>SMTP Host</label>
                    <input
                      value={form.smtp_host}
                      onChange={(event) =>
                        handleChange("smtp_host", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="smtp.mailgun.org"
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>SMTP Port</label>
                    <input
                      value={form.smtp_port}
                      onChange={(event) =>
                        handleChange("smtp_port", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>SMTP Username</label>
                    <input
                      value={form.smtp_username}
                      onChange={(event) =>
                        handleChange("smtp_username", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="postmaster@konverpro.id"
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>SMTP Password</label>
                    <input
                      type="password"
                      value={form.smtp_password}
                      onChange={(event) =>
                        handleChange("smtp_password", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>Enkripsi</label>
                    <select
                      value={form.smtp_encryption}
                      onChange={(event) =>
                        handleChange("smtp_encryption", event.target.value)
                      }
                      className={inputClassName}
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="starttls">STARTTLS</option>
                      <option value="none">Tanpa Enkripsi</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClassName}>Support Email</label>
                    <input
                      type="email"
                      value={form.support_email}
                      onChange={(event) =>
                        handleChange("support_email", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="support@konverpro.id"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Identitas Pengirim">
                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <div>
                    <label className={labelClassName}>From Name</label>
                    <input
                      value={form.mail_from_name}
                      onChange={(event) =>
                        handleChange("mail_from_name", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="KonverPro Notification"
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>From Address</label>
                    <input
                      type="email"
                      value={form.mail_from_address}
                      onChange={(event) =>
                        handleChange("mail_from_address", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="noreply@konverpro.id"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClassName}>Support WhatsApp</label>
                    <input
                      value={form.support_whatsapp}
                      onChange={(event) =>
                        handleChange("support_whatsapp", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="628123456789"
                    />
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
              <SectionCard title="Health Check">
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <div>
                      <p className="text-sm font-black text-[#001a33]">
                        Maintenance status
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Status mode operasional sistem saat ini.
                      </p>
                    </div>
                    <StatusBadge
                      variant={form.maintenance_mode ? "amber" : "green"}
                    >
                      {form.maintenance_mode ? "Maintenance" : "Normal"}
                    </StatusBadge>
                  </div>

                  <div className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <div>
                      <p className="text-sm font-black text-[#001a33]">
                        Mail readiness
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Kesiapan konfigurasi sender dan support channel.
                      </p>
                    </div>
                    <StatusBadge
                      variant={configReadiness >= 75 ? "green" : "amber"}
                    >
                      {configReadiness >= 75 ? "Siap" : "Perlu Lengkapi"}
                    </StatusBadge>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Support Channel
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Support email</span>
                        <span className="font-bold text-[#001a33]">
                          {form.support_email || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Sender</span>
                        <span className="font-bold text-[#001a33]">
                          {form.mail_from_name || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">WhatsApp</span>
                        <span className="font-bold text-[#001a33]">
                          {form.support_whatsapp || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Aksi Simpan">
                <div className="space-y-5 p-6">
                  <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/75 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#094E8B] shadow-sm">
                        <ShieldCheck size={20} weight="fill" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#001a33]">
                          Konfigurasi tersimpan ke pusat kontrol
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          Semua perubahan pricing, support, dan SMTP akan menjadi
                          sumber konfigurasi utama untuk flow operasional.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Snapshot Cepat
                    </p>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Biaya internal</span>
                        <span className="font-bold text-[#001a33]">
                          {form.internal_rate
                            ? formatCurrency(form.internal_rate)
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Biaya lead</span>
                        <span className="font-bold text-[#001a33]">
                          {form.lead_rate ? formatCurrency(form.lead_rate) : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Gateway</span>
                        <span className="font-bold text-[#001a33]">
                          {form.smtp_host || "Belum diisi"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#094E8B] text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#073e6f] disabled:opacity-50"
                  >
                    {saving ? (
                      <CircleNotch className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Check size={18} weight="bold" />
                        Simpan Konfigurasi
                      </>
                    )}
                  </button>

                  <div className="flex items-start gap-3 rounded-[1.5rem] border border-amber-100 bg-amber-50/75 p-4 text-sm leading-relaxed text-slate-600">
                    <Wrench
                      size={18}
                      weight="bold"
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                    Perubahan maintenance mode dan mail gateway sebaiknya diuji
                    di staging terlebih dahulu jika berdampak ke flow notifikasi.
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
