# Frontend Audit Checklist

Referensi audit:
- `landingpage v4.html`
- `Admin Perguruan Tinggi v2.html`
- `Dashboard Super Admin.html`

Tanggal audit:
- 2026-03-17

## Status Umum

- [x] Struktur route utama sudah tersedia untuk landing, `campus-admin`, dan `super-admin`
- [x] Banyak halaman besar sudah dipecah ke komponen reusable
- [x] Halaman login utama kini sudah memakai split layout dan mode portal `campus-admin` / `super-admin`
- [x] `npm run lint` sudah lulus
- [x] `npx tsc --noEmit` sudah lulus
- [ ] `next build` production penuh belum tervalidasi tuntas di environment ini, percobaan terbaru masih timeout pada fase optimized production build

## Landing Page vs `landingpage v4.html`

- [x] Navbar utama dengan anchor `Beranda`, `Mitra Kampus`, `Cara Kerja`, dan `Simulasi`
- [x] Hero section dengan CTA utama dan CTA sekunder
- [x] Section `Cara Kerja`
- [x] Section mitra kampus berbasis endpoint publik
- [x] Form simulasi konversi dengan pilihan kampus, prodi, upload file, dan template download
- [x] Hasil simulasi utama sudah tampil dalam kartu hasil
- [x] PDF hasil simulasi sudah tersedia
- [x] Follow-up WhatsApp sudah tersedia
- [x] Footer landing sudah ada
- [x] Marketplace/filter sidebar dasar untuk browser kampus kini sudah tersedia
- [x] Tampilan daftar kampus kini sudah dipisah ke mode `Beranda` vs `Kampus`
- [x] Modal claim hasil kini sudah punya summary kampus/prodi, biodata edit, upload transkrip opsional, PDF, dan CTA WhatsApp
- [x] Modal detail hasil kini sudah lebih dekat ke pola tab dan summary pada referensi
- [ ] Modal claim/detail hasil masih belum sama persis 1:1 dengan referensi HTML
- [x] Pencarian dan filter kampus per jenis/nama/lokasi dasar kini sudah tersedia
- [ ] Detail animasi, spacing, dan urutan section belum sepenuhnya pixel-perfect

## Campus Admin vs `Admin Perguruan Tinggi v2.html`

- [x] Layout admin kampus dengan top nav desktop dan bottom nav mobile
- [x] Dashboard analytics dengan kartu metrik dan chart utama
- [x] Halaman input konversi sudah ada dan flow utamanya jalan
- [x] Input konversi sudah dipecah ke komponen upload, mapping, bio mahasiswa, summary, dan scan result
- [x] Halaman hasil konversi sudah ada
- [x] Detail review hasil konversi per mahasiswa sudah ada
- [x] Halaman laporan akademik sudah ada
- [x] Halaman pengaturan kampus dengan tab profil, prodi, kamus, billing, dan info sudah ada
- [x] Halaman repositori kurikulum sudah ada sebagai route terpisah
- [x] Export laporan di halaman hasil konversi sudah tersedia
- [x] Cetak PDF laporan akademik sudah tersedia
- [x] Akses ke route kurikulum kini sudah terlihat di menu dan shortcut utama
- [x] Upload logo kampus lokal di browser sudah tersedia
- [x] Flow permintaan top up dasar sudah tersedia
- [x] Request top up lokal dari `campus-admin` kini bisa terbaca juga di antrean `super-admin` pada browser yang sama
- [x] Route khusus `akad settings` kini sudah tersedia
- [x] Akademik settings dasar per prodi kini sudah tersedia untuk kaprodi, tanda tangan digital, aturan semester, dan mata kuliah wajib
- [x] Preview dokumen resmi dasar kini sudah tersedia dari detail hasil konversi
- [x] Preview transkrip dasar berbasis hasil ekstraksi kini sudah tersedia dari detail hasil konversi
- [x] Workspace review detail konversi kini punya ringkasan, statistik, preview transkrip, dan preview dokumen yang lebih dekat ke referensi
- [ ] Upload logo kampus ke backend belum tersedia
- [ ] Sinkronisasi top up kampus ke backend/payment gateway belum final
- [ ] Preview transkrip lengkap berbasis file asli dan composer dokumen multi-template seperti HTML belum selengkap referensi
- [ ] Detail prodi di HTML referensi seperti biaya per prodi dan sinkronisasi backend policy masih belum lengkap di UI baru

## Super Admin vs `Dashboard Super Admin.html`

- [x] Layout shell super admin dengan sidebar dan header terpisah
- [x] Overview/dashboard utama sudah ada
- [x] Manajemen kampus sudah ada
- [x] Data konversi sudah ada
- [x] Top up & saldo sudah ada
- [x] Report pemasukan sudah ada
- [x] Manajemen user sudah ada
- [x] Config global dasar sudah ada
- [x] Template notifikasi sudah ada
- [x] Audit logs sudah ada
- [x] Backup & restore sudah ada
- [x] Manajemen kampus, user, topup, config global, dan template notifikasi kini punya fallback lokal dasar saat endpoint belum siap
- [x] Halaman login utama kini sudah mengadopsi split layout visual yang lebih dekat ke referensi admin kampus dan super admin
- [ ] Registrasi mitra 1:1 seperti panel auth di HTML super admin belum dibuat penuh
- [x] Workspace manajemen kampus kini sudah memiliki tab `info`, `prodi`, `config`, `campus-users`, dan `billing`
- [ ] Modal manajemen kampus masih belum 1:1 penuh dengan referensi, tetapi gap utamanya sudah jauh berkurang
- [x] Pengaturan global dasar dan SMTP/mail config dasar kini sudah tersedia
- [ ] Pengaturan global lanjutan di luar SMTP masih belum selengkap HTML referensi
- [x] Overview super admin kini sudah memiliki widget tren pertumbuhan dan heatmap performa kampus dasar
- [ ] Visual richness dashboard masih belum sepenuhnya 1:1 dengan referensi
- [ ] Beberapa alur masih lebih sederhana dari HTML referensi, walau fitur inti sudah tersedia

## Ringkasan Prioritas

- [ ] Finalkan verifikasi `next build` production
- [ ] Rapikan landing page agar lebih dekat ke pola marketplace/filter versi referensi
- [ ] Lengkapi area `campus-admin` untuk sinkronisasi backend policy, payment, dan preview dokumen lanjutan
- [ ] Lengkapi area `super-admin` untuk modal/detail kampus dan global config lanjutan
- [ ] Lakukan QA visual akhir per halaman agar lebih dekat ke HTML referensi
