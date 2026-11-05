import { NextRequest, NextResponse } from "next/server";
import { requireAgentToken } from "@/lib/auth/agent";
import { changeProspectStatus } from "@/lib/services/prospect-service";
import { parseProspectStatus } from "@/lib/validators/prospect.validator";
import { jsonError, notFound, unauthorized } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!(await requireAgentToken(request))) return unauthorized();
  const { id } = await context.params;
  try {
    const status = parseProspectStatus(await request.json());
    const prospect = await changeProspectStatus(id, status);
    if (prospect === null) return notFound();
    return NextResponse.json({ prospect });
  } catch (error) {
    return jsonError(error);
  }
}
