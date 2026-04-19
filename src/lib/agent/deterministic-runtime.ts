import {
  calculateMaterialCompleteness,
  generateRiskTags,
  getJobUrgencyRank,
  getTaskPriorityLabel,
  getTopJobTasks,
} from "../rules-engine";
import type { Job, RiskTag, TodayTask } from "../types";

import type { AgentRuntime, AgentRuntimeContext } from "./runtime";
import { buildFollowUpDraft, buildInterviewPrepChecklist, buildMaterialGuidance } from "./templates";
import type { AgentArtifactSection, AgentDiagnosis, AgentRecommendation, AgentResult } from "./types";

function getStageLabel(job: Job): string {
  const labels: Record<Job["stage"], string> = {
    interested: "关注中",
    to_apply: "待投递",
    applied: "已投递",
    written_test: "笔试",
    interviewing: "面试中",
    offer: "录用",
    rejected: "已淘汰",
  };

  return labels[job.stage];
}

function getPrimaryRisk(risks: RiskTag[]): RiskTag | null {
  if (risks.length === 0) {
    return null;
  }

  return [...risks].sort((left, right) => {
    if (left.level !== right.level) {
      return left.level === "critical" ? -1 : 1;
    }

    return left.type.localeCompare(right.type);
  })[0];
}

function buildSummary(job: Job, primaryRisk: RiskTag | null): string {
  if (primaryRisk?.type === "deadline") {
    return `当前最需要关注的是 ${job.company}${job.position}，它正处在网申时间窗口最紧的阶段。`;
  }

  if (primaryRisk?.type === "interview_prep") {
    return `${job.company}${job.position} 已进入面试准备阶段，当前重点是把临近面试准备完整。`;
  }

  if (primaryRisk?.type === "silence") {
    return `${job.company}${job.position} 已经投递一段时间但没有反馈，当前重点是礼貌跟进流程进展。`;
  }

  if (primaryRisk?.type === "material_gap") {
    return `${job.company}${job.position} 的主要阻塞是材料还没有补齐，先补齐再推进会更稳。`;
  }

  return `${job.company}${job.position} 当前处于正常推进状态，Agent 会给出最稳妥的下一步建议。`;
}

function buildPerception(job: Job, risks: RiskTag[], rank: number, totalJobs: number): string[] {
  const bullets = [`当前阶段：${getStageLabel(job)}`, `在申请池中的紧急度排序：第 ${rank} / ${totalJobs}`];

  if (job.applicationDeadline) {
    bullets.push("已识别到明确的网申截止时间。");
  }

  if (job.interviewDate) {
    bullets.push("已识别到明确的面试节点。");
  }

  bullets.push(risks.length > 0 ? `当前命中 ${risks.length} 个风险信号。` : "当前没有显性风险信号。");

  return bullets;
}

function buildDiagnosis(job: Job, primaryRisk: RiskTag | null, rank: number): AgentDiagnosis {
  if (!primaryRisk) {
    return {
      headline: `${job.company}${job.position} 当前没有阻塞风险`,
      reasons: ["当前没有临近 DDL、面试或材料缺口，适合按计划推进。"],
      urgencyLabel: "中",
    };
  }

  const urgencyLabel = primaryRisk.level === "critical" ? "紧急" : "高";

  return {
    headline:
      primaryRisk.type === "deadline"
        ? `${job.company}${job.position} 当前最重要的是先处理网申时效`
        : primaryRisk.type === "interview_prep"
          ? `${job.company}${job.position} 当前最重要的是准备临近面试`
          : primaryRisk.type === "silence"
            ? `${job.company}${job.position} 当前最重要的是跟进流程进展`
            : `${job.company}${job.position} 当前最重要的是补齐投递材料`,
    reasons: [primaryRisk.message, `这份岗位目前排在你的申请池第 ${rank} 位，需要优先处理。`],
    urgencyLabel,
  };
}

function buildWhyNow(task: TodayTask, rank: number): string {
  if (task.actionType === "submit_application") {
    return `这件事现在重要，因为网申时间最紧，而且它在当前申请池里排第 ${rank}。`;
  }

  if (task.actionType === "prepare_interview") {
    return `这件事现在重要，因为面试节点临近，准备不足会直接影响后续推进。`;
  }

  if (task.actionType === "follow_up") {
    return `这件事现在重要，因为已经等待了一段时间，适合发出一次礼貌且低打扰的跟进。`;
  }

  if (task.actionType === "bind_material") {
    return `这件事现在重要，因为材料缺口会直接卡住后续动作。`;
  }

  return `这件事现在重要，因为它是当前岗位最靠前的下一步。`;
}

function buildRecommendations(tasks: TodayTask[], rank: number): AgentRecommendation[] {
  return tasks.map((task) => ({
    taskId: task.id,
    action: task.action,
    reason: task.reason,
    priorityLabel: getTaskPriorityLabel(task.priority),
    whyNow: buildWhyNow(task, rank),
    actionType: task.actionType,
  }));
}

function buildRankingExplanation(job: Job, rank: number, totalJobs: number, risks: RiskTag[]): AgentArtifactSection {
  return {
    title: "排序依据",
    items: [
      `${job.company}${job.position} 当前排在第 ${rank} / ${totalJobs} 位。`,
      risks.length > 0
        ? `优先级提升的直接原因：${risks.map((risk) => risk.message).join("；")}。`
        : "当前没有显性风险，因此优先级主要来自阶段推进需要。",
    ],
  };
}

export function buildDeterministicAgentResult(context: AgentRuntimeContext): AgentResult {
  const now = context.now ?? new Date();
  const risks = generateRiskTags(context.job, context.materials, now);
  const tasks = getTopJobTasks(context.job, context.materials, now);
  const rank = getJobUrgencyRank(context.job, context.jobs, context.materials, now);
  const primaryRisk = getPrimaryRisk(risks);
  const materialState = calculateMaterialCompleteness(context.job, context.materials);

  return {
    summary: buildSummary(context.job, primaryRisk),
    perception: buildPerception(context.job, risks, rank, context.jobs.length),
    diagnosis: buildDiagnosis(context.job, primaryRisk, rank),
    recommendations: buildRecommendations(tasks, rank),
    helperArtifacts: {
      rankingExplanation: buildRankingExplanation(context.job, rank, context.jobs.length, risks),
      followUpDraft: risks.some((risk) => risk.type === "silence") ? buildFollowUpDraft(context.job) : null,
      interviewPrepChecklist:
        risks.some((risk) => risk.type === "interview_prep") || context.job.stage === "interviewing"
          ? buildInterviewPrepChecklist(context.job)
          : null,
      materialGuidance: materialState.missing.length > 0 ? buildMaterialGuidance(context.job, materialState.missing) : null,
    },
  };
}

export const deterministicAgentRuntime: AgentRuntime = {
  buildResult: buildDeterministicAgentResult,
};
