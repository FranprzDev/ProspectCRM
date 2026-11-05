"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmailDirection } from "@/lib/domain/enums";

export function EmailForm({ prospectId }: { prospectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      direction: form.get("direction"),
      subject: form.get("subject"),
      body: form.get("body"),
      fromAddress: form.get("fromAddress"),
      toAddress: form.get("toAddress"),
      sentAt: form.get("sentAt"),
    };
    const response = await fetch(`/api/prospects/${prospectId}/emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "No se pudo registrar el mail");
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-md border border-dashed border-stone-400 py-2.5 text-sm font-medium text-stone-600"
      >
        Registrar mail
      </button>
    );
  }

  const inputClass =
    "w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-3 rounded-md border border-stone-200 bg-white p-3">
      <div className="grid grid-cols-2 gap-2">
        <select name="direction" className={inputClass} defaultValue={EmailDirection.Outbound}>
          <option value={EmailDirection.Outbound}>Enviado</option>
          <option value={EmailDirection.Inbound}>Recibido</option>
        </select>
        <input
          name="sentAt"
          type="datetime-local"
          className={inputClass}
          defaultValue={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)}
        />
      </div>
      <input name="subject" required placeholder="Asunto" className={inputClass} />
      <div className="grid grid-cols-1 gap-2">
        <input name="fromAddress" required type="email" placeholder="De (email)" className={inputClass} />
        <input name="toAddress" required type="email" placeholder="Para (email)" className={inputClass} />
      </div>
      <textarea name="body" required rows={4} placeholder="Texto del mail" className={inputClass} />
      {error !== null && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Guardar mail
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-4 py-2.5 text-sm text-stone-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
