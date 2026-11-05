import { NextRequest, NextResponse } from "next/server";
import { addNote } from "@/lib/services/prospect-service";
import { parseNote } from "@/lib/validators/prospect.validator";
import { jsonError, notFound } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const message = parseNote(await request.json());
    const ok = await addNote(id, message);
    if (!ok) return notFound();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
