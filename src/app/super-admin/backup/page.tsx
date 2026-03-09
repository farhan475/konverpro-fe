"use client";

import { useState } from "react";
import {
  CloudArrowUp,
  FileArrowDown,
  ClockCounterClockwise,
  CircleNotch,
  CheckCircle,
  ShieldCheck,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { AxiosError } from "axios";

export default function BackupRestore() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      // We use windows.open or similar to trigger the download if the API returns a file
      // Since it's a JSON response with headers, axios might capture it.
      // Better to use window.open for direct download if token is in cookies/query.
      // But axiosInstance handles the token, so we'll do blob handling.

      const response = await axios.get("/super-admin/system/backup", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `backup_konverpro_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Backup data berhasil diunduh.");
    } catch {
      toast.error("Gagal melakukan backup sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !confirm(
        "Restorasi data akan menimpa pengaturan sistem saat ini. Lanjutkan?",
      )
    )
      return;

    setLoading(true);
    const formData = new FormData();
    formData.append("backup_file", file);

    try {
      await axios.post("/super-admin/system/restore", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Restorasi data berhasil diproses.");
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const message =
        (axiosError.response?.data as { message?: string })?.message ||
        "Format file tidak sesuai.";
      toast.error("Restorasi Gagal", { description: message });
    } finally {
      setLoading(false);
      // Clear file input
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-quick">
      <header>
        <h2 className="font-heading text-xl font-semibold tracking-tight text-[#001a33] uppercase">
          Backup & Pemulihan Sistem
        </h2>
        <p className="text-slate-400 text-sm">
          Amankan data platform Anda dengan melakukan backup berkala.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* EXPORT CARD */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center mb-8 shadow-inner">
              <FileArrowDown size={32} weight="duotone" />
            </div>
            <h3 className="text-2xl font-black text-[#001a33] mb-4">
              Export Database
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Unduh seluruh data (Universitas, User, Config, dll) dalam format
              JSON. File ini dapat digunakan untuk merestorasi sistem jika
              terjadi kendala.
            </p>
            <button
              onClick={handleBackup}
              disabled={loading}
              className="px-8 py-4 bg-brand-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl flex items-center gap-3 hover:bg-brand-600 transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <CircleNotch className="animate-spin" size={20} />
              ) : (
                <>
                  <ShieldCheck weight="bold" /> Jalankan Backup
                </>
              )}
            </button>
          </div>
        </div>

        {/* IMPORT CARD */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-[1.25rem] flex items-center justify-center mb-8 shadow-inner">
              <CloudArrowUp size={32} weight="duotone" />
            </div>
            <h3 className="text-2xl font-black text-[#001a33] mb-4">
              Restore Data
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Unggah file backup KonverPro (.json) untuk memulihkan keadaan
              sistem. Peringatan: Proses ini tidak dapat dibatalkan.
            </p>

            <label className="inline-flex px-8 py-4 bg-white border-2 border-slate-200 text-[#001a33] font-black uppercase text-xs tracking-widest rounded-2xl items-center gap-3 hover:border-rose-400 hover:text-rose-600 transition-all cursor-pointer shadow-sm active:scale-95">
              <CloudArrowUp weight="bold" />
              {loading ? "Memproses..." : "Pilih File Backup"}
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleRestore}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* LOG HISTORY */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <h4 className="font-bold text-[#001a33] flex items-center gap-3 mb-8">
            <ClockCounterClockwise
              weight="bold"
              className="text-xl text-slate-400"
            />{" "}
            Riwayat Aktivitas Sistem
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                  <th className="pb-4 px-4">Tipe Aktivitas</th>
                  <th className="pb-4 px-4">Waktu Eksekusi</th>
                  <th className="pb-4 px-4">Ukuran File</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {activeHistory.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-50 last:border-0 group"
                  >
                    <td className="py-6 px-4 font-bold text-[#001a33]">
                      {log.type}
                    </td>
                    <td className="py-6 px-4 font-medium">{log.date}</td>
                    <td className="py-6 px-4 font-black">{log.size}</td>
                    <td className="py-6 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle weight="fill" /> {log.status}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <button className="text-slate-300 hover:text-rose-500 transition-colors">
                        <X size={20} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-6 items-center">
            <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm">
              <ShieldCheck size={32} weight="duotone" />
            </div>
            <div>
              <h5 className="font-black text-amber-900 text-sm mb-1 uppercase tracking-tight">
                Kebijakan Retensi Data
              </h5>
              <p className="text-xs text-amber-700/70 leading-relaxed font-medium">
                Backup otomatis dilakukan setiap hari Minggu pukul 00:00 UTC ke
                cloud storage Amazon S3. Pastikan kunci API S3 terkonfigurasi
                pada tab integrasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
