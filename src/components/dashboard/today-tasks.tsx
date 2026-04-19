"use client";

import React from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AgentAvatar } from "@/components/layout/agent-avatar";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { useTodayTasks } from "@/hooks/use-today-tasks";
import { cn } from "@/lib/utils";

const agentSpeech = "JobFind-Agent 已按风险和时间窗口排好今日优先级，先处理最容易影响结果的动作！";
const agentJudgment =
  "Agent 判断：为什么现在先做这件事：字节跳动 AI 产品经理实习生已经进入临近面试窗口，准备质量会直接影响下一轮。";

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
    <Card className="premium-surface overflow-hidden rounded-lg">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#e7d8b7] bg-[#fff8e9] p-2 text-slate-800">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">Agent 今日指挥</h2>
            </div>
          </div>
          <Badge variant="outline" className="w-fit rounded-full border-slate-200 bg-white/70 text-slate-500">
            {tasks.length} 项
          </Badge>
        </div>

        <div className="grid gap-4 rounded-lg border border-slate-200/80 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:grid-cols-[8.75rem_minmax(0,1fr)] sm:items-start">
          <AgentAvatar className="h-32 w-32 sm:h-36 sm:w-36" />
          <div className="space-y-3">
            <div className="relative rounded-lg border border-[#e4d8bf] bg-[#fffaf0] px-4 py-3 text-[15px] font-medium leading-7 text-slate-900 shadow-[0_12px_30px_rgba(69,58,39,0.08)]">
              <span className="hidden sm:block absolute left-[-8px] top-6 size-4 rotate-45 border-b border-l border-[#e4d8bf] bg-[#fffaf0]" />
              {agentSpeech}
            </div>
          </div>
          <div className="col-span-full border-t border-slate-200/70 pt-3 text-sm leading-6 text-slate-600">
            {agentJudgment}
          </div>
        </div>

        <div className="space-y-3">
          {tasks.slice(0, 5).map((task, index) => {
            const completed = task.completed;

            return (
              <article
                key={task.id}
                className={cn(
                  "rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(43,51,69,0.08)]",
                  completed ? "border-slate-200/80 bg-slate-50/80" : "border-slate-200/80 bg-white/82",
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
