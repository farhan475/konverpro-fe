"use client";

import { useState } from "react";
import {
  ArrowSquareIn,
  DownloadSimple,
  FloppyDisk,
  UploadSimple,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { downloadSystemBackup, restoreSystemBackup } from "../api";
import PageHeader from "../shared/PageHeader";
import ControlHero from "../shared/ControlHero";
import { getErrorMessage } from "../utils";

const MAX_BACKUP_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_BACKUP_EXTENSIONS = [".json"];

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

  const validateBackupFile = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null);
      return;
    }

    const normalizedName = nextFile.name.toLowerCase();
    const hasSupportedExtension = SUPPORTED_BACKUP_EXTENSIONS.some((extension) =>
      normalizedName.endsWith(extension),
    );

    if (!hasSupportedExtension) {
      setFile(null);
      toast.error("File backup harus berupa snapshot JSON dari sistem.");
      return;
    }

    if (nextFile.size > MAX_BACKUP_SIZE_BYTES) {
      setFile(null);
      toast.error("Ukuran file backup maksimal 10 MB.");
      return;
    }

    setFile(nextFile);
  };

  const handleBackup = async () => {
    try {
      setBackupLoading(true);
      const { blob, filename } = await downloadSystemBackup();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
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
      const summary = await restoreSystemBackup(file);
      const restoredLabel =
        summary.restored_sections.length > 0
          ? summary.restored_sections.join(", ")
          : "tanpa section terdeteksi";

      toast.success(`Restore parsial selesai: ${restoredLabel}.`);
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

      <ControlHero
        badge="System Recovery"
        title="Ruang kontrol backup dan restore untuk operasi platform."
        description="Halaman ini sekarang memakai pola visual yang sama dengan panel super admin lain, sehingga status file aktif, jalur ekspor, dan risiko restore lebih mudah dibaca sebelum aksi besar dijalankan."
        metrics={[
          {
            label: "Backup Channel",
            value: "JSON Snapshot",
            description: "Unduh arsip sistem sebagai file backup utama.",
            tone: "default",
          },
          {
            label: "Restore State",
            value: file ? "File Siap" : "Menunggu File",
            description: "Status file restore yang dipilih operator.",
            tone: file ? "accent" : "default",
          },
          {
            label: "File Terpilih",
            value: file ? formatFileSize(file.size) : "Belum Ada",
            description: "Ukuran file aktif untuk proses restore.",
            tone: file ? "success" : "default",
          },
        ]}
        aside={[
          {
            eyebrow: "Recovery Status",
            title: "Snapshot dipakai untuk arsip, migrasi, dan fallback recovery.",
            description:
              "Gunakan backup berkala sebelum perubahan sistem besar atau import data penting.",
          },
          {
            eyebrow: "Restore Warning",
            title: "Restore wajib tervalidasi sebelum dieksekusi di environment aktif.",
            description:
              "Pastikan operator memahami dampak restore terhadap setting global dan data kontrol yang sedang berjalan.",
            tone: "amber",
          },
        ]}
      />

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
              accept=".json,application/json,text/plain"
              onChange={(event) =>
                validateBackupFile(event.target.files?.[0] ?? null)
              }
            />
            <FloppyDisk size={26} weight="bold" className="text-slate-400" />
            <p className="mt-3 text-sm font-bold text-slate-600">
              {file ? file.name : "Klik untuk pilih file backup"}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400">
              Hanya JSON snapshot, maksimal 10 MB
            </p>
          </label>

          <div className="mt-6 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              File Aktif
            </p>
            <p className="mt-2 text-sm font-black text-[#001a33]">
              {selectedFileLabel}
            </p>
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
