import { generateRiskTags } from "../../lib/rules-engine";
import type { Job, Material } from "../../lib/types";

export type BoardFilter = "all" | "attention" | "milestone";
export type BoardSort = "priority" | "updated" | "company";

const ACTION_WINDOW_MS = 72 * 60 * 60 * 1000;

function timestamp(value: string | null | undefined): number | null {
  if (!value) return null;

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function jobMilestoneTimes(job: Job): number[] {
  return [job.applicationDeadline, job.assessmentDeadline, job.writtenTestDate, job.interviewDate]
    .map(timestamp)
    .filter((value): value is number => value !== null);
}

function riskScore(job: Job, materials: Material[], now: Date): number {
  return generateRiskTags(job, materials, now).reduce(
    (score, risk) => score + (risk.level === "critical" ? 2 : 1),
    0,
  );
}

function earliestMilestone(job: Job): number {
  return Math.min(...jobMilestoneTimes(job), Number.POSITIVE_INFINITY);
}

export function matchesBoardQuery(job: Job, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  if (!normalizedQuery) return true;

  return [job.company, job.position, job.note ?? ""].some((value) =>
    value.toLocaleLowerCase("zh-CN").includes(normalizedQuery),
  );
}

export function hasKeyMilestone(job: Job): boolean {
  return jobMilestoneTimes(job).length > 0;
}

export function needsAttention(job: Job, materials: Material[], now: Date): boolean {
  if (generateRiskTags(job, materials, now).length > 0) return true;

  return jobMilestoneTimes(job).some((time) => time <= now.getTime() + ACTION_WINDOW_MS);
}

export function matchesBoardFilter(job: Job, filter: BoardFilter, materials: Material[], now: Date): boolean {
  switch (filter) {
    case "attention":
      return needsAttention(job, materials, now);
    case "milestone":
      return hasKeyMilestone(job);
    default:
      return true;
  }
}

export function sortBoardJobs(jobs: Job[], sort: BoardSort, materials: Material[], now: Date): Job[] {
  return [...jobs].sort((left, right) => {
    if (sort === "company") {
      const companyDelta = left.company.localeCompare(right.company, "zh-CN");
      return companyDelta !== 0 ? companyDelta : left.position.localeCompare(right.position, "zh-CN");
    }

    if (sort === "priority") {
      const riskDelta = riskScore(right, materials, now) - riskScore(left, materials, now);
      if (riskDelta !== 0) return riskDelta;

      const milestoneDelta = earliestMilestone(left) - earliestMilestone(right);
      if (milestoneDelta !== 0) return milestoneDelta;
    }

    const updatedDelta = (timestamp(right.updatedAt) ?? 0) - (timestamp(left.updatedAt) ?? 0);
    if (updatedDelta !== 0) return updatedDelta;

    return left.id.localeCompare(right.id);
  });
}

