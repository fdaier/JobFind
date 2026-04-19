"use client";

import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { MiniKanban } from "@/components/dashboard/mini-kanban";
import { RiskRadar } from "@/components/dashboard/risk-radar";
import { StatsSummary } from "@/components/dashboard/stats-summary";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { PageHeader } from "@/components/layout/page-header";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="今日求职作战台"
        description="Agent 已读取当前申请池，优先盯紧 DDL、材料缺口、面试窗口和沉默风险，先处理最容易掉链子的地方。"
      />

      <StatsSummary />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <TodayTasks />
        <RiskRadar />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <MiniKanban />
        <FunnelChart />
      </div>
    </div>
  );
}
