import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (req.nextUrl.pathname === "/" && token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/panel", req.url));
    } catch {}
  }

  if (req.nextUrl.pathname.startsWith("/panel")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/panel/:path*"],
};
