import Link from "next/link";
import { Calculator, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="bg-brand-900 text-white relative overflow-hidden">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-overlay"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80')" }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10 text-center">
        
        <Badge variant="outline" className="bg-brand-800/80 border-brand-700 text-accent-500 text-xs font-bold uppercase tracking-wider mb-8 px-4 py-1.5 backdrop-blur-sm gap-2">
          <Star className="w-3.5 h-3.5 fill-accent-500" /> Platform No. 1 Konversi SKS Indonesia
        </Badge>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Transfer Kredit Kuliah<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-amber-300">Lebih Cepat & Transparan</span>
        </h1>
        
        <p className="text-brand-100 text-lg md:text-xl max-w-3xl mx-auto mb-10 opacity-90 leading-relaxed font-light">
          Bandingkan peluang transfer kredit di puluhan universitas mitra. Hemat waktu dan biaya kuliah Anda sekarang dengan teknologi AI Matching.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50 font-bold rounded-xl shadow-xl shadow-brand-900/20 h-14 px-8 transform hover:-translate-y-1 transition-all" asChild>
            <Link href="#simulation-area"><Calculator className="w-5 h-5 mr-2" /> Mulai Simulasi</Link>
          </Button>
          
          <Button size="lg" variant="outline" className="bg-brand-800 text-white border-brand-700 hover:bg-brand-700 hover:text-white font-bold rounded-xl h-14 px-8" asChild>
            <Link href="#"><PlayCircle className="w-5 h-5 mr-2" /> Lihat Video Panduan</Link>
          </Button>
        </div>

      </div>
    </section>
  );
}