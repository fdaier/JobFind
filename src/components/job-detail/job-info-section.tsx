"use client";

import React, { useEffect, useState } from "react";

import { ApplicationDeadlineInput } from "@/components/ai/application-deadline-input";
import { DateTimeInput } from "@/components/ai/date-time-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { JOB_STAGE_LABELS, JOB_STAGE_ORDER } from "@/lib/job-stages";
import type { Job } from "@/lib/types";

function toDateInput(value: string | null): string { return value ? value.slice(0, 10) : ""; }
function toDateTimeInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function toIso(value: string): string | null { return value ? new Date(`${value}T23:59:59`).toISOString() : null; }
function toDateTimeIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
function formatDateTime(value: string | null | undefined): string {
  if (!value) return "暂无";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "暂无";
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}
function list(value: string): string[] { return value.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean); }
function makeDraft(job: Job) {
  return {
    company: job.company, position: job.position, stage: job.stage, deadline: toDateInput(job.applicationDeadline),
    assessmentDeadline: toDateTimeInput(job.assessmentDeadline), assessmentLink: job.assessmentLink ?? "",
    writtenTestDate: toDateTimeInput(job.writtenTestDate), interviewDate: toDateTimeInput(job.interviewDate),
    jdText: job.jdText, keywords: job.keywords.join("，"), requirements: job.requirements.join("\n"),
    contactName: job.contactName ?? "", contactInfo: job.contactInfo ?? "", note: job.note ?? "",
  };
}

