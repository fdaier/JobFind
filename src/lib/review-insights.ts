import { generateRiskTags } from "./rules-engine";
import type { Job, Material, MaterialType, SourceChannel } from "./types";

const MATERIAL_LABELS: Record<MaterialType, string> = {
  resume: "简历",
  portfolio: "作品集",
  transcript: "成绩单",
  certificate: "证书",
  cover_letter: "求职信",
  other: "其他材料",
};

const CHANNEL_LABELS: Record<SourceChannel, string> = {
  official_site: "官网",
  boss: "Boss",
  shixiseng: "实习僧",
  nowcoder: "牛客",
  school_career: "学校就业网",
  referral: "内推",
  campus_talk: "宣讲会",
};

const ADVANCED_STAGES = new Set<Job["stage"]>(["written_test", "interviewing", "offer"]);

export interface MaterialGapInsight {
  type: MaterialType;
  materialLabel: string;
  jobs: Array<{ id: string; company: string; position: string }>;
}

export interface MaterialUsageInsight {
  id: string;
  name: string;
  typeLabel: string;
  targetDirection: string;
  version: string;
  lastUpdated: string;
  boundJobCount: number;
  boundJobs: Array<{ id: string; company: string; position: string }>;
  usageNote: string;
}

export interface MaterialInsights {
  totalMaterials: number;
  topMaterial: MaterialUsageInsight | null;
  materials: MaterialUsageInsight[];
  gaps: MaterialGapInsight[];
  recommendation: string;
}

export interface ChannelInsight {
  channel: SourceChannel;
  label: string;
  totalJobs: number;
  advancedJobs: number;
  offerJobs: number;
  riskCount: number;
}

export interface ChannelInsights {
  channels: ChannelInsight[];
  recommendedChannel: ChannelInsight | null;
  recommendation: string;
}

export interface InterviewInsights {
  totalNotes: number;
  reviewedJobs: number;
  commonQuestions: string[];
  recommendation: string;
}

export interface AgentMemoryInsight {
  title: string;
  body: string;
}

function getJobSummary(job: Job) {
  return { id: job.id, company: job.company, position: job.position };
}

function getMaterialUsageNote(count: number) {
  if (count >= 5) {
    return `覆盖 ${count} 个岗位，是当前最核心的通用材料。`;
  }

  if (count > 0) {
    return `已服务 ${count} 个岗位，适合继续按方向复用。`;
  }

  return "暂无绑定岗位，适合先确认是否还需要维护。";
}

function buildUsageInsight(material: Material, jobs: Job[]): MaterialUsageInsight {
  const boundJobs = jobs.filter((job) => job.boundMaterialIds.includes(material.id)).map(getJobSummary);

  return {
    id: material.id,
    name: material.name,
    typeLabel: MATERIAL_LABELS[material.type],
    targetDirection: material.targetDirection,
    version: material.version,
    lastUpdated: material.lastUpdated,
    boundJobCount: boundJobs.length,
    boundJobs,
    usageNote: getMaterialUsageNote(boundJobs.length),
  };
}

export function getMaterialLabel(type: MaterialType): string {
  return MATERIAL_LABELS[type];
}

export function getChannelLabel(channel: SourceChannel): string {
  return CHANNEL_LABELS[channel];
}

export function buildMaterialInsights(jobs: Job[], materials: Material[]): MaterialInsights {
  const materialsById = new Map(materials.map((material) => [material.id, material] as const));

  const usages = materials
    .map((material) => buildUsageInsight(material, jobs))
    .sort((left, right) => right.boundJobCount - left.boundJobCount || left.name.localeCompare(right.name, "zh-CN"));

  const gapMap = new Map<MaterialType, Array<{ id: string; company: string; position: string }>>();
  jobs.forEach((job) => {
    job.requiredMaterials.forEach((type) => {
      const hasMaterial = job.boundMaterialIds.some((materialId) => materialsById.get(materialId)?.type === type);
      if (!hasMaterial) {
        gapMap.set(type, [...(gapMap.get(type) ?? []), getJobSummary(job)]);
      }
    });
  });

  const gaps = [...gapMap.entries()]
    .map(([type, gapJobs]) => ({
      type,
      materialLabel: getMaterialLabel(type),
      jobs: gapJobs,
    }))
    .sort((left, right) => right.jobs.length - left.jobs.length || left.materialLabel.localeCompare(right.materialLabel, "zh-CN"));

  const primaryGap = gaps[0];
  const recommendation = primaryGap
    ? `Agent 建议：优先补齐${primaryGap.materialLabel}，因为它正在影响 ${primaryGap.jobs[0]?.company}${primaryGap.jobs[0]?.position}。`
    : "Agent 建议：当前材料覆盖完整，下一步重点维护高频使用材料的最新版本。";

  return {
    totalMaterials: materials.length,
    topMaterial: usages[0] ?? null,
    materials: usages,
    gaps,
    recommendation,
  };
}

