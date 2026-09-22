import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isTuRoute = pathname.startsWith("/tu");
  const isKepsekRoute = pathname.startsWith("/kepsek");

  if (!isTuRoute && !isKepsekRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const role = await verifySessionToken(token);

  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isTuRoute && role !== "admin_tu") {
    return NextResponse.redirect(new URL("/kepsek", request.url));
  }
  if (isKepsekRoute && role !== "kepala_sekolah") {
    return NextResponse.redirect(new URL("/tu", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tu/:path*", "/kepsek/:path*"],
};
