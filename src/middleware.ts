import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ambil token dari cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('user_role')?.value;
  
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // 1. Proteksi Halaman Super Admin
  if (path.startsWith('/super-admin')) {
    if (!token) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (role !== 'super_admin') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // 2. Proteksi Halaman Admin Kampus
  if (path.startsWith('/campus-admin')) {
    if (!token) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (role !== 'campus_admin') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // 3. Proteksi Halaman Login (Kalau sudah login, jangan kasih masuk sini lagi)
  if (path === '/login' && token) {
    if (role === 'campus_admin') {
      url.pathname = '/campus-admin';
      return NextResponse.redirect(url);
    }
    if (role === 'super_admin') {
      url.pathname = '/super-admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Tentukan path mana saja yang dicek middleware
export const config = {
  matcher: ['/super-admin/:path*', '/campus-admin/:path*', '/login'],
}