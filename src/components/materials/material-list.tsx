"use client";

import React from "react";

import { FileStack } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { buildMaterialInsights } from "@/lib/review-insights";

import { MaterialCard } from "./material-card";

export function MaterialList() {
  const { jobs, materials } = useJobfindStore();
  const insights = buildMaterialInsights(jobs, materials);
  const primaryGap = insights.gaps[0];

  return (
    <div className="space-y-6">
      <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <FileStack className="size-4 text-slate-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">Agent 材料调度</h2>
          </div>
          <p className="text-sm leading-6 text-slate-700">{insights.recommendation}</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">材料总数</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{insights.totalMaterials}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">覆盖最广</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{insights.topMaterial?.name ?? "暂无材料"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">当前最大缺口</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {primaryGap ? `${primaryGap.materialLabel} · 影响 ${primaryGap.jobs.length} 个岗位` : "暂无缺口"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        {insights.materials.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </section>
    </div>
  );
}
