import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ServiceWorkerRegister } from "./service-worker-register";
import { LogoutButton } from "./logout-button";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <ServiceWorkerRegister />
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
          <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Prospect<span className="text-indigo-600">CRM</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="py-2 text-stone-600 hover:text-stone-900">
                Panel
              </Link>
              <Link
                href="/prospects"
                className="py-2 text-stone-600 hover:text-stone-900"
              >
                Prospectos
              </Link>
              <Link
                href="/prospects/new"
                className="py-2 text-indigo-600 hover:text-indigo-800"
              >
                Nuevo
              </Link>
              <LogoutButton />
            </nav>
          </header>
          <main className="flex-1 px-4 py-5">{children}</main>
        </div>
      </body>
    </html>
  );
}
