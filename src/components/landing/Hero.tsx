import { Calculator, PlayCircle, Star } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

interface HeroProps {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  campusCount: number;
  officialPartnerCount: number;
  programCount: number;
}

export default function Hero({
  onPrimaryAction,
  onSecondaryAction,
  campusCount,
  officialPartnerCount,
  programCount,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(253,216,36,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.2),_transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[95%] px-4 py-24 text-center sm:px-6 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-700 bg-brand-800/80 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-accent-500 backdrop-blur-sm">
            <Star weight="fill" className="h-4 w-4 text-accent-500" />
            Platform No. 1 Konversi SKS Indonesia
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl">
            Transfer Kredit Kuliah
            <br />
            <span className="bg-gradient-to-r from-accent-500 to-amber-300 bg-clip-text text-transparent">
              Lebih Cepat &amp; Transparan
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-lg font-light leading-relaxed text-brand-100/90 md:text-xl">
            Bandingkan peluang transfer kredit di puluhan universitas mitra.
            Hemat waktu dan biaya kuliah Anda sekarang dengan teknologi AI
            Matching.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              type="button"
              onClick={onPrimaryAction}
              className="h-14 rounded-xl bg-white px-8 text-sm font-black text-brand-900 shadow-xl shadow-brand-900/20 transition hover:bg-brand-50"
            >
              <Calculator weight="bold" className="mr-2 h-5 w-5" />
              Mulai Simulasi
            </Button>

            <Button
              type="button"
              onClick={onSecondaryAction}
              className="h-14 rounded-xl border border-brand-700 bg-brand-800 px-8 text-sm font-black text-white hover:bg-brand-700"
            >
              <PlayCircle weight="bold" className="mr-2 h-5 w-5" />
              Lihat Video Panduan
            </Button>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-100/70">
                Kampus Publik
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {campusCount > 0 ? `${campusCount}+` : "0"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-100/70">
                Official Partner
              </p>
              <p className="mt-2 text-3xl font-black text-accent-500">
                {officialPartnerCount > 0 ? `${officialPartnerCount}+` : "0"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-100/70">
                Program Studi
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {programCount > 0 ? `${programCount}+` : "0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
