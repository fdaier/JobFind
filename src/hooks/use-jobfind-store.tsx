'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { createMockJobs, createMockMaterials } from '../lib/mock-data';
import {
  loadCompletedTaskIds,
  loadDemoDataVersion,
  loadJobs,
  loadMaterials,
  saveCompletedTaskIds,
  saveDemoDataVersion,
  saveJobs,
  saveMaterials,
} from '../lib/storage';
import type { InterviewNote, Job, JobStage, Material, TimelineEvent } from '../lib/types';
import { JOB_STAGE_LABELS } from '../lib/job-stages';

type EditableJobFields = Pick<
  Job,
  | 'company'
  | 'position'
  | 'jobType'
  | 'batch'
  | 'channel'
  | 'stage'
  | 'applicationDeadline'
  | 'assessmentDeadline'
  | 'assessmentLink'
  | 'writtenTestDate'
  | 'interviewDate'
  | 'appliedDate'
  | 'jdText'
  | 'keywords'
  | 'requirements'
  | 'contactName'
  | 'contactInfo'
  | 'note'
>;

const SEEDED_MOCK_DATE = new Date('2026-04-19T08:00:00.000Z');
const DEMO_DATA_VERSION = '2026-04-20-rich-ai-pm-pool';
const SEEDED_JOBS = createMockJobs(SEEDED_MOCK_DATE);
const SEEDED_MATERIALS = createMockMaterials(SEEDED_MOCK_DATE);

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
  updateJob: (jobId: string, fields: Partial<EditableJobFields>) => void;
  updateJobMaterials: (jobId: string, requiredMaterials: Job['requiredMaterials'], boundMaterialIds: string[]) => void;
  deleteJob: (jobId: string) => void;
  advanceJobStage: (jobId: string, stage: JobStage, description?: string) => void;
  addInterviewNote: (jobId: string, note: InterviewNote) => void;
  updateInterviewNote: (jobId: string, noteIndex: number, note: InterviewNote) => void;
  deleteInterviewNote: (jobId: string, noteIndex: number) => void;
  addTimelineEvent: (jobId: string, event: TimelineEvent) => void;
  updateTimelineEvent: (jobId: string, eventIndex: number, event: TimelineEvent) => void;
  deleteTimelineEvent: (jobId: string, eventIndex: number) => void;
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

function createTimelineEvent(stage: JobStage, description: string): TimelineEvent {
  const date = new Date().toISOString();
  return { date, stage, description };
}

export function JobFindProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>({
    jobs: SEEDED_JOBS,
    materials: SEEDED_MATERIALS,
    selectedJobId: null,
    isJDParserOpen: false,
    completedTaskIds: [],
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const isCurrentDemoData = loadDemoDataVersion() === DEMO_DATA_VERSION;
    const loadedJobs = loadJobs();
    const loadedMaterials = loadMaterials();
    const loadedCompletedTaskIds = loadCompletedTaskIds();

    setState((current) => ({
      ...current,
      jobs: isCurrentDemoData ? (loadedJobs ?? current.jobs) : current.jobs,
      materials: isCurrentDemoData ? (loadedMaterials ?? current.materials) : current.materials,
      completedTaskIds: isCurrentDemoData ? (loadedCompletedTaskIds ?? current.completedTaskIds) : current.completedTaskIds,
    }));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveJobs(state.jobs);
    saveMaterials(state.materials);
    saveCompletedTaskIds(state.completedTaskIds);
    saveDemoDataVersion(DEMO_DATA_VERSION);
  }, [isHydrated, state.jobs, state.materials, state.completedTaskIds]);

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
      updateJob: (jobId, fields) => {
        setState((current) => ({
          ...current,
          jobs: current.jobs.map((job) => {
            if (job.id !== jobId) return job;
            const stageChanged = fields.stage && fields.stage !== job.stage;
            const updatedAt = new Date().toISOString();
            return {
              ...job,
              ...fields,
              updatedAt,
              timeline: stageChanged
                ? [createTimelineEvent(fields.stage!, `手动调整阶段：${JOB_STAGE_LABELS[fields.stage!]}`), ...job.timeline]
                : job.timeline,
            };
          }),
        }));
      },
      updateJobMaterials: (jobId, requiredMaterials, boundMaterialIds) => {
        setState((current) => {
          const knownMaterialIds = new Set(current.materials.map((material) => material.id));
          const nextBoundIds = boundMaterialIds.filter((id) => knownMaterialIds.has(id));
          return {
            ...current,
            jobs: current.jobs.map((job) => job.id === jobId ? { ...job, requiredMaterials, boundMaterialIds: nextBoundIds, updatedAt: new Date().toISOString() } : job),
            materials: current.materials.map((material) => ({
              ...material,
              boundJobIds: nextBoundIds.includes(material.id)
                ? [...new Set([...material.boundJobIds, jobId])]
                : material.boundJobIds.filter((id) => id !== jobId),
            })),
          };
        });
      },
      deleteJob: (jobId) => {
        setState((current) => {
          if (!current.jobs.some((job) => job.id === jobId)) {
            return current;
          }

          return {
            ...current,
            jobs: current.jobs.filter((job) => job.id !== jobId),
            materials: current.materials.map((material) => ({
              ...material,
              boundJobIds: material.boundJobIds.filter((boundJobId) => boundJobId !== jobId),
            })),
            selectedJobId: current.selectedJobId === jobId ? null : current.selectedJobId,
          };
        });
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
      addInterviewNote: (jobId, note) => {
        setState((current) => ({
          ...current,
          jobs: current.jobs.map((job) => {
            if (job.id !== jobId) {
              return job;
            }

            const updatedAt = new Date().toISOString();
            return {
              ...job,
              updatedAt,
              interviewNotes: [note, ...job.interviewNotes],
              timeline: [createTimelineEvent(job.stage, `补充面试复盘：${note.round}`), ...job.timeline],
            };
          }),
        }));
      },
      updateInterviewNote: (jobId, noteIndex, note) => {
        setState((current) => ({
          ...current,
          jobs: current.jobs.map((job) => job.id === jobId ? {
            ...job,
            updatedAt: new Date().toISOString(),
            interviewNotes: job.interviewNotes.map((item, index) => index === noteIndex ? note : item),
          } : job),
        }));
      },
      deleteInterviewNote: (jobId, noteIndex) => {
        setState((current) => ({
          ...current,
          jobs: current.jobs.map((job) => job.id === jobId ? {
            ...job,
            updatedAt: new Date().toISOString(),
            interviewNotes: job.interviewNotes.filter((_, index) => index !== noteIndex),
          } : job),
        }));
      },
      addTimelineEvent: (jobId, event) => {
        setState((current) => ({
          ...current,
          jobs: current.jobs.map((job) => job.id === jobId ? { ...job, updatedAt: new Date().toISOString(), timeline: [event, ...job.timeline] } : job),
        }));
      },
      updateTimelineEvent: (jobId, eventIndex, event) => {
        setState((current) => ({
          ...current,
          jobs: current.jobs.map((job) => job.id === jobId ? {
            ...job,
            updatedAt: new Date().toISOString(),
            timeline: job.timeline.map((item, index) => index === eventIndex ? event : item),
          } : job),
        }));
      },
      deleteTimelineEvent: (jobId, eventIndex) => {
        setState((current) => ({
          ...current,
          jobs: current.jobs.map((job) => job.id === jobId ? {
            ...job,
            updatedAt: new Date().toISOString(),
            timeline: job.timeline.filter((_, index) => index !== eventIndex),
          } : job),
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
