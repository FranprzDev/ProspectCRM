"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/prospects", label: "Prospectos" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/mejoras", label: "Mejoras" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 text-sm font-medium">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 transition ${
              active
                ? "bg-indigo-200 text-indigo-700"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
