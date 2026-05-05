import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { JobFindProvider } from './use-jobfind-store';
import { useTodayTasks } from './use-today-tasks';

describe('useTodayTasks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('overlays completed state from the store', async () => {
    localStorage.setItem('jobfind.completedTasks', JSON.stringify(['tencent-deadline']));

    const { result } = renderHook(() => useTodayTasks(), {
      wrapper: ({ children }) => <JobFindProvider>{children}</JobFindProvider>,
    });

    await waitFor(() => expect(result.current.length).toBeGreaterThan(0));

    expect(result.current[0].id).toBe('tencent-deadline');
    expect(result.current[0].completed).toBe(true);
  });
});
