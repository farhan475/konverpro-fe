import { CircleNotch, MapPin, Star } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";

import type { Campus } from "./types";

interface PartnersProps {
  campuses: Campus[];
  isLoading: boolean;
}

export default function Partners({ campuses, isLoading }: PartnersProps) {
  return (
    <section id="kampus" className="border-y border-slate-100 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-2 text-3xl font-black text-brand-900">
            Mitra Kampus Nasional
          </h2>
          <p className="font-medium text-slate-500">
            Data kampus di bawah ini diambil dari endpoint publik agar halaman
            landing tetap sinkron dengan backend.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <CircleNotch
              className="h-10 w-10 animate-spin text-brand-500"
              weight="bold"
            />
          </div>
        ) : campuses.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm font-medium text-slate-500">
            Belum ada kampus mitra yang tersedia.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {campuses.map((campus) => (
              <div
                key={campus.id}
                className="group rounded-[2rem] border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-3xl font-black text-slate-300 transition-all group-hover:bg-brand-50 group-hover:text-brand-600">
                  {campus.name.charAt(0)}
                </div>

                <div className="mb-4 flex min-h-[56px] items-center justify-center">
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-600 transition-colors group-hover:text-brand-900">
                    {campus.name}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:bg-slate-100">
                    {campus.study_programs?.length ?? 0} Prodi
                  </Badge>

                  {(campus.city || campus.province) && (
                    <Badge className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-600 hover:bg-brand-50">
                      <MapPin weight="fill" className="mr-1 h-3.5 w-3.5" />
                      {campus.city ?? campus.province}
                    </Badge>
                  )}

                  {campus.is_official_partner && (
                    <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 hover:bg-amber-50">
                      <Star weight="fill" className="mr-1 h-3.5 w-3.5" />
                      Partner
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}