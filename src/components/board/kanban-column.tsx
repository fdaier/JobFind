"use client";

import React from "react";

import type { Job, JobStage, Material } from "../../lib/types";
import { cn } from "../../lib/utils";

import { JobCard } from "./job-card";

interface KanbanColumnProps {
  stage: JobStage;
  title: string;
  jobs: Job[];
  materials: Material[];
}

export function KanbanColumn({ stage, title, jobs, materials }: KanbanColumnProps) {
  return (
    <section
      data-testid={`kanban-column-${stage}`}
      className={cn(
        "flex w-[19rem] min-w-[19rem] shrink-0 flex-col rounded-lg border border-slate-200/80 bg-white/72",
        "shadow-[0_10px_28px_rgba(43,51,69,0.06)] backdrop-blur-sm",
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200/75 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">按阶段整理</p>
        </div>
        <span
          data-testid={`kanban-count-${stage}`}
          className="inline-flex min-w-6 justify-center rounded-full border border-slate-200 bg-white/75 px-2 py-1 text-xs font-medium text-slate-700"
        >
          {jobs.length}
        </span>
      </div>

      <div className="flex min-h-[18rem] flex-1 flex-col gap-3 p-3">
        {jobs.length === 0 ? (
          <div className="flex min-h-[12rem] flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/45 px-4 text-center text-sm text-slate-500">
            这个阶段还没有岗位
          </div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} materials={materials} />)
        )}
      </div>
    </section>
  );
}
