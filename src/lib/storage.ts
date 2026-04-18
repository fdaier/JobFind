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

export function loadJobs(): Job[] | null {
  const value = loadJsonValue<unknown>(JOBS_KEY);
  return Array.isArray(value) ? (value as Job[]) : null;
}

export function saveJobs(jobs: Job[]): void {
  saveJsonValue(JOBS_KEY, jobs);
}

export function loadMaterials(): Material[] | null {
  const value = loadJsonValue<unknown>(MATERIALS_KEY);
  return Array.isArray(value) ? (value as Material[]) : null;
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
