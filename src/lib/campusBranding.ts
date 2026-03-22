import type { ImageLoaderProps } from "next/image";

export const CAMPUS_LOGO_STORAGE_KEY = "kp_campus_logo_preview";

export function getStoredCampusLogo(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CAMPUS_LOGO_STORAGE_KEY);
}

export function saveStoredCampusLogo(value: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CAMPUS_LOGO_STORAGE_KEY, value);
}

export function clearStoredCampusLogo() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CAMPUS_LOGO_STORAGE_KEY);
}

export function campusLogoLoader({ src }: ImageLoaderProps) {
  if (
    src.startsWith("data:") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return src;
  }

  return `${baseUrl}/storage/${src.replace(/^\/+/, "")}`;
}
