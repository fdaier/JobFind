"use client";

import React, { useEffect, useMemo, useState } from "react";

import { deterministicAgentRuntime } from "@/lib/agent/deterministic-runtime";
import type { AgentArtifactSection, AgentRecommendation } from "@/lib/agent/types";
import type { Job, Material } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useJobfindStore } from "@/hooks/use-jobfind-store";

type HelperKey = "rankingExplanation" | "followUpDraft" | "interviewPrepChecklist" | "materialGuidance";

const HELPER_LABELS: Record<HelperKey, string> = {
  rankingExplanation: "查看排序依据",
  followUpDraft: "生成跟进话术",
  interviewPrepChecklist: "生成面试准备清单",
  materialGuidance: "查看材料补齐建议",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

function RecommendationCard({
  recommendation,
  completed,
  onConfirm,
}: {
  recommendation: AgentRecommendation;
  completed: boolean;
  onConfirm: () => void;
}) {
  return (
    <article className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-950">{recommendation.action}</h4>
            <Badge variant={completed ? "secondary" : "outline"} className="rounded-md">
              {completed ? "已确认" : "待确认"}
            </Badge>
          </div>
          <p className="text-sm leading-6 text-slate-600">{recommendation.reason}</p>
        </div>
        <Badge variant="outline" className="rounded-md">
          {recommendation.priorityLabel}
        </Badge>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
        <span className="font-medium text-slate-950">为什么现在重要：</span>
        {recommendation.whyNow}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Agent 先给出判断和建议，状态变更仍然需要你确认。</p>
        <Button type="button" size="sm" variant={completed ? "secondary" : "default"} onClick={onConfirm} disabled={completed}>
          {completed ? "已完成" : "确认这一步"}
        </Button>
      </div>
    </article>
  );
}

function ArtifactDetail({ artifact }: { artifact: AgentArtifactSection }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-semibold text-slate-950">{artifact.title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {artifact.items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JobAIPanel({ job, materials }: { job: Job; materials: Material[] }) {
  const { jobs, markTaskComplete, completedTaskIds } = useJobfindStore();
  const [activeHelper, setActiveHelper] = useState<HelperKey | null>(null);

  const result = useMemo(
    () =>
      deterministicAgentRuntime.buildResult({
        job,
        jobs,
        materials,
        completedTaskIds,
      }),
    [completedTaskIds, job, jobs, materials],
  );

  useEffect(() => {
    setActiveHelper(null);
  }, [job.id]);

  const availableHelpers = (Object.entries(result.helperArtifacts) as Array<[HelperKey, AgentArtifactSection | null]>).filter(
    (entry): entry is [HelperKey, AgentArtifactSection] => Boolean(entry[1]),
  );

  return (
    <div className="space-y-5">
      <Section title="Agent 判断">
        <Card className="rounded-md border-slate-200 bg-white shadow-none">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm leading-6 text-slate-700">{result.summary}</p>
            <ul className="space-y-2 text-sm leading-6 text-slate-700">
              {result.perception.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Section>

      <Separator />

      <Section title="为什么现在重要">
        <Card className="rounded-md border-slate-200 bg-white shadow-none">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-950">{result.diagnosis.headline}</h4>
              <Badge variant="outline" className="rounded-md">
                {result.diagnosis.urgencyLabel}
              </Badge>
            </div>
            <ul className="space-y-2 text-sm leading-6 text-slate-700">
              {result.diagnosis.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Section>

      <Separator />

      <Section title="下一步建议">
        {result.recommendations.length > 0 ? (
          <div className="space-y-3">
            {result.recommendations.map((recommendation) => {
              const completed = completedTaskIds.includes(recommendation.taskId);

              return (
                <RecommendationCard
                  key={recommendation.taskId}
                  recommendation={recommendation}
                  completed={completed}
                  onConfirm={() => markTaskComplete(recommendation.taskId)}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">这份岗位暂时没有需要立刻确认的 Agent 建议。</p>
        )}
      </Section>

      <Separator />

      <Section title="可展开帮助">
        {availableHelpers.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {availableHelpers.map(([key]) => (
                <Button
                  key={key}
                  type="button"
                  variant={activeHelper === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveHelper((current) => (current === key ? null : key))}
                >
                  {HELPER_LABELS[key]}
                </Button>
              ))}
            </div>

            {activeHelper && result.helperArtifacts[activeHelper] ? (
              <ArtifactDetail artifact={result.helperArtifacts[activeHelper]} />
            ) : (
              <p className="text-sm text-slate-500">点开一个帮助项，Agent 会给你展开对应的解释、草稿或清单。</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">当前岗位暂时没有额外的展开帮助。</p>
        )}
      </Section>
    </div>
  );
}
