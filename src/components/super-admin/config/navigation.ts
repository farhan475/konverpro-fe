import {
  Bell,
  Buildings,
  ChartBar,
  ClipboardText,
  Database,
  Gear,
  GraduationCap,
  House,
  Money,
  Users,
} from "@phosphor-icons/react";

type SuperAdminIcon = typeof House;

export interface SuperAdminNavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: SuperAdminIcon;
  eyebrow: string;
  description: string;
}

export interface SuperAdminNavSection {
  label: string;
  items: SuperAdminNavItem[];
}

export const superAdminNavSections: SuperAdminNavSection[] = [
  {
    label: "Main Menu",
    items: [
      {
        href: "/super-admin",
        label: "Overview",
        shortLabel: "Overview",
        icon: House,
        eyebrow: "Main Menu",
        description:
          "Ringkasan utama kampus, user, transaksi, dan performa jaringan partner.",
      },
      {
        href: "/super-admin/campuses",
        label: "Manajemen Kampus",
        shortLabel: "Kampus",
        icon: Buildings,
        eyebrow: "Main Menu",
        description:
          "Kelola institusi, status partner, saldo, dan workspace kampus mitra.",
      },
      {
        href: "/super-admin/konversi",
        label: "Data Konversi",
        shortLabel: "Konversi",
        icon: GraduationCap,
        eyebrow: "Main Menu",
        description:
          "Pantau volume konversi dan performa aktivitas lintas kampus.",
      },
    ],
  },
  {
    label: "Keuangan & User",
    items: [
      {
        href: "/super-admin/finance",
        label: "Top Up & Saldo",
        shortLabel: "Finance",
        icon: Money,
        eyebrow: "Keuangan & User",
        description:
          "Verifikasi top up, arus saldo, dan keputusan transaksi operasional.",
      },
      {
        href: "/super-admin/income",
        label: "Report Pemasukan",
        shortLabel: "Income",
        icon: ChartBar,
        eyebrow: "Keuangan & User",
        description:
          "Analitik pemasukan, tren revenue, dan performa monetisasi platform.",
      },
      {
        href: "/super-admin/users",
        label: "Manajemen User",
        shortLabel: "Users",
        icon: Users,
        eyebrow: "Keuangan & User",
        description:
          "Kontrol akses operator, admin kampus, dan distribusi role sistem.",
      },
    ],
  },
  {
    label: "System Control",
    items: [
      {
        href: "/super-admin/settings",
        label: "Config Global",
        shortLabel: "Config",
        icon: Gear,
        eyebrow: "System Control",
        description:
          "Atur pricing global, support channel, maintenance mode, dan SMTP.",
      },
      {
        href: "/super-admin/system",
        label: "Backup & Restore",
        shortLabel: "Backup",
        icon: Database,
        eyebrow: "System Control",
        description:
          "Ekspor snapshot dan restore data sistem untuk kebutuhan recovery.",
      },
      {
        href: "/super-admin/audit-logs",
        label: "Audit Logs",
        shortLabel: "Audit",
        icon: ClipboardText,
        eyebrow: "System Control",
        description:
          "Telusuri aktivitas penting dan jejak perubahan operasional platform.",
      },
      {
        href: "/super-admin/notification-templates",
        label: "Template Notifikasi",
        shortLabel: "Notif",
        icon: Bell,
        eyebrow: "System Control",
        description:
          "Kelola orkestrasi pesan email dan notifikasi untuk flow utama aplikasi.",
      },
    ],
  },
];

export const superAdminNavItems = superAdminNavSections.flatMap(
  (section) => section.items,
);

export function resolveSuperAdminPath(pathname: string) {
  if (
    pathname === "/super-admin/backup" ||
    pathname.startsWith("/super-admin/backup/")
  ) {
    return "/super-admin/system";
  }

  return pathname;
}

export function isSuperAdminNavItemActive(pathname: string, href: string) {
  const currentPath = resolveSuperAdminPath(pathname);

  if (href === "/super-admin") {
    return currentPath === href;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function getSuperAdminNavContext(pathname: string) {
  const currentPath = resolveSuperAdminPath(pathname);

  for (const section of superAdminNavSections) {
    for (const item of section.items) {
      if (isSuperAdminNavItemActive(currentPath, item.href)) {
        return {
          section,
          item,
        };
      }
    }
  }

  return {
    section: superAdminNavSections[0],
    item: superAdminNavSections[0].items[0],
  };
}
