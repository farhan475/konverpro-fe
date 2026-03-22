import type { Metadata } from "next";

import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "KonverPro | Transfer Kredit Kuliah",
  description:
    "Simulasi konversi SKS, rekomendasi kampus mitra, dan popup follow-up pendaftaran dalam satu landing page yang lebih rapi dan siap production.",
};

export default function HomePage() {
  return <LandingPage />;
}