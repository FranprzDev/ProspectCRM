import { and, count, desc, eq, inArray, isNotNull, like, ne, SQL } from "drizzle-orm";
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

export interface ProspectListFilters {
  status?: string;
  search?: string;
  websiteStatus?: string;
  hasDemo?: boolean;
  hasEmail?: boolean;
  category?: string;
}

export async function listProspects(
  filters: ProspectListFilters = {}
): Promise<ProspectRow[]> {
  const db = await getDb();
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(prospects.status, filters.status));
  else conditions.push(ne(prospects.status, "EXCLUDED"));
  if (filters.search) conditions.push(like(prospects.name, `%${filters.search}%`));
  if (filters.websiteStatus)
    conditions.push(eq(prospects.websiteStatus, filters.websiteStatus));
  if (filters.hasDemo) conditions.push(isNotNull(prospects.demoPageUrl));
  if (filters.hasEmail) conditions.push(isNotNull(prospects.email));
  if (filters.category) conditions.push(eq(prospects.category, filters.category));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(prospects).where(where).orderBy(desc(prospects.createdAt));
}

export async function countByWebsiteStatus(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db
    .select({ status: prospects.websiteStatus, value: count() })
    .from(prospects)
    .groupBy(prospects.websiteStatus);
  const result: Record<string, number> = {};
  for (const row of rows) result[row.status] = row.value;
  return result;
}

export async function countWithDemo(): Promise<number> {
  const db = await getDb();
  const rows = await db
    .select({ value: count() })
    .from(prospects)
    .where(isNotNull(prospects.demoPageUrl));
  return rows[0]?.value ?? 0;
}

export interface ContactEligibleProspect {
  id: string;
  name: string;
  demoPageUrl: string | null;
}

export async function listContactEligible(): Promise<ContactEligibleProspect[]> {
  const db = await getDb();
  return db
    .select({
      id: prospects.id,
      name: prospects.name,
      demoPageUrl: prospects.demoPageUrl,
    })
    .from(prospects)
    .where(
      and(
        inArray(prospects.websiteStatus, ["NO_WEBSITE", "WEAK_WEBSITE"]),
        isNotNull(prospects.demoPageUrl),
        isNotNull(prospects.email),
        ne(prospects.status, "OPTED_OUT"),
        ne(prospects.status, "EXCLUDED")
      )
    )
    .orderBy(prospects.name);
}

export async function countContactEligible(): Promise<number> {
  const db = await getDb();
  const rows = await db
    .select({ value: count() })
    .from(prospects)
    .where(
      and(
        inArray(prospects.websiteStatus, ["NO_WEBSITE", "WEAK_WEBSITE"]),
        isNotNull(prospects.demoPageUrl),
        isNotNull(prospects.email),
        ne(prospects.status, "OPTED_OUT"),
        ne(prospects.status, "EXCLUDED")
      )
    );
  return rows[0]?.value ?? 0;
}

export async function deleteProspect(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(prospects).where(eq(prospects.id, id));
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
