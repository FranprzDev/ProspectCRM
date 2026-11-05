import { NextRequest, NextResponse } from "next/server";
import { requireAgentToken } from "@/lib/auth/agent";
import { logEmail } from "@/lib/services/email-service";
import { parseLogEmail } from "@/lib/validators/email.validator";
import { jsonError, notFound, unauthorized } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!(await requireAgentToken(request))) return unauthorized();
  const { id } = await context.params;
  try {
    const input = parseLogEmail(await request.json());
    const ok = await logEmail(id, input);
    if (!ok) return notFound();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
