import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/validators/validation-error";

export function jsonError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function notFound(): NextResponse {
  return NextResponse.json({ error: "No encontrado" }, { status: 404 });
}
