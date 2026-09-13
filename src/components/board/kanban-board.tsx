"use client";

import React from "react";
import { useMemo } from "react";

import { useJobfindStore } from "../../hooks/use-jobfind-store";
import { JOB_STAGE_LABELS, JOB_STAGE_ORDER } from "../../lib/job-stages";
import type { JobStage } from "../../lib/types";
import { KanbanColumn } from "./kanban-column";

const STAGES: Array<{ stage: JobStage; title: string }> = JOB_STAGE_ORDER.map((stage) => ({ stage, title: JOB_STAGE_LABELS[stage] }));

export function KanbanBoard() {
  const { jobs, materials } = useJobfindStore();

  const jobsByStage = useMemo(() => {
    const grouped = new Map<JobStage, typeof jobs>();
    for (const { stage } of STAGES) {
      grouped.set(stage, []);
    }

    for (const job of jobs) {
      grouped.get(job.stage)?.push(job);
    }

    return grouped;
  }, [jobs]);

  return (
    <section aria-label="申请看板" className="editorial-panel w-full rounded-lg p-3">
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-color:#b7c0cc_transparent]">
        {STAGES.map(({ stage, title }) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            title={title}
            jobs={jobsByStage.get(stage) ?? []}
            materials={materials}
          />
        ))}
      </div>
    </section>
  );
}
