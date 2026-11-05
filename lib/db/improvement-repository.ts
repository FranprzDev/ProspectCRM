import { desc, eq } from "drizzle-orm";
import { getDb } from "./index";
import { ImprovementRow, improvements } from "./schema";

export async function listImprovements(): Promise<ImprovementRow[]> {
  const db = await getDb();
  return db.select().from(improvements).orderBy(desc(improvements.createdAt));
}

export async function markImprovementRequested(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .update(improvements)
    .set({ status: "requested" })
    .where(eq(improvements.id, id));
  return (result.rowsAffected ?? 0) > 0;
}
