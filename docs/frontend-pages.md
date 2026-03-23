# Frontend Pages

## Public

### `/`

- Hero utama marketplace
- Penjelasan cara kerja
- Simulation workspace untuk upload template dan proses matching
- Results board dengan filter, sort, detail, dan claim flow
- Marketplace explorer untuk jelajah kampus mitra

### `/login`

- Portal switching untuk kampus dan super admin
- Login role-aware
- Redirect ke dashboard yang sesuai dengan role backend

## Campus Admin

### `/campus-admin`

- Dashboard analytics
- Kartu ringkasan pipeline, balance, approval rate, dan quick actions

### `/campus-admin/input-konversi`

- Upload transcript
- Scan / parsing file
- Biodata mahasiswa
- Mapping hasil awal

### `/campus-admin/conversions`

- Daftar hasil konversi
- Filter review
- Export dan finalisasi

### `/campus-admin/conversions/[id]`

- Review detail konversi
- Statistik hasil review
- Payload dokumen resmi

### `/campus-admin/curriculum`

- Kelola kurikulum dan import mata kuliah

### `/campus-admin/akad-settings`

- Pengaturan akademik per prodi

### `/campus-admin/laporan`

- Ringkasan laporan operasional

### `/campus-admin/settings`

- Profil institusi
- Program studi
- Kamus sinonim
- Billing
- Informasi sistem

## Super Admin

### `/super-admin`

- Overview control room
- Growth trend
- Heatmap performa kampus
- Central insights

### `/super-admin/campuses`

- Ringkasan jaringan kampus
- Search dan manajemen institusi
- Workspace form
- Adjust balance

### `/super-admin/finance`

- Queue top up
- Approve / reject transaksi

### `/super-admin/income`

- Report pemasukan dan chart revenue

### `/super-admin/users`

- Manajemen user dan role

### `/super-admin/settings`

- Config global
- SMTP dan sender identity
- Maintenance control

### `/super-admin/notification-templates`

- Library template notifikasi
- Search, create, edit, delete

### `/super-admin/audit-logs`

- Jejak aksi penting operator

### `/super-admin/system`

- Backup dan restore sistem

### `/super-admin/backup`

- Alias ke workspace backup dan restore
