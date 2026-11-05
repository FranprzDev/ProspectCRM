import { NextResponse } from "next/server";
import { deleteCampaignValue } from "@/lib/db/campaign-repository";
import { jsonError } from "@/lib/api/respond";

export async function POST() {
  try {
    await deleteCampaignValue("contact_started_at");
    return NextResponse.json({ contactStartedAt: null });
  } catch (error) {
    return jsonError(error);
  }
}
