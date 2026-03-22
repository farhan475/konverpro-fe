import type { Metadata } from "next";
import SuperAdminShell from "@/components/super-admin/shell/SuperAdminShell";

export const metadata: Metadata = {
  title: "Super Admin | KonverPro",
  description: "Panel super admin KonverPro.",
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminShell>{children}</SuperAdminShell>;
}