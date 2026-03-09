import { Loader2, Building2 } from "lucide-react";

interface PartnersProps {
  campuses: any[];
  loading: boolean;
}

export default function Partners({ campuses, loading }: PartnersProps) {
  return (
    <section id="kampus" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Mitra Kampus Terpercaya</h2>
        <p className="text-slate-500 mb-10">Bergabung dengan jaringan perguruan tinggi digital terbaik di Indonesia.</p>
        
        {loading ? (
          <div className="flex justify-center"><Loader2 className="animate-spin text-slate-400 w-8 h-8"/></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
            {campuses.map((campus: any) => (
              <div key={campus.id} className="flex flex-col items-center gap-3 group cursor-pointer hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xl group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors border border-transparent group-hover:border-brand-200">
                   {campus.logoPath ? (
                     <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${campus.logoPath}`} alt={campus.name} className="w-full h-full object-contain p-2" />
                   ) : (
                     <Building2 className="w-6 h-6" />
                   )}
                </div>
                <span className="text-xs font-bold text-slate-600 max-w-[120px] leading-tight group-hover:text-brand-600 transition-colors">
                  {campus.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}