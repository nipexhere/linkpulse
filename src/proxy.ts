import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Optimistic check: bounce signed-out visitors before the dashboard renders.
// Server actions verify the session again before touching data.
export async function proxy(request: NextRequest) {
  const signedIn = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!signedIn) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
