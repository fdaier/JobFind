"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JOB_STAGE_LABELS, JOB_STAGE_ORDER } from "@/lib/job-stages";
import { isDemoJobId, stageCanAdvance, type ReviewItem } from "@/lib/mail/review";
import type { Job, JobStage } from "@/lib/types";

const CATEGORY_LABELS = { application: "投递回执", assessment: "测评", written_test: "笔试", interview: "面试", offer: "录用", rejection: "未通过", recruitment_other: "招聘相关", other: "未识别" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialId: string | null;
  items: ReviewItem[];
  jobs: Job[];
  busy: boolean;
  onApply: (item: ReviewItem, jobId: string, stage: JobStage, allowTerminalOverride: boolean) => Promise<void>;
  onIgnore: (item: ReviewItem) => Promise<void>;
}

function dateLabel(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "时间未知";
}

export function MailReviewDialog({ open, onOpenChange, initialId, items, jobs, busy, onApply, onIgnore }: Props) {
  const pending = useMemo(() => items.filter((item) => !item.decision), [items]);
  const realJobs = useMemo(() => jobs.filter((job) => !isDemoJobId(job.id)), [jobs]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jobId, setJobId] = useState("");
  const [stage, setStage] = useState<JobStage | "">("");

  useEffect(() => {
    if (!open) return;
    setSelectedId((previous) => pending.some((item) => item.id === previous) ? previous : initialId && pending.some((item) => item.id === initialId) ? initialId : pending[0]?.id ?? null);
  }, [open, initialId, pending]);

  const selected = pending.find((item) => item.id === selectedId) ?? null;
  useEffect(() => {
    setJobId(selected?.suggestedJobId ?? "");
    setStage(selected?.suggestedStage ?? "");
  }, [selected?.id, selected?.suggestedJobId, selected?.suggestedStage]);

  const job = realJobs.find((item) => item.id === jobId);
  const alreadyApplied = Boolean(selected && job?.timeline.some((event) => event.sourceEventId === selected.id));
  const terminalConflict = job?.stage === "offer" || job?.stage === "rejected";
  const canApply = Boolean(selected && job && stage && (alreadyApplied || terminalConflict || stageCanAdvance(job.stage, stage)));

  async function apply() {
    if (!selected || !job || !stage || !canApply) return;
    if (terminalConflict && !alreadyApplied && !window.confirm("这个岗位已在终态。确定根据这封邮件改写阶段吗？")) return;
    if (!selected.suggestedStage && !window.confirm("系统未发现明确的进度推进证据。你已核对原邮件并确定要应用吗？")) return;
    await onApply(selected, job.id, stage, Boolean(terminalConflict));
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[min(980px,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden bg-[#f8f7fc] p-0 sm:max-w-none">
      <DialogHeader className="shrink-0 border-b border-slate-200 px-6 py-5 pr-12 text-left">
        <DialogTitle className="text-xl">邮件进度建议</DialogTitle>
        <DialogDescription>{pending.length} 条待处理。每条邮件都由你决定是否应用到看板。</DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)] lg:overflow-hidden">
        <div className="border-b border-slate-200 lg:overflow-y-auto lg:border-b-0 lg:border-r" aria-label="待处理邮件列表">
          {pending.length ? pending.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`block w-full border-b border-slate-200/80 px-5 py-4 text-left transition-colors hover:bg-white/75 ${item.id === selected?.id ? "bg-white shadow-[inset_3px_0_0_#4f46e5]" : ""}`}>
            <div className="flex items-center justify-between gap-3"><span className={`text-xs font-medium ${item.lane === "ready" ? "text-indigo-700" : "text-amber-700"}`}>{item.lane === "ready" ? "进度建议" : "待核对"}</span><span className="text-xs text-slate-500">{CATEGORY_LABELS[item.mail.category]}</span></div>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-950">{item.mail.subject || "无主题"}</p>
            <p className="mt-1 text-xs text-slate-500">{dateLabel(item.mail.date)}</p>
          </button>) : <p className="p-6 text-sm text-slate-500">没有待处理邮件。</p>}
        </div>
        <div className="min-h-0 overflow-y-auto px-6 py-5">
          {selected ? <div className="space-y-6">
            <div><p className="text-xs font-medium text-slate-500">系统判断</p><div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-950"><span>{job ? JOB_STAGE_LABELS[job.stage] : "待选择岗位"}</span><ArrowRight className="size-4 text-slate-400" /><span>{selected.suggestedStage ? JOB_STAGE_LABELS[selected.suggestedStage] : "阶段待核对"}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{selected.reason}</p></div>
            <div className="space-y-2 border-t border-slate-200 pt-5"><p className="text-xs font-medium text-slate-500">邮件依据</p><p className="text-sm font-medium text-slate-900">{selected.mail.subject}</p><p className="text-xs text-slate-500">{selected.mail.senderDomain || selected.mail.sender} · {dateLabel(selected.mail.date)}</p><p className="border-l-2 border-indigo-300 pl-3 text-sm leading-6 text-slate-700">{selected.mail.evidence || selected.mail.snippet || "仅有邮件主题可供核对"}</p>{selected.mail.hasLink ? <p className="flex items-center gap-1 text-xs text-slate-500"><Link2 className="size-3" />邮件包含链接；链接本身不会自动改变进度</p> : null}</div>
            <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium text-slate-700">匹配岗位<select aria-label="匹配岗位" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={jobId} onChange={(event) => setJobId(event.target.value)}><option value="">请选择已有岗位</option>{realJobs.map((item) => <option key={item.id} value={item.id}>{item.company} · {item.position}</option>)}</select></label><label className="space-y-1.5 text-sm font-medium text-slate-700">目标阶段<select aria-label="目标阶段" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={stage} onChange={(event) => setStage(event.target.value as JobStage | "")}><option value="">请选择阶段</option>{JOB_STAGE_ORDER.filter((item) => item !== "to_apply").map((item) => <option key={item} value={item}>{JOB_STAGE_LABELS[item]}</option>)}</select></label></div>
            {!realJobs.length ? <p className="text-sm text-amber-700">这个浏览器还没有可审批的真实岗位。请先在看板建立岗位。</p> : job && stage && !canApply ? <p className="text-sm text-amber-700">目标阶段未晚于当前进度；不会将岗位倒退。</p> : null}
          </div> : <p className="text-sm text-slate-500">选择一封邮件查看证据。</p>}
        </div>
      </div>
      <DialogFooter className="shrink-0 flex-row flex-wrap justify-end border-t border-slate-200 bg-[#f8f7fc] px-6 py-4">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>暂不处理</Button>
        <Button variant="outline" disabled={!selected || busy} onClick={() => selected && void onIgnore(selected)}>忽略这条</Button>
        <Button disabled={!canApply || busy} onClick={() => void apply()}>{busy ? "处理中…" : alreadyApplied ? "重试同步回执" : "应用到看板"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
