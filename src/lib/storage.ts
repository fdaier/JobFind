import type { Job, Material } from './types';

const JOBS_KEY = 'jobfind.jobs';
const MATERIALS_KEY = 'jobfind.materials';
const COMPLETED_TASK_IDS_KEY = 'jobfind.completedTasks';

function hasWindow(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadJsonValue<T>(key: string): T | null {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function saveJsonValue(key: string, value: unknown): void {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function loadStringArray(key: string): string[] | null {
  const value = loadJsonValue<unknown>(key);
  if (value === null) {
    return null;
  }

  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    if (hasWindow()) {
      window.localStorage.removeItem(key);
    }

    return null;
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isTimelineEvent(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.date === 'string' &&
    typeof value.stage === 'string' &&
    typeof value.description === 'string'
  );
}

function isInterviewNote(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.round === 'string' &&
    typeof value.date === 'string' &&
    isStringArray(value.questions) &&
    typeof value.reflection === 'string' &&
    (value.result === 'passed' || value.result === 'failed' || value.result === 'pending')
  );
}

function isRiskTag(value: unknown): boolean {
  return (
    isRecord(value) &&
    (value.type === 'deadline' || value.type === 'material_gap' || value.type === 'silence' || value.type === 'interview_prep') &&
    (value.level === 'critical' || value.level === 'warning' || value.level === 'normal') &&
    typeof value.message === 'string'
  );
}

function isAISuggestion(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.action === 'string' &&
    typeof value.reason === 'string' &&
    (value.priority === 'urgent' || value.priority === 'high' || value.priority === 'medium' || value.priority === 'low') &&
    (value.actionType === 'submit_application' ||
      value.actionType === 'bind_material' ||
      value.actionType === 'prepare_interview' ||
      value.actionType === 'follow_up' ||
      value.actionType === 'take_test' ||
      value.actionType === 'update_material' ||
      value.actionType === 'review_interview') &&
    typeof value.completed === 'boolean'
  );
}

function isJob(value: unknown): value is Job {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.company === 'string' &&
    typeof value.position === 'string' &&
    typeof value.jobType === 'string' &&
    typeof value.batch === 'string' &&
    typeof value.channel === 'string' &&
    typeof value.stage === 'string' &&
    (typeof value.applicationDeadline === 'string' || value.applicationDeadline === null) &&
    (typeof value.writtenTestDate === 'string' || value.writtenTestDate === null) &&
    (typeof value.interviewDate === 'string' || value.interviewDate === null) &&
    (typeof value.appliedDate === 'string' || value.appliedDate === null) &&
    typeof value.jdText === 'string' &&
    isStringArray(value.keywords) &&
    isStringArray(value.requirements) &&
    isStringArray(value.requiredMaterials) &&
    isStringArray(value.boundMaterialIds) &&
    (typeof value.contactName === 'string' || value.contactName === null) &&
    (typeof value.contactInfo === 'string' || value.contactInfo === null) &&
    Array.isArray(value.riskTags) &&
    value.riskTags.every(isRiskTag) &&
    Array.isArray(value.aiSuggestions) &&
    value.aiSuggestions.every(isAISuggestion) &&
    Array.isArray(value.timeline) &&
    value.timeline.every(isTimelineEvent) &&
    Array.isArray(value.interviewNotes) &&
    value.interviewNotes.every(isInterviewNote) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

function isMaterial(value: unknown): value is Material {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.type === 'string' &&
    typeof value.targetDirection === 'string' &&
    typeof value.version === 'string' &&
    typeof value.lastUpdated === 'string' &&
    isStringArray(value.boundJobIds)
  );
}

function loadValidatedArray<T>(key: string, predicate: (value: unknown) => value is T): T[] | null {
  const value = loadJsonValue<unknown>(key);
  if (!Array.isArray(value)) {
    if (value !== null && hasWindow()) {
      window.localStorage.removeItem(key);
    }

    return null;
  }

  if (!value.every(predicate)) {
    if (hasWindow()) {
      window.localStorage.removeItem(key);
    }

    return null;
  }

  return value;
}

export function loadJobs(): Job[] | null {
  return loadValidatedArray(JOBS_KEY, isJob);
}

export function saveJobs(jobs: Job[]): void {
  saveJsonValue(JOBS_KEY, jobs);
}

export function loadMaterials(): Material[] | null {
  return loadValidatedArray(MATERIALS_KEY, isMaterial);
}

export function saveMaterials(materials: Material[]): void {
  saveJsonValue(MATERIALS_KEY, materials);
}

export function loadCompletedTaskIds(): string[] | null {
  return loadStringArray(COMPLETED_TASK_IDS_KEY);
}

export function saveCompletedTaskIds(completedTaskIds: string[]): void {
  saveJsonValue(COMPLETED_TASK_IDS_KEY, completedTaskIds);
}
