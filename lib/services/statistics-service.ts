import { and, count, isNotNull, ne } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { prospects } from "@/lib/db/schema";
import { getCampaignValue } from "@/lib/db/campaign-repository";
import {
  ProspectStatus,
  prospectStatusLabels,
  prospectStatusOrder,
  WebsiteStatus,
  websiteStatusLabels,
} from "@/lib/domain/enums";

export interface Statistics {
  total: number;
  byStatus: { status: string; label: string; count: number }[];
  byWebsite: { status: string; label: string; count: number }[];
  withDemo: number;
  demoVerified: number;
  withEmail: number;
  contactStartedAt: string | null;
  contacted: number;
}

export async function getStatistics(): Promise<Statistics> {
  const db = await getDb();
  const [totalRows, statusRows, webRows, demoRows, demoVerifiedRows, emailRows, contactStartedAt] =
    await Promise.all([
      db.select({ c: count() }).from(prospects),
      db.select({ status: prospects.status, c: count() }).from(prospects).groupBy(prospects.status),
      db.select({ status: prospects.websiteStatus, c: count() }).from(prospects).groupBy(prospects.websiteStatus),
      db.select({ c: count() }).from(prospects).where(isNotNull(prospects.demoPageUrl)),
      db.select({ c: count() }).from(prospects).where(and(isNotNull(prospects.demoPageUrl), ne(prospects.websiteStatus, "UNKNOWN"))),
      db.select({ c: count() }).from(prospects).where(isNotNull(prospects.email)),
      getCampaignValue("contact_started_at"),
    ]);
  const statusMap = new Map(statusRows.map((r) => [r.status, r.c]));
  const webMap = new Map(webRows.map((r) => [r.status, r.c]));
  return {
    total: totalRows[0]?.c ?? 0,
    byStatus: prospectStatusOrder.map((s) => ({
      status: s,
      label: prospectStatusLabels[s],
      count: statusMap.get(s) ?? 0,
    })),
    byWebsite: Object.values(WebsiteStatus).map((w) => ({
      status: w,
      label: websiteStatusLabels[w],
      count: webMap.get(w) ?? 0,
    })),
    withDemo: demoRows[0]?.c ?? 0,
    demoVerified: demoVerifiedRows[0]?.c ?? 0,
    withEmail: emailRows[0]?.c ?? 0,
    contactStartedAt,
    contacted: statusMap.get(ProspectStatus.Contacted) ?? 0,
  };
}
