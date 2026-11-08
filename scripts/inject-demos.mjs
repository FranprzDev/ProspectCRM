// Injects the prospect-webs demo sites into the OpenNext assets directory so
// each demo is served by path on the CRM host:
//   https://prospect-crm.franprzdev.workers.dev/<nombre-worker>
// Source of truth: the prospect-webs monorepo (one folder per site). Folders
// with site/ use that directory; otherwise public/.
// drymeat-web and anka-aerial-web stay on their own workers (SPAs with
// root-absolute asset paths and links already shared); normaster-web and
// almacen-de-maria-web have no CRM ficha and are not served publicly.
//
// Usage:  node scripts/inject-demos.mjs            (usa ../prospect-webs si existe)
//         DEMOS_DIR=<checkout de prospect-webs> node scripts/inject-demos.mjs
//         ALLOW_NO_DEMOS=1 node scripts/inject-demos.mjs   (deploy del CRM sin demos)
//
// Sin una fuente de demos valida el script FALLA: un deploy silencioso sin
// demos borraria las 93 rutas publicas. Usar ALLOW_NO_DEMOS=1 solo si el
// deploy sin demos es intencional.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const allowNoDemos = process.env.ALLOW_NO_DEMOS === "1";
const sibling = resolve(process.cwd(), "..", "prospect-webs");
const demosDir = process.env.DEMOS_DIR ?? (existsSync(join(sibling, "webs")) ? sibling : undefined);

if (!demosDir) {
  if (allowNoDemos) {
    console.warn("inject-demos: ALLOW_NO_DEMOS=1, se despliega el CRM SIN demos por ruta");
    process.exit(0);
  }
  console.error(
    "inject-demos: no se encontro el monorepo prospect-webs.\n" +
      "  Clonalo una vez al lado del CRM:  git clone https://github.com/FranprzDev/prospect-webs ../prospect-webs\n" +
      "  o indica la ruta con DEMOS_DIR=<path al checkout>.\n" +
      "  Para desplegar el CRM sin demos a proposito: ALLOW_NO_DEMOS=1.",
  );
  process.exit(1);
}

const websDir = join(demosDir, "webs");
const manifestPath = join(demosDir, "manifest.json");
const assetsDir = join(process.cwd(), ".open-next", "assets");
if (!existsSync(assetsDir)) {
  console.error("inject-demos: no existe .open-next/assets (correr despues de opennextjs build)");
  process.exit(1);
}
if (!existsSync(websDir) || !existsSync(manifestPath)) {
  console.error(`inject-demos: ${demosDir} no parece un checkout de prospect-webs (faltan webs/ o manifest.json)`);
  process.exit(1);
}

// Solo se inyectan las webs migrables con ficha viva en el CRM (manifest.json).
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const injectable = manifest.webs
  .filter((e) => e.prospect !== null && String(e.hosting ?? "").startsWith("migrable"))
  .map((e) => e.worker);

const missing = [];
const skipped = [];
let copied = 0;
for (const slug of injectable) {
  const dir = join(websDir, slug);
  const src = existsSync(join(dir, "site", "index.html"))
    ? join(dir, "site")
    : existsSync(join(dir, "public", "index.html"))
      ? join(dir, "public")
      : null;
  if (src === null) {
    missing.push(slug);
    continue;
  }
  const dest = join(assetsDir, slug);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  copied += 1;
}

for (const slug of readdirSync(websDir)) {
  if (!statSync(join(websDir, slug)).isDirectory()) continue;
  if (!injectable.includes(slug)) skipped.push(slug);
}

if (missing.length > 0) {
  console.error(
    `inject-demos: faltan ${missing.length} demos esperadas en ${demosDir} (sin site/ ni public/ o checkout incompleto):`,
  );
  for (const slug of missing) console.error(`  - ${slug}`);
  console.error("Actualiza el checkout de prospect-webs y reintenta. No se despliega un CRM sin las demos esperadas.");
  process.exit(1);
}

console.log(`inject-demos: ${copied}/${injectable.length} demos inyectadas en assets desde ${demosDir}`);
if (skipped.length > 0) {
  console.log(`inject-demos: ${skipped.length} carpetas no inyectadas (worker propio o sin ficha): ${skipped.join(", ")}`);
}
