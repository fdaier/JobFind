"use client";

import React from "react";

import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { PageHeader } from "@/components/layout/page-header";
import { AgentMemory } from "@/components/review/agent-memory";
import { ChannelReview } from "@/components/review/channel-review";
import { InterviewReview } from "@/components/review/interview-review";

export default function ReviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="复盘中心"
        description="Agent 会把阶段、渠道、材料和面试记录沉淀成下一轮投递策略，先把最有价值的判断留下来。"
      />
      <AgentMemory />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ChannelReview />
        <InterviewReview />
      </div>
      <FunnelChart />
    </div>
  );
}
