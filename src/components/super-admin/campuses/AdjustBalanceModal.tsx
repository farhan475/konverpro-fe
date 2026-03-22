"use client";

import { useEffect, useState } from "react";
import { Check, CircleNotch, X } from "@phosphor-icons/react";
import { toast } from "sonner";

import { adjustCampusBalance } from "../api";
import type { University } from "../types";
import { formatCurrency, getErrorMessage } from "../utils";

interface AdjustBalanceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campus: University | null;
}

export default function AdjustBalanceModal({
  open,
  onClose,
  onSuccess,
  campus,
}: AdjustBalanceModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setAmount("");
  }, [open]);

  if (!open || !campus) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await adjustCampusBalance(campus.id, Number(amount));
      toast.success("Saldo kampus berhasil disesuaikan.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyesuaikan saldo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-50 px-8 py-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#001a33]">
              Adjust Balance
            </h3>
            <p className="mt-1 text-xs text-slate-400">{campus.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-700"
          >
            <X weight="bold" size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <div className="rounded-2xl bg-[#094E8B] p-6 text-center text-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
              Saldo Saat Ini
            </p>
            <p className="mt-3 text-3xl font-black">
              {formatCurrency(campus.balance)}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Nominal Penyesuaian
            </label>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              min={1}
              className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold"
              placeholder="Contoh: 1000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              <CircleNotch className="animate-spin" size={20} />
            ) : (
              <>
                <Check size={18} weight="bold" />
                Simpan Penyesuaian
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
