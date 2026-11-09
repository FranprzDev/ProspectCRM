import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sessionCookieName, verifySessionToken } from "@/lib/auth/session";

const publicPaths = [
  "/login",
  "/manifest.webmanifest",
  "/sw.js",
  "/icon.svg",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  if (publicPaths.includes(pathname)) return true;
  if (pathname.startsWith("/icons/")) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/api/agent/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/786-barbershop-web" || pathname === "/786-barbershop-web/") {
    return new NextResponse("404", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  }
  if (isPublicPath(pathname)) return NextResponse.next();
  const { env } = await getCloudflareContext({ async: true });
  const secret = env.SESSION_SECRET;
  const token = request.cookies.get(sessionCookieName)?.value;
  const valid = secret ? await verifySessionToken(token, secret) : false;
  if (valid) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/prospects", request.url));
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
