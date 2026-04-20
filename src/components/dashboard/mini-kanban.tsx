"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { cn } from "@/lib/utils";

const stages = [
  { key: "interested", label: "关注中" },
  { key: "to_apply", label: "待投递" },
  { key: "applied", label: "已投递" },
  { key: "written_test", label: "笔试" },
  { key: "interviewing", label: "面试" },
  { key: "offer", label: "录用" },
  { key: "rejected", label: "已淘汰" },
] as const;

export function MiniKanban() {
  const { jobs } = useJobfindStore();
  const counts = stages.map((stage) => jobs.filter((job) => job.stage === stage.key).length);
  const maxCount = Math.max(...counts, 1);

  return (
    <Card className="editorial-panel rounded-lg">
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">阶段看板</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">七个阶段的轻量统计，方便快速扫一眼推进情况。</p>
        </div>

        <div className="grid gap-3 xl:grid-cols-7">
          {stages.map((stage, index) => {
            const count = counts[index];
            const width = count === 0 ? 0 : Math.max(12, (count / maxCount) * 100);

            return (
              <div
                key={stage.key}
                className="flex min-h-24 flex-col justify-between rounded-lg border border-white/48 bg-white/34 p-3"
              >
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500">{stage.label}</div>
                  <div className="text-2xl font-semibold tracking-tight text-slate-950">{count}</div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/75">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      stage.key === "offer"
                        ? "bg-emerald-600"
                        : stage.key === "rejected"
                          ? "bg-slate-400"
                          : "bg-slate-800",
                    )}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
