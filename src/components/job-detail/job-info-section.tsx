"use client";

import React from "react";

import type { Job, JobType, MaterialType, RecruitBatch, SourceChannel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const MATERIAL_LABELS: Record<MaterialType, string> = {
  resume: "简历",
  portfolio: "作品集",
  transcript: "成绩单",
  certificate: "证书",
  cover_letter: "求职信",
  other: "其他",
};

const JOB_TYPE_LABELS: Record<JobType, string> = {
  campus: "校招",
  intern: "实习",
  management_trainee: "管培生",
  social: "社招",
};

const BATCH_LABELS: Record<RecruitBatch, string> = {
  autumn: "秋招",
  spring: "春招",
  supplementary: "补录",
  summer_intern: "暑期实习",
  daily_intern: "日常实习",
};

const CHANNEL_LABELS: Record<SourceChannel, string> = {
  official_site: "官网",
  boss: "BOSS 直聘",
  shixiseng: "实习僧",
  nowcoder: "牛客",
  school_career: "学校就业网",
  referral: "内推",
  campus_talk: "宣讲会",
};

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

export function JobInfoSection({ job }: { job: Job }) {
  return (
    <div className="space-y-5">
      <SectionBlock title="JD">
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{job.jdText}</p>
      </SectionBlock>

      <Separator />

      <SectionBlock title="关键词">
        <div className="flex flex-wrap gap-2">
          {job.keywords.length > 0 ? (
            job.keywords.map((keyword) => (
              <Badge key={keyword} variant="outline" className="rounded-md">
                {keyword}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-slate-500">暂无关键词。</p>
          )}
        </div>
      </SectionBlock>

      <Separator />

      <SectionBlock title="要求">
        <ul className="space-y-2">
          {job.requirements.length > 0 ? (
            job.requirements.map((requirement) => (
              <li key={requirement} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{requirement}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-slate-500">暂无要求信息。</li>
          )}
        </ul>
      </SectionBlock>

      <Separator />

      <SectionBlock title="联系人">
        {job.contactName || job.contactInfo ? (
          <div className="space-y-1 text-sm leading-6 text-slate-700">
            <p>{job.contactName ?? "暂无联系人姓名"}</p>
            <p>{job.contactInfo ?? "暂无联系方式"}</p>
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-500">还没有联系人信息，后续补上就行。</p>
        )}
      </SectionBlock>

      <Separator />

      <SectionBlock title="申请概览">
        <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <p className="text-slate-500">岗位类型</p>
            <p>{JOB_TYPE_LABELS[job.jobType]}</p>
          </div>
          <div>
            <p className="text-slate-500">投递批次</p>
            <p>{BATCH_LABELS[job.batch]}</p>
          </div>
          <div>
            <p className="text-slate-500">投递渠道</p>
            <p>{CHANNEL_LABELS[job.channel]}</p>
          </div>
          <div>
            <p className="text-slate-500">期望材料</p>
            <p>{job.requiredMaterials.map((type) => MATERIAL_LABELS[type]).join("、")}</p>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}
