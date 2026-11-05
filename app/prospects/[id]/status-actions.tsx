"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ProspectStatus,
  prospectStatusBadgeClass,
  prospectStatusLabels,
  prospectStatusOrder,
} from "@/lib/domain/enums";

export function StatusActions({
  prospectId,
  currentStatus,
}: {
  prospectId: string;
  currentStatus: ProspectStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<ProspectStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(status: ProspectStatus) {
    setLoading(status);
    setError(null);
    const response = await fetch(`/api/prospects/${prospectId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "No se pudo cambiar el estado");
    }
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2">
        {prospectStatusOrder.map((status) => (
          <button
            key={status}
            type="button"
            disabled={status === currentStatus || loading !== null}
            onClick={() => changeStatus(status)}
            className={`rounded-full px-3 py-2 text-xs font-semibold disabled:opacity-40 ${prospectStatusBadgeClass[status]}`}
          >
            {loading === status ? "..." : prospectStatusLabels[status]}
          </button>
        ))}
      </div>
      {error !== null && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
