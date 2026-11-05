import { NextRequest, NextResponse } from "next/server";
import {
  getProspectDetail,
  updateProspectFields,
} from "@/lib/services/prospect-service";
import { parseUpdateProspect } from "@/lib/validators/prospect.validator";
import { jsonError, notFound } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const detail = await getProspectDetail(id);
  if (detail === null) return notFound();
  return NextResponse.json(detail);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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
