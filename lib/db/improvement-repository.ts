import { desc, eq, like } from "drizzle-orm";
import { ImprovementStatus } from "@/lib/domain/enums";
import { getDb } from "./index";
import { ImprovementRow, improvements } from "./schema";

export interface CreateImprovementInput {
  title: string;
  body: string;
  basis: string | null;
}

export function nextImprovementId(existingIds: string[], isoDate: string): string {
  const datePart = isoDate.slice(0, 10).replace(/-/g, "");
  const prefix = `imp-${datePart}-`;
  let max = 0;
  for (const id of existingIds) {
    if (!id.startsWith(prefix)) continue;
    const sequence = Number.parseInt(id.slice(prefix.length), 10);
    if (Number.isInteger(sequence) && sequence > max) max = sequence;
  }
  return `${prefix}${String(max + 1).padStart(2, "0")}`;
}

export async function listImprovements(status?: string): Promise<ImprovementRow[]> {
  const db = await getDb();
  const query = db.select().from(improvements);
  if (status !== undefined) {
    return query.where(eq(improvements.status, status)).orderBy(desc(improvements.createdAt));
  }
  return query.orderBy(desc(improvements.createdAt));
}

export async function createImprovement(input: CreateImprovementInput): Promise<ImprovementRow> {
  const db = await getDb();
  const createdAt = new Date().toISOString();
  const datePart = createdAt.slice(0, 10).replace(/-/g, "");
  const prefix = `imp-${datePart}-`;
  const existing = await db
    .select({ id: improvements.id })
    .from(improvements)
    .where(like(improvements.id, `${prefix}%`));
  const id = nextImprovementId(existing.map((row) => row.id), createdAt);
  const row: ImprovementRow = {
    id,
    createdAt,
    title: input.title,
    body: input.body,
    basis: input.basis,
    status: ImprovementStatus.Proposed,
  };
  await db.insert(improvements).values(row);
  return row;
}

export async function updateImprovementStatus(
  id: string,
  status: ImprovementStatus
): Promise<ImprovementRow | null> {
  const db = await getDb();
  // D1's update result does not expose rowsAffected reliably; check existence first.
  const existing = await db
    .select()
    .from(improvements)
    .where(eq(improvements.id, id))
    .limit(1);
  const row = existing[0];
  if (!row) return null;
  await db.update(improvements).set({ status }).where(eq(improvements.id, id));
  return { ...row, status };
}

export async function markImprovementRequested(id: string): Promise<boolean> {
  const row = await updateImprovementStatus(id, ImprovementStatus.Requested);
  return row !== null;
}
