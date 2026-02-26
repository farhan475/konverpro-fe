import { Loader2, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 items-center justify-items-center">
            {campuses.map((campus: any) => (
              <Card key={campus.id} className="w-full flex flex-col items-center gap-3 p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 cursor-pointer group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-brand-600 font-bold text-xl group-hover:bg-brand-50 transition-colors">
                  {campus.logo_path ? (
                    <img src={campus.logo_path} alt={campus.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <Building2 className="w-6 h-6 opacity-50" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-600 leading-tight text-center group-hover:text-brand-700 transition-colors line-clamp-2">
                  {campus.name}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}