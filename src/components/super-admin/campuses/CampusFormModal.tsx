"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CircleNotch, X } from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  createSuperAdminCampus,
  updateSuperAdminCampus,
} from "../api";
import type { CampusFormValues, University } from "../types";
import { getErrorMessage } from "../utils";

interface CampusFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: University | null;
}

const planOptions = ["Starter", "Growth", "Enterprise"];

export default function CampusFormModal({
  open,
  onClose,
  onSuccess,
  initialData,
}: CampusFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("Growth");
  const [status, setStatus] = useState<"active" | "pending" | "suspended">("active");
  const [isPartner, setIsPartner] = useState(false);
  const [registrationFee, setRegistrationFee] = useState("");
  const [tuitionFee, setTuitionFee] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = useMemo(() => Boolean(initialData), [initialData]);

  useEffect(() => {
    if (!open) return;

    setName(initialData?.name ?? "");
    setEmail(initialData?.settings?.email ?? "");
    setPlan(initialData?.settings?.plan ?? "Growth");
    setStatus(
      initialData
        ? initialData.status === "active" ||
          initialData.status === "pending" ||
          initialData.status === "suspended"
            ? initialData.status
            : initialData.is_active
              ? "active"
              : "pending"
        : "active",
    );
    setIsPartner(initialData?.is_partner ?? false);
    setRegistrationFee(
      initialData?.student_registration_fee
        ? String(initialData.student_registration_fee)
        : "",
    );
    setTuitionFee(initialData?.student_fee ? String(initialData.student_fee) : "");
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload: CampusFormValues = {
        name,
        email,
        plan,
        status,
        is_partner: isPartner,
        regFee: registrationFee ? Number(registrationFee) : undefined,
        tuitionFee: tuitionFee ? Number(tuitionFee) : undefined,
      };

      if (isEdit && initialData) {
        await updateSuperAdminCampus(initialData.id, payload);
        toast.success("Data kampus berhasil diperbarui.");
      } else {
        await createSuperAdminCampus(payload);
        toast.success("Kampus baru berhasil didaftarkan.");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan kampus."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/30 px-10 py-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#001a33]">
            {isEdit ? "Update" : "Registrasi"} Mitra Kampus
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-700"
          >
            <X weight="bold" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-10">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Nama Perguruan Tinggi
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold"
                placeholder="Nama kampus"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Email PIC Kampus
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold"
                placeholder="admin@kampus.ac.id"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Paket Layanan
              </label>
              <select
                value={plan}
                onChange={(event) => setPlan(event.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold outline-none"
              >
                {planOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {isEdit ? (
              <>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status Akun
                  </label>
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as "active" | "pending" | "suspended")
                    }
                    className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Tipe Kemitraan
                  </label>
                  <label className="flex h-14 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isPartner}
                      onChange={(event) => setIsPartner(event.target.checked)}
                      className="h-5 w-5 rounded"
                    />
                    Official Partner
                  </label>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Biaya Registrasi Mahasiswa
                  </label>
                  <input
                    type="number"
                    value={registrationFee}
                    onChange={(event) => setRegistrationFee(event.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold"
                    placeholder="Contoh: 250000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    UKT / Tuition Fee
                  </label>
                  <input
                    type="number"
                    value={tuitionFee}
                    onChange={(event) => setTuitionFee(event.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold"
                    placeholder="Contoh: 3500000"
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="flex gap-4 pt-4">
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
                  Simpan Kampus
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
