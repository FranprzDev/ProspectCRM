import { NextResponse } from "next/server";
import { setCampaignValue } from "@/lib/db/campaign-repository";
import { jsonError } from "@/lib/api/respond";

export async function POST() {
  try {
    const startedAt = Date.now().toString();
    await setCampaignValue("contact_started_at", startedAt);
    return NextResponse.json({ contactStartedAt: startedAt });
  } catch (error) {
    return jsonError(error);
  }
}
