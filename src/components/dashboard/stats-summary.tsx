"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  Clock3,
  TriangleAlert,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { calculateFunnelData, generateRiskTags } from "@/lib/rules-engine";

type MetricTone = "default" | "warning" | "danger" | "success";

type MetricCard = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: MetricTone;
};

function getWeekStart(now: Date) {
  const start = new Date(now);
  const day = start.getDay();
  const offset = (day + 6) % 7;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

function toneClass(tone: MetricTone) {
  switch (tone) {
    case "warning":
      return {
        icon: "border-[#ead8ae] bg-[#fff7e5] text-amber-700",
        value: "text-slate-950",
        label: "text-amber-700",
      };
    case "danger":
      return {
        icon: "border-rose-200 bg-rose-50 text-rose-700",
        value: "text-slate-950",
        label: "text-rose-700",
      };
    case "success":
      return {
        icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
        value: "text-slate-950",
        label: "text-emerald-700",
      };
    default:
      return {
        icon: "border-slate-200 bg-white/80 text-slate-700",
        value: "text-slate-950",
        label: "text-slate-500",
      };
  }
}

export function StatsSummary() {
  const { completedTaskIds, jobs, materials } = useJobfindStore();

  const metrics = useMemo<MetricCard[]>(() => {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const criticalJobs = new Set(
      jobs
        .filter((job) => generateRiskTags(job, materials, now).some((risk) => risk.level === "critical"))
        .map((job) => job.id),
    );
    const taskIds = new Set(
      jobs.flatMap((job) =>
        generateRiskTags(job, materials, now).map((riskTag) => `${job.id}-${riskTag.type}`),
      ),
    );
    const funnel = calculateFunnelData(jobs);
    const upcomingInterviewCount = jobs.filter((job) => {
      if (job.stage !== "interviewing" || !job.interviewDate) {
        return false;
      }

      const delta = new Date(job.interviewDate).getTime() - now.getTime();
      return delta >= 0 && delta <= 72 * 60 * 60 * 1000;
    }).length;

    return [
      {
        label: "本周投递",
        value: jobs.filter((job) => {
          if (!job.appliedDate) {
            return false;
          }

          const appliedAt = new Date(job.appliedDate);
          return appliedAt >= weekStart && appliedAt <= now;
        }).length,
        hint: `覆盖 ${funnel.applied + funnel.writtenTest + funnel.interviewing + funnel.offer} 个已推进岗位`,
        icon: CalendarDays,
        tone: "default",
      },
      {
        label: "待处理任务",
        value: Array.from(taskIds).filter((taskId) => !completedTaskIds.includes(taskId)).length,
        hint: `${taskIds.size} 个今日规则任务，完成后仍会保留在列表里`,
        icon: Clock3,
        tone: "warning",
      },
      {
        label: "高风险申请",
        value: criticalJobs.size,
        hint: "优先处理 DDL、面试和沉默风险",
        icon: TriangleAlert,
        tone: "danger",
      },
      {
        label: "即将面试",
        value: upcomingInterviewCount,
        hint: "72 小时内的面试窗口",
        icon: UserRoundCheck,
        tone: "success",
      },
    ];
  }, [completedTaskIds, jobs, materials]);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const tone = toneClass(metric.tone);

        return (
          <Card key={metric.label} className="editorial-panel rounded-lg">
            <div className="flex h-full min-h-28 flex-col justify-between gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className={`text-sm font-medium ${tone.label}`}>{metric.label}</div>
                  <div className={`text-3xl font-semibold tracking-tight ${tone.value}`}>{metric.value}</div>
                </div>
                <div className={`rounded-lg border p-2 ${tone.icon}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </div>
              </div>
              <div className="text-sm leading-6 text-slate-500">{metric.hint}</div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
