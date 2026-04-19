import { getMaterialTypeLabel } from "../rules-engine";
import type { Job, MaterialType } from "../types";

import type { AgentArtifactSection } from "./types";

export function buildFollowUpDraft(job: Job): AgentArtifactSection {
  return {
    title: "跟进话术草稿",
    items: [
      "您好，我是此前投递贵司相关岗位的同学，想礼貌跟进一下当前流程进展。",
      `我投递的是 ${job.company}${job.position}，如果还需要补充任何材料或信息，我可以尽快配合。`,
      "感谢您抽空查看，也期待后续消息。",
    ],
  };
}

export function buildInterviewPrepChecklist(job: Job): AgentArtifactSection {
  const keywordText = job.keywords.length > 0 ? job.keywords.join("、") : "岗位要求";

  return {
    title: "面试准备清单",
    items: [
      `围绕 ${keywordText} 准备 2-3 个项目案例。`,
      "把项目背景、目标、行动、结果整理成 1 分钟和 3 分钟两个版本。",
      "提前准备一版反问问题，聚焦团队目标、岗位期待和协作方式。",
    ],
  };
}

export function buildMaterialGuidance(job: Job, missing: MaterialType[]): AgentArtifactSection {
  const firstMissing = missing[0];

  return {
    title: "材料补齐建议",
    items: [
      `优先补齐${firstMissing ? getMaterialTypeLabel(firstMissing) : "关键材料"}，避免卡住当前投递。`,
      `当前岗位还缺：${missing.map(getMaterialTypeLabel).join("、")}。`,
      `补齐后优先回到 ${job.company}${job.position} 的申请动作。`,
    ],
  };
}
