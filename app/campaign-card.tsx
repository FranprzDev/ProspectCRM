"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CampaignCard({
  contactStartedAt,
  eligibleCount,
}: {
  contactStartedAt: string | null;
  eligibleCount: number;
}) {
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
              : `${eligibleCount} prospectos verificados con muestra lista para contactar.`}
          </p>
          <button
            type="button"
            disabled={loading || eligibleCount === 0}
            onClick={() => post("/api/campaign/start")}
            className="mt-3 w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-600"
          >
            {loading ? "Iniciando..." : "Iniciar contacto"}
          </button>
          <p className="mt-2 text-xs text-stone-500">
            Al iniciarlo, el agente empieza los envíos. Nada se envía desde esta
            app.
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
