"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ApplicationDeadlineInput } from "@/components/ai/application-deadline-input";
import { JOB_STAGE_LABELS, type JDIntakeDraft } from "@/lib/jd-intake";
import type { MaterialType } from "@/lib/types";

const materialLabels: Record<MaterialType, string> = {
  resume: "简历",
  portfolio: "作品集 / 项目材料",
  transcript: "成绩单",
  certificate: "证书",
  cover_letter: "求职信",
  other: "其他材料",
};

const materialTypes = Object.keys(materialLabels) as MaterialType[];

export function JDParserResult({
  draft,
  onDraftChange,
  onBack,
  onSave,
  isSaving = false,
}: {
  draft: JDIntakeDraft;
  onDraftChange: (draft: JDIntakeDraft) => void;
  onBack: () => void;
  onSave: () => void;
  isSaving?: boolean;
}) {
  const [keywordInput, setKeywordInput] = useState("");

  const updateDraft = <Key extends keyof JDIntakeDraft>(field: Key, value: JDIntakeDraft[Key]) => {
    onDraftChange({ ...draft, [field]: value });
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (!keyword || draft.keywords.includes(keyword)) {
      return;
    }

    updateDraft("keywords", [...draft.keywords, keyword]);
    setKeywordInput("");
  };

  const toggleMaterial = (material: MaterialType) => {
    updateDraft(
      "requiredMaterials",
      draft.requiredMaterials.includes(material)
        ? draft.requiredMaterials.filter((item) => item !== material)
        : [...draft.requiredMaterials, material],
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <div>
          <p className="text-sm font-semibold text-slate-950">根据 JD 整理的建议</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">你可以直接修改。公司、岗位名称和原始 JD 会按你的输入保存。</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="jd-preview-company" className="text-xs text-slate-500">公司</label>
          <Input id="jd-preview-company" value={draft.company} onChange={(event) => updateDraft("company", event.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="jd-preview-position" className="text-xs text-slate-500">岗位名称</label>
          <Input id="jd-preview-position" value={draft.position} onChange={(event) => updateDraft("position", event.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="jd-preview-stage" className="text-xs text-slate-500">阶段</label>
          <select id="jd-preview-stage" value={draft.stage} onChange={(event) => updateDraft("stage", event.target.value as JDIntakeDraft["stage"])} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
            {Object.entries(JOB_STAGE_LABELS).map(([stage, label]) => <option key={stage} value={stage}>{label}</option>)}
          </select>
        </div>
        <ApplicationDeadlineInput
          id="jd-preview-deadline"
          label={<>申请截止时间 <span className="font-normal text-slate-500">（选填）</span></>}
          value={draft.applicationDeadline}
          onChange={(value) => updateDraft("applicationDeadline", value)}
        />
      </div>

      <Separator />

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-950">关键词</h3>
        <div className="flex flex-wrap gap-2">
          {draft.keywords.map((keyword) => (
            <Badge key={keyword} variant="outline" className="gap-1 rounded-md pr-1">
              {keyword}
              <button type="button" aria-label={`移除关键词 ${keyword}`} onClick={() => updateDraft("keywords", draft.keywords.filter((item) => item !== keyword))} className="rounded-sm p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-950">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {draft.keywords.length === 0 ? <p className="text-sm text-slate-500">未从 JD 中匹配到关键词，可手动补充。</p> : null}
        </div>
        <div className="flex max-w-sm gap-2">
          <Input aria-label="添加关键词" value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addKeyword();
            }
          }} placeholder="添加关键词" />
          <Button type="button" variant="outline" size="sm" onClick={addKeyword}>添加</Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-950">材料建议</h3>
        <p className="text-sm text-slate-600">仅把 JD 中明确提到的材料预先勾选；你可以调整。</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {materialTypes.map((material) => (
            <label key={material} className="flex items-center gap-2 text-sm text-slate-800">
              <input type="checkbox" checked={draft.requiredMaterials.includes(material)} onChange={() => toggleMaterial(material)} className="size-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400" />
              {materialLabels[material]}
            </label>
          ))}
        </div>
      </section>

      <details className="border-t border-slate-200 pt-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">查看原始 JD</summary>
        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-700">{draft.jdText}</pre>
      </details>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSaving}>返回修改</Button>
        <Button type="button" onClick={onSave} disabled={isSaving}>{isSaving ? "保存中..." : "保存到看板"}</Button>
      </div>
    </div>
  );
}
