"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  WebsiteStatus,
  websiteStatusLabels,
} from "@/lib/domain/enums";

const order: WebsiteStatus[] = [
  WebsiteStatus.NoWebsite,
  WebsiteStatus.WeakWebsite,
  WebsiteStatus.HasWebsite,
  WebsiteStatus.Unknown,
];

export function WebsiteStatusActions({
  prospectId,
  currentStatus,
}: {
  prospectId: string;
  currentStatus: WebsiteStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<WebsiteStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function change(websiteStatus: WebsiteStatus) {
    setLoading(websiteStatus);
    setError(null);
    const response = await fetch(`/api/prospects/${prospectId}/website-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteStatus }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "No se pudo cambiar el estado web");
    }
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1.5">
        {order.map((option) => (
          <button
            key={option}
            onClick={() => change(option)}
            disabled={loading !== null || option === currentStatus}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              option === currentStatus
                ? "bg-stone-700 text-[#17191c]"
                : "bg-stone-300 text-stone-700 hover:bg-stone-200 disabled:opacity-50"
            }`}
          >
            {loading === option ? "..." : websiteStatusLabels[option]}
          </button>
        ))}
      </div>
      {error !== null && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
