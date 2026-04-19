"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { calculateFunnelData } from "@/lib/rules-engine";

const steps = [
  { key: "interested", label: "关注" },
  { key: "toApply", label: "待投递" },
  { key: "applied", label: "已投递" },
  { key: "writtenTest", label: "笔试" },
  { key: "interviewing", label: "面试" },
  { key: "offer", label: "录用" },
  { key: "rejected", label: "已淘汰" },
] as const;

export function FunnelChart() {
  const { jobs } = useJobfindStore();
  const data = calculateFunnelData(jobs);
  const maxCount = Math.max(...steps.map((step) => data[step.key]), 1);

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">转化漏斗</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">按阶段看一眼流动方向，不引入额外图表库。</p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const count = data[step.key];
            const width = maxCount === 0 ? 0 : (count / maxCount) * 100;

            return (
              <div key={step.key} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{step.label}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-slate-700 transition-[width]" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
