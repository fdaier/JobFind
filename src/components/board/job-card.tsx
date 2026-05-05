"use client";

import React, { useMemo } from "react";

import { useJobfindStore } from "../../hooks/use-jobfind-store";
import { calculateMaterialCompleteness, generateRiskTags } from "../../lib/rules-engine";
import type { Job, Material } from "../../lib/types";
import { cn } from "../../lib/utils";

interface JobCardProps {
  job: Job;
  materials: Material[];
  now?: Date;
}

const STAGE_LABELS: Record<Job["stage"], string> = {
  interested: "关注中",
  to_apply: "待投递",
  applied: "已投递",
  written_test: "笔试",
  interviewing: "面试",
  offer: "录用",
  rejected: "已淘汰",
};

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getMilestoneState(job: Job, now: Date) {
  const milestones = [
    job.applicationDeadline ? { label: "DDL", value: job.applicationDeadline } : null,
    job.writtenTestDate ? { label: "笔试", value: job.writtenTestDate } : null,
    job.interviewDate ? { label: "面试", value: job.interviewDate } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  if (milestones.length === 0) {
    return {
      label: job.stage === "offer" || job.stage === "rejected" ? "已结束" : "暂无关键时间",
      milestone: null as { label: string; value: string } | null,
    };
  }

  const ordered = milestones
    .map((milestone) => ({ ...milestone, time: new Date(milestone.value).getTime() }))
    .filter((milestone) => Number.isFinite(milestone.time))
    .sort((left, right) => left.time - right.time);

  const nextUpcoming = ordered.find((milestone) => milestone.time >= now.getTime());
  if (nextUpcoming) {
    return { label: "关键下一时间", milestone: nextUpcoming };
  }

  return {
    label: job.stage === "offer" || job.stage === "rejected" ? "已结束" : "已过期",
    milestone: ordered[ordered.length - 1] ?? null,
  };
}

export function JobCard({ job, materials, now = new Date() }: JobCardProps) {
  const { setSelectedJobId } = useJobfindStore();

  const completeness = useMemo(() => calculateMaterialCompleteness(job, materials), [job, materials]);
  const riskTags = useMemo(() => generateRiskTags(job, materials), [job, materials]);
  const milestoneState = useMemo(() => getMilestoneState(job, now), [job, now]);

  return (
    <button
      type="button"
      data-testid="job-card"
      onClick={() => setSelectedJobId(job.id)}
      className={cn(
        "flex w-full flex-col gap-3 rounded-lg border border-white/52 bg-white/36 p-4 text-left",
        "transition hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/48 hover:shadow-[0_16px_32px_rgba(43,51,69,0.045)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{job.company}</p>
          <h3 className="mt-1 break-words text-sm font-semibold text-slate-950">{job.position}</h3>
        </div>
        <span className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/30 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {STAGE_LABELS[job.stage]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
          <span className="font-medium text-slate-700">{milestoneState.label}</span>
          <span>{milestoneState.milestone ? `${milestoneState.milestone.label} ${formatDate(milestoneState.milestone.value)}` : "—"}</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium text-slate-700">材料完成度</span>
            <span>
              {completeness.percentage}%{completeness.missing.length > 0 ? ` · 缺 ${completeness.missing.length} 项` : ""}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={completeness.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-slate-200/70"
          >
            <div className="h-full rounded-full bg-slate-900" style={{ width: `${completeness.percentage}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-700">Agent 风险</p>
        <div className="flex flex-wrap gap-2">
          {riskTags.length === 0 ? (
              <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                暂无风险
              </span>
          ) : (
            riskTags.map((tag) => (
              <span
                key={`${job.id}-${tag.type}-${tag.message}`}
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                  tag.level === "critical"
                    ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
                    : tag.level === "warning"
                      ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                      : "bg-slate-100 text-slate-600",
                )}
              >
                {tag.message}
              </span>
            ))
          )}
        </div>
      </div>
    </button>
  );
}
