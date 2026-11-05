import { desc, eq } from "drizzle-orm";
import { getDb } from "./index";
import { ActivityRow, activities } from "./schema";

export async function insertActivity(
  prospectId: string,
  type: string,
  message: string
): Promise<void> {
  const db = await getDb();
  await db.insert(activities).values({
    id: crypto.randomUUID(),
    prospectId,
    type,
    message,
    createdAt: Date.now(),
  });
}

export async function listActivitiesByProspect(
  prospectId: string,
  limit = 50
): Promise<ActivityRow[]> {
  const db = await getDb();
  return db
    .select()
    .from(activities)
    .where(eq(activities.prospectId, prospectId))
    .orderBy(desc(activities.createdAt))
    .limit(limit);
}

export async function listRecentActivities(limit = 20): Promise<ActivityRow[]> {
  const db = await getDb();
  return db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(limit);
}
