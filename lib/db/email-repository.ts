import { desc, eq } from "drizzle-orm";
import { getDb } from "./index";
import { EmailRow, emails } from "./schema";

export interface EmailInsert {
  id: string;
  prospectId: string;
  direction: string;
  subject: string;
  body: string;
  fromAddress: string;
  toAddress: string;
  sentAt: number;
  createdAt: number;
}

export async function insertEmail(row: EmailInsert): Promise<void> {
  const db = await getDb();
  await db.insert(emails).values(row);
}

export async function listEmailsByProspect(prospectId: string): Promise<EmailRow[]> {
  const db = await getDb();
  return db
    .select()
    .from(emails)
    .where(eq(emails.prospectId, prospectId))
    .orderBy(desc(emails.sentAt));
}
