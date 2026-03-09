"use client";

import { useState, useEffect } from "react";
import {
  Gear,
  ShieldCheck,
  Globe,
  EnvelopeSimple,
  Bell,
  FloppyDisk,
  CircleNotch,
  Info,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import axios from "@/lib/axios";

// interface Setting {
//   key: string;
//   value: string;
// }

export default function GlobalSettings() {
  const [activeTab, setActiveTab] = useState("umum");
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Local state for formatted settings
  const [formData, setFormData] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    try {
      // const response = await axios.get("/super-admin/settings");
      // setSettings(response.data.data);

      // Convert array to object key-value
      const data: Record<string, string> = {};
      // response.data.data.forEach((s: { key: string; value: string }) => {
      //   data[s.key] = s.value;
      // });
      setFormData(data);
    } catch {
      toast.error("Gagal memuat pengaturan global.");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Backend store handles bulk/single update usually or we send the whole object
      // The current route is Route::post('/settings', [GlobalSettingController::class, 'store']);
      // Usually it takes an array of settings.

      const payload = Object.keys(formData).map((key) => ({
        key: key,
        value: formData[key],
      }));

      await axios.post("/super-admin/settings", { settings: payload });
      toast.success("Konfigurasi sistem berhasil diperbarui secara global.");
    } catch {
      toast.error("Gagal menyimpan konfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <CircleNotch className="animate-spin text-blue-900 w-12 h-12" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Memuat Konfigurasi Global...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-quick">
      <header>
        <h2 className="font-heading text-xl font-semibold tracking-tight text-brand-900 uppercase">
          Konfigurasi Global Sistem
        </h2>
        <p className="text-slate-400 text-sm">
          Kelola parameter sistem, integrasi pihak ketiga, dan kebijakan
          platform.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar bg-white p-2 lg:p-3 shadow-sm border border-slate-100 rounded-2xl sticky top-24">
          <button
            onClick={() => setActiveTab("umum")}
            className={`shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === "umum" ? "bg-brand-500 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Gear
              weight={activeTab === "umum" ? "fill" : "regular"}
              className="text-xl"
            />{" "}
            Umum & Branding
          </button>
          <button
            onClick={() => setActiveTab("keamanan")}
            className={`shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === "keamanan" ? "bg-brand-500 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <ShieldCheck
              weight={activeTab === "keamanan" ? "fill" : "regular"}
              className="text-xl"
            />{" "}
            Keamanan & Akses
          </button>
          <button
            onClick={() => setActiveTab("integrasi")}
            className={`shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === "integrasi" ? "bg-brand-500 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Globe
              weight={activeTab === "integrasi" ? "fill" : "regular"}
              className="text-xl"
            />{" "}
            API & Integrasi
          </button>
          <button
            onClick={() => setActiveTab("notifikasi")}
            className={`shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-xs lg:text-sm whitespace-nowrap ${activeTab === "notifikasi" ? "bg-brand-500 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Bell
              weight={activeTab === "notifikasi" ? "fill" : "regular"}
              className="text-xl"
            />{" "}
            Mail & Notifikasi
          </button>
        </div>

        {/* Form Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-125">
          {activeTab === "umum" && (
            <div className="space-y-6 animate-fade-in-quick max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Gear weight="duotone" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Pengaturan Umum</h3>
                  <p className="text-xs text-slate-400">
                    Identitas dasar aplikasi KonverPro.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
                    Nama Aplikasi
                  </label>
                  <input
                    type="text"
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    value={formData.app_name || "KonverPro"}
                    onChange={(e) =>
                      setFormData({ ...formData, app_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
                    Deskripsi Dashboard
                  </label>
                  <input
                    type="text"
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                    value={formData.app_description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        app_description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
                  <Info
                    weight="fill"
                    className="text-amber-500 shrink-0"
                    size={20}
                  />
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    Pemberitahuan: Perubahan nama aplikasi akan berdampak pada
                    footer email dan header dashboard seluruh pengguna.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrasi" && (
            <div className="space-y-6 animate-fade-in-quick max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Globe weight="duotone" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    Integrasi Pihak Ketiga
                  </h3>
                  <p className="text-xs text-slate-400">
                    Koneksi payment gateway dan AI services.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 mb-4">
                    Midtrans Payment Gateway
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Server Key
                      </label>
                      <input
                        type="password"
                        className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl font-mono text-sm"
                        value={formData.midtrans_server_key || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            midtrans_server_key: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Client Key
                      </label>
                      <input
                        type="text"
                        className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl font-mono text-sm"
                        value={formData.midtrans_client_key || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            midtrans_client_key: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 mb-4">
                    OpenAI / DeepSeek (AI Logic)
                  </h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl font-mono text-sm"
                      value={formData.ai_api_key || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, ai_api_key: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifikasi" && (
            <div className="space-y-6 animate-fade-in-quick max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <EnvelopeSimple weight="duotone" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    Mail Server (SMTP)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Konfigurasi pengiriman email transaksional.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl outline-none"
                    value={formData.smtp_host || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, smtp_host: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl"
                    value={formData.smtp_port || "465"}
                    onChange={(e) =>
                      setFormData({ ...formData, smtp_port: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Encryption
                  </label>
                  <select
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl"
                    value={formData.smtp_encryption || "ssl"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp_encryption: e.target.value,
                      })
                    }
                  >
                    <option value="ssl">SSL</option>
                    <option value="tls">TLS</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Email Username
                  </label>
                  <input
                    type="text"
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl"
                    value={formData.smtp_user || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, smtp_user: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-10 py-4 bg-brand-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#073e6f] transition shadow-xl shadow-blue-900/20 flex items-center gap-4 disabled:opacity-50"
            >
              {loading ? (
                <CircleNotch className="animate-spin" size={20} />
              ) : (
                <>
                  <FloppyDisk size={20} weight="bold" /> Simpan Konfigurasi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
