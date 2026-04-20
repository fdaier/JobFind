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
    <Card className="premium-surface overflow-hidden rounded-lg py-0">
      <CardContent className="space-y-5 px-5 pb-5 pt-3.5 sm:px-6 sm:pb-6 sm:pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-white/50 bg-white/32 p-2 text-slate-700 shadow-[0_10px_24px_rgba(82,91,122,0.035)]">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">Agent 今日指挥</h2>
            </div>
          </div>
          <Badge variant="outline" className="w-fit rounded-full border-white/50 bg-white/36 text-slate-500">
            {tasks.length} 项
          </Badge>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-white/48 bg-[linear-gradient(112deg,rgba(219,228,243,0.58)_0%,rgba(255,255,255,0.54)_38%,rgba(247,242,250,0.38)_100%)] shadow-[inset_1px_1px_0_rgba(255,255,255,0.78),inset_-1px_-1px_0_rgba(190,181,206,0.14),0_18px_42px_rgba(83,91,122,0.04)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-52 bg-[radial-gradient(circle_at_38%_36%,rgba(162,190,218,0.32),rgba(162,190,218,0)_58%),linear-gradient(90deg,rgba(211,222,240,0.52),rgba(211,222,240,0))]" />
          <div className="relative grid gap-4 p-4 sm:grid-cols-[11.5rem_minmax(0,1fr)] sm:items-center">
            <div className="relative h-36 overflow-hidden rounded-lg border border-white/55 bg-[#dbe8f3]/70 shadow-[inset_1px_1px_0_rgba(255,255,255,0.72),0_16px_34px_rgba(65,82,108,0.08)]">
              <AgentAvatar
                className="absolute inset-0 h-full w-full rounded-none border-0 bg-transparent shadow-none"
                imageClassName="object-cover object-[50%_30%] scale-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_58%,rgba(255,255,255,0.58)_100%)]" />
            </div>
            <div>
              <div className="relative rounded-lg border border-white/62 bg-white/56 px-5 py-4 text-[15px] font-medium leading-7 text-slate-900 shadow-[inset_1px_1px_0_rgba(255,255,255,0.82),0_12px_28px_rgba(82,91,122,0.045)]">
                <span className="hidden sm:block absolute left-[-9px] top-7 size-4 rotate-45 border-b border-l border-white/62 bg-white/56" />
                {agentSpeech}
              </div>
            </div>
            <div className="col-span-full border-t border-white/48 pt-3 text-sm leading-6 text-slate-600">
              {agentJudgment}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.slice(0, 5).map((task, index) => {
            const completed = task.completed;

            return (
              <article
                key={task.id}
                className={cn(
                  "rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(43,51,69,0.045)]",
                  completed ? "border-white/45 bg-white/24" : "border-white/50 bg-white/38",
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
