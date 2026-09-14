import { beforeEach, describe, expect, it } from 'vitest';

import { createMockJobs, createMockMaterials } from './mock-data';
import { loadCompletedTaskIds, loadJobs, loadMaterials, saveCompletedTaskIds, saveJobs, saveMaterials } from './storage';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips jobs, materials, and completed task ids', () => {
    const jobs = createMockJobs();
    const materials = createMockMaterials();

    saveJobs(jobs);
    saveMaterials(materials);
    saveCompletedTaskIds(['task-1', 'task-2']);

    expect(loadJobs()).toEqual(jobs);
    expect(loadMaterials()).toEqual(materials);
    expect(loadCompletedTaskIds()).toEqual(['task-1', 'task-2']);
  });

  it('preserves invalid JSON when loading so it can be recovered', () => {
    localStorage.setItem('jobfind.jobs', '{bad json');

    expect(loadJobs()).toBeNull();
    expect(localStorage.getItem('jobfind.jobs')).toBe('{bad json');
  });

  it('rejects structurally invalid job arrays without removing the stored value', () => {
    localStorage.setItem('jobfind.jobs', JSON.stringify([{}]));

    expect(loadJobs()).toBeNull();
    expect(localStorage.getItem('jobfind.jobs')).toBe(JSON.stringify([{}]));
  });

  it('rejects structurally invalid material arrays without removing the stored value', () => {
    localStorage.setItem('jobfind.materials', JSON.stringify([{ id: 'bad-material' }]));

    expect(loadMaterials()).toBeNull();
    expect(localStorage.getItem('jobfind.materials')).toBe(JSON.stringify([{ id: 'bad-material' }]));
  });

  it('rejects jobs with invalid nested arrays without removing the stored value', () => {
    const jobs = createMockJobs();
    const [job] = jobs;

    localStorage.setItem(
      'jobfind.jobs',
      JSON.stringify([
        {
          ...job,
          riskTags: [123],
          aiSuggestions: [123],
          timeline: [
            {
              date: '2026-04-19T00:00:00.000Z',
              stage: 'applied',
              description: 'Submitted application',
            },
          ],
          interviewNotes: [],
        },
      ]),
    );

    expect(loadJobs()).toBeNull();
    expect(localStorage.getItem('jobfind.jobs')).not.toBeNull();
  });

  it('rejects jobs with invalid stages without removing the stored value', () => {
    const jobs = createMockJobs();
    const [job] = jobs;

    localStorage.setItem(
      'jobfind.jobs',
      JSON.stringify([
        {
          ...job,
          stage: 'archived',
        },
      ]),
    );

    expect(loadJobs()).toBeNull();
    expect(localStorage.getItem('jobfind.jobs')).not.toBeNull();
  });

  it('rejects jobs with invalid persisted dates without removing the stored value', () => {
    const jobs = createMockJobs();
    const [job] = jobs;

    localStorage.setItem(
      'jobfind.jobs',
      JSON.stringify([
        {
          ...job,
          timeline: [
            {
              date: 'not-a-real-date',
              stage: 'applied',
              description: 'Submitted application',
            },
          ],
          interviewNotes: [
            {
              round: 'First round',
              date: 'still-not-a-date',
              questions: ['Tell me about yourself'],
              reflection: 'Need to prepare better',
              result: 'pending',
            },
          ],
        },
      ]),
    );

    expect(loadJobs()).toBeNull();
    expect(localStorage.getItem('jobfind.jobs')).not.toBeNull();
  });

  it('backs up and migrates legacy stages without losing JD, materials, timeline, or interview notes', () => {
    const [job] = createMockJobs();
    const legacy = {
      ...job,
      stage: 'interviewing',
      note: undefined,
      timeline: [{ ...job.timeline[0], stage: 'interested' }],
    };
    localStorage.setItem('jobfind.jobs', JSON.stringify([legacy]));

    const migrated = loadJobs();

    expect(migrated).toHaveLength(1);
    expect(migrated![0]).toMatchObject({ id: job.id, stage: 'first_interview', note: '', assessmentDeadline: null, assessmentLink: null, jdText: job.jdText, boundMaterialIds: job.boundMaterialIds, interviewNotes: job.interviewNotes });
    expect(migrated![0].timeline[0].stage).toBe('to_apply');
    expect(localStorage.getItem('jobfind.jobs.backup.v3')).toBe(JSON.stringify([legacy]));
  });
});
