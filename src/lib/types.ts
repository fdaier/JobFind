export type JobStage =
  | 'to_apply'
  | 'applied'
  | 'assessment'
  | 'written_test'
  | 'first_interview'
  | 'second_interview'
  | 'third_interview'
  | 'hr_interview'
  | 'offer'
  | 'rejected';

export type JobType = 'campus' | 'intern' | 'management_trainee' | 'social';

export type RecruitBatch = 'autumn' | 'spring' | 'supplementary' | 'summer_intern' | 'daily_intern';

export type SourceChannel =
  | 'official_site'
  | 'boss'
  | 'shixiseng'
  | 'nowcoder'
  | 'school_career'
  | 'referral'
  | 'campus_talk';

export type RiskLevel = 'critical' | 'warning' | 'normal';

export type MaterialType = 'resume' | 'portfolio' | 'transcript' | 'certificate' | 'cover_letter' | 'other';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskActionType =
  | 'submit_application'
  | 'bind_material'
  | 'prepare_interview'
  | 'follow_up'
  | 'take_test'
  | 'update_material'
  | 'review_interview';

export interface RiskTag {
  type: 'deadline' | 'assessment_deadline' | 'material_gap' | 'silence' | 'interview_prep';
  level: RiskLevel;
  message: string;
}

export interface AISuggestion {
  id: string;
  action: string;
  reason: string;
  priority: TaskPriority;
  actionType: TaskActionType;
  completed: boolean;
}

export interface TimelineEvent {
  date: string;
  stage: JobStage;
  description: string;
}

export interface InterviewNote {
  round: string;
  date: string;
  questions: string[];
  reflection: string;
  result: 'passed' | 'failed' | 'pending';
}

export interface Job {
  id: string;
  company: string;
  position: string;
  jobType: JobType;
  batch: RecruitBatch;
  channel: SourceChannel;
  stage: JobStage;
  applicationDeadline: string | null;
  /** Added in the assessment-deadline release; storage hydration backfills old jobs with null. */
  assessmentDeadline?: string | null;
  /** User-provided link only; JobFind never automatically opens or accesses it. */
  assessmentLink?: string | null;
  writtenTestDate: string | null;
  interviewDate: string | null;
  appliedDate: string | null;
  jdText: string;
  keywords: string[];
  requirements: string[];
  requiredMaterials: MaterialType[];
  boundMaterialIds: string[];
  contactName: string | null;
  contactInfo: string | null;
  /** Added in V3; storage hydration backfills old jobs with an empty value. */
  note?: string;
  riskTags: RiskTag[];
  aiSuggestions: AISuggestion[];
  timeline: TimelineEvent[];
  interviewNotes: InterviewNote[];
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  targetDirection: string;
  version: string;
  lastUpdated: string;
  boundJobIds: string[];
}

export interface TodayTask {
  id: string;
  jobId: string;
  company: string;
  position: string;
  action: string;
  reason: string;
  priority: TaskPriority;
  actionType: TaskActionType;
  score: number;
  completed: boolean;
}

export interface FunnelData {
  toApply: number;
  applied: number;
  assessment: number;
  writtenTest: number;
  firstInterview: number;
  secondInterview: number;
  thirdInterview: number;
  hrInterview: number;
  offer: number;
  rejected: number;
}
