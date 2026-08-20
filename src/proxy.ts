import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, type Role } from "@/lib/jwt";

const ROLE_PREFIXES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/member", roles: ["HOMEOWNER", "ADMIN"] },
  { prefix: "/vendor", roles: ["VENDOR", "ADMIN"] },
  { prefix: "/financing", roles: ["FINANCING_PARTNER", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = ROLE_PREFIXES.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!match.roles.includes(session.role)) {
    const fallback: Record<Role, string> = {
      HOMEOWNER: "/member",
      VENDOR: "/vendor",
      FINANCING_PARTNER: "/financing",
      ADMIN: "/admin",
    };
    return NextResponse.redirect(new URL(fallback[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*", "/vendor/:path*", "/financing/:path*", "/admin/:path*"],
};
