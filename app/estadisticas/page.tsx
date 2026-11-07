import { getStatistics } from "@/lib/services/statistics-service";
import { formatIsoDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const stats = await getStatistics();
  const demoPct =
    stats.contactables > 0
      ? Math.round((stats.withDemo / stats.contactables) * 100)
      : 0;
  return (
    <main className="flex flex-col gap-6 py-1">
      <h1 className="text-xl font-bold">Estadísticas</h1>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Prospectos" value={stats.total} />
        <StatCard label="Contactables (tel o email)" value={stats.contactables} accent />
        <StatCard label="Con web de muestra" value={stats.withDemo} />
        <StatCard
          label="Con muestra, verificado sin web o web débil"
          value={stats.demoVerified}
        />
        <StatCard label="Con email cargado" value={stats.withEmail} />
        <StatCard label="Contactados" value={stats.contacted} />
      </section>

      <section className="rounded-xl border border-stone-200 p-4">
        <h2 className="mb-1 text-sm font-semibold text-stone-700">
          Cobertura de muestras
        </h2>
        <p className="mb-3 text-xs text-stone-500">
          {stats.withDemo} de {stats.contactables} contactables tienen página
          de muestra lista.
        </p>
        <div className="h-3 w-full overflow-hidden rounded-full bg-stone-300">
          <div
            className="h-3 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${demoPct}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs font-semibold tabular-nums text-indigo-700">
          {demoPct}%
        </p>
      </section>

      <section className="rounded-xl border border-stone-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-700">Por etapa</h2>
        <div className="flex flex-col gap-2">
          {stats.byStatus.map((row) => (
            <BarRow
              key={row.status}
              label={row.label}
              count={row.count}
              total={stats.total}
            />
          ))}
        </div>
        {stats.excludedCount > 0 ? (
          <p className="mt-3 text-xs text-stone-500">
            {stats.excludedCount}{" "}
            {stats.excludedCount === 1 ? "excluido" : "excluidos"} (fuera de
            campaña)
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-stone-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-700">Por rubro</h2>
        <div className="flex flex-col gap-2">
          {stats.byCategory.map((row) => (
            <BarRow
              key={row.category}
              label={row.label}
              count={row.count}
              total={stats.total}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-700">
          Verificación de sitio web
        </h2>
        <div className="flex flex-col gap-2">
          {stats.byWebsite.map((row) => (
            <BarRow
              key={row.status}
              label={row.label}
              count={row.count}
              total={stats.total}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-[#212429] p-4 text-sm text-stone-600">
        {stats.contacted === 0 ? (
          <p>
            Todavía no se contactó a ningún prospecto, así que no hay tasas de
            respuesta ni de conversión que mostrar. Apenas empiecen los
            envíos, esta sección va a mostrar datos reales.
          </p>
        ) : null}
        <p className="mt-1">
          Estado del contacto:{" "}
          {stats.contactStartedAt ? (
            <>iniciado el {formatIsoDateTime(stats.contactStartedAt)}</>
          ) : (
            "sin iniciar."
          )}
        </p>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? "border-indigo-500/40 bg-indigo-200/20" : "border-stone-200"
      }`}
    >
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{label}</p>
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 shrink-0 truncate text-stone-600">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-stone-300">
        <div
          className="h-2 rounded-full bg-indigo-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-medium tabular-nums">
        {count}
      </span>
    </div>
  );
}
