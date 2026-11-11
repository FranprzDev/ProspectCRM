"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusStyles: Record<"done" | "dismissed", string> = {
  done: "bg-green-600 text-white hover:bg-green-700",
  dismissed: "bg-stone-200 text-stone-700 hover:bg-stone-300",
};

export function StatusButton({
  id,
  status,
  label,
}: {
  id: string;
  status: "done" | "dismissed";
  label: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const router = useRouter();

  async function submit() {
    setState("sending");
    try {
      const res = await fetch(`/api/improvements/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("status failed");
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <span className="text-xs font-medium text-green-700">Listo</span>;
  }
  return (
    <button
      onClick={submit}
      disabled={state === "sending"}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${statusStyles[status]}`}
    >
      {state === "sending" ? "Guardando..." : state === "error" ? "Reintentar" : label}
    </button>
  );
}
