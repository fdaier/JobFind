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
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-slate-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-950">风险雷达</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              由规则引擎展开所有风险标签，先看红色项，再处理黄色项。
            </p>
          </div>
          <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">
            {riskItems.length} 项
          </Badge>
        </div>

        <div className="space-y-3">
          {riskItems.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              当前没有显性的风险标签。
            </div>
          ) : (
            riskItems.map((risk) => (
              <article
                key={risk.id}
                className={cn(
                  "rounded-md border p-4",
                  risk.level === "critical"
                    ? "border-rose-200 bg-rose-50/80"
                    : "border-amber-200 bg-amber-50/70",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 rounded-md border p-2",
                      risk.level === "critical"
                        ? "border-rose-200 bg-white text-rose-700"
                        : "border-amber-200 bg-white text-amber-700",
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
                            ? "border-rose-200 bg-white text-rose-700"
                            : "border-amber-200 bg-white text-amber-700",
                        )}
                      >
                        {risk.level === "critical" ? "Critical" : "Warning"}
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
