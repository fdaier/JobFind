import { describe, expect, it } from "vitest";

import { createMockJobs, createMockMaterials } from "../mock-data";
import { buildDeterministicAgentResult } from "./deterministic-runtime";

describe("buildDeterministicAgentResult", () => {
  const now = new Date("2026-04-19T08:00:00.000Z");
  const jobs = createMockJobs(now);
  const materials = createMockMaterials(now);

  it("returns a structured Agent result for the selected job", () => {
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

  it("explains Tencent as deadline plus missing portfolio focus", () => {
    const job = jobs.find((item) => item.id === "tencent");

    expect(job).toBeDefined();

    const result = buildDeterministicAgentResult({
      job: job!,
      jobs,
      materials,
      completedTaskIds: [],
      now,
    });

    expect(result.summary).toContain("腾讯");
    expect(result.diagnosis.headline).toContain("网申");
    expect(result.helperArtifacts.materialGuidance?.items).toContain("优先补齐作品集，避免卡住当前投递。");
  });

  it("builds an interview checklist for ByteDance-like jobs", () => {
    const job = jobs.find((item) => item.id === "bytedance");

    expect(job).toBeDefined();

    const result = buildDeterministicAgentResult({
      job: job!,
      jobs,
      materials,
      completedTaskIds: [],
      now,
    });

    expect(result.helperArtifacts.interviewPrepChecklist?.items.length).toBeGreaterThan(0);
    expect(result.helperArtifacts.interviewPrepChecklist?.items).toContain("围绕 AI、产品经理、面试、内容 准备 2-3 个项目案例。");
  });

  it("builds a follow-up draft for silence-related jobs", () => {
    const job = jobs.find((item) => item.id === "xiaohongshu");

    expect(job).toBeDefined();

    const result = buildDeterministicAgentResult({
      job: job!,
      jobs,
      materials,
      completedTaskIds: [],
      now,
    });

    expect(result.helperArtifacts.followUpDraft?.items[0]).toContain("您好");
    expect(result.helperArtifacts.followUpDraft?.items[1]).toContain("小红书");
  });
});
