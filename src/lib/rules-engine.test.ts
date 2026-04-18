import { describe, expect, it } from 'vitest';

import {
  calculateFunnelData,
  calculateMaterialCompleteness,
  generateRiskTags,
  generateTodayTasks,
} from './rules-engine';
import type { Job, Material } from './types';

const now = new Date('2026-04-19T12:00:00.000Z');

const materials: Material[] = [
  {
    id: 'resume-1',
    name: 'Resume',
    type: 'resume',
    targetDirection: 'general',
    version: 'v1',
    lastUpdated: '2026-04-18T00:00:00.000Z',
    boundJobIds: ['tencent-1', 'meituan-1'],
  },
  {
    id: 'transcript-1',
    name: 'Transcript',
    type: 'transcript',
    targetDirection: 'general',
    version: 'v1',
    lastUpdated: '2026-04-18T00:00:00.000Z',
    boundJobIds: ['tencent-1'],
  },
  {
    id: 'portfolio-1',
    name: 'Portfolio',
    type: 'portfolio',
    targetDirection: 'product',
    version: 'v1',
    lastUpdated: '2026-04-18T00:00:00.000Z',
    boundJobIds: [],
  },
];

const baseJob: Job = {
  id: 'tencent-1',
  company: 'Tencent',
  position: 'Product Intern',
  jobType: 'intern',
  batch: 'autumn',
  channel: 'official_site',
  stage: 'applied',
  applicationDeadline: '2026-04-20T06:00:00.000Z',
  writtenTestDate: null,
  interviewDate: null,
  appliedDate: '2026-04-08T12:00:00.000Z',
  jdText: 'Product intern role',
  keywords: ['product', 'intern'],
  requirements: ['Strong product sense'],
  requiredMaterials: ['resume', 'portfolio', 'transcript'],
  boundMaterialIds: ['resume-1', 'transcript-1'],
  contactName: null,
  contactInfo: null,
  riskTags: [],
  aiSuggestions: [],
  timeline: [],
  interviewNotes: [],
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-19T00:00:00.000Z',
};

describe('rules engine', () => {
  it('detects critical deadline risk and material gap risk for a Tencent-like job', () => {
    const risks = generateRiskTags(baseJob, materials, now);

    expect(risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'deadline', level: 'critical' }),
        expect.objectContaining({ type: 'material_gap', level: 'warning' }),
      ]),
    );
  });

  it('calculates material completeness percentage and missing material type', () => {
    const result = calculateMaterialCompleteness(baseJob, materials);

    expect(result).toEqual({
      percentage: 67,
      missing: ['portfolio'],
    });
  });

  it('treats invalid bound material ids as incomplete', () => {
    const result = calculateMaterialCompleteness(
      {
        ...baseJob,
        boundMaterialIds: ['missing-material-id'],
      },
      materials,
    );

    expect(result).toEqual({
      percentage: 0,
      missing: ['resume', 'portfolio', 'transcript'],
    });
  });

  it('keeps overdue deadlines visible as critical risks', () => {
    const risks = generateRiskTags(
      {
        ...baseJob,
        stage: 'applied',
        applicationDeadline: '2026-04-18T08:00:00.000Z',
      },
      materials,
      now,
    );

    expect(risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'deadline',
          level: 'critical',
          message: expect.stringContaining('网申已截止'),
        }),
      ]),
    );
  });

  it('keeps overdue interviews visible as critical risks', () => {
    const risks = generateRiskTags(
      {
        ...baseJob,
        stage: 'interviewing',
        interviewDate: '2026-04-19T09:00:00.000Z',
      },
      materials,
      now,
    );

    expect(risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'interview_prep',
          level: 'critical',
          message: '面试时间已过，请补充复盘',
        }),
      ]),
    );
  });

  it('generates today tasks sorted by priority, including submit_application and bind_material', () => {
    const jobs: Job[] = [
      {
        ...baseJob,
        id: 'deadline-job',
        company: 'Tencent',
        position: 'AI Product Intern',
        stage: 'to_apply',
        applicationDeadline: '2026-04-19T16:00:00.000Z',
        appliedDate: null,
        requiredMaterials: ['resume'],
        boundMaterialIds: ['resume-1'],
      },
      {
        ...baseJob,
        id: 'material-job',
        company: 'Meituan',
        position: 'Product Intern',
        stage: 'to_apply',
        applicationDeadline: '2026-04-23T12:00:00.000Z',
        appliedDate: null,
        requiredMaterials: ['resume', 'cover_letter'],
        boundMaterialIds: ['resume-1'],
      },
    ];

    const tasks = generateTodayTasks(jobs, materials, now);

    expect(tasks.map((task) => task.actionType)).toEqual(['submit_application', 'bind_material']);
    expect(tasks[0].score).toBeGreaterThan(tasks[1].score);
    expect(tasks[0].priority).toBe('urgent');
    expect(tasks[1].priority).toBe('medium');
  });

  it('groups funnel data by stage', () => {
    const jobs: Job[] = [
      { ...baseJob, stage: 'interested' },
      { ...baseJob, id: 'job-2', stage: 'to_apply' },
      { ...baseJob, id: 'job-3', stage: 'applied' },
      { ...baseJob, id: 'job-4', stage: 'written_test' },
      { ...baseJob, id: 'job-5', stage: 'interviewing' },
      { ...baseJob, id: 'job-6', stage: 'offer' },
      { ...baseJob, id: 'job-7', stage: 'rejected' },
      { ...baseJob, id: 'job-8', stage: 'applied' },
    ];

    expect(calculateFunnelData(jobs)).toEqual({
      interested: 1,
      toApply: 1,
      applied: 2,
      writtenTest: 1,
      interviewing: 1,
      offer: 1,
      rejected: 1,
    });
  });
});
