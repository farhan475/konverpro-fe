# Frontend Components

## Shared UI Primitives

Lokasi: `src/components/ui`

Komponen inti:

- `button.tsx`
- `input.tsx`
- `card.tsx`
- `table.tsx`
- `dialog.tsx`
- `badge.tsx`
- `select.tsx`

Komponen ini menjadi fondasi semua domain dan dipakai untuk menjaga konsistensi spacing, radius, dan behavior.

## Landing Components

Lokasi: `src/components/landing`

Komponen penting:

- `Hero`
- `HowItWorks`
- `LandingSimulationWorkspace`
- `LandingResultsBoard`
- `MarketplaceExplorer`
- `SimulationResultDetailDialog`
- `SimulationClaimDialog`

Pola:

- page orchestration berada di `LandingPage.tsx`
- komponen lain fokus ke presentasi dan interaksi spesifik

## Campus Admin Components

Lokasi: `src/components/campus-admin`

Komponen penting:

- input konversi cards dan modal preview
- summary card hasil konversi
- preview transcript dan official document

Pola:

- route page tetap memegang orchestration
- komponen domain dipakai untuk panel/presentasi yang berulang

## Super Admin Components

Lokasi: `src/components/super-admin`

Sub-area:

- `shell/` untuk sidebar, mobile nav, header, dan layout wrapper
- `shared/` untuk page header, section card, empty/loading state, status badge, control hero
- `pages/` untuk implementasi halaman per fitur
- `campuses/`, `notifications/`, `users/` untuk modal dan form domain
- `config/navigation.ts` untuk grouping sidebar dan metadata halaman

Refactor utama:

- `ControlHero` menyatukan pola hero dashboard yang sebelumnya berulang
- `navigation.ts` menjadi sumber tunggal label sidebar, short label mobile, dan deskripsi header

## Kapan Membuat Komponen Baru

Buat komponen baru jika:

- pola UI muncul minimal di dua halaman
- komponen punya boundary feature yang jelas
- logika layout lebih stabil jika diisolasi

Jangan pecah komponen jika:

- komponen hanya dipakai sekali dan belum stabil
- pemecahan justru memindahkan state orchestration tanpa manfaat nyata
