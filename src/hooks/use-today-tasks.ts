'use client';

import { useMemo } from 'react';

import { generateTodayTasks } from '../lib/rules-engine';

import { useJobfindStore } from './use-jobfind-store';

export function useTodayTasks() {
  const { completedTaskIds, jobs, materials } = useJobfindStore();

  return useMemo(() => {
    const completedTaskSet = new Set(completedTaskIds);
    return generateTodayTasks(jobs, materials).map((task) => ({
      ...task,
      completed: completedTaskSet.has(task.id),
    }));
  }, [completedTaskIds, jobs, materials]);
}
