"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DemoUrlForm({
  prospectId,
  currentUrl,
}: {
  prospectId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(currentUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/prospects/${prospectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demoPageUrl: url }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "No se pudo guardar");
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-2 flex gap-2">
      <input
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://..."
        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="shrink-0 rounded-md bg-stone-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Guardar
      </button>
      {error !== null && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
