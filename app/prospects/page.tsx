import Link from "next/link";
import {
  ProspectStatus,
  prospectCategoryLabels,
  ProspectCategory,
  prospectStatusBadgeClass,
  prospectStatusLabels,
  prospectStatusOrder,
} from "@/lib/domain/enums";
import {
  getPipelineSummary,
  listProspectRows,
} from "@/lib/services/prospect-service";

export const dynamic = "force-dynamic";

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;
  const validStatus = Object.values(ProspectStatus).find((s) => s === status);
  const [prospects, summary] = await Promise.all([
    listProspectRows(validStatus, search),
    getPipelineSummary(),
  ]);
  const stats = [
    { label: "Nuevos", count: summary.counts[ProspectStatus.New] ?? 0 },
    { label: "Contactados", count: summary.counts[ProspectStatus.Contacted] ?? 0 },
    { label: "En cierre", count: summary.counts[ProspectStatus.Closing] ?? 0 },
    { label: "Ganados", count: summary.counts[ProspectStatus.Won] ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[10px] border border-stone-300 bg-[#212429] px-3 py-2"
          >
            <p className="text-lg font-bold leading-tight tabular-nums">
              {stat.count}
            </p>
            <p className="text-xs text-stone-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <form method="get" className="flex gap-2">
        {validStatus && <input type="hidden" name="status" value={validStatus} />}
        <input
          type="search"
          name="search"
          defaultValue={search ?? ""}
          placeholder="Buscar prospecto"
          className="w-full rounded-md border border-stone-300 px-3 py-2.5 text-base focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-stone-800 px-4 py-2.5 text-sm font-semibold text-[#17191c]"
        >
          Buscar
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/prospects"
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            !validStatus ? "bg-stone-800 text-[#17191c]" : "bg-stone-200 text-stone-700"
          }`}
        >
          Todos
        </Link>
        {prospectStatusOrder.map((s) => (
          <Link
            key={s}
            href={`/prospects?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              validStatus === s
                ? "bg-stone-800 text-[#17191c]"
                : prospectStatusBadgeClass[s]
            }`}
          >
            {prospectStatusLabels[s]}
          </Link>
        ))}
      </div>
      {prospects.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          No hay prospectos con este filtro.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {prospects.map((prospect) => (
            <li key={prospect.id}>
              <Link
                href={`/prospects/${prospect.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-stone-300 bg-[#212429] p-3.5"
              >
                <div>
                  <p className="font-semibold leading-snug">{prospect.name}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {prospectCategoryLabels[prospect.category as ProspectCategory] ??
                      prospect.category}
                    {prospect.rating !== null &&
                      ` · ${prospect.rating} (${prospect.reviewsCount ?? 0} reseñas)`}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    prospectStatusBadgeClass[prospect.status as ProspectStatus] ??
                    "bg-stone-200 text-stone-700"
                  }`}
                >
                  {prospectStatusLabels[prospect.status as ProspectStatus] ??
                    prospect.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
