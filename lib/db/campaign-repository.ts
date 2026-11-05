import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { campaignState } from "./schema";

export async function getCampaignValue(key: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(campaignState)
    .where(eq(campaignState.key, key))
    .limit(1);
  return rows[0]?.value ?? null;
}

export async function setCampaignValue(
  key: string,
  value: string
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db
    .insert(campaignState)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({
      target: campaignState.key,
      set: { value, updatedAt: now },
    });
}

export async function deleteCampaignValue(key: string): Promise<void> {
  const db = await getDb();
  await db.delete(campaignState).where(eq(campaignState.key, key));
}
