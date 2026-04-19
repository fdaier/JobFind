import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockJobs, createMockMaterials, createParsedJDJob, sampleJD } from './mock-data';

const HOUR = 60 * 60 * 1000;

describe('mock data', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-19T08:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exports a B站 AI 产品实习生 JD sample', () => {
    expect(sampleJD).toContain('B站 AI 产品实习生');
    expect(sampleJD).toContain('AI');
  });

  it('creates the approved six materials', () => {
    const materials = createMockMaterials();

    expect(materials).toHaveLength(6);
    expect(materials.map((material) => material.id)).toEqual([
      'resume-pm',
      'resume-ops',
      'portfolio-ai',
      'transcript',
      'portfolio-game',
      'cet6',
    ]);
  });

  it('creates the approved eight jobs with the required relative dates', () => {
    const jobs = createMockJobs();

    expect(jobs).toHaveLength(8);
    expect(jobs.map((job) => job.id)).toEqual([
      'tencent',
      'bytedance',
      'xiaohongshu',
      'meituan',
      'alibaba',
      'netease',
      'jd',
      'kuaishou',
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
  });

  it('creates the parsed JD job with the previewed B站 details', () => {
    const job = createParsedJDJob();

    expect(job.company).toBe('B站');
    expect(job.position).toBe('AI 产品实习生');
    expect(job.stage).toBe('to_apply');
    expect(job.requiredMaterials).toEqual(['resume', 'portfolio']);
    expect(job.boundMaterialIds).toEqual(['resume-pm']);
    expect(job.applicationDeadline).not.toBeNull();
    expect((new Date(job.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeGreaterThan(24 * 2);
    expect((new Date(job.applicationDeadline!).getTime() - Date.now()) / HOUR).toBeLessThan(24 * 4);
  });

  it('generates unique parsed JD ids for the same timestamp', () => {
    const now = new Date('2026-04-19T08:00:00.000Z');

    const first = createParsedJDJob(now);
    const second = createParsedJDJob(now);

    expect(first.id).not.toBe(second.id);
    expect(first.id.startsWith('bilibili-jd-')).toBe(true);
    expect(second.id.startsWith('bilibili-jd-')).toBe(true);
  });
});
