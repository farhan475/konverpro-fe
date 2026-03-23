# KonverPro Frontend

Frontend KonverPro adalah aplikasi Next.js untuk tiga permukaan utama:

- landing page marketplace konversi SKS
- portal admin perguruan tinggi
- dashboard super admin

Refactor ini menyelaraskan struktur halaman, shell, komponen shared, dan flow utama dengan referensi desain yang diberikan, sambil menjaga integrasi langsung ke backend aktif.

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui primitives
- Axios untuk komunikasi API
- Recharts untuk chart dashboard

## Area Produk

- `/` untuk landing marketplace, simulasi upload transkrip, hasil rekomendasi, dan claim
- `/login` untuk portal akses `campus_admin`, `prodi_admin`, dan `super_admin`
- `/campus-admin/*` untuk dashboard kampus, input konversi, hasil review, laporan, dan pengaturan
- `/super-admin/*` untuk command center kampus, user, finance, audit, notifikasi, dan system control

## Struktur Folder

```text
src/
  app/                       App Router pages dan layouts
  components/
    auth/                    Portal login dan showcase panel
    landing/                 Hero, simulation workspace, result board, dialogs
    campus-admin/            Komponen domain admin kampus
    super-admin/             Shell, shared page chrome, feature pages, modals
    ui/                      Primitive reusable berbasis shadcn
  lib/                       Axios client, PDF export, branding helpers
docs/
  frontend-architecture.md
  frontend-pages.md
  frontend-components.md
  frontend-setup.md
  integration-fe-be.md
  refactor-summary.md
```

## Environment

Salin env yang diperlukan ke `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_CONVERSION_TEMPLATE_URL=http://localhost:8000/api/public/template
NEXT_PUBLIC_ADMIN_WA_NUMBER=628123456789
```

## Menjalankan Project

```bash
npm install
npm run dev
```

Verifikasi produksi:

```bash
npm run lint
npm run build
```

## Dokumentasi

- [Arsitektur Frontend](docs/frontend-architecture.md)
- [Daftar Halaman](docs/frontend-pages.md)
- [Komponen Utama](docs/frontend-components.md)
- [Setup Frontend](docs/frontend-setup.md)
- [Integrasi FE-BE](docs/integration-fe-be.md)
- [Ringkasan Refactor](docs/refactor-summary.md)

## Catatan

- Frontend berjalan dengan integrasi API nyata ke backend aktif.
- Local fallback lama yang masih tersisa dipertahankan hanya sebagai safety net, bukan sebagai sumber data utama.
- Route `/super-admin/backup` saat ini diperlakukan sebagai alias dari workspace backup dan restore sistem.
