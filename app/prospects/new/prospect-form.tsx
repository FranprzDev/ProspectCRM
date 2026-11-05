"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ProspectCategory,
  prospectCategoryLabels,
  WebsiteStatus,
  websiteStatusLabels,
} from "@/lib/domain/enums";

const inputClass =
  "w-full rounded-md border border-stone-300 px-3 py-2.5 text-base focus:border-indigo-500 focus:outline-none";

export function ProspectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      category: form.get("category"),
      phone: form.get("phone"),
      email: form.get("email"),
      address: form.get("address"),
      mapsUrl: form.get("mapsUrl"),
      websiteUrl: form.get("websiteUrl"),
      websiteStatus: form.get("websiteStatus"),
      rating: form.get("rating"),
      reviewsCount: form.get("reviewsCount"),
      pitchAngle: form.get("pitchAngle"),
      demoPageUrl: form.get("demoPageUrl"),
      notes: form.get("notes"),
    };
    const response = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const data = (await response.json()) as { prospect: { id: string } };
      router.push(`/prospects/${data.prospect.id}`);
      router.refresh();
      return;
    }
    const data = (await response.json()) as { error?: string };
    setError(data.error ?? "No se pudo guardar");
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="name">
          Nombre del estudio o negocio
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="category">
          Rubro
        </label>
        <select id="category" name="category" className={inputClass} defaultValue={ProspectCategory.LawFirm}>
          {Object.values(ProspectCategory).map((category) => (
            <option key={category} value={category}>
              {prospectCategoryLabels[category]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="phone">
            Teléfono
          </label>
          <input id="phone" name="phone" type="tel" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="address">
          Dirección
        </label>
        <input id="address" name="address" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="mapsUrl">
          Link de Google Maps
        </label>
        <input id="mapsUrl" name="mapsUrl" type="url" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="websiteUrl">
            Web actual
          </label>
          <input id="websiteUrl" name="websiteUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="websiteStatus">
            Estado de la web
          </label>
          <select id="websiteStatus" name="websiteStatus" className={inputClass} defaultValue={WebsiteStatus.Unknown}>
            {Object.values(WebsiteStatus).map((status) => (
              <option key={status} value={status}>
                {websiteStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="rating">
            Rating (0 a 5)
          </label>
          <input id="rating" name="rating" type="number" step="0.1" min="0" max="5" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="reviewsCount">
            Reseñas
          </label>
          <input id="reviewsCount" name="reviewsCount" type="number" min="0" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="pitchAngle">
          Ángulo de venta
        </label>
        <textarea id="pitchAngle" name="pitchAngle" rows={3} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="demoPageUrl">
          Página de muestra
        </label>
        <input id="demoPageUrl" name="demoPageUrl" type="url" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="notes">
          Notas
        </label>
        <textarea id="notes" name="notes" rows={2} className={inputClass} />
      </div>
      {error !== null && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar prospecto"}
      </button>
    </form>
  );
}
