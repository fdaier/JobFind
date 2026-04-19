"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { generateRiskTags } from "@/lib/rules-engine";
import { cn } from "@/lib/utils";

export function RiskRadar() {
  const { jobs, materials } = useJobfindStore();

  const riskItems = jobs
    .flatMap((job) =>
      generateRiskTags(job, materials).map((risk) => ({
        id: `${job.id}-${risk.type}-${risk.message}`,
        company: job.company,
        position: job.position,
        level: risk.level,
        message: risk.message,
      })),
    )
    .sort((left, right) => {
      if (left.level !== right.level) {
        return left.level === "critical" ? -1 : 1;
      }

      return `${left.company}${left.position}`.localeCompare(`${right.company}${right.position}`);
    });

  return (
    <Card className="editorial-panel rounded-lg">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-slate-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-950">Agent 风险雷达</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Agent 已识别 DDL、材料、面试和沉默风险，先看红色项，再处理黄色项。
            </p>
          </div>
          <Badge variant="outline" className="rounded-full border-slate-200 bg-white/70 text-slate-500">
            {riskItems.length} 项
          </Badge>
        </div>

        <div className="space-y-3">
          {riskItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white/55 p-4 text-sm text-slate-500">
              当前没有显性的风险标签。
            </div>
          ) : (
            riskItems.map((risk) => (
              <article
                key={risk.id}
                className={cn(
                  "rounded-lg border p-4 shadow-[0_10px_28px_rgba(43,51,69,0.04)]",
                  risk.level === "critical"
                    ? "border-rose-200 bg-rose-50/72"
                    : "border-[#ecd8ad] bg-[#fff7e5]/72",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 rounded-md border p-2",
                      risk.level === "critical"
                        ? "border-rose-200 bg-white/85 text-rose-700"
                        : "border-[#ecd8ad] bg-white/85 text-amber-700",
                    )}
                  >
                    <AlertTriangle className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-950">
                        {risk.company} · {risk.position}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full",
                          risk.level === "critical"
                            ? "border-rose-200 bg-white/85 text-rose-700"
                            : "border-[#ecd8ad] bg-white/85 text-amber-700",
                        )}
                      >
                        {risk.level === "critical" ? "紧急" : "提醒"}
                      </Badge>
                    </div>
                    <p className={cn("text-sm leading-6", risk.level === "critical" ? "text-rose-900" : "text-amber-900")}>
                      {risk.message}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
