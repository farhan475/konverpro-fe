export type PortalMode = "campus_admin" | "super_admin";

type PortalMetric = {
  value: string;
  label: string;
  hint: string;
};

type PortalFeature = {
  icon: "scan" | "chart" | "wallet" | "buildings" | "users" | "gear";
  title: string;
  description: string;
};

type PortalNote = {
  title: string;
  description: string;
};

export type PortalConfig = {
  badge: string;
  badgeAccent: string;
  sideTitle: string;
  sideDescription: string;
  quote: string;
  headerTitle: string;
  headerDescription: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordHint: string;
  submitLabel: string;
  helperText: string;
  metrics: PortalMetric[];
  features: PortalFeature[];
  notes: PortalNote[];
};

export const portalConfigs: Record<PortalMode, PortalConfig> = {
  campus_admin: {
    badge: "Higher Education Admin",
    badgeAccent: "Campus Operations",
    sideTitle: "Kelola konversi, kurikulum, dan layanan akademik dalam satu portal.",
    sideDescription:
      "Tampilan ini mengikuti nuansa dashboard admin kampus pada referensi: fokus pada proses konversi, approval, laporan, dan pengaturan institusi.",
    quote:
      '"Satu panel untuk scan transkrip, review hasil, billing kampus, dan dokumen resmi mahasiswa pindahan."',
    headerTitle: "Masuk Portal Kampus",
    headerDescription:
      "Gunakan akun admin kampus atau admin prodi yang sudah terdaftar untuk mengelola proses konversi dan operasional akademik.",
    emailLabel: "Email Kampus",
    emailPlaceholder: "admin@kampus.ac.id",
    passwordHint:
      "Akun admin prodi juga diarahkan ke portal kampus dengan hak akses yang lebih terbatas.",
    submitLabel: "Masuk Dashboard Kampus",
    helperText:
      "Belum punya akses? Tim implementasi bisa membantu setup onboarding, branding kampus, dan migrasi awal kurikulum.",
    metrics: [
      {
        value: "1 Dashboard",
        label: "Input, hasil, laporan, billing",
        hint: "Selaras dengan Admin Perguruan Tinggi v2",
      },
      {
        value: "PDF Ready",
        label: "Dokumen resmi dan preview",
        hint: "Siap untuk review kaprodi",
      },
      {
        value: "24/7",
        label: "Monitoring proses konversi",
        hint: "Status, saldo, dan aktivitas kampus",
      },
    ],
    features: [
      {
        icon: "scan",
        title: "Input Konversi Cepat",
        description:
          "Upload transkrip, mapping hasil AI, dan review mahasiswa dalam alur yang lebih jelas.",
      },
      {
        icon: "chart",
        title: "Analitik Akademik",
        description:
          "Pantau performa prodi, approval pending, serta laporan konversi per periode.",
      },
      {
        icon: "wallet",
        title: "Billing & Top Up",
        description:
          "Kelola saldo kampus, histori transaksi, dan permintaan top up dari satu halaman.",
      },
    ],
    notes: [
      {
        title: "Flow kampus paling siap",
        description:
          "Input konversi, hasil, laporan, settings, dan akad settings sudah tersedia.",
      },
      {
        title: "Masih menunggu backend final",
        description:
          "Upload logo backend, payment gateway, dan sinkronisasi policy lanjutan belum final.",
      },
    ],
  },
  super_admin: {
    badge: "Super Control Center",
    badgeAccent: "KonverPro Central",
    sideTitle: "Pusat kendali mitra kampus, saldo, user, dan konfigurasi global nasional.",
    sideDescription:
      "Tampilan ini mengikuti nuansa Dashboard Super Admin: shell terpisah, kontrol operasional, revenue, audit, dan template notifikasi.",
    quote:
      '"Pantau mitra kampus, approval top up, revenue, audit, dan template notifikasi dari satu control room."',
    headerTitle: "Masuk Portal Super Admin",
    headerDescription:
      "Gunakan akun pusat untuk mengelola ekosistem kampus, konfigurasi global, saldo, dan kontrol operasional platform.",
    emailLabel: "Email Super Admin",
    emailPlaceholder: "root@konverpro.id",
    passwordHint:
      "Portal ini diperuntukkan bagi pengelola platform pusat dengan akses kampus, top up, user, dan system control.",
    submitLabel: "Masuk Dashboard Pusat",
    helperText:
      "Portal ini sekarang diarahkan ke backend aktif untuk manajemen kampus, user, top up, audit, dan konfigurasi platform.",
    metrics: [
      {
        value: "Multi Campus",
        label: "Kontrol mitra dan approval",
        hint: "Campuses, users, topups, settings",
      },
      {
        value: "API Connected",
        label: "Flow utama tersambung",
        hint: "Kampus, user, top up, settings, dan audit",
      },
      {
        value: "Audit Aware",
        label: "Sistem lebih mudah dipantau",
        hint: "Revenue, logs, dan template notifikasi",
      },
    ],
    features: [
      {
        icon: "buildings",
        title: "Manajemen Mitra Kampus",
        description:
          "Kelola institusi, plan, status partner, dan saldo per kampus dari satu kontrol utama.",
      },
      {
        icon: "users",
        title: "Akses & Operasional",
        description:
          "Atur role admin, user kampus, dan pemetaan akses lintas institusi dari portal pusat.",
      },
      {
        icon: "gear",
        title: "Global Config & SMTP",
        description:
          "Konfigurasi tarif, SMTP, template notifikasi, dan kontrol sistem global dengan UI yang lebih rapi.",
      },
    ],
    notes: [
      {
        title: "Shell utama sudah aktif",
        description:
          "Overview, kampus, user, top up, settings, notification templates, audit, dan backup sudah tersedia.",
      },
      {
        title: "Yang masih belum 1:1",
        description:
          "Tab detail kampus, global config lanjutan, dan visual richness dashboard masih bisa dipoles lagi.",
      },
    ],
  },
};
