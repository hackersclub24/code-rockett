import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Access tokens are stored in localStorage (sent as Bearer on API calls), while refresh
 * tokens are HttpOnly on the API origin. Client layouts (`StudentShell`, `AdminShell`)
 * perform redirects for protected routes; this middleware is a hook for future SSR/JWT work.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/classes/:path*", "/assignments", "/profile", "/admin/:path*"],
};
