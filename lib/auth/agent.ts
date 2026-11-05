import { getCloudflareContext } from "@opennextjs/cloudflare";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function requireAgentToken(request: Request): Promise<boolean> {
  const header = request.headers.get("authorization");
  if (header === null || !header.startsWith("Bearer ")) return false;
  const { env } = await getCloudflareContext({ async: true });
  const expected = env.AGENT_API_TOKEN;
  if (!expected) return false;
  return timingSafeEqual(header.slice("Bearer ".length), expected);
}
