import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ServiceWorkerRegister } from "./service-worker-register";
import { LogoutButton } from "./logout-button";
import { NavLinks } from "./nav-links";
import { sessionCookieName, verifySessionToken } from "@/lib/auth/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProspectCRM",
  description: "CRM para seguir prospectos de venta de webs",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#17191c",
  width: "device-width",
  initialScale: 1,
};

async function isAuthenticated(): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const secret = env.SESSION_SECRET;
    if (!secret) return false;
    const store = await cookies();
    const token = store.get(sessionCookieName)?.value;
    return await verifySessionToken(token, secret);
  } catch {
    return false;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authenticated = await isAuthenticated();
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <ServiceWorkerRegister />
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
          <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#17191c]/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2.5">
              <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
                Prospect<span className="text-indigo-600">CRM</span>
              </Link>
              {authenticated ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <NavLinks />
                  <LogoutButton />
                </div>
              ) : null}
            </div>
          </header>
          <main className="flex-1 px-4 py-5">{children}</main>
        </div>
      </body>
    </html>
  );
}
