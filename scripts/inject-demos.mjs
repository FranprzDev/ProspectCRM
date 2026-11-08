// Injects the prospect-webs demo sites into the OpenNext assets directory so
// each demo is served by path on the CRM host:
//   https://prospect-crm.franprzdev.workers.dev/<nombre-worker>
// Source of truth: the prospect-webs monorepo (one folder per site). Folders
// with site/ use that directory; otherwise public/. Sites without either are
// skipped with a warning (drymeat-web and anka-aerial-web stay on their own
// workers: SPAs with root-absolute asset paths).
// Usage: DEMOS_DIR=<path to prospect-webs checkout> node scripts/inject-demos.mjs
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const demosDir = process.env.DEMOS_DIR;
if (!demosDir) {
  console.warn("inject-demos: DEMOS_DIR no definido, se despliega el CRM sin demos por ruta");
  process.exit(0);
}
const websDir = join(demosDir, "webs");
const assetsDir = join(process.cwd(), ".open-next", "assets");
if (!existsSync(assetsDir)) {
  console.error("inject-demos: no existe .open-next/assets (correr despues de opennextjs build)");
  process.exit(1);
}

// Solo se inyectan las webs migrables con ficha viva en el CRM (manifest.json):
// quedan fuera las SPAs que conservan worker propio (drymeat/anka) y las demos
// sin ficha (normaster, excluida de la campaña; almacen-de-maria, rubro descartado).
const manifest = JSON.parse(readFileSync(join(demosDir, "manifest.json"), "utf8"));
const injectable = new Set(
  manifest.webs
    .filter((e) => e.prospect !== null && String(e.hosting ?? "").startsWith("migrable"))
    .map((e) => e.worker),
);

let copied = 0;
for (const slug of readdirSync(websDir)) {
  const dir = join(websDir, slug);
  if (!statSync(dir).isDirectory()) continue;
  if (!injectable.has(slug)) {
    console.log(`inject-demos: ${slug} no migrable o sin ficha, se omite`);
    continue;
  }
  const src = existsSync(join(dir, "site", "index.html"))
    ? join(dir, "site")
    : existsSync(join(dir, "public", "index.html"))
      ? join(dir, "public")
      : null;
  if (src === null) {
    console.warn(`inject-demos: ${slug} sin site/ ni public/ desplegable, se omite`);
    continue;
  }
  const dest = join(assetsDir, slug);
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  copied += 1;
}
console.log(`inject-demos: ${copied} demos inyectadas en assets`);
