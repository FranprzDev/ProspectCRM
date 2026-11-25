import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createSessionToken,
  rememberMaxAgeSeconds,
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
  let remember = false;
  try {
    const body = (await request.json()) as {
      password?: unknown;
      remember?: unknown;
    };
    password = typeof body.password === "string" ? body.password : "";
    remember = body.remember === true;
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
  const maxAge = remember ? rememberMaxAgeSeconds : sessionMaxAgeSeconds;
  const token = await createSessionToken(env.SESSION_SECRET, maxAge);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return response;
}
