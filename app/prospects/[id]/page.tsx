import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ActivityType,
  EmailDirection,
  ProspectCategory,
  prospectCategoryLabels,
  ProspectStatus,
  prospectStatusBadgeClass,
  prospectStatusLabels,
  WebsiteStatus,
  websiteStatusLabels,
} from "@/lib/domain/enums";
import { getProspectDetail } from "@/lib/services/prospect-service";
import { formatDateTime } from "@/lib/format";
import { StatusActions } from "./status-actions";
import { DemoUrlForm } from "./demo-url-form";
import { EmailForm } from "./email-form";
import { NoteForm } from "./note-form";
import type { ActivityRow, EmailRow } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type TimelineItem =
  | { kind: "email"; ts: number; email: EmailRow }
  | { kind: "note"; ts: number; activity: ActivityRow }
  | { kind: "system"; ts: number; activity: ActivityRow };

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProspectDetail(id);
  if (detail === null) notFound();
  const { prospect, emails, activities } = detail;
  const status = prospect.status as ProspectStatus;

  const timeline: TimelineItem[] = [
    ...emails.map((email) => ({ kind: "email" as const, ts: email.sentAt, email })),
    ...activities
      .filter((a) => a.type !== ActivityType.EmailLogged)
      .map((activity) => ({
        kind: (activity.type === ActivityType.Note ? "note" : "system") as "note" | "system",
        ts: activity.createdAt,
        activity,
      })),
  ].sort((a, b) => a.ts - b.ts);

  return (
    <div className="flex flex-col gap-7">
      <div>
        <Link href="/prospects" className="text-xs text-stone-400">
          ← Volver al tablero
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold">{prospect.name}</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${prospectStatusBadgeClass[status]}`}
          >
            {prospectStatusLabels[status]}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {prospectCategoryLabels[prospect.category as ProspectCategory] ??
            prospect.category}
          {prospect.rating !== null &&
            ` · ${prospect.rating} estrellas, ${prospect.reviewsCount ?? 0} reseñas`}
          {` · ${websiteStatusLabels[prospect.websiteStatus as WebsiteStatus] ?? prospect.websiteStatus}`}
        </p>
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          Estado de la venta
        </h2>
        <StatusActions prospectId={prospect.id} currentStatus={status} />
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          Contacto
        </h2>
        <div className="mt-2 flex flex-col gap-1.5 text-sm">
          {prospect.phone !== null && (
            <a href={`tel:${prospect.phone}`} className="py-1 font-medium text-indigo-700">
              {prospect.phone}
            </a>
          )}
          {prospect.email !== null && (
            <a href={`mailto:${prospect.email}`} className="py-1 font-medium text-indigo-700">
              {prospect.email}
            </a>
          )}
          {prospect.address !== null && (
            <p className="text-stone-600">{prospect.address}</p>
          )}
          <div className="flex gap-4">
            {prospect.mapsUrl !== null && (
              <a href={prospect.mapsUrl} target="_blank" rel="noreferrer" className="py-1 font-medium text-indigo-700">
                Ver en Maps
              </a>
            )}
            {prospect.websiteUrl !== null && (
              <a href={prospect.websiteUrl} target="_blank" rel="noreferrer" className="py-1 font-medium text-indigo-700">
                Web actual
              </a>
            )}
          </div>
        </div>
      </section>

      {prospect.pitchAngle !== null && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
            Ángulo de venta
          </h2>
          <p className="mt-2 border-l-4 border-indigo-200 pl-3 text-sm text-stone-700">
            {prospect.pitchAngle}
          </p>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          Página de muestra
        </h2>
        {prospect.demoPageUrl !== null && (
          <a href={prospect.demoPageUrl} target="_blank" rel="noreferrer" className="mt-1 block py-1 text-sm font-medium text-indigo-700">
            {prospect.demoPageUrl}
          </a>
        )}
        <DemoUrlForm prospectId={prospect.id} currentUrl={prospect.demoPageUrl} />
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          Conversación
        </h2>
        <div className="mt-2 rounded-xl border border-stone-200 bg-[#212429] p-3">
          <p className="mb-3 rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-800">
            Canal real: email desde franciscoperezdeveloper@gmail.com
            {emails.length === 0
              ? " · Contacto no iniciado: los envíos arrancan cuando Fran toca Iniciar contacto."
              : ` · ${emails.length} mail${emails.length === 1 ? "" : "s"} intercambiado${emails.length === 1 ? "" : "s"}.`}
          </p>
          {timeline.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">
              Todavía no hay mensajes ni notas.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {timeline.map((item) => {
                if (item.kind === "email") {
                  const outbound = item.email.direction === EmailDirection.Outbound;
                  return (
                    <div key={item.email.id} className={`flex ${outbound ? "justify-end" : "justify-start"}`}>
                      <details
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          outbound
                            ? "rounded-br-sm bg-indigo-600 text-white"
                            : "rounded-bl-sm bg-[#2e3339] text-stone-700"
                        }`}
                      >
                        <summary className="cursor-pointer list-none">
                          <span className="font-medium">{item.email.subject}</span>
                          <span className={`ml-2 text-[10px] ${outbound ? "text-indigo-800" : "text-stone-400"}`}>
                            {formatDateTime(item.email.sentAt)}
                          </span>
                        </summary>
                        <p className={`mt-1 text-[11px] ${outbound ? "text-indigo-800" : "text-stone-400"}`}>
                          De {item.email.fromAddress} para {item.email.toAddress}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap">{item.email.body}</p>
                      </details>
                    </div>
                  );
                }
                if (item.kind === "note") {
                  return (
                    <div key={item.activity.id} className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-dashed border-stone-300 bg-[#2e3339] px-3 py-2 text-sm text-stone-700">
                        <span className="mr-2 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                          Nota interna
                        </span>
                        {item.activity.message}
                        <span className="ml-2 text-[10px] text-stone-400">
                          {formatDateTime(item.activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                }
                return (
                  <p key={item.activity.id} className="py-0.5 text-center text-[11px] text-stone-400">
                    {item.activity.message} · {formatDateTime(item.activity.createdAt)}
                  </p>
                );
              })}
            </div>
          )}
        </div>
        <EmailForm prospectId={prospect.id} />
        <NoteForm prospectId={prospect.id} />
      </section>
    </div>
  );
}
