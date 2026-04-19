"use client";

import React from "react";

import { Separator } from "@/components/ui/separator";
import type { Job, TimelineEvent } from "@/lib/types";

const STAGE_LABELS: Record<Job["stage"], string> = {
  interested: "关注中",
  to_apply: "待投递",
  applied: "已投递",
  written_test: "笔试",
  interviewing: "面试",
  offer: "录用",
  rejected: "已淘汰",
};

function formatTimelineDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function TimelineRow({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  return (
    <li className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-950">{STAGE_LABELS[event.stage]}</span>
            <span className="text-xs text-slate-500">{formatTimelineDate(event.date)}</span>
          </div>
          <p className="text-sm leading-6 text-slate-700">{event.description}</p>
        </div>
      </div>
      {!isLast ? <Separator className="ml-1.5 w-[calc(100%-0.375rem)]" /> : null}
    </li>
  );
}

export function JobTimeline({ job }: { job: Job }) {
  const events = [...job.timeline].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  if (events.length === 0) {
    return <p className="text-sm text-slate-500">还没有时间线记录。</p>;
  }

  return (
    <ol className="space-y-0.5">
      {events.map((event, index) => (
        <TimelineRow key={`${event.date}-${event.stage}-${index}`} event={event} isLast={index === events.length - 1} />
      ))}
    </ol>
  );
}
