import { cn } from "../utils";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "purple" | "green" | "amber" | "rose" | "slate";
}

const variants = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
};

export default function StatusBadge({
  children,
  variant = "slate",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider",
        variants[variant],
      )}
    >
      {children}
    </span>
  );
}