import { act, render, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { JobFindProvider, useJobfindStore } from './use-jobfind-store';

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <JobFindProvider>{children}</JobFindProvider>;
  };
}

describe('JobFind store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows seeded mock data on the first render', () => {
    const { result } = renderHook(() => useJobfindStore(), { wrapper: createWrapper() });

    expect(result.current.materials).toHaveLength(6);
    expect(result.current.jobs).toHaveLength(8);
  });

  it('hydrates valid persisted state after mount without losing the seeded first paint', async () => {
    localStorage.setItem(
      'jobfind.jobs',
      JSON.stringify([
        {
          id: 'persisted-job',
          company: 'Persisted',
          position: 'Intern',
          jobType: 'intern',
          batch: 'summer_intern',
          channel: 'official_site',
          stage: 'interested',
          applicationDeadline: null,
          writtenTestDate: null,
          interviewDate: null,
          appliedDate: null,
          jdText: 'Persisted JD',
          keywords: [],
          requirements: [],
          requiredMaterials: [],
          boundMaterialIds: [],
          contactName: null,
          contactInfo: null,
          riskTags: [],
          aiSuggestions: [],
          timeline: [],
          interviewNotes: [],
          createdAt: '2026-04-18T08:00:00.000Z',
          updatedAt: '2026-04-18T08:00:00.000Z',
        },
      ]),
    );
    localStorage.setItem(
      'jobfind.materials',
      JSON.stringify([
        {
          id: 'resume-persisted',
          name: 'Persisted Resume',
          type: 'resume',
          targetDirection: 'product',
          version: 'v1',
          lastUpdated: '2026-04-18T08:00:00.000Z',
          boundJobIds: ['persisted-job'],
        },
      ]),
    );

    const snapshots: Array<{ jobs: number; materials: number }> = [];

    function Probe() {
      const { jobs, materials } = useJobfindStore();
      snapshots.push({ jobs: jobs.length, materials: materials.length });
      return null;
    }

    render(
      <JobFindProvider>
        <Probe />
      </JobFindProvider>,
    );

    expect(snapshots[0]).toEqual({ jobs: 8, materials: 6 });

    await waitFor(() => {
      expect(snapshots[snapshots.length - 1]).toEqual({ jobs: 1, materials: 1 });
    });
  });

  it('persists store mutations after hydration', async () => {
    localStorage.setItem('jobfind.jobs', JSON.stringify([]));
    localStorage.setItem('jobfind.materials', JSON.stringify([]));

    const { result } = renderHook(() => useJobfindStore(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.jobs).toHaveLength(0));

    act(() => {
      result.current.addJob({
        id: 'new-job',
        company: 'New Co',
        position: 'Intern',
        jobType: 'intern',
        batch: 'summer_intern',
        channel: 'official_site',
        stage: 'interested',
        applicationDeadline: null,
        writtenTestDate: null,
        interviewDate: null,
        appliedDate: null,
        jdText: 'New JD',
        keywords: [],
        requirements: [],
        requiredMaterials: [],
        boundMaterialIds: [],
        contactName: null,
        contactInfo: null,
        riskTags: [],
        aiSuggestions: [],
        timeline: [],
        interviewNotes: [],
        createdAt: '2026-04-19T00:00:00.000Z',
        updatedAt: '2026-04-19T00:00:00.000Z',
      });
      result.current.setSelectedJobId('new-job');
      result.current.setJDParserOpen(true);
      result.current.advanceJobStage('new-job', 'applied', 'Submitted application');
      result.current.markTaskComplete('task-42');
      result.current.addInterviewNote('new-job', {
        round: '一面',
        date: '2026-04-19T10:00:00.000Z',
        questions: ['介绍一个你做过的项目'],
        reflection: '需要把项目结果讲得更具体。',
        result: 'pending',
      });
    });

    expect(result.current.selectedJob?.id).toBe('new-job');
    expect(result.current.isJDParserOpen).toBe(true);
    expect(result.current.jobs[0].stage).toBe('applied');
    expect(result.current.jobs[0].interviewNotes[0]).toMatchObject({
      round: '一面',
      reflection: '需要把项目结果讲得更具体。',
      result: 'pending',
    });
    expect(result.current.jobs[0].timeline[0]).toMatchObject({
      stage: 'applied',
      description: '补充面试复盘：一面',
    });
    expect(result.current.jobs[0].timeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stage: 'applied',
          description: 'Submitted application',
        }),
      ]),
    );
    expect(result.current.completedTaskIds).toContain('task-42');
    expect(JSON.parse(localStorage.getItem('jobfind.completedTasks') ?? '[]')).toEqual(['task-42']);
    expect(JSON.parse(localStorage.getItem('jobfind.jobs') ?? '[]')[0].interviewNotes[0]).toMatchObject({
      round: '一面',
      reflection: '需要把项目结果讲得更具体。',
      result: 'pending',
    });
  });
});
