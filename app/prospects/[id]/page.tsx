import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EmailDirection,
  emailDirectionLabels,
  ProspectCategory,
  prospectCategoryLabels,
  ProspectStatus,
  prospectStatusBadgeClass,
  prospectStatusLabels,
  WebsiteStatus,
  websiteStatusLabels,
} from "@/lib/domain/enums";
import { getProspectDetail } from "@/lib/services/prospect-service";
import { formatDateTime, formatRelative } from "@/lib/format";
import { StatusActions } from "./status-actions";
import { DemoUrlForm } from "./demo-url-form";
import { EmailForm } from "./email-form";
import { NoteForm } from "./note-form";

export const dynamic = "force-dynamic";

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

  return (
    <div className="flex flex-col gap-7">
      <div>
        <Link href="/prospects" className="text-xs text-stone-400">
          ← Volver a prospectos
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
              <a
                href={prospect.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="py-1 font-medium text-indigo-700"
              >
                Ver en Maps
              </a>
            )}
            {prospect.websiteUrl !== null && (
              <a
                href={prospect.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="py-1 font-medium text-indigo-700"
              >
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
          <a
            href={prospect.demoPageUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block py-1 text-sm font-medium text-indigo-700"
          >
            {prospect.demoPageUrl}
          </a>
        )}
        <DemoUrlForm prospectId={prospect.id} currentUrl={prospect.demoPageUrl} />
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          Mails ({emails.length})
        </h2>
        {emails.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            Todavía no hay mails registrados para este prospecto.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {emails.map((email) => (
              <li key={email.id} className="rounded-md border border-stone-200 bg-[#212429] p-3">
                <details>
                  <summary className="cursor-pointer py-1">
                    <span
                      className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        email.direction === EmailDirection.Outbound
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {emailDirectionLabels[email.direction as EmailDirection] ??
                        email.direction}
                    </span>
                    <span className="font-medium">{email.subject}</span>
                    <span className="ml-2 text-xs text-stone-400">
                      {formatDateTime(email.sentAt)}
                    </span>
                  </summary>
                  <p className="mt-1 text-xs text-stone-500">
                    De {email.fromAddress} para {email.toAddress}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
                    {email.body}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        )}
        <EmailForm prospectId={prospect.id} />
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          Actividad y notas
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          {activities.map((activity) => (
            <li key={activity.id} className="text-sm text-stone-700">
              <span className="text-xs text-stone-400">
                {formatRelative(activity.createdAt)} ·{" "}
              </span>
              {activity.message}
            </li>
          ))}
        </ul>
        <NoteForm prospectId={prospect.id} />
      </section>
    </div>
  );
}
