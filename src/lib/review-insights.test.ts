import { describe, expect, it } from "vitest";

import { createMockJobs, createMockMaterials } from "./mock-data";
import {
  buildAgentMemoryInsights,
  buildChannelInsights,
  buildInterviewInsights,
  buildMaterialInsights,
} from "./review-insights";

const now = new Date("2026-04-19T08:00:00.000Z");

describe("review insights", () => {
  it("builds material coverage and gap guidance", () => {
    const jobs = createMockJobs(now);
    const materials = createMockMaterials(now);

    const insights = buildMaterialInsights(jobs, materials);

    expect(insights.totalMaterials).toBe(6);
    expect(insights.topMaterial?.name).toBe("本科成绩单");
    expect(insights.topMaterial?.boundJobCount).toBe(8);
    expect(insights.gaps[0]?.materialLabel).toBe("作品集");
    expect(insights.gaps[0]?.jobs.some((job) => job.company === "腾讯")).toBe(true);
    expect(insights.recommendation).toContain("优先补齐作品集");
  });

  it("builds channel performance and recommendation", () => {
    const jobs = createMockJobs(now);
    const materials = createMockMaterials(now);

    const insights = buildChannelInsights(jobs, materials, now);

    expect(insights.channels.length).toBeGreaterThan(0);
    expect(insights.recommendedChannel).toBeTruthy();
    expect(insights.recommendation).toContain("Agent 建议");
    expect(insights.channels.some((channel) => channel.label === "官网")).toBe(true);
  });

  it("builds interview review summary", () => {
    const jobs = createMockJobs(now);

    const insights = buildInterviewInsights(jobs);

    expect(insights.totalNotes).toBeGreaterThan(0);
    expect(insights.commonQuestions.length).toBeGreaterThan(0);
    expect(insights.recommendation).toContain("复盘");
  });

  it("builds 3 to 5 Agent memory items", () => {
    const jobs = createMockJobs(now);
    const materials = createMockMaterials(now);

    const memories = buildAgentMemoryInsights(jobs, materials, now);

    expect(memories.length).toBeGreaterThanOrEqual(3);
    expect(memories.length).toBeLessThanOrEqual(5);
    expect(memories[0]?.title).toContain("Agent");
  });
});
