interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white px-6 py-7 shadow-sm md:px-8">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-50 blur-3xl" />
      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Super Control
          </p>
          <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-[#001a33] md:text-2xl">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            {description}
          </p>
        </div>
        {action}
      </div>
    </header>
  );
}
