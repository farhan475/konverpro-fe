import { Calculator, PlayCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-brand-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-800/80 border border-brand-700 text-accent-500 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm">
          ★ Platform No. 1 Konversi SKS Indonesia
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Transfer Kredit Kuliah<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-amber-300">Lebih Cepat & Transparan</span>
        </h1>
        <p className="text-brand-100 text-lg md:text-xl max-w-3xl mx-auto mb-10 opacity-90 leading-relaxed font-light">
          Bandingkan peluang transfer kredit di puluhan universitas mitra. Hemat waktu dan biaya kuliah Anda sekarang dengan teknologi AI Matching.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#simulation-area" className="px-8 py-4 bg-white text-brand-900 font-bold rounded-xl hover:bg-brand-50 transition shadow-xl shadow-brand-900/20 flex items-center justify-center gap-2 transform hover:-translate-y-1">
            <Calculator className="w-5 h-5" /> Mulai Simulasi
          </a>
          <button className="px-8 py-4 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition border border-brand-700 flex items-center justify-center gap-2">
            <PlayCircle className="w-5 h-5" /> Lihat Video Panduan
          </button>
        </div>
      </div>
    </section>
  );
}