import { NextResponse } from "next/server";
import { ImprovementStatus } from "@/lib/domain/enums";
import { updateImprovementStatus } from "@/lib/db/improvement-repository";
import { parseImprovementStatus } from "@/lib/validators/improvement.validator";
import { ValidationError } from "@/lib/validators/validation-error";
import { jsonError, notFound } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const status = parseImprovementStatus(await request.json());
    if (status !== ImprovementStatus.Done && status !== ImprovementStatus.Dismissed) {
      throw new ValidationError("Estado no permitido");
    }
    const improvement = await updateImprovementStatus(id, status);
    if (improvement === null) return notFound();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
