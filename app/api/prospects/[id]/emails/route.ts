import { NextRequest, NextResponse } from "next/server";
import { listEmailsByProspect } from "@/lib/db/email-repository";
import { logEmail } from "@/lib/services/email-service";
import { parseLogEmail } from "@/lib/validators/email.validator";
import { jsonError, notFound } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const rows = await listEmailsByProspect(id);
  return NextResponse.json({ emails: rows });
}

export async function POST(request: NextRequest, context: RouteContext) {
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
