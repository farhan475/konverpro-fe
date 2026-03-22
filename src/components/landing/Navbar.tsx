import Link from "next/link";
import { List, X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

interface NavbarProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  activeView: "home" | "kampus";
  onNavigate: (
    target: "home" | "kampus" | "prosedur" | "simulation-area",
  ) => void;
}

const navItems = [
  { label: "Beranda", target: "home" },
  { label: "Kampus", target: "kampus" },
  { label: "Cara Kerja", target: "prosedur" },
  { label: "Cari Prodi", target: "simulation-area" },
];

export default function Navbar({
  mobileMenuOpen,
  onToggleMobileMenu,
  activeView,
  onNavigate,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[95%] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <button
            type="button"
            className="group flex items-center gap-3"
            onClick={() => onNavigate("home")}
            aria-label="Kembali ke atas"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-2xl font-bold text-white shadow-lg shadow-brand-600/20 transition-transform group-hover:scale-105">
              K
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className="text-xl font-bold leading-none tracking-tight text-brand-900">
                KonverPro
              </span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Campus Marketplace
              </span>
            </div>
          </button>

          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() =>
                  onNavigate(
                    item.target as
                      | "home"
                      | "kampus"
                      | "prosedur"
                      | "simulation-area",
                  )
                }
                className={`text-sm font-bold transition-colors ${
                  (item.target === "home" && activeView === "home") ||
                  (item.target === "kampus" && activeView === "kampus")
                    ? "text-brand-600"
                    : "text-slate-500 hover:text-brand-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login?portal=campus_admin">
            <Button
              variant="ghost"
              className="px-4 text-sm font-bold text-brand-600 hover:bg-brand-50"
            >
              Masuk
            </Button>
          </Link>
          <Link href="/login?portal=campus_admin">
            <Button className="h-11 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700">
              Daftar Mitra
            </Button>
          </Link>
        </div>

        <div className="md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleMobileMenu}
            className="text-brand-900"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileMenuOpen ? (
              <X size={24} weight="bold" />
            ) : (
              <List size={24} weight="bold" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 border-t border-slate-100 bg-white p-6 shadow-2xl md:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => {
                  onNavigate(
                    item.target as
                      | "home"
                      | "kampus"
                      | "prosedur"
                      | "simulation-area",
                  );
                }}
                className={`text-left text-sm font-bold ${
                  (item.target === "home" && activeView === "home") ||
                  (item.target === "kampus" && activeView === "kampus")
                    ? "text-brand-600"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
            <Link href="/login?portal=campus_admin">
              <Button variant="outline" className="h-12 w-full font-bold">
                Masuk
              </Button>
            </Link>
            <Link href="/login?portal=campus_admin">
              <Button className="h-12 w-full bg-brand-600 font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700">
                Daftar Mitra
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
