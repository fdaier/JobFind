"use client";

import React from "react";
import { useMemo } from "react";

import { useJobfindStore } from "../../hooks/use-jobfind-store";
import type { JobStage } from "../../lib/types";
import { KanbanColumn } from "./kanban-column";

const STAGES: Array<{ stage: JobStage; title: string }> = [
  { stage: "interested", title: "关注中" },
  { stage: "to_apply", title: "待投递" },
  { stage: "applied", title: "已投递" },
  { stage: "written_test", title: "笔试" },
  { stage: "interviewing", title: "面试" },
  { stage: "offer", title: "录用" },
  { stage: "rejected", title: "已淘汰" },
];

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
