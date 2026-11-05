import { NextResponse } from "next/server";
import { markImprovementRequested } from "@/lib/db/improvement-repository";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await markImprovementRequested(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
