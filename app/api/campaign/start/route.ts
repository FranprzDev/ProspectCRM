import { NextResponse } from "next/server";
import { setCampaignValue } from "@/lib/db/campaign-repository";
import { listContactEligible } from "@/lib/db/prospect-repository";
import { jsonError } from "@/lib/api/respond";

export async function POST() {
  try {
    const batch = await listContactEligible();
    if (batch.length === 0) {
      return NextResponse.json(
        { error: "No hay prospectos verificados con muestra lista" },
        { status: 400 }
      );
    }
    const startedAt = Date.now().toString();
    await setCampaignValue("contact_started_at", startedAt);
    await setCampaignValue(
      "contact_batch_ids",
      JSON.stringify(batch.map((prospect) => prospect.id))
    );
    return NextResponse.json({
      contactStartedAt: startedAt,
      batchSize: batch.length,
    });
  } catch (error) {
    return jsonError(error);
  }
}
