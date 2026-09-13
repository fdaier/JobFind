import type { JobStage } from "./types";

export const JOB_STAGE_ORDER: JobStage[] = [
  "to_apply",
  "applied",
  "assessment",
  "written_test",
  "first_interview",
  "second_interview",
  "third_interview",
  "hr_interview",
  "offer",
  "rejected",
];

export const JOB_STAGE_LABELS: Record<JobStage, string> = {
  to_apply: "待投递",
  applied: "已投递",
  assessment: "测评",
  written_test: "笔试",
  first_interview: "一面",
  second_interview: "二面",
  third_interview: "三面",
  hr_interview: "HR面",
  offer: "录用",
  rejected: "已淘汰",
};

export const INTERVIEW_STAGES = new Set<JobStage>([
  "first_interview",
  "second_interview",
  "third_interview",
  "hr_interview",
]);

export function isInterviewStage(stage: JobStage): boolean {
  return INTERVIEW_STAGES.has(stage);
}

export function isJobStage(value: unknown): value is JobStage {
  return typeof value === "string" && JOB_STAGE_ORDER.includes(value as JobStage);
}

export function getNextStage(stage: JobStage): JobStage | null {
  const index = JOB_STAGE_ORDER.indexOf(stage);
  if (index < 0 || stage === "offer" || stage === "rejected") {
    return null;
  }

  return JOB_STAGE_ORDER[index + 1] ?? null;
}
