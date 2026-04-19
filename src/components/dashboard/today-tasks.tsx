"use client";

import { CheckCircle2, Circle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { useTodayTasks } from "@/hooks/use-today-tasks";
import { cn } from "@/lib/utils";

const priorityStyles = {
  urgent: "border-rose-200 bg-rose-50 text-rose-800",
  high: "border-amber-200 bg-amber-50 text-amber-800",
  medium: "border-slate-200 bg-slate-50 text-slate-700",
  low: "border-slate-200 bg-white text-slate-500",
} as const;

const priorityLabels = {
  urgent: "紧急",
  high: "高",
  medium: "中",
  low: "低",
} as const;

export function TodayTasks() {
  const tasks = useTodayTasks();
  const { markTaskComplete } = useJobfindStore();

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-slate-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-950">今日任务</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              只展示最该先处理的前 5 项，已完成的任务会保留在列表里。
            </p>
          </div>
          <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">
            {tasks.length} 项
          </Badge>
        </div>

        <div className="space-y-3">
          {tasks.slice(0, 5).map((task, index) => {
            const completed = task.completed;

            return (
              <article
                key={task.id}
                className={cn(
                  "rounded-md border p-4 transition-colors",
                  completed ? "border-slate-200 bg-slate-50/80" : "border-slate-200 bg-white",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">
                    {completed ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Circle className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn("rounded-full", priorityStyles[task.priority])}>
                        {priorityLabels[task.priority]}
                      </Badge>
                      <span className={cn("text-xs text-slate-500", completed && "text-slate-400")}>
                        #{index + 1}
                      </span>
                    </div>

                    <div className={cn("space-y-1", completed && "text-slate-400")}>
                      <div className={cn("text-sm font-medium text-slate-950", completed && "line-through")}>
                        {task.action}
                      </div>
                      <div className="text-sm leading-6 text-slate-500">{task.reason}</div>
                      <div className="text-xs text-slate-500">
                        {task.company} · {task.position}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {completed ? (
                      <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                        已完成
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="rounded-full border-slate-200"
                        onClick={() => markTaskComplete(task.id)}
                      >
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                        完成
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
