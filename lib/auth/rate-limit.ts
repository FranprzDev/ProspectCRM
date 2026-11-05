import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { loginAttempts } from "@/lib/db/schema";

const windowMs = 10 * 60 * 1000;
const maxAttempts = 5;

export async function isLoginRateLimited(ip: string): Promise<boolean> {
  const db = await getDb();
  const since = Date.now() - windowMs;
  const rows = await db
    .select({ id: loginAttempts.id })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.ip, ip), gt(loginAttempts.attemptedAt, since)));
  return rows.length >= maxAttempts;
}

export async function recordLoginAttempt(ip: string): Promise<void> {
  const db = await getDb();
  await db.insert(loginAttempts).values({
    id: crypto.randomUUID(),
    ip,
    attemptedAt: Date.now(),
  });
}
