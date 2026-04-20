"use client";

import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { buildInterviewInsights } from "@/lib/review-insights";

export function InterviewReview() {
  const { jobs } = useJobfindStore();
  const insights = buildInterviewInsights(jobs);

  return (
    <Card className="editorial-panel rounded-lg">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-950">面试复盘沉淀</h2>
          <p className="text-sm leading-6 text-slate-600">{insights.recommendation}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200/80 bg-white/62 p-4">
            <p className="text-xs text-slate-500">已记录复盘</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{insights.totalNotes}</p>
          </div>
          <div className="rounded-lg border border-slate-200/80 bg-white/62 p-4">
            <p className="text-xs text-slate-500">覆盖岗位</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{insights.reviewedJobs}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-950">高频问题</h3>
          {insights.commonQuestions.length > 0 ? (
            <ul className="space-y-1 text-sm leading-6 text-slate-700">
              {insights.commonQuestions.map((question) => (
                <li key={question} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a7a2df]" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-slate-500">暂无面试问题记录。</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
