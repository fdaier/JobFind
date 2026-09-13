"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { JDParserResult } from "@/components/ai/jd-parser-result";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { createEmptyJDIntakeDraft, createJobFromJDIntake, organizeJDIntake, type JDIntakeDraft } from "@/lib/jd-intake";

type IntakeState = "input" | "preview";
type IntakeErrors = Partial<Record<"company" | "position" | "jdText", string>>;

function validateDraft(draft: JDIntakeDraft): IntakeErrors {
  return {
    ...(draft.company.trim() ? {} : { company: "请填写公司名称。" }),
    ...(draft.position.trim() ? {} : { position: "请填写岗位名称。" }),
    ...(draft.jdText.trim() ? {} : { jdText: "请粘贴岗位描述。" }),
  };
}

export function JDParserDialog() {
  const { isJDParserOpen, setJDParserOpen, addJob, materials } = useJobfindStore();
  const [mode, setMode] = useState<IntakeState>("input");
  const [draft, setDraft] = useState<JDIntakeDraft>(createEmptyJDIntakeDraft);
  const [errors, setErrors] = useState<IntakeErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const saveGuardRef = useRef(false);

  const resetToInput = useCallback(() => {
    saveGuardRef.current = false;
    setIsSaving(false);
    setMode("input");
    setDraft(createEmptyJDIntakeDraft());
    setErrors({});
  }, []);

  useEffect(() => {
    if (!isJDParserOpen) {
      resetToInput();
    }
  }, [isJDParserOpen, resetToInput]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetToInput();
    }
    setJDParserOpen(open);
  };

  const updateField = <Key extends keyof JDIntakeDraft>(field: Key, value: JDIntakeDraft[Key]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (field === "company" || field === "position" || field === "jdText") {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handlePreview = () => {
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setDraft(organizeJDIntake(draft));
    setMode("preview");
  };

  const handleSave = () => {
    if (saveGuardRef.current) {
      return;
    }

    saveGuardRef.current = true;
    setIsSaving(true);
    addJob(createJobFromJDIntake(draft, materials));
    toast.success("岗位已保存到看板");
    setJDParserOpen(false);
  };

  return (
    <Dialog open={isJDParserOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>导入 JD 添加岗位</DialogTitle>
          <DialogDescription>填写公司、岗位名称和 JD；系统基于文本整理标签和材料建议，保存前请确认。</DialogDescription>
        </DialogHeader>

        {mode === "input" ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="jd-intake-company" className="text-sm font-medium text-slate-950">公司</label>
                <Input id="jd-intake-company" value={draft.company} onChange={(event) => updateField("company", event.target.value)} aria-invalid={Boolean(errors.company)} aria-describedby={errors.company ? "jd-intake-company-error" : undefined} placeholder="例如：腾讯" />
                {errors.company ? <p id="jd-intake-company-error" className="text-xs text-rose-700">{errors.company}</p> : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="jd-intake-position" className="text-sm font-medium text-slate-950">岗位名称</label>
                <Input id="jd-intake-position" value={draft.position} onChange={(event) => updateField("position", event.target.value)} aria-invalid={Boolean(errors.position)} aria-describedby={errors.position ? "jd-intake-position-error" : undefined} placeholder="例如：AI 产品经理" />
                {errors.position ? <p id="jd-intake-position-error" className="text-xs text-rose-700">{errors.position}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="jd-intake-deadline" className="text-sm font-medium text-slate-950">申请截止时间 <span className="font-normal text-slate-500">（选填）</span></label>
                <Input id="jd-intake-deadline" type="datetime-local" value={draft.applicationDeadline} onChange={(event) => updateField("applicationDeadline", event.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="jd-intake-stage" className="text-sm font-medium text-slate-950">当前阶段</label>
                <select id="jd-intake-stage" value={draft.stage} onChange={(event) => updateField("stage", event.target.value as JDIntakeDraft["stage"])} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <option value="interested">关注中</option><option value="to_apply">待投递</option><option value="applied">已投递</option><option value="written_test">笔试</option><option value="interviewing">面试</option><option value="offer">录用</option><option value="rejected">已淘汰</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="jd-parser-input" className="text-sm font-medium text-slate-950">JD 正文</label>
              <Textarea id="jd-parser-input" value={draft.jdText} onChange={(event) => updateField("jdText", event.target.value)} aria-invalid={Boolean(errors.jdText)} aria-describedby={errors.jdText ? "jd-parser-input-error" : undefined} placeholder="粘贴完整的岗位职责、岗位要求和加分项。原文会保存到此岗位。" rows={12} className="min-h-[18rem] rounded-md" />
              {errors.jdText ? <p id="jd-parser-input-error" className="text-xs text-rose-700">{errors.jdText}</p> : null}
            </div>

            <Separator />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>取消</Button>
              <Button type="button" onClick={handlePreview}>整理并预览</Button>
            </DialogFooter>
          </div>
        ) : (
          <JDParserResult draft={draft} onDraftChange={setDraft} onBack={() => setMode("input")} onSave={handleSave} isSaving={isSaving} />
        )}
      </DialogContent>
    </Dialog>
  );
}
