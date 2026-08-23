import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key"
);

const roleRouteMap: Record<string, string> = {
  HOMEOWNER: "/dashboard/member",
  VENDOR: "/dashboard/vendor",
  FINANCING_PARTNER: "/dashboard/financing",
  ADMIN: "/dashboard/admin",
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;
      const expectedPath = roleRouteMap[userRole];

      // Block access to unauthorized dashboards
      if (expectedPath && !pathname.startsWith(expectedPath) && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL(expectedPath, request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users trying to access login/signup
  if (pathname === "/login" || pathname === "/signup") {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const redirectUrl = roleRouteMap[payload.role as string] || "/";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      } catch {
        // Proceed to auth page if token is invalid
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};