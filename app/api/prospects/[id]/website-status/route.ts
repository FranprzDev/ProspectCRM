import { NextRequest, NextResponse } from "next/server";
import { changeWebsiteStatus } from "@/lib/services/prospect-service";
import { parseWebsiteStatus } from "@/lib/validators/prospect.validator";
import { jsonError, notFound } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const websiteStatus = parseWebsiteStatus(await request.json());
    const prospect = await changeWebsiteStatus(id, websiteStatus);
    if (prospect === null) return notFound();
    return NextResponse.json({ prospect });
  } catch (error) {
    return jsonError(error);
  }
}
