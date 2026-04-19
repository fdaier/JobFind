import type { TaskActionType } from "../types";

export interface AgentArtifactSection {
  title: string;
  items: string[];
}

export interface AgentDiagnosis {
  headline: string;
  reasons: string[];
  urgencyLabel: string;
}

export interface AgentRecommendation {
  taskId: string;
  action: string;
  reason: string;
  priorityLabel: string;
  whyNow: string;
  actionType: TaskActionType;
}

export interface AgentHelperArtifacts {
  rankingExplanation: AgentArtifactSection | null;
  followUpDraft: AgentArtifactSection | null;
  interviewPrepChecklist: AgentArtifactSection | null;
  materialGuidance: AgentArtifactSection | null;
}

export interface AgentResult {
  summary: string;
  perception: string[];
  diagnosis: AgentDiagnosis;
  recommendations: AgentRecommendation[];
  helperArtifacts: AgentHelperArtifacts;
}
