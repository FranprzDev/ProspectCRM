import {
  ActivityType,
  activityTypeLabels,
  ProspectStatus,
  prospectStatusLabels,
} from "@/lib/domain/enums";
import {
  CreateProspectInput,
  UpdateProspectInput,
} from "@/lib/validators/prospect.validator";
import {
  insertActivity,
  listActivitiesByProspect,
  listRecentActivities,
} from "@/lib/db/activity-repository";
import { listEmailsByProspect } from "@/lib/db/email-repository";
import {
  countByWebsiteStatus,
  countContactEligible,
  deleteProspect,
  countProspectsByStatus,
  countWithDemo,
  findProspectById,
  insertProspect,
  listProspects,
  ProspectListFilters,
  updateProspect,
  ActivityRow,
  EmailRow,
  ProspectRow,
} from "@/lib/db/prospect-repository";

export interface ProspectDetail {
  prospect: ProspectRow;
  emails: EmailRow[];
  activities: ActivityRow[];
}

export interface PipelineSummary {
  counts: Record<string, number>;
  recentActivities: ActivityRow[];
}

export async function createProspect(input: CreateProspectInput): Promise<ProspectRow> {
  const now = Date.now();
  const id = crypto.randomUUID();
  await insertProspect({ id, ...input, createdAt: now, updatedAt: now });
  await insertActivity(id, ActivityType.Created, `Se cargó el prospecto ${input.name}`);
  const created = await findProspectById(id);
  if (created === null) throw new Error("No se pudo crear el prospecto");
  return created;
}

export async function getProspectDetail(id: string): Promise<ProspectDetail | null> {
  const prospect = await findProspectById(id);
  if (prospect === null) return null;
  const [emails, activities] = await Promise.all([
    listEmailsByProspect(id),
    listActivitiesByProspect(id),
  ]);
  return { prospect, emails, activities };
}

export async function listProspectRows(
  status?: ProspectStatus,
  search?: string,
  extra?: Omit<ProspectListFilters, "status" | "search">
): Promise<ProspectRow[]> {
  return listProspects({ status, search, ...extra });
}

export interface ReviewSummary {
  websiteCounts: Record<string, number>;
  withDemo: number;
  contactEligible: number;
}

export async function getReviewSummary(): Promise<ReviewSummary> {
  const [websiteCounts, withDemo, contactEligible] = await Promise.all([
    countByWebsiteStatus(),
    countWithDemo(),
    countContactEligible(),
  ]);
  return { websiteCounts, withDemo, contactEligible };
}

export async function deleteProspectById(id: string): Promise<boolean> {
  const existing = await findProspectById(id);
  if (existing === null) return false;
  await deleteProspect(id);
  return true;
}

export async function updateProspectFields(
  id: string,
  input: UpdateProspectInput
): Promise<ProspectRow | null> {
  const existing = await findProspectById(id);
  if (existing === null) return null;
  await updateProspect(id, input);
  if (input.demoPageUrl !== undefined && input.demoPageUrl !== existing.demoPageUrl) {
    await insertActivity(
      id,
      ActivityType.DemoPageSet,
      input.demoPageUrl === null
        ? "Se quitó la página de muestra"
        : `Página de muestra: ${input.demoPageUrl}`
    );
  }
  return findProspectById(id);
}

export async function changeProspectStatus(
  id: string,
  status: ProspectStatus
): Promise<ProspectRow | null> {
  const existing = await findProspectById(id);
  if (existing === null) return null;
  if (existing.status !== status) {
    const from =
      prospectStatusLabels[existing.status as ProspectStatus] ?? existing.status;
    await updateProspect(id, { status });
    await insertActivity(
      id,
      ActivityType.StatusChange,
      `${from} → ${prospectStatusLabels[status]}`
    );
  }
  return findProspectById(id);
}

export async function addNote(id: string, message: string): Promise<boolean> {
  const existing = await findProspectById(id);
  if (existing === null) return false;
  await insertActivity(id, ActivityType.Note, message);
  return true;
}

export async function getPipelineSummary(): Promise<PipelineSummary> {
  const [counts, recentActivities] = await Promise.all([
    countProspectsByStatus(),
    listRecentActivities(20),
  ]);
  return { counts, recentActivities };
}

export { activityTypeLabels };
