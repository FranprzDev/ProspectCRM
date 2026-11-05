import { NextRequest, NextResponse } from "next/server";
import { ProspectStatus } from "@/lib/domain/enums";
import { requireAgentToken } from "@/lib/auth/agent";
import { createProspect, listProspectRows } from "@/lib/services/prospect-service";
import { parseCreateProspect } from "@/lib/validators/prospect.validator";
import { jsonError, unauthorized } from "@/lib/api/respond";

export async function GET(request: NextRequest) {
  if (!(await requireAgentToken(request))) return unauthorized();
  const params = request.nextUrl.searchParams;
  const status = params.get("status") ?? undefined;
  const search = params.get("search") ?? undefined;
  const validStatus = Object.values(ProspectStatus).find((s) => s === status);
  const rows = await listProspectRows(validStatus, search);
  return NextResponse.json({ prospects: rows });
}

export async function POST(request: NextRequest) {
  if (!(await requireAgentToken(request))) return unauthorized();
  try {
    const input = parseCreateProspect(await request.json());
    const prospect = await createProspect(input);
    return NextResponse.json({ prospect }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
