"use client";

import React, { useMemo } from "react";

import { useJobfindStore } from "../../hooks/use-jobfind-store";
import { generateRiskTags } from "../../lib/rules-engine";
import { JOB_STAGE_LABELS } from "../../lib/job-stages";
import type { Job, Material } from "../../lib/types";
import { cn } from "../../lib/utils";

interface JobCardProps {
  job: Job;
  materials: Material[];
  now?: Date;
}

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
    job.assessmentDeadline ? { label: "测评截止", value: job.assessmentDeadline } : null,
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
          <p className="break-words text-sm font-semibold text-slate-950">{job.company}</p>
          <h3 className="mt-0.5 break-words text-sm font-semibold text-slate-950">{job.position}</h3>
        </div>
        <span className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/30 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {JOB_STAGE_LABELS[job.stage]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
          <span className="font-medium text-slate-700">{milestoneState.label}</span>
          <span>{milestoneState.milestone ? `${milestoneState.milestone.label} ${formatDate(milestoneState.milestone.value)}` : "—"}</span>
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

      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-700">备注</p>
        <p className="min-h-5 text-xs leading-5 text-slate-600">{job.note?.trim() || "未添加备注"}</p>
      </div>
    </button>
  );
}
