"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NoteForm({ prospectId }: { prospectId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/prospects/${prospectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (response.ok) {
      setMessage("");
    } else {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "No se pudo guardar la nota");
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={2}
        placeholder="Anotá un avance, una respuesta, lo que sea"
        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      {error !== null && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || message.trim() === ""}
        className="self-start rounded-md bg-stone-800 px-4 py-2 text-sm font-semibold text-[#17191c] disabled:opacity-60"
      >
        Agregar nota
      </button>
    </form>
  );
}
