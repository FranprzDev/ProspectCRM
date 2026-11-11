import { NextRequest, NextResponse } from "next/server";
import { ImprovementStatus } from "@/lib/domain/enums";
import { requireAgentToken } from "@/lib/auth/agent";
import { createImprovement, listImprovements } from "@/lib/db/improvement-repository";
import { parseCreateImprovement } from "@/lib/validators/improvement.validator";
import { jsonError, unauthorized } from "@/lib/api/respond";

export async function GET(request: NextRequest) {
  if (!(await requireAgentToken(request))) return unauthorized();
  try {
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const validStatus = Object.values(ImprovementStatus).find((s) => s === status);
    const improvements = await listImprovements(validStatus);
    return NextResponse.json({ improvements });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAgentToken(request))) return unauthorized();
  try {
    const input = parseCreateImprovement(await request.json());
    const improvement = await createImprovement(input);
    return NextResponse.json({ improvement }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
