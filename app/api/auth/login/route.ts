import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createSessionToken,
  sessionCookieName,
  sessionMaxAgeSeconds,
  verifyPassword,
} from "@/lib/auth/session";
import { isLoginRateLimited, recordLoginAttempt } from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (await isLoginRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá en unos minutos." },
      { status: 429 }
    );
  }
  let password: string;
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    password = "";
  }
  const { env } = await getCloudflareContext({ async: true });
  const valid =
    password !== "" &&
    Boolean(env.ADMIN_PASSWORD_HASH) &&
    (await verifyPassword(password, env.ADMIN_PASSWORD_HASH));
  if (!valid) {
    await recordLoginAttempt(ip);
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  const token = await createSessionToken(env.SESSION_SECRET);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
  return response;
}
