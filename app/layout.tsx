import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ServiceWorkerRegister } from "./service-worker-register";
import { LogoutButton } from "./logout-button";
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
  const { env } = await getCloudflareContext({ async: true });
  const secret = env.SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  const token = store.get(sessionCookieName)?.value;
  return verifySessionToken(token, secret);
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
          <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Prospect<span className="text-indigo-600">CRM</span>
            </Link>
            {authenticated ? (
              <nav className="flex items-center gap-4 text-sm font-medium">
                <Link
                  href="/prospects"
                  className="py-2 text-stone-600 hover:text-stone-900"
                >
                  Prospectos
                </Link>
                <Link
                  href="/estadisticas"
                  className="py-2 text-stone-600 hover:text-stone-900"
                >
                  Estadísticas
                </Link>
                <Link
                  href="/mejoras"
                  className="py-2 text-stone-600 hover:text-stone-900"
                >
                  Mejoras sugeridas
                </Link>
                <LogoutButton />
              </nav>
            ) : null}
          </header>
          <main className="flex-1 px-4 py-5">{children}</main>
        </div>
      </body>
    </html>
  );
}
