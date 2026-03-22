"use client";

import { useEffect, useState } from "react";
import { ArrowsClockwise, Check, CircleNotch } from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  getSuperAdminSettings,
  saveSuperAdminSettings,
} from "../api";
import PageHeader from "../shared/PageHeader";
import type { GlobalSettingsForm } from "../types";
import { getErrorMessage } from "../utils";

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
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl space-y-8 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm"
        >
          <div>
            <h3 className="border-b border-slate-100 pb-3 text-sm font-black uppercase text-[#001a33]">
              Konfigurasi Harga & Sistem
            </h3>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Biaya Internal
                </label>
                <input
                  type="number"
                  value={form.internal_rate}
                  onChange={(event) =>
                    handleChange("internal_rate", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Biaya Lead
                </label>
                <input
                  type="number"
                  value={form.lead_rate}
                  onChange={(event) =>
                    handleChange("lead_rate", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Surcharge Partner (%)
                </label>
                <input
                  type="number"
                  value={form.partner_surcharge}
                  onChange={(event) =>
                    handleChange("partner_surcharge", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Pajak / PPN (%)
                </label>
                <input
                  type="number"
                  value={form.tax}
                  onChange={(event) => handleChange("tax", event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Minimum Topup
                </label>
                <input
                  type="number"
                  value={form.min_topup}
                  onChange={(event) =>
                    handleChange("min_topup", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
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
              </div>
            </div>
          </div>

          <div>
            <h3 className="border-b border-slate-100 pb-3 text-sm font-black uppercase text-[#001a33]">
              SMTP & Mail Gateway
            </h3>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  SMTP Host
                </label>
                <input
                  value={form.smtp_host}
                  onChange={(event) => handleChange("smtp_host", event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                  placeholder="smtp.mailgun.org"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  SMTP Port
                </label>
                <input
                  value={form.smtp_port}
                  onChange={(event) => handleChange("smtp_port", event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  SMTP Username
                </label>
                <input
                  value={form.smtp_username}
                  onChange={(event) =>
                    handleChange("smtp_username", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                  placeholder="postmaster@konverpro.id"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={form.smtp_password}
                  onChange={(event) =>
                    handleChange("smtp_password", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Enkripsi
                </label>
                <select
                  value={form.smtp_encryption}
                  onChange={(event) =>
                    handleChange("smtp_encryption", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">Tanpa Enkripsi</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Support Email
                </label>
                <input
                  type="email"
                  value={form.support_email}
                  onChange={(event) =>
                    handleChange("support_email", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                  placeholder="support@konverpro.id"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="border-b border-slate-100 pb-3 text-sm font-black uppercase text-[#001a33]">
              Identitas Pengirim
            </h3>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  From Name
                </label>
                <input
                  value={form.mail_from_name}
                  onChange={(event) =>
                    handleChange("mail_from_name", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                  placeholder="KonverPro Notification"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  From Address
                </label>
                <input
                  type="email"
                  value={form.mail_from_address}
                  onChange={(event) =>
                    handleChange("mail_from_address", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                  placeholder="noreply@konverpro.id"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Support WhatsApp
                </label>
                <input
                  value={form.support_whatsapp}
                  onChange={(event) =>
                    handleChange("support_whatsapp", event.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold"
                  placeholder="628123456789"
                />
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
        </form>
      )}
    </div>
  );
}   
