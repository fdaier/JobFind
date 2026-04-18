import { act, renderHook, waitFor } from '@testing-library/react';
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

  it('falls back to mock data when nothing is persisted', async () => {
    const { result } = renderHook(() => useJobfindStore(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.jobs).toHaveLength(8));

    expect(result.current.materials).toHaveLength(6);
    expect(result.current.selectedJob).toBeNull();
    expect(result.current.isJDParserOpen).toBe(false);
  });

  it('loads persisted state, updates stages, and persists task completion', async () => {
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

    const { result } = renderHook(() => useJobfindStore(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    act(() => {
      result.current.setSelectedJobId('persisted-job');
      result.current.setJDParserOpen(true);
      result.current.advanceJobStage('persisted-job', 'applied', 'Submitted application');
      result.current.markTaskComplete('task-42');
    });

    expect(result.current.selectedJob?.id).toBe('persisted-job');
    expect(result.current.isJDParserOpen).toBe(true);
    expect(result.current.jobs[0].stage).toBe('applied');
    expect(result.current.jobs[0].timeline[0]).toMatchObject({
      stage: 'applied',
      description: 'Submitted application',
    });
    expect(new Date(result.current.jobs[0].timeline[0].date).toString()).not.toBe('Invalid Date');
    expect(result.current.jobs[0].updatedAt).not.toBe('2026-04-18T08:00:00.000Z');
    expect(result.current.completedTaskIds).toContain('task-42');
    expect(JSON.parse(localStorage.getItem('jobfind.completedTasks') ?? '[]')).toEqual(['task-42']);
  });
});
