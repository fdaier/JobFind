"use client";

import React, { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { generateTodayTasks } from "@/lib/rules-engine";
import type { Job, Material, TodayTask } from "@/lib/types";
import { useJobfindStore } from "@/hooks/use-jobfind-store";

function TaskRow({
  task,
  completed,
  onConfirm,
}: {
  task: TodayTask;
  completed: boolean;
  onConfirm: () => void;
}) {
  return (
    <article className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950">{task.action}</h3>
            <Badge variant={completed ? "secondary" : "outline"} className="rounded-md">
              {completed ? "已确认" : "待确认"}
            </Badge>
          </div>
        </div>
        <Badge variant="outline" className="rounded-md">
          {task.priority}
        </Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="space-y-1">
          <dt className="text-xs text-slate-500">Action</dt>
          <dd className="text-slate-700">{task.action}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs text-slate-500">Reason</dt>
          <dd className="text-slate-700">{task.reason}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs text-slate-500">Priority</dt>
          <dd className="text-slate-700">{task.priority}</dd>
        </div>
      </dl>

      <Separator />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">先确认动作、原因和优先级，再推进下一步。</p>
        <Button type="button" size="sm" variant={completed ? "secondary" : "default"} onClick={onConfirm} disabled={completed}>
          {completed ? "已完成" : "确认这一步"}
        </Button>
      </div>
    </article>
  );
}

export function JobAIPanel({ job, materials }: { job: Job; materials: Material[] }) {
  const { markTaskComplete, completedTaskIds } = useJobfindStore();

  const tasks = useMemo(() => generateTodayTasks([job], materials), [job, materials]);

  if (tasks.length === 0) {
    return <p className="text-sm text-slate-500">这份岗位暂时没有可执行的 AI 建议。</p>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const completed = completedTaskIds.includes(task.id);
        return (
          <TaskRow
            key={task.id}
            task={task}
            completed={completed}
            onConfirm={() => markTaskComplete(task.id)}
          />
        );
      })}
    </div>
  );
}
