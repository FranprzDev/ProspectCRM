import { getStatistics } from "@/lib/services/statistics-service";
import { formatIsoDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const stats = await getStatistics();
  return (
    <main className="flex flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold">Estadísticas</h1>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Prospectos" value={stats.total} />
        <StatCard label="Con web de muestra" value={stats.withDemo} />
        <StatCard label="Listos para contacto" value={stats.eligible} />
        <StatCard label="Contactados" value={stats.contacted} />
      </section>

      <section className="rounded-xl border border-stone-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-700">Por etapa</h2>
        <div className="flex flex-col gap-2">
          {stats.byStatus.map((row) => (
            <BarRow key={row.status} label={row.label} count={row.count} total={stats.total} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-700">Verificación de sitio web</h2>
        <div className="flex flex-col gap-2">
          {stats.byWebsite.map((row) => (
            <BarRow key={row.status} label={row.label} count={row.count} total={stats.total} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        {stats.contacted === 0 ? (
          <p>
            Todavía no se contactó a ningún prospecto, así que no hay tasas de
            respuesta ni de conversión que mostrar. Apenas empiecen los envíos,
            esta sección va a mostrar datos reales.
          </p>
        ) : null}
        <p className="mt-1">
          Estado del contacto: {stats.contactStartedAt ? (
            <>iniciado el {formatIsoDateTime(stats.contactStartedAt)}</>
          ) : (
            "pausado, a la espera de la revisión de Fran."
          )}
        </p>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-stone-200 p-4">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{label}</p>
    </div>
  );
}

function BarRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 shrink-0 text-stone-600">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-stone-100">
        <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right font-medium tabular-nums">{count}</span>
    </div>
  );
}
