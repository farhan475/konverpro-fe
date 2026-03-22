import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("user_role")?.value;

  const url = request.nextUrl.clone();
  const path = url.pathname;

  if (path.startsWith("/super-admin")) {
    if (!token || role !== "super_admin") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (path.startsWith("/campus-admin")) {
    if (!token || !["campus_admin", "prodi_admin"].includes(role ?? "")) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (path === "/login" && token) {
    if (role === "campus_admin" || role === "prodi_admin") {
      url.pathname = "/campus-admin";
      return NextResponse.redirect(url);
    }

    if (role === "super_admin") {
      url.pathname = "/super-admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/super-admin/:path*", "/campus-admin/:path*", "/login"],
};
