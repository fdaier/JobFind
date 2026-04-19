"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { formatChineseDateTime } from "@/lib/date";
import type { InterviewNote, Job } from "@/lib/types";

const RESULT_VARIANTS: Record<InterviewNote["result"], "default" | "secondary" | "destructive" | "outline"> = {
  passed: "default",
  failed: "destructive",
  pending: "outline",
};

const EMPTY_FORM = {
  round: "",
  date: "",
  questions: "",
  reflection: "",
  result: "pending" as InterviewNote["result"],
};

export function JobInterviewNotes({ job }: { job: Job }) {
  const { addInterviewNote } = useJobfindStore();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(EMPTY_FORM);
  }, [job.id]);

  const parsedQuestions = useMemo(() => {
    return form.questions
      .split("\n")
      .map((question) => question.trim())
      .filter(Boolean);
  }, [form.questions]);

  const canSave =
    form.round.trim().length > 0 &&
    form.date.length > 0 &&
    parsedQuestions.length > 0 &&
    form.reflection.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    addInterviewNote(job.id, {
      round: form.round.trim(),
      date: new Date(form.date).toISOString(),
      questions: parsedQuestions,
      reflection: form.reflection.trim(),
      result: form.result,
    });
    setForm(EMPTY_FORM);
  };

  if (job.interviewNotes.length === 0) {
    return (
      <div className="space-y-5">
        <InterviewNoteForm form={form} setForm={setForm} canSave={canSave} onSave={handleSave} />
        <p className="text-sm text-slate-500">还没有面试复盘，先记下一轮关键问题和感受，后面会很有用。</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InterviewNoteForm form={form} setForm={setForm} canSave={canSave} onSave={handleSave} />
      {job.interviewNotes.map((note, index) => (
        <article key={`${note.round}-${note.date}-${index}`} className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-950">{note.round}</h3>
              <p className="text-xs text-slate-500">{formatChineseDateTime(note.date)}</p>
            </div>
            <Badge variant={RESULT_VARIANTS[note.result]} className="rounded-md">
              {note.result === "passed" ? "通过" : note.result === "failed" ? "未通过" : "待定"}
            </Badge>
          </div>

          <Separator />

          <section className="space-y-2">
            <h4 className="text-sm font-medium text-slate-950">高频问题</h4>
            <ul className="space-y-1 text-sm leading-6 text-slate-700">
              {note.questions.map((question) => (
                <li key={question} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-1">
            <h4 className="text-sm font-medium text-slate-950">复盘</h4>
            <p className="text-sm leading-6 text-slate-700">{note.reflection}</p>
          </section>
        </article>
      ))}
    </div>
  );
}

function InterviewNoteForm({
  form,
  setForm,
  canSave,
  onSave,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  canSave: boolean;
  onSave: () => void;
}) {
  return (
    <section className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-950">新增面试复盘</h3>
        <p className="text-sm leading-6 text-slate-600">先把轮次、问题和你的判断记下来，后面复用会轻松很多。</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-950">
          <span>轮次</span>
          <input
            type="text"
            value={form.round}
            onChange={(event) => setForm((current) => ({ ...current, round: event.target.value }))}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
            placeholder="例如：一面 / HR 面"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-950">
          <span>面试时间</span>
          <input
            type="datetime-local"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-950">
        <span>高频问题</span>
        <Textarea
          value={form.questions}
          onChange={(event) => setForm((current) => ({ ...current, questions: event.target.value }))}
          rows={4}
          className="min-h-[8rem] rounded-md border-slate-200 bg-white"
          placeholder={"每行一条，例如：\n为什么想做这个岗位？"}
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-950">
        <span>复盘</span>
        <Textarea
          value={form.reflection}
          onChange={(event) => setForm((current) => ({ ...current, reflection: event.target.value }))}
          rows={4}
          className="min-h-[8rem] rounded-md border-slate-200 bg-white"
          placeholder="记录哪里答得顺、哪里需要补强。"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-950">
        <span>结果</span>
        <select
          value={form.result}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              result: event.target.value as InterviewNote["result"],
            }))
          }
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
        >
          <option value="pending">待定</option>
          <option value="passed">通过</option>
          <option value="failed">未通过</option>
        </select>
      </label>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={!canSave}>
          保存复盘
        </Button>
      </div>
    </section>
  );
}
