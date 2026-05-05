"use client";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { calculateMaterialCompleteness } from "@/lib/rules-engine";
import type { Job, Material, MaterialType } from "@/lib/types";

const MATERIAL_LABELS: Record<MaterialType, string> = {
  resume: "简历",
  portfolio: "作品集",
  transcript: "成绩单",
  certificate: "证书",
  cover_letter: "求职信",
  other: "其他",
};

function MaterialList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="outline" className="rounded-md">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">暂无内容。</p>
      )}
    </section>
  );
}

export function JobMaterials({ job, materials }: { job: Job; materials: Material[] }) {
  const completeness = calculateMaterialCompleteness(job, materials);
  const boundMaterials = job.boundMaterialIds
    .map((materialId) => materials.find((material) => material.id === materialId))
    .filter((material): material is Material => Boolean(material))
    .map((material) => material.name);
  const missingMaterials = completeness.missing.map((type) => MATERIAL_LABELS[type]);
  const requiredMaterials = job.requiredMaterials.map((type) => MATERIAL_LABELS[type]);

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <h3 className="font-semibold text-slate-950">材料完成度</h3>
          <span className="text-slate-600">{completeness.percentage}%</span>
        </div>
        <Progress value={completeness.percentage} className="h-2 rounded-full bg-slate-100" />
      </section>

      <Separator />

      <MaterialList title="需要的材料" items={requiredMaterials} />

      <Separator />

      <MaterialList title="已绑定材料" items={boundMaterials} />

      <Separator />

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-950">缺少的材料</h3>
        {missingMaterials.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingMaterials.map((item) => (
              <Badge key={item} variant="destructive" className="rounded-md">
                缺少 {item}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">材料都已经对上了。</p>
        )}
      </section>
    </div>
  );
}
