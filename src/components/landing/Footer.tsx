import Link from "next/link";
import { MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-16 pb-8 mt-auto">
      <div className="max-w-[95%] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">K</div>
              <span className="font-bold text-2xl tracking-tight">KonverPro</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Platform marketplace pendidikan pertama di Indonesia yang mengintegrasikan sistem konversi SKS otomatis dengan pendaftaran mahasiswa baru.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Perusahaan</h4>
            <ul className="flex flex-col items-start space-y-1">
              <Button variant="link" className="text-slate-400 hover:text-white px-0 h-auto font-normal" asChild><Link href="#">Tentang Kami</Link></Button>
              <Button variant="link" className="text-slate-400 hover:text-white px-0 h-auto font-normal" asChild><Link href="#">Karir</Link></Button>
              <Button variant="link" className="text-slate-400 hover:text-white px-0 h-auto font-normal" asChild><Link href="#">Mitra Kampus</Link></Button>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Layanan</h4>
            <ul className="flex flex-col items-start space-y-1">
              <Button variant="link" className="text-slate-400 hover:text-white px-0 h-auto font-normal" asChild><Link href="#">Simulasi Konversi</Link></Button>
              <Button variant="link" className="text-slate-400 hover:text-white px-0 h-auto font-normal" asChild><Link href="#">Cari Program Studi</Link></Button>
              <Button variant="link" className="text-slate-400 hover:text-white px-0 h-auto font-normal" asChild><Link href="#">Beasiswa</Link></Button>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Kontak</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3"><MapPin className="text-brand-500 w-5 h-5 shrink-0" /><span>Menara 165, Jakarta Selatan</span></li>
              <li className="flex items-center gap-3"><Mail className="text-brand-500 w-5 h-5 shrink-0" /><span>hello@konverpro.id</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} PT Rajo Net Indonesia. All rights reserved.</p>
          <div className="flex gap-4">
            <Button variant="link" className="text-slate-500 hover:text-white px-0 text-xs">Privacy Policy</Button>
            <Button variant="link" className="text-slate-500 hover:text-white px-0 text-xs">Terms of Service</Button>
          </div>
        </div>
      </div>
    </footer>
  );
}