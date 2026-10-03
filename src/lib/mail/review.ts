import type { Company } from "@/lib/company-pool";
import type { Job, JobStage } from "@/lib/types";
import { JOB_STAGE_ORDER } from "@/lib/job-stages";
import type { MailObservation } from "./analysis";

export interface ReviewMail extends MailObservation { uidValidity: string }
export interface ReviewDecision {
  uidValidity: string;
  uid: number;
  status: "applied" | "ignored";
  jobId: string | null;
  targetStage: JobStage | null;
}
export interface ReviewItem {
  id: string;
  mail: ReviewMail;
  lane: "ready" | "uncertain";
  suggestedJobId: string | null;
  suggestedStage: JobStage | null;
  reason: string;
  decision: ReviewDecision | null;
}

const DEMO_JOB_IDS = new Set(["tencent", "bytedance", "xiaohongshu", "meituan", "alibaba", "netease", "jd", "kuaishou", "baidu", "ant", "bilibili", "tme", "mihoyo"]);
const TERMINAL = new Set<JobStage>(["offer", "rejected"]);

function normalized(value: string): string {
  return value.toLocaleLowerCase("zh-CN").replace(/[\s\-—_（）()·.，,。:：\[\]【】]/g, "");
}

export function isDemoJobId(id: string): boolean { return DEMO_JOB_IDS.has(id); }

export function stageFromMail(mail: MailObservation): JobStage | null {
  switch (mail.category) {
    case "application": return "applied";
    case "assessment": return "assessment";
    case "written_test": return "written_test";
    case "offer": return "offer";
    case "rejection": return "rejected";
    case "interview": {
      const text = `${mail.subject} ${mail.evidence ?? ""}`;
      if (/HR\s*面|人力资源面/i.test(text)) return "hr_interview";
      if (/三面|第三轮面试/i.test(text)) return "third_interview";
      if (/二面|第二轮面试/i.test(text)) return "second_interview";
      return "first_interview";
    }
    default: return null;
  }
}

export function stageCanAdvance(current: JobStage, target: JobStage): boolean {
  if (TERMINAL.has(current)) return false;
  if (target === "rejected") return true;
  return JOB_STAGE_ORDER.indexOf(target) > JOB_STAGE_ORDER.indexOf(current);
}

function matchJob(mail: ReviewMail, jobs: Job[], companies: Company[]): string | null {
  const eventId = `${mail.uidValidity}:${mail.uid}`;
  const previouslyApplied = jobs.filter((job) => job.timeline.some((event) => event.sourceEventId === eventId));
  if (previouslyApplied.length === 1) return previouslyApplied[0].id;
  const text = normalized(`${mail.subject} ${mail.snippet} ${mail.evidence ?? ""}`);
  const matches = jobs.filter((job) => {
    if (isDemoJobId(job.id)) return false;
    const company = companies.find((item) => item.id === job.companyId);
    const names = [job.company, company?.name ?? "", ...(company?.aliases ?? [])]
      .map(normalized).filter((name) => name.length >= 2);
    const position = normalized(job.position);
    return names.some((name) => text.includes(name)) && position.length >= 4 && text.includes(position);
  });
  return matches.length === 1 ? matches[0].id : null;
}

export function buildReviewItems(mails: ReviewMail[], jobs: Job[], companies: Company[], decisions: ReviewDecision[]): ReviewItem[] {
  const decisionMap = new Map(decisions.map((decision) => [`${decision.uidValidity}:${decision.uid}`, decision]));
  return mails.map((mail) => {
    const id = `${mail.uidValidity}:${mail.uid}`;
    const suggestedJobId = mail.category === "other" ? null : matchJob(mail, jobs, companies);
    const job = jobs.find((candidate) => candidate.id === suggestedJobId);
    const suggestedStage = stageFromMail(mail) ?? job?.timeline.find((event) => event.sourceEventId === id)?.stage ?? null;
    const alreadyApplied = Boolean(job?.timeline.some((event) => event.sourceEventId === id));
    const canAdvance = Boolean(job && suggestedStage && stageCanAdvance(job.stage, suggestedStage));
    let reason = mail.category === "other"
      ? "这封邮件未被识别为招聘通知；仅保留主题和发件人供你核对，可能与求职无关。"
      : "邮件与岗位尚不能唯一对应，请核对后手动选择。";
    if (alreadyApplied) reason = "岗位已应用这封邮件，处理回执待同步；重试不会重复推进。";
    else if (!suggestedStage && mail.category !== "other") reason = "这封邮件与招聘有关，但没有明确证明申请阶段已推进。";
    else if (job && TERMINAL.has(job.stage)) reason = "岗位已处于终态，新邮件与当前状态冲突。";
    else if (job && !canAdvance) reason = "邮件阶段已被看板现有进度覆盖，不会自动倒退。";
    else if (canAdvance) reason = "邮件中的公司和岗位名称均匹配当前浏览器的唯一岗位。";
    return { id, mail, lane: canAdvance ? "ready" as const : "uncertain" as const, suggestedJobId, suggestedStage, reason, decision: decisionMap.get(id) ?? null };
  }).sort((a, b) => (b.mail.date ?? "").localeCompare(a.mail.date ?? "") || b.mail.uid - a.mail.uid);
}
