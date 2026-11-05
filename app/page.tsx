import Link from "next/link";
import {
  prospectStatusBadgeClass,
  prospectStatusLabels,
  prospectStatusOrder,
  WebsiteStatus,
} from "@/lib/domain/enums";
import {
  getPipelineSummary,
  getReviewSummary,
  listProspectRows,
} from "@/lib/services/prospect-service";
import { getCampaignValue } from "@/lib/db/campaign-repository";
import { CampaignCard } from "./campaign-card";
import { formatRelative } from "@/lib/format";
import { findProspectById } from "@/lib/db/prospect-repository";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const [summary, prospects, review, contactStartedAt] = await Promise.all([
    getPipelineSummary(),
    listProspectRows(),
    getReviewSummary(),
    getCampaignValue("contact_started_at"),
  ]);
  const names = new Map(prospects.map((p) => [p.id, p.name]));
  const prospectNames = new Map<string, string>();
  for (const activity of summary.recentActivities) {
    if (!names.has(activity.prospectId) && !prospectNames.has(activity.prospectId)) {
      const row = await findProspectById(activity.prospectId);
      prospectNames.set(activity.prospectId, row?.name ?? "Prospecto eliminado");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-xl font-bold">Pipeline</h1>
        <div className="mt-3 flex flex-col gap-2">
          {prospectStatusOrder.map((status) => {
            const count = summary.counts[status] ?? 0;
            const rows = prospects.filter((p) => p.status === status);
            return (
              <div key={status} className="border-b border-stone-200 pb-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${prospectStatusBadgeClass[status]}`}
                  >
                    {prospectStatusLabels[status]}
                  </span>
                  <span className="text-2xl font-bold tabular-nums">{count}</span>
                </div>
                {rows.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rows.slice(0, 6).map((prospect) => (
                      <Link
                        key={prospect.id}
                        href={`/prospects/${prospect.id}`}
                        className="rounded-md border border-stone-300 bg-[#212429] px-3 py-2 text-sm font-medium hover:border-indigo-400"
                      >
                        {prospect.name}
                      </Link>
                    ))}
                    {rows.length > 6 && (
                      <Link
                        href={`/prospects?status=${status}`}
                        className="rounded-md border border-dashed border-stone-400 px-3 py-2 text-sm font-medium text-stone-400 hover:border-indigo-400"
                      >
                        +{rows.length - 6} más
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-bold">Revisión de candidatos</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={`/prospects?web=${WebsiteStatus.Unknown}`}
            className="rounded-[10px] border border-stone-300 bg-[#212429] px-3 py-2"
          >
            <p className="text-lg font-bold leading-tight tabular-nums">
              {review.websiteCounts[WebsiteStatus.Unknown] ?? 0}
            </p>
            <p className="text-xs text-stone-500">Sin verificar</p>
          </Link>
          <Link
            href={`/prospects?web=${WebsiteStatus.NoWebsite}`}
            className="rounded-[10px] border border-stone-300 bg-[#212429] px-3 py-2"
          >
            <p className="text-lg font-bold leading-tight tabular-nums">
              {review.websiteCounts[WebsiteStatus.NoWebsite] ?? 0}
            </p>
            <p className="text-xs text-stone-500">Sin web verificados</p>
          </Link>
          <Link
            href={`/prospects?web=${WebsiteStatus.WeakWebsite}`}
            className="rounded-[10px] border border-stone-300 bg-[#212429] px-3 py-2"
          >
            <p className="text-lg font-bold leading-tight tabular-nums">
              {review.websiteCounts[WebsiteStatus.WeakWebsite] ?? 0}
            </p>
            <p className="text-xs text-stone-500">Web débil</p>
          </Link>
          <Link
            href="/prospects?demo=1"
            className="rounded-[10px] border border-stone-300 bg-[#212429] px-3 py-2"
          >
            <p className="text-lg font-bold leading-tight tabular-nums">
              {review.withDemo}
            </p>
            <p className="text-xs text-stone-500">Con muestra lista</p>
          </Link>
        </div>
      </section>
      <CampaignCard
        contactStartedAt={contactStartedAt}
        eligibleCount={review.contactEligible}
      />
      <section>
        <h2 className="text-lg font-bold">Actividad reciente</h2>
        {summary.recentActivities.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            Todavía no hay movimientos. Cargá tu primer prospecto desde Nuevo.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {summary.recentActivities.map((activity) => (
              <li key={activity.id} className="text-sm">
                <Link
                  href={`/prospects/${activity.prospectId}`}
                  className="font-semibold text-indigo-700"
                >
                  {names.get(activity.prospectId) ??
                    prospectNames.get(activity.prospectId) ??
                    "Prospecto"}
                </Link>{" "}
                <span className="text-stone-700">{activity.message}</span>{" "}
                <span className="text-xs text-stone-400">
                  {formatRelative(activity.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
