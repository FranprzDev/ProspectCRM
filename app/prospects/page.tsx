import { WhatsAppHandoff } from "@/app/whatsapp-handoff";
import Link from "next/link";
import {
  ProspectCategory,
  prospectCategoryLabels,
  prospectStatusBadgeClass,
  prospectStatusLabels,
  prospectStatusOrder,
  ProspectStatus,
  websiteStatusLabels,
  WebsiteStatus,
} from "@/lib/domain/enums";
import { listProspectRows } from "@/lib/services/prospect-service";
import {
  IconMail,
  IconMapPin,
  IconPhone,
  IconSearch,
  IconStar,
  IconWeb,
} from "@/app/icons";
import type { ProspectRow } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const statusDotClass: Record<string, string> = {
  NEW: "bg-stone-400",
  CONTACTED: "bg-blue-800",
  ADVANCED_LEAD: "bg-violet-800",
  CLOSING: "bg-amber-800",
  HUMAN_HANDOFF: "bg-orange-800",
  WON: "bg-green-800",
  LOST: "bg-red-800",
  OPTED_OUT: "bg-stone-500",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = first(params.q).trim();
  const categoria = first(params.categoria);
  const web = first(params.web);
  const conDemo = first(params.demo) === "1";
  const conEmail = first(params.email) === "1";
  const filtersActive =
    q !== "" || categoria !== "" || web !== "" || conDemo || conEmail;

  const allRows = await listProspectRows();
  const kpis = {
    total: allRows.length,
    contactables: allRows.filter((p) => p.phone !== null || p.email !== null)
      .length,
    withDemo: allRows.filter((p) => p.demoPageUrl !== null).length,
    withEmail: allRows.filter((p) => p.email !== null).length,
  };

  const rows = filtersActive
    ? await listProspectRows(undefined, q === "" ? undefined : q, {
        category: categoria === "" ? undefined : categoria,
        websiteStatus: web === "" ? undefined : web,
        hasDemo: conDemo || undefined,
        hasEmail: conEmail || undefined,
      })
    : allRows;

  const byStatus = new Map<string, ProspectRow[]>();
  for (const status of prospectStatusOrder) byStatus.set(status, []);
  if (!filtersActive) {
    for (const row of rows) {
      const list = byStatus.get(row.status) ?? [];
      list.push(row);
      byStatus.set(row.status, list);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold">Prospectos</h1>
        <span className="text-xs text-stone-500">
          {kpis.contactables} contactables · {kpis.withDemo} con muestra ·{" "}
          {kpis.withEmail} con email
        </span>
      </div>

      <form
        action="/prospects"
        method="get"
        className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-[#212429] p-3"
      >
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
            <IconSearch />
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre..."
            className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-stone-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            name="categoria"
            defaultValue={categoria}
            className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Todos los rubros</option>
            {Object.values(ProspectCategory).map((c) => (
              <option key={c} value={c}>
                {prospectCategoryLabels[c]}
              </option>
            ))}
          </select>
          <select
            name="web"
            defaultValue={web}
            className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Web: todas</option>
            {Object.values(WebsiteStatus).map((w) => (
              <option key={w} value={w}>
                {websiteStatusLabels[w]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            href={buildQuery({ q, categoria, web, demo: conDemo ? "" : "1", email: conEmail ? "1" : "" })}
            active={conDemo}
            label="Con muestra"
          />
          <FilterChip
            href={buildQuery({ q, categoria, web, demo: conDemo ? "1" : "", email: conEmail ? "" : "1" })}
            active={conEmail}
            label="Con email"
          />
          <span className="flex-1" />
          {filtersActive ? (
            <Link
              href="/prospects"
              className="rounded-lg px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-900"
            >
              Limpiar
            </Link>
          ) : null}
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Filtrar
          </button>
        </div>
      </form>

      {filtersActive ? (
        <section>
          <p className="mb-2 text-xs text-stone-500">
            {rows.length} resultado{rows.length === 1 ? "" : "s"}
          </p>
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
              Ningún prospecto coincide con esos filtros.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rows.map((p) => (
                <li key={p.id}>
                  <BoardCard prospect={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <div className="relative left-1/2 w-[calc(100vw-1rem)] max-w-7xl -translate-x-1/2 px-2">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:snap-none">
            {prospectStatusOrder.map((status) => {
              const list = byStatus.get(status) ?? [];
              return (
                <section
                  key={status}
                  className="flex max-h-[75vh] w-64 shrink-0 snap-start flex-col rounded-xl border border-stone-200 bg-[#212429]"
                >
                  <header className="flex items-center justify-between px-3 py-2">
                    <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-600">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${statusDotClass[status] ?? "bg-stone-400"}`}
                      />
                      {prospectStatusLabels[status]}
                    </h2>
                    <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-bold tabular-nums text-stone-700">
                      {list.length}
                    </span>
                  </header>
                  <div className="flex flex-col gap-2 overflow-y-auto px-2 pb-2">
                    {list.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-stone-200 px-2 py-3 text-center text-xs text-stone-400">
                        Vacío
                      </p>
                    ) : (
                      list.map((p) => <BoardCard key={p.id} prospect={p} />)
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function buildQuery(parts: {
  q: string;
  categoria: string;
  web: string;
  demo: string;
  email: string;
}): string {
  const params = new URLSearchParams();
  if (parts.q !== "") params.set("q", parts.q);
  if (parts.categoria !== "") params.set("categoria", parts.categoria);
  if (parts.web !== "") params.set("web", parts.web);
  if (parts.demo !== "") params.set("demo", parts.demo);
  if (parts.email !== "") params.set("email", parts.email);
  const qs = params.toString();
  return qs === "" ? "/prospects" : `/prospects?${qs}`;
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-indigo-500 bg-indigo-200 text-indigo-700"
          : "border-stone-300 text-stone-500 hover:text-stone-900"
      }`}
    >
      {label}
    </Link>
  );
}

function Badge({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full bg-stone-300 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600"
    >
      {children}
    </span>
  );
}

function BoardCard({ prospect }: { prospect: ProspectRow }) {
  const websiteLabel =
    websiteStatusLabels[prospect.websiteStatus as WebsiteStatus] ??
    prospect.websiteStatus;
  const statusBadge =
    prospectStatusBadgeClass[
      prospect.status as keyof typeof prospectStatusBadgeClass
    ] ?? "bg-stone-200 text-stone-700";
  return (
    <article
      className="block rounded-lg border border-stone-300 bg-[#17191c] p-3 transition hover:border-indigo-500"
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/prospects/${prospect.id}`} className="text-sm font-semibold leading-snug hover:underline">{prospect.name}</Link>
        {prospect.rating !== null ? (
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-amber-800">
            <IconStar className="h-3 w-3" />
            {(Math.round(prospect.rating * 10) / 10).toLocaleString("es-AR")}
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-xs text-stone-500">
        {prospectCategoryLabels[prospect.category as ProspectCategory] ??
          prospect.category}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge}`}
        >
          {prospectStatusLabels[prospect.status as ProspectStatus] ??
            prospect.status}
        </span>
        <Badge title={`Sitio web: ${websiteLabel}`}>
          <IconWeb />
          {websiteLabel}
        </Badge>
        {prospect.phone !== null ? (
          <Badge title="Teléfono cargado">
            <IconPhone />
          </Badge>
        ) : null}
        {prospect.email !== null ? (
          <Badge title="Email cargado">
            <IconMail />
          </Badge>
        ) : null}
        {prospect.mapsUrl !== null ? (
          <Badge title="Ficha de Maps">
            <IconMapPin />
          </Badge>
        ) : null}
        {prospect.demoPageUrl !== null ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            Muestra lista
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/prospects/${prospect.id}`} className="text-xs text-indigo-300 underline">Abrir ficha</Link>
        {prospect.demoPageUrl !== null && <a href={prospect.demoPageUrl} target="_blank" rel="noreferrer" className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">Ver muestra</a>}
      </div>
      <div className="mt-2"><WhatsAppHandoff prospectId={prospect.id} /></div>
    </article>
  );
}
