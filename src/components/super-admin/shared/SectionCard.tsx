interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-50/60 blur-2xl" />
      {title ? (
        <div className="relative z-10 border-b border-slate-100 px-8 py-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#001a33]">
            {title}
          </h3>
        </div>
      ) : null}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
