# Frontend Setup

## Prasyarat

- Node.js 20+
- npm 10+
- backend KonverPro API berjalan

## Instalasi

```bash
npm install
```

## Environment

Buat `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_CONVERSION_TEMPLATE_URL=http://localhost:8000/api/public/template
NEXT_PUBLIC_ADMIN_WA_NUMBER=628123456789
```

## Menjalankan Development Server

```bash
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run build
```

## Integrasi Lokal

- login dan dashboard admin memerlukan backend Sanctum API yang aktif
- landing page memakai endpoint publik backend untuk daftar kampus, marketplace, template, dan conversion submission

## Known Notes

- beberapa feature lama masih menyimpan fallback lokal sebagai safety net
- data utama tetap diambil dari API backend
