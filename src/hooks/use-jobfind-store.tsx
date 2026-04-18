'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { createMockJobs, createMockMaterials } from '../lib/mock-data';
import { loadCompletedTaskIds, loadJobs, loadMaterials, saveCompletedTaskIds, saveJobs, saveMaterials } from '../lib/storage';
import type { Job, JobStage, Material, TimelineEvent } from '../lib/types';

interface JobFindStoreValue {
  jobs: Job[];
  materials: Material[];
  selectedJobId: string | null;
  isJDParserOpen: boolean;
  completedTaskIds: string[];
  selectedJob: Job | null;
  setSelectedJobId: (jobId: string | null) => void;
  setJDParserOpen: (isOpen: boolean) => void;
  addJob: (job: Job) => void;
  advanceJobStage: (jobId: string, stage: JobStage, description?: string) => void;
  markTaskComplete: (taskId: string) => void;
}

interface StoreState {
  jobs: Job[];
  materials: Material[];
  selectedJobId: string | null;
  isJDParserOpen: boolean;
  completedTaskIds: string[];
}

const JobFindStoreContext = createContext<JobFindStoreValue | null>(null);

function createLoadedState(): StoreState {
  return {
    jobs: loadJobs() ?? createMockJobs(),
    materials: loadMaterials() ?? createMockMaterials(),
    selectedJobId: null,
    isJDParserOpen: false,
    completedTaskIds: loadCompletedTaskIds() ?? [],
  };
}

function createTimelineEvent(stage: JobStage, description: string): TimelineEvent {
  const date = new Date().toISOString();
  return { date, stage, description };
}

export function JobFindProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>({
    jobs: [],
    materials: [],
    selectedJobId: null,
    isJDParserOpen: false,
    completedTaskIds: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(createLoadedState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveJobs(state.jobs);
    saveMaterials(state.materials);
    saveCompletedTaskIds(state.completedTaskIds);
  }, [hydrated, state.jobs, state.materials, state.completedTaskIds]);

  const selectedJob = useMemo(() => {
    return state.selectedJobId ? state.jobs.find((job) => job.id === state.selectedJobId) ?? null : null;
  }, [state.jobs, state.selectedJobId]);

  const value = useMemo<JobFindStoreValue>(
    () => ({
      jobs: state.jobs,
      materials: state.materials,
      selectedJobId: state.selectedJobId,
      isJDParserOpen: state.isJDParserOpen,
      completedTaskIds: state.completedTaskIds,
      selectedJob,
      setSelectedJobId: (jobId) => {
        setState((current) => ({
          ...current,
          selectedJobId: jobId,
        }));
      },
      setJDParserOpen: (isOpen) => {
        setState((current) => ({
          ...current,
          isJDParserOpen: isOpen,
        }));
      },
      addJob: (job) => {
        setState((current) => ({
          ...current,
          jobs: [job, ...current.jobs],
          selectedJobId: job.id,
        }));
      },
      advanceJobStage: (jobId, stage, description = `推进到 ${stage}`) => {
        setState((current) => ({
          ...current,
          jobs: current.jobs.map((job) => {
            if (job.id !== jobId) {
              return job;
            }

            const updatedAt = new Date().toISOString();
            return {
              ...job,
              stage,
              updatedAt,
              timeline: [createTimelineEvent(stage, description), ...job.timeline],
            };
          }),
        }));
      },
      markTaskComplete: (taskId) => {
        setState((current) => {
          if (current.completedTaskIds.includes(taskId)) {
            return current;
          }

          return {
            ...current,
            completedTaskIds: [taskId, ...current.completedTaskIds],
          };
        });
      },
    }),
    [selectedJob, state.completedTaskIds, state.isJDParserOpen, state.jobs, state.materials, state.selectedJobId],
  );

  return <JobFindStoreContext.Provider value={value}>{children}</JobFindStoreContext.Provider>;
}

export function useJobfindStore(): JobFindStoreValue {
  const value = useContext(JobFindStoreContext);
  if (!value) {
    throw new Error('useJobfindStore must be used within JobFindProvider');
  }

  return value;
}
