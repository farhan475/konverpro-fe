import { MapPin, Mail } from "lucide-react";

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
            <h4 className="font-bold text-lg mb-6">Perusahaan</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition">Karir</a></li>
              <li><a href="#" className="hover:text-white transition">Mitra Kampus</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Layanan</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">Simulasi Konversi</a></li>
              <li><a href="#" className="hover:text-white transition">Cari Program Studi</a></li>
              <li><a href="#" className="hover:text-white transition">Beasiswa</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Kontak</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3"><MapPin className="text-brand-500 text-lg mt-0.5" /><span>Menara 165, Jakarta Selatan</span></li>
              <li className="flex items-center gap-3"><Mail className="text-brand-500 text-lg" /><span>hello@konverpro.id</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} PT Rajo Net Indonesia. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}