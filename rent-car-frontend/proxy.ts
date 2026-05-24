import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  // Redirect already-authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      return NextResponse.redirect(new URL("/vehicles", request.url));
    }
    return NextResponse.next();
  }

  // Admin pages require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!token || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/vehicles", request.url));
    }
    return NextResponse.next();
  }

  // Reservations require any authenticated user
  if (pathname.startsWith("/reservations")) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/reservations/:path*",
    "/admin/:path*",
  ],
};
