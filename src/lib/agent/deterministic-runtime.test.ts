import { describe, expect, it } from "vitest";

import { createMockJobs, createMockMaterials } from "../mock-data";
import { buildDeterministicAgentResult } from "./deterministic-runtime";

describe("buildDeterministicAgentResult", () => {
  it("returns a structured Agent result for the selected job", () => {
    const now = new Date("2026-04-19T08:00:00.000Z");
    const jobs = createMockJobs(now);
    const materials = createMockMaterials(now);
    const job = jobs.find((item) => item.id === "tencent");

    expect(job).toBeDefined();

    const result = buildDeterministicAgentResult({
      job: job!,
      jobs,
      materials,
      completedTaskIds: [],
      now,
    });

    expect(result).toEqual(
      expect.objectContaining({
        summary: expect.any(String),
        diagnosis: expect.objectContaining({
          headline: expect.any(String),
          reasons: expect.any(Array),
        }),
        recommendations: expect.any(Array),
        helperArtifacts: expect.any(Object),
      }),
    );
  });
});
