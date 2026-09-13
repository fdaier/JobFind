import { generateRiskTags } from "@/lib/rules-engine";
import type { Job, JobStage, JobType, Material, MaterialType, RecruitBatch } from "@/lib/types";
import { JOB_STAGE_LABELS } from "@/lib/job-stages";

export interface JDIntakeDraft {
  company: string;
  position: string;
  jdText: string;
  applicationDeadline: string;
  stage: JobStage;
  note: string;
  keywords: string[];
  requirements: string[];
  requiredMaterials: MaterialType[];
}

export { JOB_STAGE_LABELS };

const KEYWORD_RULES = [
  "LLM",
  "MLLM",
  "Agent",
  "RAG",
  "多模态",
  "大模型",
  "A/B 测试",
  "用户洞察",
  "用户体验",
  "产品策略",
  "数据分析",
  "用户增长",
  "智能体",
  "对话式界面",
  "生成式 UI",
  "用户行为分析",
  "数据实验",
];

const MATERIAL_RULES: Array<{ type: MaterialType; pattern: RegExp }> = [
  { type: "resume", pattern: /简历/i },
  { type: "portfolio", pattern: /作品集|产品项目|项目经验|项目作品/i },
  { type: "transcript", pattern: /成绩单/i },
  { type: "certificate", pattern: /证书|CET|雅思|托福/i },
  { type: "cover_letter", pattern: /求职信|cover\s*letter/i },
];

let fallbackIdCounter = 0;

function createManualJobId(now: Date): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `manual-jd-${now.getTime()}-${randomId}`;
  }

  fallbackIdCounter += 1;
  return `manual-jd-${now.getTime()}-${fallbackIdCounter}`;
}

function normalizeLine(line: string): string {
  return line.replace(/^\s*(?:[-*•]|\d+[.、])\s*/, "").replace(/\*\*/g, "").trim();
}

function extractRequirements(jdText: string): string[] {
  const lines = jdText.split(/\r?\n/).map(normalizeLine);
  const start = lines.findIndex((line) => /^(岗位要求|任职要求|职位要求|任职资格)/.test(line));
  if (start < 0) {
    return [];
  }

  const requirements: string[] = [];
  const firstLineRemainder = lines[start].replace(/^(岗位要求|任职要求|职位要求|任职资格)[:：]?\s*/, "");
  if (firstLineRemainder) {
    requirements.push(firstLineRemainder);
  }

  for (let index = start + 1; index < lines.length && requirements.length < 5; index += 1) {
    const line = lines[index];
    if (/^(加分项|注意事项|福利|岗位职责|工作职责|职位描述)/.test(line)) {
      break;
    }

    if (line) {
      requirements.push(line.slice(0, 180));
    }
  }

  return requirements;
}

function classifyJobType(text: string): JobType {
  if (/实习/.test(text)) {
    return "intern";
  }

  if (/校招/.test(text)) {
    return "campus";
  }

  if (/管培/.test(text)) {
    return "management_trainee";
  }

  return "social";
}

function classifyRecruitBatch(text: string, jobType: JobType): RecruitBatch {
  if (/秋招/.test(text)) {
    return "autumn";
  }

  if (/春招/.test(text)) {
    return "spring";
  }

  if (/补录/.test(text)) {
    return "supplementary";
  }

  if (/暑期|夏季/.test(text)) {
    return "summer_intern";
  }

  return jobType === "intern" ? "daily_intern" : "supplementary";
}

function deadlineToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T23:59:59`);
  const [year, month, day] = value.split("-").map(Number);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed.toISOString();
}

function matchesKeyword(jdText: string, keyword: string): boolean {
  if (keyword === "A/B 测试") {
    return /A\s*\/\s*B\s*测试/i.test(jdText);
  }

  return jdText.toLocaleLowerCase().includes(keyword.toLocaleLowerCase());
}

export function createEmptyJDIntakeDraft(): JDIntakeDraft {
  return {
    company: "",
    position: "",
    jdText: "",
    applicationDeadline: "",
    stage: "to_apply",
    note: "",
    keywords: [],
    requirements: [],
    requiredMaterials: [],
  };
}

export function organizeJDIntake(draft: JDIntakeDraft): JDIntakeDraft {
  return {
    ...draft,
    company: draft.company.trim(),
    position: draft.position.trim(),
    keywords: KEYWORD_RULES.filter((keyword) => matchesKeyword(draft.jdText, keyword)),
    requirements: extractRequirements(draft.jdText),
    requiredMaterials: MATERIAL_RULES.filter(({ pattern }) => pattern.test(draft.jdText)).map(({ type }) => type),
  };
}

export function createJobFromJDIntake(draft: JDIntakeDraft, materials: Material[], now: Date = new Date()): Job {
  const createdAt = now.toISOString();
  const jobType = classifyJobType(`${draft.position}\n${draft.jdText}`);
  const job: Job = {
    id: createManualJobId(now),
    company: draft.company.trim(),
    position: draft.position.trim(),
    jobType,
    batch: classifyRecruitBatch(`${draft.position}\n${draft.jdText}`, jobType),
    channel: "official_site",
    stage: draft.stage,
    applicationDeadline: deadlineToIso(draft.applicationDeadline),
    writtenTestDate: null,
    interviewDate: null,
    appliedDate: draft.stage === "to_apply" ? null : createdAt,
    jdText: draft.jdText,
    keywords: draft.keywords,
    requirements: draft.requirements,
    requiredMaterials: draft.requiredMaterials,
    boundMaterialIds: [],
    contactName: null,
    contactInfo: null,
    note: draft.note.trim().slice(0, 20),
    riskTags: [],
    aiSuggestions: [],
    timeline: [
      {
        date: createdAt,
        stage: draft.stage,
        description: `添加岗位：${draft.company.trim()} · ${draft.position.trim()}`,
      },
    ],
    interviewNotes: [],
    createdAt,
    updatedAt: createdAt,
  };

  return {
    ...job,
    riskTags: generateRiskTags(job, materials, now),
  };
}
