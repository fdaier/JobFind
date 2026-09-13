"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { formatChineseDateTime } from "@/lib/date";
import { JOB_STAGE_LABELS, JOB_STAGE_ORDER } from "@/lib/job-stages";
import type { Job, TimelineEvent } from "@/lib/types";

function toDateTimeLocal(value: string): string { return value.slice(0, 16); }
function eventDraft(event?: TimelineEvent) { return { date: event ? toDateTimeLocal(event.date) : toDateTimeLocal(new Date().toISOString()), stage: event?.stage ?? "applied" as Job["stage"], description: event?.description ?? "" }; }

export function JobTimeline({ job }: { job: Job }) {
  const { addTimelineEvent, updateTimelineEvent, deleteTimelineEvent } = useJobfindStore();
  const [editing, setEditing] = useState(false);
  const [newEvent, setNewEvent] = useState(eventDraft());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState(eventDraft());
  useEffect(() => { setEditing(false); setEditingIndex(null); setNewEvent(eventDraft()); }, [job]);
  const rows = job.timeline.map((event, index) => ({ event, index })).sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
  const asEvent = (value: ReturnType<typeof eventDraft>): TimelineEvent => ({ date: new Date(value.date).toISOString(), stage: value.stage, description: value.description.trim() });
  const editor = (value: ReturnType<typeof eventDraft>, setValue: (value: ReturnType<typeof eventDraft>) => void) => <div className="grid gap-2 rounded-md border bg-slate-50 p-3 sm:grid-cols-[1.1fr_0.8fr_2fr]"><Input type="datetime-local" value={value.date} onChange={(e) => setValue({ ...value, date: e.target.value })} /><select value={value.stage} onChange={(e) => setValue({ ...value, stage: e.target.value as Job["stage"] })} className="h-9 rounded-md border bg-white px-2 text-sm">{JOB_STAGE_ORDER.map((stage) => <option key={stage} value={stage}>{JOB_STAGE_LABELS[stage]}</option>)}</select><Textarea rows={1} value={value.description} onChange={(e) => setValue({ ...value, description: e.target.value })} placeholder="事件说明" /></div>;

  if (!editing) return <div className="space-y-5"><div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => setEditing(true)}>编辑</Button></div>{rows.length ? <ol className="space-y-4">{rows.map(({ event, index }) => <li key={`${event.date}-${index}`} className="border-l-2 border-primary pl-4"><p className="text-sm font-medium">{JOB_STAGE_LABELS[event.stage]} <span className="ml-2 text-xs font-normal text-slate-500">{formatChineseDateTime(event.date)}</span></p><p className="mt-1 text-sm text-slate-700">{event.description}</p></li>)}</ol> : <p className="text-sm text-slate-500">还没有时间线记录。</p>}</div>;

  return <div className="space-y-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">编辑时间线</h3><Button variant="outline" size="sm" onClick={() => { setEditing(false); setEditingIndex(null); }}>完成</Button></div><section className="space-y-2"><p className="text-sm font-medium">新增事件</p>{editor(newEvent, setNewEvent)}<Button size="sm" disabled={!newEvent.date || !newEvent.description.trim()} onClick={() => { addTimelineEvent(job.id, asEvent(newEvent)); setNewEvent(eventDraft()); }}>添加事件</Button></section><div className="space-y-3">{rows.map(({ event, index }) => <article key={`${event.date}-${index}`} className="rounded-md border p-3">{editingIndex === index ? <><div className="mb-2">{editor(draft, setDraft)}</div><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>取消</Button><Button size="sm" disabled={!draft.date || !draft.description.trim()} onClick={() => { updateTimelineEvent(job.id, index, asEvent(draft)); setEditingIndex(null); }}>保存</Button></div></> : <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{JOB_STAGE_LABELS[event.stage]} <span className="ml-2 text-xs font-normal text-slate-500">{formatChineseDateTime(event.date)}</span></p><p className="mt-1 text-sm text-slate-700">{event.description}</p></div><div className="flex shrink-0 gap-1"><Button variant="ghost" size="sm" onClick={() => { setDraft(eventDraft(event)); setEditingIndex(index); }}>编辑</Button><Button variant="ghost" size="sm" className="text-rose-700" onClick={() => { if (window.confirm("删除这条时间线记录？")) deleteTimelineEvent(job.id, index); }}>删除</Button></div></div>}</article>)}</div></div>;
}
