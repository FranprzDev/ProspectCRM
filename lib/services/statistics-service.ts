import { and, count, inArray, isNotNull, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { prospects } from "@/lib/db/schema";
import { getCampaignValue } from "@/lib/db/campaign-repository";
import {
  ProspectCategory,
  prospectCategoryLabels,
  ProspectStatus,
  prospectStatusLabels,
  prospectStatusOrder,
  WebsiteStatus,
  websiteStatusLabels,
} from "@/lib/domain/enums";

export interface Statistics {
  total: number;
  contactables: number;
  byStatus: { status: string; label: string; count: number }[];
  byWebsite: { status: string; label: string; count: number }[];
  byCategory: { category: string; label: string; count: number }[];
  withDemo: number;
  demoVerified: number;
  withEmail: number;
  contactStartedAt: string | null;
  contacted: number;
}

export async function getStatistics(): Promise<Statistics> {
  const db = await getDb();
  const [
    totalRows,
    contactableRows,
    statusRows,
    webRows,
    categoryRows,
    demoRows,
    demoVerifiedRows,
    emailRows,
    contactStartedAt,
  ] = await Promise.all([
    db.select({ c: count() }).from(prospects),
    db
      .select({ c: count() })
      .from(prospects)
      .where(or(isNotNull(prospects.phone), isNotNull(prospects.email))),
    db
      .select({ status: prospects.status, c: count() })
      .from(prospects)
      .groupBy(prospects.status),
    db
      .select({ status: prospects.websiteStatus, c: count() })
      .from(prospects)
      .groupBy(prospects.websiteStatus),
    db
      .select({ category: prospects.category, c: count() })
      .from(prospects)
      .groupBy(prospects.category),
    db.select({ c: count() }).from(prospects).where(isNotNull(prospects.demoPageUrl)),
    db
      .select({ c: count() })
      .from(prospects)
      .where(
        and(
          isNotNull(prospects.demoPageUrl),
          inArray(prospects.websiteStatus, [
            WebsiteStatus.NoWebsite,
            WebsiteStatus.WeakWebsite,
          ])
        )
      ),
    db.select({ c: count() }).from(prospects).where(isNotNull(prospects.email)),
    getCampaignValue("contact_started_at"),
  ]);
  const statusMap = new Map(statusRows.map((r) => [r.status, r.c]));
  const webMap = new Map(webRows.map((r) => [r.status, r.c]));
  return {
    total: totalRows[0]?.c ?? 0,
    contactables: contactableRows[0]?.c ?? 0,
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
    byCategory: categoryRows
      .map((r) => ({
        category: r.category,
        label:
          prospectCategoryLabels[r.category as ProspectCategory] ?? r.category,
        count: r.c,
      }))
      .sort((a, b) => b.count - a.count),
    withDemo: demoRows[0]?.c ?? 0,
    demoVerified: demoVerifiedRows[0]?.c ?? 0,
    withEmail: emailRows[0]?.c ?? 0,
    contactStartedAt,
    contacted: statusMap.get(ProspectStatus.Contacted) ?? 0,
  };
}
