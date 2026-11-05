import { listImprovements } from "@/lib/db/improvement-repository";
import { RequestButton } from "./request-button";
import { formatIsoDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  proposed: "Propuesta",
  requested: "Pedida",
  implemented: "Implementada",
  dismissed: "Descartada",
};

export default async function MejorasPage() {
  const improvements = await listImprovements();
  return (
    <main className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold">Mejoras sugeridas</h1>
      <p className="text-sm text-stone-600">
        Cada 6 horas se revisan las estadísticas reales del pipeline y se
        proponen mejoras de estrategia. Las propuestas no se ejecutan solas:
        vos decidís cuáles pedir.
      </p>
      {improvements.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          Todavía no hay propuestas. La primera llega en la próxima revisión programada.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {improvements.map((imp) => (
            <li key={imp.id} className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold">{imp.title}</h2>
                <span className="shrink-0 rounded-full bg-stone-300 px-2 py-0.5 text-xs font-medium text-stone-600">
                  {statusLabels[imp.status] ?? imp.status}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">{imp.body}</p>
              {imp.basis ? (
                <p className="mt-2 text-xs text-stone-500">Base: {imp.basis}</p>
              ) : null}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-stone-400">{formatIsoDateTime(imp.createdAt)}</span>
                {imp.status === "proposed" ? (
                  <RequestButton id={imp.id} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
