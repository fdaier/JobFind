"use client";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatChineseDateTime } from "@/lib/date";
import type { MaterialUsageInsight } from "@/lib/review-insights";

type MaterialCardProps = {
  material: MaterialUsageInsight;
};

export function MaterialCard({ material }: MaterialCardProps) {
  return (
    <Card className="editorial-panel rounded-lg">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{material.typeLabel}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-950">{material.name}</h3>
          </div>
          <Badge variant="outline" className="rounded-lg border-white/50 bg-white/34 text-slate-700">
            覆盖 {material.boundJobCount} 个岗位
          </Badge>
        </div>

        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-lg border border-white/48 bg-white/34 px-3 py-2">
            <p className="text-xs text-slate-500">版本</p>
            <p className="mt-1 font-medium text-slate-950">{material.version}</p>
          </div>
          <div className="rounded-lg border border-white/48 bg-white/34 px-3 py-2">
            <p className="text-xs text-slate-500">方向</p>
            <p className="mt-1 font-medium text-slate-950">方向：{material.targetDirection}</p>
          </div>
          <div className="rounded-lg border border-white/48 bg-white/34 px-3 py-2">
            <p className="text-xs text-slate-500">最近更新</p>
            <p className="mt-1 font-medium text-slate-950">{formatChineseDateTime(material.lastUpdated)}</p>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-700">{material.usageNote}</p>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">已绑定岗位</p>
          <div className="flex flex-wrap gap-2">
            {material.boundJobs.length > 0 ? (
              material.boundJobs.map((job) => (
                <Badge key={job.id} variant="secondary" className="rounded-lg bg-slate-100/80">
                  {job.company} · {job.position}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-slate-500">暂无绑定岗位</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
