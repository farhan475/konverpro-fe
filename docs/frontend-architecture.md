# Frontend Architecture

## Tujuan

Frontend KonverPro dibagi menjadi tiga domain produk yang berbeda tetapi tetap memakai fondasi UI dan integrasi API yang sama:

- `landing` untuk akuisisi lead, simulasi konversi, dan claim
- `campus-admin` untuk operasional kampus
- `super-admin` untuk kontrol pusat sistem

## Prinsip Arsitektur

- App Router dipakai sebagai boundary halaman dan layout.
- Domain component dipisahkan berdasarkan konteks bisnis, bukan hanya jenis file.
- Primitive UI umum tetap berada di `src/components/ui`.
- Integrasi API dilakukan melalui `src/lib/axios.ts` dan helper per domain.
- State tetap lokal per halaman atau per feature; belum ada global store karena kebutuhan saat ini masih lebih cocok dengan server-driven pages dan local component state.

## Routing Surface

- `src/app/page.tsx` merender landing marketplace
- `src/app/(auth)/login/page.tsx` merender portal login berbasis role
- `src/app/campus-admin/*` memakai header shell ala admin perguruan tinggi reference
- `src/app/super-admin/*` memakai shell control room dengan sidebar terkelompok

## Styling System

- Token warna, radius, shadow, dan animasi inti dipusatkan di `src/app/globals.css`
- Primitive tombol, input, card, badge, dialog, dan table tetap reusable melalui `src/components/ui`
- Super admin memakai page chrome reusable seperti:
  - `PageHeader`
  - `SectionCard`
  - `StatusBadge`
  - `ControlHero`
- Navigasi super admin dipusatkan di `src/components/super-admin/config/navigation.ts` agar label, grouping, dan page context tidak tersebar

## Data Flow

- `src/lib/axios.ts` menyisipkan token bearer dari cookie untuk route protected
- Feature super admin memakai helper khusus di `src/components/super-admin/api.ts`
- Landing page mengorkestrasi upload transkrip, polling hasil, metric derivation, detail dialog, dan claim flow di level feature page
- Campus admin tetap remote-first dan memakai fallback lokal hanya untuk skenario tertentu yang sebelumnya sudah ada

## Refactor Highlights

- Shell super admin sekarang memakai konfigurasi navigasi tunggal
- Header super admin membaca konteks halaman dari route aktif
- Hero section yang berulang di finance, settings, notification, dan system dipindahkan ke komponen reusable `ControlHero`
- Dokumentasi frontend kini mencerminkan struktur aktual repo, bukan boilerplate Next.js