export function JobInfoSection({ job }: { job: Job }) {
  const { updateJob } = useJobfindStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => makeDraft(job));
  useEffect(() => { setEditing(false); setDraft(makeDraft(job)); }, [job]);
  const cancel = () => { setEditing(false); setDraft(makeDraft(job)); };
  const save = () => {
    updateJob(job.id, {
      company: draft.company.trim(), position: draft.position.trim(), stage: draft.stage,
      applicationDeadline: toIso(draft.deadline), assessmentDeadline: toDateTimeIso(draft.assessmentDeadline), assessmentLink: draft.assessmentLink.trim() || null,
      writtenTestDate: toDateTimeIso(draft.writtenTestDate), interviewDate: toDateTimeIso(draft.interviewDate),
      jdText: draft.jdText, keywords: list(draft.keywords), requirements: list(draft.requirements),
      contactName: draft.contactName.trim() || null, contactInfo: draft.contactInfo.trim() || null, note: draft.note.trim(),
    });
    setEditing(false);
  };

  if (editing) return <div className="space-y-5">
    <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-950">编辑基本信息</h3><span className="text-xs text-slate-500">保存后 Agent 会重新判断</span></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium">公司<Input value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} /></label>
      <label className="space-y-2 text-sm font-medium">岗位名称<Input value={draft.position} onChange={(event) => setDraft({ ...draft, position: event.target.value })} /></label>
      <label className="space-y-2 text-sm font-medium">当前阶段<select value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value as Job["stage"] })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">{JOB_STAGE_ORDER.map((stage) => <option key={stage} value={stage}>{JOB_STAGE_LABELS[stage]}</option>)}</select></label>
    </div>
    <section className="space-y-3 border-y border-slate-200 py-4">
      <div><h4 className="text-sm font-semibold text-slate-950">关键时间</h4><p className="mt-1 text-xs text-slate-500">测评截止支持精确到时分；填写链接仅用于你快速返回入口。</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ApplicationDeadlineInput id="detail-deadline" label="申请截止时间" value={draft.deadline} onChange={(deadline) => setDraft({ ...draft, deadline })} />
        <DateTimeInput id="detail-assessment-deadline" label="测评截止时间" ariaLabel="测评截止时间" value={draft.assessmentDeadline} onChange={(value) => setDraft({ ...draft, assessmentDeadline: value })} />
        <DateTimeInput id="detail-written-test-date" label="笔试时间" ariaLabel="笔试时间" value={draft.writtenTestDate} onChange={(value) => setDraft({ ...draft, writtenTestDate: value })} />
        <DateTimeInput id="detail-interview-date" label="面试时间" ariaLabel="面试时间" value={draft.interviewDate} onChange={(value) => setDraft({ ...draft, interviewDate: value })} />
        <label className="space-y-2 text-sm font-medium sm:col-span-2">测评链接 <span className="font-normal text-slate-500">（选填）</span><Input type="url" value={draft.assessmentLink} onChange={(event) => setDraft({ ...draft, assessmentLink: event.target.value })} /></label>
      </div>
    </section>
    <label className="block space-y-2 text-sm font-medium">JD 正文<Textarea rows={10} value={draft.jdText} onChange={(event) => setDraft({ ...draft, jdText: event.target.value })} /></label>
    <label className="block space-y-2 text-sm font-medium">JD 命中的术语（用逗号分隔）<Input value={draft.keywords} onChange={(event) => setDraft({ ...draft, keywords: event.target.value })} /></label>
    <label className="block space-y-2 text-sm font-medium">岗位要求（每行一条）<Textarea rows={4} value={draft.requirements} onChange={(event) => setDraft({ ...draft, requirements: event.target.value })} /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">联系人<Input value={draft.contactName} onChange={(event) => setDraft({ ...draft, contactName: event.target.value })} /></label><label className="space-y-2 text-sm font-medium">联系方式<Input value={draft.contactInfo} onChange={(event) => setDraft({ ...draft, contactInfo: event.target.value })} /></label></div>
    <label className="block space-y-2 text-sm font-medium">备注 <span className="font-normal text-slate-500">{draft.note.length}/20</span><Input maxLength={20} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder="例如：等内推回复" /></label>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={cancel}>取消</Button><Button disabled={!draft.company.trim() || !draft.position.trim() || !draft.jdText.trim()} onClick={save}>保存</Button></div>
  </div>;

  return <div className="space-y-5">
    <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => setEditing(true)}>编辑</Button></div>
    <section className="space-y-2"><h3 className="text-sm font-semibold text-slate-950">JD</h3><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{job.jdText}</p></section><Separator />
    <section className="space-y-2"><h3 className="text-sm font-semibold text-slate-950">JD 命中的术语</h3><div className="flex flex-wrap gap-2">{job.keywords.length ? job.keywords.map((item) => <Badge key={item} variant="outline" className="rounded-md">{item}</Badge>) : <p className="text-sm text-slate-500">暂无术语。</p>}</div></section><Separator />
    <section className="space-y-2"><h3 className="text-sm font-semibold text-slate-950">岗位要求</h3>{job.requirements.length ? <ul className="space-y-2">{job.requirements.map((item) => <li key={item} className="text-sm leading-6 text-slate-700">• {item}</li>)}</ul> : <p className="text-sm text-slate-500">暂无要求信息。</p>}</section><Separator />
    <section className="grid gap-3 text-sm sm:grid-cols-2">
      <div><p className="text-slate-500">联系人</p><p>{job.contactName ?? "暂无"}</p></div><div><p className="text-slate-500">联系方式</p><p>{job.contactInfo ?? "暂无"}</p></div>
      <div><p className="text-slate-500">申请截止时间</p><p>{job.applicationDeadline ? toDateInput(job.applicationDeadline) : "暂无"}</p></div><div><p className="text-slate-500">测评截止时间</p><p>{formatDateTime(job.assessmentDeadline)}</p></div>
      <div><p className="text-slate-500">笔试时间</p><p>{formatDateTime(job.writtenTestDate)}</p></div><div><p className="text-slate-500">面试时间</p><p>{formatDateTime(job.interviewDate)}</p></div>
      <div className="sm:col-span-2"><p className="text-slate-500">测评链接</p>{job.assessmentLink ? <a href={job.assessmentLink} target="_blank" rel="noreferrer" className="break-all text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">打开测评链接</a> : <p>暂无</p>}</div>
      <div><p className="text-slate-500">备注</p><p>{job.note?.trim() || "未添加备注"}</p></div>
    </section>
  </div>;
}
