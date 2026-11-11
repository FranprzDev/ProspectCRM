import { NextResponse } from "next/server";

function notFoundResponse(): NextResponse {
  return NextResponse.json({ error: "No encontrado" }, { status: 404 });
}

export async function GET(): Promise<NextResponse> {
  return notFoundResponse();
}

export async function POST(): Promise<NextResponse> {
  return notFoundResponse();
}

export async function PUT(): Promise<NextResponse> {
  return notFoundResponse();
}

export async function PATCH(): Promise<NextResponse> {
  return notFoundResponse();
}

export async function DELETE(): Promise<NextResponse> {
  return notFoundResponse();
}
