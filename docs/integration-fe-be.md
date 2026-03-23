# FE-BE Integration

## Tujuan

Dokumen ini memetakan hubungan antara halaman frontend dan endpoint backend aktif agar perubahan di kedua repo tetap sinkron.

## Base URL

- frontend membaca `NEXT_PUBLIC_API_URL`
- seluruh request protected memakai bearer token dari cookie `token`

## Auth Flow

Frontend:

- `/login`
- simpan `token`, `user_role`, `user_univ` ke cookie
- redirect berdasarkan role

Backend:

- `POST /api/login`
- `POST /api/logout`
- `GET /api/user`

## Landing Integration

Frontend:

- `LandingPage.tsx`
- `LandingSimulationWorkspace.tsx`
- `LandingResultsBoard.tsx`

Backend:

- `GET /api/public/campuses`
- `GET /api/public/marketplace`
- `GET /api/public/template`
- `POST /api/conversions`
- `GET /api/conversions/{id}`

Catatan:

- hasil simulasi publik tidak mengekspos identitas mahasiswa
- detail claim tetap mengandalkan hasil konversi publik dan CTA WhatsApp

## Campus Admin Integration

Backend endpoints utama:

- `GET /api/admin/dashboard-stats`
- `GET /api/admin/conversions`
- `GET /api/admin/conversions/{id}`
- `GET /api/admin/conversions/{id}/official-document`
- `POST /api/admin/review-detail/{detailId}`
- `POST /api/admin/finalize/{conversionId}`
- `GET /api/curriculum/prodi`
- `GET /api/curriculum/prodi/{prodiId}/courses`
- `POST /api/curriculum/import`
- `GET /api/campus/settings/profile`
- `POST /api/campus/settings/profile`
- `GET /api/campus/settings/prodi`
- `POST /api/campus/settings/prodi`
- `PUT /api/campus/settings/prodi/{id}`
- `DELETE /api/campus/settings/prodi/{id}`
- `GET /api/campus/settings/prodi/{id}/academic-settings`
- `PUT /api/campus/settings/prodi/{id}/academic-settings`
- `GET /api/campus/settings/dictionary`
- `PUT /api/campus/settings/dictionary/{courseId}`
- `GET /api/campus/settings/billing-history`
- `POST /api/campus/settings/topups`

## Super Admin Integration

Backend endpoints utama:

- `GET /api/super-admin/campuses`
- `POST /api/super-admin/campuses`
- `PUT /api/super-admin/campuses/{id}`
- `DELETE /api/super-admin/campuses/{id}`
- `POST /api/super-admin/campuses/{id}/adjust-balance`
- `GET /api/super-admin/users`
- `POST /api/super-admin/users`
- `PUT /api/super-admin/users/{id}`
- `DELETE /api/super-admin/users/{id}`
- `GET /api/super-admin/topups`
- `POST /api/super-admin/topups/{id}/process`
- `GET /api/super-admin/settings`
- `POST /api/super-admin/settings`
- `GET /api/super-admin/notification-templates`
- `POST /api/super-admin/notification-templates`
- `PUT /api/super-admin/notification-templates/{id}`
- `DELETE /api/super-admin/notification-templates/{id}`
- `GET /api/super-admin/system/backup`
- `POST /api/super-admin/system/restore`
- `GET /api/super-admin/reports/audit-logs`
- `GET /api/super-admin/reports/revenue`
- `GET /api/super-admin/reports/overview`

## Response Contract

Refactor backend menambahkan dua fondasi utama:

- helper `ApiResponse` untuk envelope JSON yang konsisten
- centralized API exception rendering di `bootstrap/app.php`

Implikasi:

- endpoint sukses umumnya mengembalikan `message` dan/atau `data`
- error validasi, auth, authorization, not found, dan server error kini konsisten dalam format JSON

## Known Boundaries

- route backup mengembalikan file JSON stream untuk diunduh
- import backup saat ini masih partial restore untuk entitas tertentu, bukan full destructive restore
