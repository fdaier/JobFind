"use client";

import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { calculateMaterialCompleteness } from "@/lib/rules-engine";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import type { Job, Material, MaterialType } from "@/lib/types";

const TYPES: Array<{ value: MaterialType; label: string }> = [{ value: "resume", label: "简历" }, { value: "portfolio", label: "作品集" }, { value: "transcript", label: "成绩单" }, { value: "certificate", label: "证书" }, { value: "cover_letter", label: "求职信" }, { value: "other", label: "其他" }];

export function JobMaterials({ job, materials }: { job: Job; materials: Material[] }) {
  const { updateJobMaterials } = useJobfindStore();
  const [editing, setEditing] = useState(false);
  const [required, setRequired] = useState<MaterialType[]>(job.requiredMaterials);
  const [bound, setBound] = useState<string[]>(job.boundMaterialIds);
  useEffect(() => { setEditing(false); setRequired(job.requiredMaterials); setBound(job.boundMaterialIds); }, [job]);
  const completeness = calculateMaterialCompleteness(job, materials);
  const toggle = <T,>(value: T, selected: T[], setSelected: (next: T[]) => void) => setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);

  if (editing) return <div className="space-y-5">
    <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">编辑材料</h3><span className="text-xs text-slate-500">只调整关联，不会删除材料库内容</span></div>
    <section className="space-y-3"><p className="text-sm font-medium">需要的材料</p><div className="grid gap-2 sm:grid-cols-2">{TYPES.map((type) => <label key={type.value} className="flex items-center gap-2 rounded-md border p-3 text-sm"><input type="checkbox" checked={required.includes(type.value)} onChange={() => toggle(type.value, required, setRequired)} />{type.label}</label>)}</div></section>
    <section className="space-y-3"><p className="text-sm font-medium">绑定已有材料</p><div className="space-y-2">{materials.map((material) => <label key={material.id} className="flex items-center gap-2 rounded-md border p-3 text-sm"><input type="checkbox" checked={bound.includes(material.id)} onChange={() => toggle(material.id, bound, setBound)} />{material.name}<span className="text-slate-500">· {material.version}</span></label>)}</div></section>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setEditing(false); setRequired(job.requiredMaterials); setBound(job.boundMaterialIds); }}>取消</Button><Button onClick={() => { updateJobMaterials(job.id, required, bound); setEditing(false); }}>保存</Button></div>
  </div>;

  const boundNames = job.boundMaterialIds.map((id) => materials.find((material) => material.id === id)?.name).filter(Boolean) as string[];
  return <div className="space-y-5"><div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => setEditing(true)}>编辑</Button></div><section className="space-y-2"><div className="flex justify-between text-sm"><h3 className="font-semibold">材料完成度</h3><span>{completeness.percentage}%</span></div><p className="text-sm text-slate-600">{completeness.missing.length ? `还缺：${completeness.missing.map((type) => TYPES.find((item) => item.value === type)?.label).join("、")}` : "材料都已对上。"}</p></section><Separator /><section className="space-y-2"><h3 className="text-sm font-semibold">需要的材料</h3><div className="flex flex-wrap gap-2">{job.requiredMaterials.map((type) => <Badge key={type} variant="outline">{TYPES.find((item) => item.value === type)?.label}</Badge>)}</div></section><Separator /><section className="space-y-2"><h3 className="text-sm font-semibold">已绑定材料</h3><div className="flex flex-wrap gap-2">{boundNames.length ? boundNames.map((name) => <Badge key={name} variant="outline">{name}</Badge>) : <p className="text-sm text-slate-500">暂无已绑定材料。</p>}</div></section></div>;
}
