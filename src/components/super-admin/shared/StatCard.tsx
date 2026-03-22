interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  helper,
  icon,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-50/70 blur-2xl transition-transform group-hover:scale-110" />
      <div className="relative z-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-[#094E8B] shadow-inner">
            {icon}
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <h3 className="mt-2 text-3xl font-black text-[#001a33]">{value}</h3>
        {helper ? <p className="mt-2 text-sm leading-relaxed text-slate-400">{helper}</p> : null}
      </div>
    </div>
  );
}
