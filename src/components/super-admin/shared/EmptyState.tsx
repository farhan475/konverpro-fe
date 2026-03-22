interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <h4 className="text-lg font-black text-[#001a33]">{title}</h4>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
    </div>
  );
}