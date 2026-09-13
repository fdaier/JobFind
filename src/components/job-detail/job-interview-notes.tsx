"use client";

import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { formatChineseDateTime } from "@/lib/date";
import type { InterviewNote, Job } from "@/lib/types";

type NoteDraft = { round: string; date: string; questions: string; reflection: string; result: InterviewNote["result"] };
const empty = (): NoteDraft => ({ round: "", date: new Date().toISOString().slice(0, 10), questions: "", reflection: "", result: "pending" });
const toDraft = (note: InterviewNote): NoteDraft => ({ round: note.round, date: note.date.slice(0, 10), questions: note.questions.join("\n"), reflection: note.reflection, result: note.result });
function valid(value: NoteDraft): boolean { return Boolean(value.round.trim() && value.date && value.questions.trim() && value.reflection.trim()); }
function toNote(value: NoteDraft): InterviewNote { return { round: value.round.trim(), date: new Date(`${value.date}T12:00:00`).toISOString(), questions: value.questions.split("\n").map((item) => item.trim()).filter(Boolean), reflection: value.reflection.trim(), result: value.result }; }
function Editor({ value, setValue }: { value: NoteDraft; setValue: (next: NoteDraft) => void }) { return <div className="space-y-3"><div className="grid gap-3 sm:grid-cols-3"><Input aria-label="轮次" value={value.round} placeholder="轮次，例如一面" onChange={(e) => setValue({ ...value, round: e.target.value })} /><Input aria-label="面试日期" type="date" value={value.date} onChange={(e) => setValue({ ...value, date: e.target.value })} /><select aria-label="结果" value={value.result} onChange={(e) => setValue({ ...value, result: e.target.value as NoteDraft["result"] })} className="h-9 rounded-md border bg-white px-2 text-sm"><option value="pending">待定</option><option value="passed">通过</option><option value="failed">未通过</option></select></div><Textarea aria-label="高频问题" rows={3} value={value.questions} placeholder="高频问题，每行一条" onChange={(e) => setValue({ ...value, questions: e.target.value })} /><Textarea aria-label="复盘" rows={3} value={value.reflection} placeholder="复盘" onChange={(e) => setValue({ ...value, reflection: e.target.value })} /></div>; }

export function JobInterviewNotes({ job }: { job: Job }) {
  const { addInterviewNote, updateInterviewNote, deleteInterviewNote } = useJobfindStore();
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState<NoteDraft>(empty());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<NoteDraft>(empty());
  useEffect(() => { setEditing(false); setEditingIndex(null); setNewNote(empty()); }, [job]);
  const label = (result: InterviewNote["result"]) => result === "passed" ? "通过" : result === "failed" ? "未通过" : "待定";
  if (!editing) return <div className="space-y-5"><div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => setEditing(true)}>编辑</Button></div>{job.interviewNotes.length ? job.interviewNotes.map((note, index) => <article key={`${note.round}-${index}`} className="space-y-3 rounded-md border p-4"><div className="flex justify-between gap-3"><div><h3 className="text-sm font-semibold">{note.round}</h3><p className="text-xs text-slate-500">{formatChineseDateTime(note.date)}</p></div><Badge variant={note.result === "failed" ? "destructive" : "outline"}>{label(note.result)}</Badge></div><p className="text-sm text-slate-700">{note.questions.join("；")}</p><p className="text-sm text-slate-700">{note.reflection}</p></article>) : <p className="text-sm text-slate-500">还没有面试复盘。</p>}</div>;
  return <div className="space-y-5"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">编辑面试复盘</h3><Button variant="outline" size="sm" onClick={() => { setEditing(false); setEditingIndex(null); }}>完成</Button></div><section className="space-y-3 rounded-md border bg-slate-50 p-4"><p className="text-sm font-medium">新增复盘</p><Editor value={newNote} setValue={setNewNote} /><Button size="sm" disabled={!valid(newNote)} onClick={() => { addInterviewNote(job.id, toNote(newNote)); setNewNote(empty()); }}>添加复盘</Button></section>{job.interviewNotes.map((note, index) => <article key={`${note.round}-${index}`} className="rounded-md border p-4">{editingIndex === index ? <><Editor value={draft} setValue={setDraft} /><div className="mt-3 flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>取消</Button><Button size="sm" disabled={!valid(draft)} onClick={() => { updateInterviewNote(job.id, index, toNote(draft)); setEditingIndex(null); }}>保存</Button></div></> : <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{note.round}</h3><p className="text-xs text-slate-500">{formatChineseDateTime(note.date)}</p><p className="mt-2 text-sm">{note.questions.join("；")}</p><p className="mt-1 text-sm text-slate-700">{note.reflection}</p></div><div className="flex shrink-0 gap-1"><Button variant="ghost" size="sm" onClick={() => { setDraft(toDraft(note)); setEditingIndex(index); }}>编辑</Button><Button variant="ghost" size="sm" className="text-rose-700" onClick={() => { if (window.confirm("删除这条面试复盘？")) deleteInterviewNote(job.id, index); }}>删除</Button></div></div>}</article>)}</div>;
}
