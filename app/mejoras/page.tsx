import {
  ImprovementStatus,
  improvementStatusBadgeClass,
  improvementStatusLabels,
} from "@/lib/domain/enums";
import { ImprovementRow } from "@/lib/db/schema";
import { listImprovements } from "@/lib/db/improvement-repository";
import { formatIsoDateTime } from "@/lib/format";
import { RequestButton } from "./request-button";
import { StatusButton } from "./status-button";

export const dynamic = "force-dynamic";

function statusChipClass(status: string): string {
  return (
    improvementStatusBadgeClass[status as ImprovementStatus] ??
    "bg-stone-300 text-stone-600"
  );
}

function statusLabel(status: string): string {
  return improvementStatusLabels[status as ImprovementStatus] ?? status;
}

function ImprovementCard({ improvement }: { improvement: ImprovementRow }) {
  return (
    <li className="rounded-xl border border-stone-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold">{improvement.title}</h2>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusChipClass(improvement.status)}`}
        >
          {statusLabel(improvement.status)}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">{improvement.body}</p>
      {improvement.basis ? (
        <p className="mt-2 text-xs text-stone-500">Base: {improvement.basis}</p>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-stone-400">{formatIsoDateTime(improvement.createdAt)}</span>
        {improvement.status === ImprovementStatus.Proposed ? (
          <div className="flex flex-wrap items-center gap-2">
            <RequestButton id={improvement.id} />
            <StatusButton id={improvement.id} status="done" label="Marcar hecha" />
            <StatusButton id={improvement.id} status="dismissed" label="Descartar" />
          </div>
        ) : improvement.status === ImprovementStatus.Requested ? (
          <div className="flex flex-wrap items-center gap-2">
            <StatusButton id={improvement.id} status="done" label="Marcar hecha" />
            <StatusButton id={improvement.id} status="dismissed" label="Descartar" />
          </div>
        ) : null}
      </div>
    </li>
  );
}

export default async function MejorasPage() {
  const improvements = await listImprovements();
  const active = improvements.filter(
    (imp) =>
      imp.status === ImprovementStatus.Proposed ||
      imp.status === ImprovementStatus.Requested
  );
  const resolved = improvements.filter(
    (imp) =>
      imp.status === ImprovementStatus.Done ||
      imp.status === ImprovementStatus.Dismissed
  );
  return (
    <main className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold">Mejoras sugeridas</h1>
      <p className="text-sm text-stone-600">
        Cada 6 horas se revisan las estadísticas reales del pipeline y se
        proponen mejoras de estrategia. Las propuestas no se ejecutan solas:
        vos decidís cuáles pedir.
      </p>
      {active.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          Todavía no hay propuestas. La primera llega en la próxima revisión programada.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {active.map((imp) => (
            <ImprovementCard key={imp.id} improvement={imp} />
          ))}
        </ul>
      )}
      {resolved.length > 0 ? (
        <details className="rounded-xl border border-stone-200">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-stone-600">
            Resueltas ({resolved.length})
          </summary>
          <ul className="flex flex-col gap-3 p-4 pt-0">
            {resolved.map((imp) => (
              <ImprovementCard key={imp.id} improvement={imp} />
            ))}
          </ul>
        </details>
      ) : null}
    </main>
  );
}
