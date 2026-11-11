import { describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: async () => ({ env: { AGENT_API_TOKEN: "test-token" } }),
}));

import { nextImprovementId } from "@/lib/db/improvement-repository";

const iso = "2026-11-11T15:04:05.000Z";

describe("nextImprovementId", () => {
  it("starts at 01 when there are no existing ids", () => {
    expect(nextImprovementId([], iso)).toBe("imp-20261111-01");
  });

  it("continues from the max existing sequence", () => {
    expect(nextImprovementId(["imp-20261111-01", "imp-20261111-04"], iso)).toBe(
      "imp-20261111-05"
    );
  });

  it("ignores ids from other dates", () => {
    expect(nextImprovementId(["imp-20261110-09"], iso)).toBe("imp-20261111-01");
  });

  it("uses the date part of the ISO instant", () => {
    expect(nextImprovementId([], "2025-01-02T00:00:00.000Z")).toBe("imp-20250102-01");
  });
});
