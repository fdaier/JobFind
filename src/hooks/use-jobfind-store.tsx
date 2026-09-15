'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { createMockJobs, createMockMaterials } from '../lib/mock-data';
import {
  loadCompletedTaskIds,
  loadCompanyPool,
  loadDemoDataVersion,
  loadJobs,
  loadMaterials,
  saveCompletedTaskIds,
  saveCompanyPool,
  saveDemoDataVersion,
  saveJobs,
  saveMaterials,
  backupJobsBeforeCompanyBinding,
} from '../lib/storage';
import type { InterviewNote, Job, JobStage, Material, TimelineEvent } from '../lib/types';
import { JOB_STAGE_LABELS } from '../lib/job-stages';
import { createSeedCompanies, resolveCompanyId, type Company } from '../lib/company-pool';

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
const SEEDED_COMPANIES = createSeedCompanies();

interface JobFindStoreValue {
  jobs: Job[];
  companies: Company[];
  materials: Material[];
  selectedJobId: string | null;
  isJDParserOpen: boolean;
  isCompanyPoolOpen: boolean;
  companyPoolSelectedCompanyId: string | null;
  completedTaskIds: string[];
  selectedJob: Job | null;
  setSelectedJobId: (jobId: string | null) => void;
  setJDParserOpen: (isOpen: boolean) => void;
  openCompanyPool: () => void;
  dismissCompanyPool: () => void;
  setCompanyPoolSelectedCompanyId: (companyId: string | null) => void;
  openCompanyPoolJob: (jobId: string) => void;
  resumeCompanyPoolAfterJobDetail: () => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, fields: Partial<EditableJobFields>) => void;
  updateJobCompanyBinding: (jobId: string, companyId: string | null) => void;
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (companyId: string, fields: Partial<Omit<Company, 'id'>>) => void;
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
  companies: Company[];
  materials: Material[];
  selectedJobId: string | null;
  isJDParserOpen: boolean;
  isCompanyPoolOpen: boolean;
  companyPoolSelectedCompanyId: string | null;
  resumeCompanyPoolAfterDetail: boolean;
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
    companies: SEEDED_COMPANIES,
    materials: SEEDED_MATERIALS,
    selectedJobId: null,
    isJDParserOpen: false,
    isCompanyPoolOpen: false,
    companyPoolSelectedCompanyId: null,
    resumeCompanyPoolAfterDetail: false,
    completedTaskIds: [],
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const isCurrentDemoData = loadDemoDataVersion() === DEMO_DATA_VERSION;
    const loadedJobs = loadJobs();
    const loadedCompanies = loadCompanyPool();
    const loadedMaterials = loadMaterials();
    const loadedCompletedTaskIds = loadCompletedTaskIds();

    setState((current) => {
      const companies = loadedCompanies ?? current.companies;
      const jobs = isCurrentDemoData ? (loadedJobs ?? current.jobs) : current.jobs;
      const boundJobs = jobs.map((job) => {
        if (job.companyId) return job;
        const companyId = resolveCompanyId(job.company, companies);
        return companyId ? { ...job, companyId } : job;
      });
      if (isCurrentDemoData && loadedJobs && JSON.stringify(jobs) !== JSON.stringify(boundJobs)) {
        backupJobsBeforeCompanyBinding();
      }
      return {
      ...current,
      jobs: boundJobs,
      companies,
      materials: isCurrentDemoData ? (loadedMaterials ?? current.materials) : current.materials,
      completedTaskIds: isCurrentDemoData ? (loadedCompletedTaskIds ?? current.completedTaskIds) : current.completedTaskIds,
      };
    });
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveJobs(state.jobs);
    saveCompanyPool(state.companies);
    saveMaterials(state.materials);
    saveCompletedTaskIds(state.completedTaskIds);
    saveDemoDataVersion(DEMO_DATA_VERSION);
  }, [isHydrated, state.jobs, state.companies, state.materials, state.completedTaskIds]);

  const selectedJob = useMemo(() => {
    return state.selectedJobId ? state.jobs.find((job) => job.id === state.selectedJobId) ?? null : null;
  }, [state.jobs, state.selectedJobId]);

  const value = useMemo<JobFindStoreValue>(
    () => ({
      jobs: state.jobs,
      companies: state.companies,
      materials: state.materials,
      selectedJobId: state.selectedJobId,
      isJDParserOpen: state.isJDParserOpen,
      isCompanyPoolOpen: state.isCompanyPoolOpen,
      companyPoolSelectedCompanyId: state.companyPoolSelectedCompanyId,
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
          jobs: [{ ...job, companyId: job.companyId ?? resolveCompanyId(job.company, current.companies) }, ...current.jobs],
          selectedJobId: job.id,
        }));
      },
      openCompanyPool: () => {
        setState((current) => ({ ...current, isCompanyPoolOpen: true }));
      },
      dismissCompanyPool: () => {
        setState((current) => ({
          ...current,
          isCompanyPoolOpen: false,
          companyPoolSelectedCompanyId: null,
          resumeCompanyPoolAfterDetail: false,
        }));
      },
      setCompanyPoolSelectedCompanyId: (companyId) => {
        setState((current) => ({ ...current, companyPoolSelectedCompanyId: companyId }));
      },
      openCompanyPoolJob: (jobId) => {
        setState((current) => ({
          ...current,
          isCompanyPoolOpen: false,
          resumeCompanyPoolAfterDetail: true,
          selectedJobId: jobId,
        }));
      },
      resumeCompanyPoolAfterJobDetail: () => {
        setState((current) => current.resumeCompanyPoolAfterDetail ? {
          ...current,
          isCompanyPoolOpen: true,
          resumeCompanyPoolAfterDetail: false,
        } : current);
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
              companyId: fields.company === undefined ? job.companyId : resolveCompanyId(fields.company, current.companies),
              updatedAt,
              timeline: stageChanged
                ? [createTimelineEvent(fields.stage!, `手动调整阶段：${JOB_STAGE_LABELS[fields.stage!]}`), ...job.timeline]
                : job.timeline,
            };
          }),
        }));
      },
      updateJobCompanyBinding: (jobId, companyId) => {
        setState((current) => ({
          ...current,
          jobs: current.jobs.map((job) => job.id === jobId ? { ...job, companyId, updatedAt: new Date().toISOString() } : job),
        }));
      },
      addCompany: (company) => {
        setState((current) => ({
          ...current,
          companies: [...current.companies, { ...company, id: `company-user-${Date.now()}` }].sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
        }));
      },
      updateCompany: (companyId, fields) => {
        setState((current) => ({
          ...current,
          companies: current.companies.map((company) => company.id === companyId ? { ...company, ...fields } : company),
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
    [selectedJob, state.completedTaskIds, state.isJDParserOpen, state.isCompanyPoolOpen, state.companyPoolSelectedCompanyId, state.jobs, state.companies, state.materials, state.selectedJobId],
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
