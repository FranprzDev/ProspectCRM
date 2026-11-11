import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="text-xl font-bold">Página no encontrada</h1>
      <p className="text-sm text-stone-600">
        El enlace que buscás no existe o fue movido.
      </p>
      <Link
        href="/prospects"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Volver a prospectos
      </Link>
    </div>
  );
}
