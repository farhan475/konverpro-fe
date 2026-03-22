import { CircleNotch } from "@phosphor-icons/react";

interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({
  label = "Memuat data...",
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <CircleNotch
        weight="bold"
        className="h-10 w-10 animate-spin text-[#094E8B]"
      />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
    </div>
  );
}