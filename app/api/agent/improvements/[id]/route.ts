import { NextRequest, NextResponse } from "next/server";
import { requireAgentToken } from "@/lib/auth/agent";
import { updateImprovementStatus } from "@/lib/db/improvement-repository";
import { parseImprovementStatus } from "@/lib/validators/improvement.validator";
import { jsonError, notFound, unauthorized } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await requireAgentToken(request))) return unauthorized();
  const { id } = await context.params;
  try {
    const status = parseImprovementStatus(await request.json());
    const improvement = await updateImprovementStatus(id, status);
    if (improvement === null) return notFound();
    return NextResponse.json({ improvement });
  } catch (error) {
    return jsonError(error);
  }
}
