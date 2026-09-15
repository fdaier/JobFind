import { describe, expect, it } from "vitest";

import { createMockJobs } from "../../lib/mock-data";
import type { Job } from "../../lib/types";
import { matchesBoardFilter, matchesBoardQuery, sortBoardJobs } from "./board-view";

describe("board high-volume view helpers", () => {
  const now = new Date("2026-09-15T08:00:00.000Z");
  const seed = createMockJobs(now);

  it("matches company, position and note without changing saved jobs", () => {
    const jobWithNote: Job = { ...seed[0], note: "等腾讯测评" };

    expect(matchesBoardQuery(jobWithNote, "腾讯")).toBe(true);
    expect(matchesBoardQuery(jobWithNote, "产品实习")).toBe(true);
    expect(matchesBoardQuery(jobWithNote, "测评")).toBe(true);
    expect(matchesBoardQuery(jobWithNote, "不存在")).toBe(false);
  });

  it("filters attention from the existing risk and milestone data", () => {
    const urgent: Job = {
      ...seed[0],
      id: "urgent-assessment",
      stage: "assessment",
      applicationDeadline: null,
      assessmentDeadline: "2026-09-16T08:00:00.000Z",
      requiredMaterials: [],
      boundMaterialIds: [],
    };
    const quiet: Job = {
      ...seed[0],
      id: "quiet-job",
      stage: "applied",
      applicationDeadline: null,
      assessmentDeadline: null,
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: "2026-09-14T08:00:00.000Z",
      requiredMaterials: [],
      boundMaterialIds: [],
    };

    expect(matchesBoardFilter(urgent, "attention", [], now)).toBe(true);
    expect(matchesBoardFilter(quiet, "attention", [], now)).toBe(false);
    expect(matchesBoardFilter(urgent, "milestone", [], now)).toBe(true);
    expect(matchesBoardFilter(quiet, "milestone", [], now)).toBe(false);
  });

  it("sorts urgent work before ordinary jobs and keeps recent updates ordered", () => {
    const urgent: Job = {
      ...seed[0],
      id: "urgent",
      company: "紧急公司",
      stage: "assessment",
      applicationDeadline: null,
      assessmentDeadline: "2026-09-15T12:00:00.000Z",
      requiredMaterials: [],
      boundMaterialIds: [],
      updatedAt: "2026-09-14T08:00:00.000Z",
    };
    const recent: Job = {
      ...seed[0],
      id: "recent",
      company: "普通公司",
      applicationDeadline: null,
      assessmentDeadline: null,
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: "2026-09-14T08:00:00.000Z",
      requiredMaterials: [],
      boundMaterialIds: [],
      updatedAt: "2026-09-15T07:00:00.000Z",
    };

    expect(sortBoardJobs([recent, urgent], "priority", [], now).map((job) => job.id)).toEqual(["urgent", "recent"]);
    expect(sortBoardJobs([urgent, recent], "updated", [], now).map((job) => job.id)).toEqual(["recent", "urgent"]);
  });
});
