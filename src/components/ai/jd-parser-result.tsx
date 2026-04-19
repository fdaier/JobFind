"use client";

import React from "react";
import type { ReactNode } from "react";

import type { Job } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DATE_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

export function JDParserResult({
  job,
  onSave,
  isSaving = false,
}: {
  job: Job;
  onSave: () => void;
  isSaving?: boolean;
}) {
  const deadline = job.applicationDeadline ? DATE_FORMAT.format(new Date(job.applicationDeadline)) : "暂无";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" value={job.company} />
        <Field label="Position" value={job.position} />
        <Field label="Stage" value={job.stage} />
        <Field label="DDL" value={`${deadline}（3 天内）`} />
      </div>

      <Separator />

      <Section title="Keywords">
        <div className="flex flex-wrap gap-2">
          {job.keywords.map((keyword) => (
            <Badge key={keyword} variant="outline" className="rounded-md">
              {keyword}
            </Badge>
          ))}
        </div>
      </Section>

      <Separator />

      <Section title="Required materials">
        <div className="flex flex-wrap gap-2">
          {job.requiredMaterials.map((material) => (
            <Badge key={material} variant="outline" className="rounded-md">
              {material}
            </Badge>
          ))}
        </div>
      </Section>

      <Separator />

      <Section title="下一步">
        <p className="text-sm leading-6 text-slate-700">保存到看板后补齐 AI 产品作品集。</p>
      </Section>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? "保存中..." : "保存到看板"}
        </Button>
      </div>
    </div>
  );
}
