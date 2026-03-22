import Link from "next/link";
import { EnvelopeSimple, MapPin } from "@phosphor-icons/react";

interface FooterProps {
  onNavigate?: (
    target: "home" | "kampus" | "prosedur" | "simulation-area",
  ) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900 px-4 pb-8 pt-16 text-white sm:px-6">
      <div className="mx-auto mb-12 grid max-w-[95%] gap-12 border-b border-slate-800 pb-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">
              K
            </div>
            <h2 className="text-2xl font-black tracking-tight">KonverPro</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Platform marketplace pendidikan pertama di Indonesia yang
            mengintegrasikan sistem konversi SKS otomatis dengan pendaftaran
            mahasiswa baru.
          </p>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-bold">Perusahaan</h3>
          <ul className="space-y-4 text-sm text-slate-400">
            <li>
              <Link href="#" className="transition-colors hover:text-white">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link href="#" className="transition-colors hover:text-white">
                Karir
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate?.("kampus")}
                className="transition-colors hover:text-white"
              >
                Mitra Kampus
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-bold">Layanan</h3>
          <ul className="space-y-4 text-sm text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => onNavigate?.("simulation-area")}
                className="transition-colors hover:text-white"
              >
                Simulasi Konversi
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate?.("kampus")}
                className="transition-colors hover:text-white"
              >
                Cari Program Studi
              </button>
            </li>
            <li>
              <Link href="#" className="transition-colors hover:text-white">
                Beasiswa
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-bold">Kontak</h3>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin
                size={18}
                weight="fill"
                className="mt-0.5 text-brand-500"
              />
              <span>Menara 165, Jakarta Selatan</span>
            </li>
            <li className="flex items-center gap-2">
              <EnvelopeSimple
                size={18}
                weight="fill"
                className="text-brand-500"
              />
              <span>hello@konverpro.id</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[95%] flex-col items-center justify-between gap-6 md:flex-row">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} PT Rajo Net Indonesia. All rights
          reserved.
        </p>

        <div className="flex gap-6 text-sm text-slate-500">
          <Link href="#" className="transition-colors hover:text-white">
            Privacy Policy
          </Link>
          <Link href="#" className="transition-colors hover:text-white">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
