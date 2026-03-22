"use client";

import Link from "next/link";
import { isAxiosError } from "axios";
import Cookies from "js-cookie";
import {
  ArrowRight,
  CircleNotch,
  Eye,
  EyeSlash,
  Info,
  Lifebuoy,
  LockKey,
  ShieldCheck,
  SignIn,
  UserCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AuthPortalTabs from "@/components/auth/AuthPortalTabs";
import LoginShowcasePanel from "@/components/auth/LoginShowcasePanel";
import {
  portalConfigs,
  type PortalMode,
} from "@/components/auth/portal-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/axios";
import { cn } from "@/lib/utils";

type LoginResponse = {
  access_token: string;
  user: {
    name: string;
    role: string;
    university_id?: string | number | null;
  };
};

const resolvePortalMode = (value: string | null): PortalMode =>
  value === "super_admin" ? "super_admin" : "campus_admin";

export default function LoginPage() {
  const router = useRouter();

  const [portalMode, setPortalMode] = useState<PortalMode>("campus_admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setPortalMode(resolvePortalMode(params.get("portal")));
  }, []);

  const activePortal = useMemo(() => portalConfigs[portalMode], [portalMode]);

  const handlePortalChange = (nextMode: PortalMode) => {
    setPortalMode(nextMode);
    router.replace(`/login?portal=${nextMode}`, { scroll: false });
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.post<LoginResponse>("/login", {
        email,
        password,
      });

      const { access_token, user } = response.data;
      const normalizedRole = String(user.role ?? "");

      Cookies.set("token", access_token, { expires: 7 });
      Cookies.set("user_role", normalizedRole, { expires: 7 });

      if (user.university_id !== undefined && user.university_id !== null) {
        Cookies.set("user_univ", String(user.university_id), { expires: 7 });
      } else {
        Cookies.remove("user_univ");
      }

      toast.success(`Selamat datang, ${user.name}`);

      if (
        (portalMode === "super_admin" && normalizedRole !== "super_admin") ||
        (portalMode === "campus_admin" &&
          !["campus_admin", "prodi_admin"].includes(normalizedRole))
      ) {
        toast.info("Akun Anda diarahkan ke portal yang sesuai dengan role.");
      }

      if (normalizedRole === "super_admin") {
        router.push("/super-admin");
        return;
      }

      if (
        normalizedRole === "campus_admin" ||
        normalizedRole === "prodi_admin"
      ) {
        router.push("/campus-admin");
        return;
      }

      router.push("/");
    } catch (error: unknown) {
      toast.error(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Login gagal. Periksa email dan kata sandi Anda.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(253,216,36,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(9,78,139,0.14),_transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.65),_transparent),linear-gradient(to_right,_rgba(255,255,255,0.35),_transparent)] [background-size:120px_120px]" />
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-100/50 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
          <LoginShowcasePanel mode={portalMode} />

          <section className="relative bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center">
              <div className="mb-8 flex items-center justify-between lg:hidden">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 text-left"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-900 text-lg font-black text-white shadow-lg shadow-brand-900/20">
                    K
                  </div>
                  <div>
                    <p className="text-lg font-black tracking-tight text-brand-900">
                      KonverPro
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Login Portal
                    </p>
                  </div>
                </Link>

                <Link
                  href="/"
                  className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 transition hover:text-brand-700"
                >
                  Kembali
                </Link>
              </div>

              <div className="mb-6 rounded-[1.75rem] border border-brand-100 bg-brand-50/60 p-5 lg:hidden">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-700">
                  {activePortal.badgeAccent}
                </p>
                <p className="mt-2 text-lg font-black leading-tight text-brand-900">
                  {activePortal.sideTitle}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {activePortal.sideDescription}
                </p>
              </div>

              <div className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-7">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  <ShieldCheck
                    size={14}
                    weight="fill"
                    className="text-brand-700"
                  />
                  Portal Login KonverPro
                </div>

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-lg shadow-brand-900/15">
                    {portalMode === "super_admin" ? (
                      <ShieldCheck size={24} weight="fill" />
                    ) : (
                      <SignIn size={24} weight="bold" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Portal Access
                    </p>
                    <h1 className="text-2xl font-black tracking-tight text-brand-900">
                      {activePortal.headerTitle}
                    </h1>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-500">
                  {activePortal.headerDescription}
                </p>

                <div className="mt-6">
                  <AuthPortalTabs
                    mode={portalMode}
                    onChange={handlePortalChange}
                  />
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/90 px-4 py-3">
                  <Info
                    size={18}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-brand-700"
                  />
                  <p className="text-xs leading-relaxed text-slate-500">
                    {activePortal.passwordHint}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="mt-7 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      {activePortal.emailLabel}
                    </label>
                    <div className="relative">
                      <UserCircle
                        size={20}
                        weight="duotone"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      />
                      <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder={activePortal.emailPlaceholder}
                        autoComplete="email"
                        required
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-brand-900 shadow-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <LockKey
                        size={20}
                        weight="duotone"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Masukkan kata sandi"
                        autoComplete="current-password"
                        required
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50 pl-12 pr-14 text-sm font-bold text-brand-900 shadow-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-brand-700"
                        aria-label={
                          showPassword
                            ? "Sembunyikan password"
                            : "Lihat password"
                        }
                      >
                        {showPassword ? (
                          <EyeSlash size={20} weight="bold" />
                        ) : (
                          <Eye size={20} weight="bold" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-14 w-full rounded-2xl bg-brand-900 text-xs font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-brand-900/20 transition hover:bg-brand-800"
                  >
                    {isLoading ? (
                      <>
                        <CircleNotch className="animate-spin" size={20} />
                        Memproses Login
                      </>
                    ) : (
                      <>
                        {activePortal.submitLabel}
                        <ArrowRight size={18} weight="bold" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 flex items-start gap-3 rounded-[1.4rem] border border-brand-100 bg-brand-50/70 px-4 py-4">
                  <ShieldCheck
                    size={20}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-brand-700"
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-700">
                      Secure Session
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Akses portal ini dipisah berdasarkan role agar admin
                      kampus dan super admin masuk ke ruang kerja yang sesuai.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {activePortal.notes.map((note) => (
                    <div
                      key={note.title}
                      className="rounded-[1.35rem] border border-slate-200 bg-white p-4"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {note.title}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        {note.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-brand-100 bg-brand-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-white">
                      <Lifebuoy size={20} weight="fill" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-brand-900">
                        Butuh bantuan onboarding?
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {activePortal.helperText}
                      </p>
                      <a
                        href="mailto:support@konverpro.id"
                        className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand-700 transition hover:text-brand-900"
                      >
                        <Lifebuoy size={16} weight="bold" />
                        support@konverpro.id
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/"
                  className={cn(
                    "inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] transition",
                    "text-slate-500 hover:text-brand-900",
                  )}
                >
                  <ArrowRight size={16} weight="bold" className="rotate-180" />
                  Kembali ke marketplace
                </Link>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  &copy; 2026 KonverPro Systems
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
