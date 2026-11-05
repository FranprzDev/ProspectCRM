import { NextRequest, NextResponse } from "next/server";
import { requireAgentToken } from "@/lib/auth/agent";
import {
  getProspectDetail,
  updateProspectFields,
} from "@/lib/services/prospect-service";
import { parseUpdateProspect } from "@/lib/validators/prospect.validator";
import { jsonError, notFound, unauthorized } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!(await requireAgentToken(request))) return unauthorized();
  const { id } = await context.params;
  const detail = await getProspectDetail(id);
  if (detail === null) return notFound();
  return NextResponse.json(detail);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await requireAgentToken(request))) return unauthorized();
  const { id } = await context.params;
  try {
    const input = parseUpdateProspect(await request.json());
    const prospect = await updateProspectFields(id, input);
    if (prospect === null) return notFound();
    return NextResponse.json({ prospect });
  } catch (error) {
    return jsonError(error);
  }
}
