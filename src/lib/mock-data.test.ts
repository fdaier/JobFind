import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockJobs, createMockMaterials } from './mock-data';

const HOUR = 60 * 60 * 1000;

describe('mock data', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-19T08:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the approved eight AI product manager materials', () => {
    const materials = createMockMaterials();

    expect(materials).toHaveLength(8);
    expect(materials.map((material) => material.id)).toEqual([
      'resume-pm',
      'resume-ai-pm',
      'portfolio-ai',
      'transcript',
      'case-ai-assistant',
      'cet6',
      'cover-letter-ai-pm',
      'internship-proof',
    ]);
  });

  it('creates the expanded AI product manager job pool with the required relative dates', () => {
    const jobs = createMockJobs();

    expect(jobs).toHaveLength(13);
    expect(jobs.map((job) => job.id)).toEqual([
      'tencent',
      'bytedance',
      'xiaohongshu',
      'meituan',
      'alibaba',
      'netease',
      'jd',
      'kuaishou',
      'baidu',
      'ant',
      'bilibili',
      'tme',
      'mihoyo',
    ]);

    const jobsById = new Map(jobs.map((job) => [job.id, job] as const));

    expect((new Date(jobsById.get('tencent')!.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeGreaterThan(0);
    expect((new Date(jobsById.get('tencent')!.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeLessThan(24);

    expect((new Date(jobsById.get('bytedance')!.interviewDate!).getTime() - Date.now()) / HOUR).toBeGreaterThan(12);
    expect((new Date(jobsById.get('bytedance')!.interviewDate!).getTime() - Date.now()) / HOUR).toBeLessThan(36);

    expect((Date.now() - new Date(jobsById.get('xiaohongshu')!.appliedDate!).getTime()) / HOUR).toBeGreaterThan(24 * 11);
    expect((Date.now() - new Date(jobsById.get('xiaohongshu')!.appliedDate!).getTime()) / HOUR).toBeLessThan(24 * 13);

    expect((new Date(jobsById.get('alibaba')!.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeGreaterThan(24 * 4);
    expect((new Date(jobsById.get('alibaba')!.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeLessThan(24 * 6);

    expect((new Date(jobsById.get('kuaishou')!.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeGreaterThan(24 * 6);
    expect((new Date(jobsById.get('kuaishou')!.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeLessThan(24 * 8);

    expect((new Date(jobsById.get('baidu')!.interviewDate!).getTime() - Date.now()) / HOUR).toBeGreaterThan(48);
    expect((new Date(jobsById.get('baidu')!.interviewDate!).getTime() - Date.now()) / HOUR).toBeLessThan(72);

    expect((new Date(jobsById.get('ant')!.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeGreaterThan(24);
    expect((new Date(jobsById.get('ant')!.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeLessThan(72);

    expect((new Date(jobsById.get('mihoyo')!.writtenTestDate!).getTime() - Date.now()) / HOUR).toBeGreaterThan(24);
    expect((new Date(jobsById.get('mihoyo')!.writtenTestDate!).getTime() - Date.now()) / HOUR).toBeLessThan(48);
  });

});
