"use client";

import React from "react";

import { AgentAvatar } from "@/components/layout/agent-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { buildAgentMemoryInsights } from "@/lib/review-insights";

export function AgentMemory() {
  const { jobs, materials } = useJobfindStore();
  const memories = buildAgentMemoryInsights(jobs, materials);

  return (
    <Card className="premium-surface rounded-lg">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <AgentAvatar className="size-16 shrink-0" />
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-950">Agent 策略记忆</h2>
            <p className="text-sm leading-6 text-slate-600">把渠道、材料和面试里反复出现的判断留给下次投递直接复用。</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {memories.map((memory) => (
            <article key={memory.title} className="rounded-lg border border-white/48 bg-white/34 p-4">
              <h3 className="text-sm font-semibold text-slate-950">{memory.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{memory.body}</p>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
