"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface EligibleProspect {
  id: string;
  name: string;
  demoPageUrl: string | null;
}

export function CampaignCard({
  contactStartedAt,
  eligible,
}: {
  contactStartedAt: string | null;
  eligible: EligibleProspect[];
}) {
  const eligibleCount = eligible.length;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(path: string) {
    setLoading(true);
    setError(null);
    const response = await fetch(path, { method: "POST" });
    setLoading(false);
    if (!response.ok) {
      setError("No se pudo actualizar el estado del contacto");
      return;
    }
    router.refresh();
  }

  const startedLabel = contactStartedAt
    ? new Date(Number(contactStartedAt)).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <section className="rounded-xl border border-stone-300 bg-[#212429] p-4">
      <h2 className="text-lg font-bold">Contacto</h2>
      {startedLabel === null ? (
        <>
          <p className="mt-2 text-sm text-stone-400">
            {eligibleCount === 0
              ? "No hay prospectos verificados con muestra lista."
              : eligibleCount === 1
                ? "Se contactará solo a este prospecto. El agente revisa la muestra y ejecuta el envío."
                : `Se contactará solo a estos ${eligibleCount} prospectos. El agente revisa cada muestra y ejecuta los envíos.`}
          </p>
          {eligibleCount > 0 && (
            <ul className="mt-3 space-y-2">
              {eligible.map((prospect) => (
                <li
                  key={prospect.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-stone-300 px-3 py-2"
                >
                  <Link
                    href={`/prospects/${prospect.id}`}
                    className="truncate text-sm font-medium hover:text-indigo-300"
                  >
                    {prospect.name}
                  </Link>
                  {prospect.demoPageUrl !== null && (
                    <a
                      href={prospect.demoPageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-md border border-indigo-400 px-2 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-400/10"
                    >
                      Ver muestra
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            disabled={loading || eligibleCount === 0}
            onClick={() => post("/api/campaign/start")}
            className="mt-3 w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-600"
          >
            {loading ? "Iniciando..." : "Iniciar contacto"}
          </button>
          <p className="mt-2 text-xs text-stone-500">
            Al iniciarlo, el agente empieza los envíos a este lote. Los
            prospectos nuevos necesitan otra revisión. Nada se envía desde
            esta app.
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-stone-300">
            Contacto iniciado el {startedLabel}. Los envíos los ejecuta el
            agente desde el Gmail de Fran dentro del horario 08-19.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => post("/api/campaign/pause")}
            className="mt-3 w-full rounded-md border border-stone-400 px-4 py-2.5 text-sm font-semibold text-stone-200 disabled:opacity-50"
          >
            {loading ? "Pausando..." : "Pausar contacto"}
          </button>
        </>
      )}
      {error !== null && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </section>
  );
}
