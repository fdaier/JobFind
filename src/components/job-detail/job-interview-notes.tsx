"use client";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatChineseDateTime } from "@/lib/date";
import type { InterviewNote, Job } from "@/lib/types";

const RESULT_VARIANTS: Record<InterviewNote["result"], "default" | "secondary" | "destructive" | "outline"> = {
  passed: "default",
  failed: "destructive",
  pending: "outline",
};

export function JobInterviewNotes({ job }: { job: Job }) {
  if (job.interviewNotes.length === 0) {
    return <p className="text-sm text-slate-500">还没有面试复盘，面完再补也来得及。</p>;
  }

  return (
    <div className="space-y-4">
      {job.interviewNotes.map((note, index) => (
        <article key={`${note.round}-${note.date}-${index}`} className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-950">{note.round}</h3>
              <p className="text-xs text-slate-500">{formatChineseDateTime(note.date)}</p>
            </div>
            <Badge variant={RESULT_VARIANTS[note.result]} className="rounded-md">
              {note.result === "passed" ? "通过" : note.result === "failed" ? "未通过" : "待定"}
            </Badge>
          </div>

          <Separator />

          <section className="space-y-2">
            <h4 className="text-sm font-medium text-slate-950">高频问题</h4>
            <ul className="space-y-1 text-sm leading-6 text-slate-700">
              {note.questions.map((question) => (
                <li key={question} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-1">
            <h4 className="text-sm font-medium text-slate-950">复盘</h4>
            <p className="text-sm leading-6 text-slate-700">{note.reflection}</p>
          </section>
        </article>
      ))}
    </div>
  );
}
