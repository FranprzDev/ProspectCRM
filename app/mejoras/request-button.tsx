"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RequestButton({ id }: { id: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const router = useRouter();

  async function request() {
    setState("sending");
    try {
      const res = await fetch(`/api/improvements/${id}/request`, { method: "POST" });
      if (!res.ok) throw new Error("request failed");
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <span className="text-xs font-medium text-green-700">Pedido enviado</span>;
  }
  return (
    <button
      onClick={request}
      disabled={state === "sending"}
      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      {state === "sending" ? "Enviando..." : state === "error" ? "Reintentar" : "Pedir implementación"}
    </button>
  );
}
