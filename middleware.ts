import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const protectedPrefixes = ["/dashboard", "/onboarding", "/profile", "/jobs", "/applications", "/settings"];

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/api")) {
    return !pathname.startsWith("/api/auth");
  }

  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req: NextRequest) => {
  const isProtected = isProtectedPath(req.nextUrl.pathname);
  if (!isProtected) {
    return NextResponse.next();
  }

  if (!req.auth) {
    if (req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
