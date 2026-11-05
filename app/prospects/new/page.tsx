import { ProspectForm } from "./prospect-form";

export default function NewProspectPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Nuevo prospecto</h1>
      <p className="mt-1 text-sm text-stone-500">
        Cargá el negocio y el ángulo de venta. El resto se completa después.
      </p>
      <div className="mt-5">
        <ProspectForm />
      </div>
    </div>
  );
}
