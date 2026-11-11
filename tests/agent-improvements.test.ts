import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: async () => ({ env: { AGENT_API_TOKEN: "test-token" } }),
}));

vi.mock("@/lib/db/improvement-repository", () => ({
  listImprovements: vi.fn(),
  createImprovement: vi.fn(),
  updateImprovementStatus: vi.fn(),
}));

import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/agent/improvements/route";
import { PATCH } from "@/app/api/agent/improvements/[id]/route";
import {
  createImprovement,
  listImprovements,
  updateImprovementStatus,
} from "@/lib/db/improvement-repository";
import { ImprovementRow } from "@/lib/db/schema";

const agentToken = "test-token";
const authHeaders = { authorization: `Bearer ${agentToken}` };

function request(
  path: string,
  init: { method?: string; token?: boolean; body?: unknown } = {}
): NextRequest {
  const { method = "GET", token = false, body } = init;
  const headers: Record<string, string> = token ? { ...authHeaders } : {};
  if (body !== undefined) headers["content-type"] = "application/json";
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function row(overrides: Partial<ImprovementRow> = {}): ImprovementRow {
  return {
    id: "imp-20261111-01",
    createdAt: "2026-11-11T15:04:05.000Z",
    title: "Mejorar seguimiento",
    body: "Cuerpo de la mejora",
    basis: null,
    status: "proposed",
    ...overrides,
  };
}

const routeContext = { params: Promise.resolve({ id: "imp-20261111-01" }) };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/agent/improvements", () => {
  it("returns 401 without a valid token", async () => {
    const res = await GET(request("/api/agent/improvements"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with improvements when authorized", async () => {
    vi.mocked(listImprovements).mockResolvedValue([row()]);
    const res = await GET(request("/api/agent/improvements", { token: true }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { improvements: ImprovementRow[] };
    expect(json.improvements).toHaveLength(1);
  });
});

describe("POST /api/agent/improvements", () => {
  it("returns 401 without a valid token", async () => {
    const res = await POST(
      request("/api/agent/improvements", {
        method: "POST",
        body: { title: "T", body: "B" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("creates an improvement and returns 201", async () => {
    vi.mocked(createImprovement).mockResolvedValue(row());
    const res = await POST(
      request("/api/agent/improvements", {
        method: "POST",
        token: true,
        body: { title: "Nueva", body: "Detalle" },
      })
    );
    expect(res.status).toBe(201);
    const json = (await res.json()) as { improvement: ImprovementRow };
    expect(json.improvement.id).toMatch(/^imp-\d{8}-\d{2}$/);
    expect(json.improvement.status).toBe("proposed");
  });

  it("returns 400 when title is missing", async () => {
    const res = await POST(
      request("/api/agent/improvements", {
        method: "POST",
        token: true,
        body: { body: "Detalle" },
      })
    );
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/agent/improvements/[id]", () => {
  it("returns 401 without a valid token", async () => {
    const res = await PATCH(
      request("/api/agent/improvements/imp-20261111-01", {
        method: "PATCH",
        body: { status: "done" },
      }),
      routeContext
    );
    expect(res.status).toBe(401);
  });

  it("updates the status and returns 200", async () => {
    vi.mocked(updateImprovementStatus).mockResolvedValue(row({ status: "done" }));
    const res = await PATCH(
      request("/api/agent/improvements/imp-20261111-01", {
        method: "PATCH",
        token: true,
        body: { status: "done" },
      }),
      routeContext
    );
    expect(res.status).toBe(200);
    expect(updateImprovementStatus).toHaveBeenCalledWith("imp-20261111-01", "done");
  });

  it("returns 400 for an invalid status", async () => {
    const res = await PATCH(
      request("/api/agent/improvements/imp-20261111-01", {
        method: "PATCH",
        token: true,
        body: { status: "invalid" },
      }),
      routeContext
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown id", async () => {
    vi.mocked(updateImprovementStatus).mockResolvedValue(null);
    const res = await PATCH(
      request("/api/agent/improvements/imp-20261111-99", {
        method: "PATCH",
        token: true,
        body: { status: "done" },
      }),
      { params: Promise.resolve({ id: "imp-20261111-99" }) }
    );
    expect(res.status).toBe(404);
  });
});
