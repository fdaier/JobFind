"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { JOB_STAGE_LABELS, JOB_STAGE_ORDER } from "@/lib/job-stages";
import { cn } from "@/lib/utils";

const stages = JOB_STAGE_ORDER.map((key) => ({ key, label: JOB_STAGE_LABELS[key] }));

export function MiniKanban() {
  const { jobs } = useJobfindStore();
  const counts = stages.map((stage) => jobs.filter((job) => job.stage === stage.key).length);
  const maxCount = Math.max(...counts, 1);

  return (
    <Card className="editorial-panel rounded-lg">
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">阶段看板</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">十个校招阶段的轻量统计，方便快速扫一眼推进情况。</p>
        </div>

        <div className="grid gap-3 xl:grid-cols-5">
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
