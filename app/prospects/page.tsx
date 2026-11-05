import Link from "next/link";
import {
  prospectStatusBadgeClass,
  prospectStatusLabels,
  prospectStatusOrder,
  websiteStatusLabels,
  WebsiteStatus,
} from "@/lib/domain/enums";
import { listProspectRows } from "@/lib/services/prospect-service";
import { formatRelative } from "@/lib/format";
import type { ProspectRow } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const rows = await listProspectRows();
  const byStatus = new Map<string, ProspectRow[]>();
  for (const status of prospectStatusOrder) byStatus.set(status, []);
  for (const row of rows) {
    const list = byStatus.get(row.status) ?? [];
    list.push(row);
    byStatus.set(row.status, list);
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Prospectos</h1>
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-7">
        {prospectStatusOrder.map((status) => {
          const list = byStatus.get(status) ?? [];
          return (
            <section
              key={status}
              className="flex w-56 shrink-0 flex-col rounded-xl border border-stone-200 bg-stone-50 md:w-auto"
            >
              <header className="flex items-center justify-between px-3 py-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                  {prospectStatusLabels[status]}
                </h2>
                <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-bold tabular-nums text-stone-700">
                  {list.length}
                </span>
              </header>
              <div className="flex flex-col gap-2 px-2 pb-2">
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
  );
}

function BoardCard({ prospect }: { prospect: ProspectRow }) {
  return (
    <Link
      href={`/prospects/${prospect.id}`}
      className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow"
    >
      <p className="text-sm font-semibold leading-snug">{prospect.name}</p>
      <p className="mt-0.5 text-xs text-stone-500">{prospect.category}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${prospectStatusBadgeClass[prospect.status as keyof typeof prospectStatusBadgeClass] ?? "bg-stone-200 text-stone-700"}`}
        >
          {websiteStatusLabels[prospect.websiteStatus as WebsiteStatus] ?? prospect.websiteStatus}
        </span>
        {prospect.demoPageUrl ? (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            Web lista
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[10px] text-stone-400">
        Actualizado {formatRelative(prospect.updatedAt)}
      </p>
    </Link>
  );
}
