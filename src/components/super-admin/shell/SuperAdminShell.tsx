"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getCurrentUser } from "../api";
import { getErrorMessage } from "../utils";
import LoadingState from "../shared/LoadingState";
import SuperAdminHeader from "./SuperAdminHeader";
import SuperAdminMobileNav from "./SuperAdminMobileNav";
import SuperAdminSidebar from "./SuperAdminSidebar";

interface SuperAdminShellProps {
  children: React.ReactNode;
}

export default function SuperAdminShell({ children }: SuperAdminShellProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Administrator");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const user = await getCurrentUser();

        if (user?.role !== "super_admin") {
          toast.error("Anda tidak memiliki akses ke halaman ini.");
          router.replace("/login");
          return;
        }

        setUserName(user?.name ?? "Administrator");
      } catch (error) {
        toast.error(getErrorMessage(error, "Sesi login tidak valid."));
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LoadingState label="Memverifikasi akses super admin..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600">
      <div className="flex min-h-screen">
        <SuperAdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <SuperAdminHeader userName={userName} />
          <SuperAdminMobileNav />
          <main className="relative flex-1 p-6 md:p-8 lg:p-10">
            <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top,_rgba(9,78,139,0.08),_transparent_60%)] blur-3xl" />
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
