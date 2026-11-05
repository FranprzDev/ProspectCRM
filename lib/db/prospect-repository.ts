import { and, desc, eq, like, SQL } from "drizzle-orm";
import { getDb } from "./index";
import { ActivityRow, EmailRow, ProspectRow, prospects } from "./schema";

export interface ProspectInsert {
  id: string;
  name: string;
  category: string;
  status: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  mapsUrl: string | null;
  websiteUrl: string | null;
  websiteStatus: string;
  rating: number | null;
  reviewsCount: number | null;
  pitchAngle: string | null;
  demoPageUrl: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}

export async function insertProspect(row: ProspectInsert): Promise<void> {
  const db = await getDb();
  await db.insert(prospects).values(row);
}

export async function findProspectById(id: string): Promise<ProspectRow | null> {
  const db = await getDb();
  const rows = await db.select().from(prospects).where(eq(prospects.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listProspects(
  status?: string,
  search?: string
): Promise<ProspectRow[]> {
  const db = await getDb();
  const filters: SQL[] = [];
  if (status) filters.push(eq(prospects.status, status));
  if (search) filters.push(like(prospects.name, `%${search}%`));
  const where = filters.length > 0 ? and(...filters) : undefined;
  return db.select().from(prospects).where(where).orderBy(desc(prospects.createdAt));
}

export async function updateProspect(
  id: string,
  changes: Partial<Omit<ProspectRow, "id" | "createdAt">>
): Promise<void> {
  const db = await getDb();
  await db
    .update(prospects)
    .set({ ...changes, updatedAt: Date.now() })
    .where(eq(prospects.id, id));
}

export async function countProspectsByStatus(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db
    .select({ status: prospects.status })
    .from(prospects);
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

export type { ActivityRow, EmailRow, ProspectRow };