export function buildChannelInsights(jobs: Job[], materials: Material[], now: Date = new Date()): ChannelInsights {
  const channels = [...new Set(jobs.map((job) => job.channel))]
    .map((channel) => {
      const channelJobs = jobs.filter((job) => job.channel === channel);
      return {
        channel,
        label: getChannelLabel(channel),
        totalJobs: channelJobs.length,
        advancedJobs: channelJobs.filter((job) => ADVANCED_STAGES.has(job.stage)).length,
        offerJobs: channelJobs.filter((job) => job.stage === "offer").length,
        riskCount: channelJobs.reduce((count, job) => count + generateRiskTags(job, materials, now).length, 0),
      };
    })
    .sort(
      (left, right) =>
        right.offerJobs - left.offerJobs ||
        right.advancedJobs - left.advancedJobs ||
        right.totalJobs - left.totalJobs ||
        left.label.localeCompare(right.label, "zh-CN"),
    );

  const recommendedChannel = channels[0] ?? null;
  const recommendation = recommendedChannel
    ? `Agent 建议：优先维护${recommendedChannel.label}渠道，它当前带来了 ${recommendedChannel.advancedJobs} 个进入后续阶段的机会。`
    : "Agent 建议：先积累更多申请记录，再判断渠道投入优先级。";

  return { channels, recommendedChannel, recommendation };
}

export function buildInterviewInsights(jobs: Job[]): InterviewInsights {
  const notes = jobs.flatMap((job) => job.interviewNotes);
  const questionCounts = new Map<string, number>();

  notes.forEach((note) => {
    note.questions.forEach((question) => {
      questionCounts.set(question, (questionCounts.get(question) ?? 0) + 1);
    });
  });

  const commonQuestions = [...questionCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "zh-CN"))
    .slice(0, 5)
    .map(([question]) => question);

  return {
    totalNotes: notes.length,
    reviewedJobs: jobs.filter((job) => job.interviewNotes.length > 0).length,
    commonQuestions,
    recommendation:
      notes.length > 0
        ? "Agent 建议：把高频问题沉淀成固定准备清单，每次面试前先复盘项目拆解、指标和动机表达。"
        : "Agent 建议：完成下一场面试后立即补充复盘，避免忘记关键问题。",
  };
}

export function buildAgentMemoryInsights(jobs: Job[], materials: Material[], now: Date = new Date()): AgentMemoryInsight[] {
  const materialInsights = buildMaterialInsights(jobs, materials);
  const channelInsights = buildChannelInsights(jobs, materials, now);
  const interviewInsights = buildInterviewInsights(jobs);

  const memories: AgentMemoryInsight[] = [
    {
      title: "Agent 记忆：渠道策略",
      body: channelInsights.recommendation,
    },
    {
      title: "Agent 记忆：材料策略",
      body: materialInsights.recommendation,
    },
    {
      title: "Agent 记忆：面试策略",
      body: interviewInsights.recommendation,
    },
  ];

  if (materialInsights.topMaterial) {
    memories.push({
      title: "Agent 记忆：核心资产",
      body: `${materialInsights.topMaterial.name} 已覆盖 ${materialInsights.topMaterial.boundJobCount} 个岗位，后续应优先保持这一版最新。`,
    });
  }

  const activeRisks = jobs.reduce((count, job) => count + generateRiskTags(job, materials, now).length, 0);
  memories.push({
    title: "Agent 记忆：风险节奏",
    body:
      activeRisks > 0
        ? `当前申请池仍有 ${activeRisks} 个风险信号，复盘时先看 DDL、材料和面试窗口。`
        : "当前申请池风险较低，适合把精力转向新岗位拓展。",
  });

  return memories.slice(0, 5);
}
