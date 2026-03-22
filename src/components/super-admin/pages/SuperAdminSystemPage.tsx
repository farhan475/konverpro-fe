"use client";

import { useState } from "react";
import {
  ArrowSquareIn,
  ClockCountdown,
  DownloadSimple,
  FloppyDisk,
  ShieldCheck,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import axios from "@/lib/axios";
import PageHeader from "../shared/PageHeader";
import { getErrorMessage } from "../utils";

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function SuperAdminSystemPage() {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const selectedFileLabel = file
    ? `${file.name} (${formatFileSize(file.size)})`
    : "Belum ada file dipilih";

  const handleBackup = async () => {
    try {
      setBackupLoading(true);
      const response = await axios.get("/super-admin/system/backup", {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `konverpro-backup-${Date.now()}.json`;
      anchor.click();
      window.URL.revokeObjectURL(url);

      toast.success("Backup berhasil diunduh.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal melakukan backup sistem."));
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!file) {
      toast.error("Pilih file backup terlebih dahulu.");
      return;
    }

    try {
      setRestoreLoading(true);
      const formData = new FormData();
      formData.append("backup_file", file);

      await axios.post("/super-admin/system/restore", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Restore sistem berhasil dijalankan.");
      setFile(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal melakukan restore sistem."));
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Backup & Restore"
        description="Lakukan ekspor dan impor data sistem untuk kebutuhan pemulihan."
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-[2.25rem] bg-[#001a33] p-7 text-white shadow-2xl shadow-brand-900/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
              System Recovery
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
              Manual safeguard
            </span>
          </div>
          <h3 className="mt-4 text-3xl font-black tracking-tight">
            Ruang kontrol backup dan restore untuk operasi platform.
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
            Halaman ini saya poles supaya terasa seperti panel pemulihan sistem.
            Operator sekarang lebih mudah membaca status file aktif, jalur
            ekspor, dan risiko restore sebelum mengeksekusi aksi besar.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Backup Channel
              </p>
              <p className="mt-2 text-sm font-black text-blue-200">
                Download JSON snapshot
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Restore State
              </p>
              <p className="mt-2 text-sm font-black text-amber-200">
                {file ? "File siap diproses" : "Menunggu file backup"}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                File Terpilih
              </p>
              <p className="mt-2 text-sm font-black text-white">
                {file ? formatFileSize(file.size) : "Belum ada"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={20} weight="bold" />
              </div>
              <div>
                <p className="text-sm font-black text-[#001a33]">
                  Sistem siap ekspor
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Snapshot dipakai untuk arsip, migrasi, dan fallback recovery.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                <WarningCircle size={20} weight="bold" />
              </div>
              <div>
                <p className="text-sm font-black text-[#001a33]">
                  Restore wajib tervalidasi
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-900/75">
                  Gunakan file backup yang benar dan pastikan operator memahami
                  dampak restore terhadap setting global yang sedang aktif.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#094E8B]">
            <DownloadSimple size={28} weight="bold" />
          </div>
          <h3 className="text-lg font-black text-[#001a33]">Backup Sistem</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Ekspor seluruh data sistem ke file cadangan untuk arsip atau migrasi.
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Output
            </p>
            <p className="mt-2 text-sm font-black text-[#001a33]">
              Snapshot JSON siap unduh
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Cocok untuk penyimpanan berkala, audit internal, dan simulasi
              recovery ringan.
            </p>
          </div>

          <button
            type="button"
            onClick={handleBackup}
            disabled={backupLoading}
            className="mt-8 inline-flex h-14 items-center gap-3 rounded-2xl bg-[#094E8B] px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#073e6f] disabled:opacity-50"
          >
            <ArrowSquareIn size={18} weight="bold" />
            {backupLoading ? "Memproses..." : "Download Backup"}
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <UploadSimple size={28} weight="bold" />
          </div>
          <h3 className="text-lg font-black text-[#001a33]">Restore Sistem</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Impor file backup untuk memulihkan data sistem. Gunakan dengan sangat hati-hati.
          </p>

          <label className="mt-6 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center transition hover:border-blue-300">
            <input
              type="file"
              className="hidden"
              accept=".json,.zip,.sql"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <FloppyDisk size={26} weight="bold" className="text-slate-400" />
            <p className="mt-3 text-sm font-bold text-slate-600">
              {file ? file.name : "Klik untuk pilih file backup"}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400">
              Mendukung file backup sistem
            </p>
          </label>

          <div className="mt-6 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <ClockCountdown
                size={20}
                weight="bold"
                className="mt-0.5 shrink-0 text-slate-400"
              />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  File Aktif
                </p>
                <p className="mt-2 text-sm font-black text-[#001a33]">
                  {selectedFileLabel}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRestore}
            disabled={restoreLoading || !file}
            className="mt-6 inline-flex h-14 items-center gap-3 rounded-2xl bg-emerald-600 px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <UploadSimple size={18} weight="bold" />
            {restoreLoading ? "Memproses..." : "Jalankan Restore"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Best Practice
          </p>
          <p className="mt-2 text-base font-black text-[#001a33]">
            Jalankan backup sebelum update besar
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Simpan snapshot sebelum mengubah setting global, restore data, atau
            melakukan maintenance yang berdampak ke konfigurasi lintas kampus.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Restore Reminder
          </p>
          <p className="mt-2 text-base font-black text-[#001a33]">
            Validasi file dan sumber backup
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Pastikan file berasal dari snapshot yang benar agar proses pemulihan
            tidak menimpa konfigurasi yang masih dibutuhkan operator saat ini.
          </p>
        </div>
      </div>
    </div>
  );
}
