import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";
import { joinUrl, roleHome, routeRoles } from "@/lib/access";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const roles = routeRoles(pathname);
  if (!roles) return NextResponse.next();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.redirect(new URL(joinUrl(pathname + search), request.url));
  if (!roles.includes(session.role)) return NextResponse.redirect(new URL(roleHome(session.role), request.url));
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: ["/member/:path*", "/vendor/:path*", "/financing/:path*", "/admin/:path*", "/marketplace/:path*", "/welcome", "/pending-approval", "/agreement"],
};
