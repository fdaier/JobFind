# JobFind v1.2 Complete Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build JobFind v1.2 by adding Materials Center and Review Center so the MVP expresses material management, channel review, interview learning, and Agent strategy memory.

**Architecture:** Keep the app as a Next.js client-side prototype backed by React Context and localStorage. Add a pure `review-insights` layer that computes materials, channels, interview, and Agent memory insights from existing `jobs` and `materials`, then render those insights in two new pages. No backend, model API dependency, upload flow, chart library, or new dependency is introduced.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind, shadcn-style local UI components, Vitest, Testing Library, Playwright CLI.

---

## File Structure

- Create `src/lib/review-insights.ts`
  - Pure functions for material, channel, interview, and Agent memory insights.
- Create `src/lib/review-insights.test.ts`
  - Unit tests for insight calculations.
- Modify `src/components/layout/app-sidebar.tsx`
  - Add `材料中心` and `复盘中心` nav items.
- Modify `src/components/layout/app-sidebar.test.tsx`
  - Cover new navigation entries.
- Create `src/components/materials/material-card.tsx`
  - Present a single material version, bound jobs, and Agent usage judgment.
- Create `src/components/materials/material-list.tsx`
  - Present Agent material dispatch summary and all material cards.
- Create `src/app/materials/page.tsx`
  - Materials Center page.
- Create `src/app/materials/page.test.tsx`
  - Page test for Materials Center.
- Create `src/components/review/channel-review.tsx`
  - Channel performance and Agent recommended channel.
- Create `src/components/review/agent-memory.tsx`
  - Agent strategy memory cards.
- Create `src/components/review/interview-review.tsx`
  - Interview review accumulation and common questions.
- Create `src/app/review/page.tsx`
  - Review Center page.
- Create `src/app/review/page.test.tsx`
  - Page test for Review Center.

## Task 1: Review Insights Layer

**Files:**
- Create: `src/lib/review-insights.test.ts`
- Create: `src/lib/review-insights.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/review-insights.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { createMockJobs, createMockMaterials } from "./mock-data";
import {
  buildAgentMemoryInsights,
  buildChannelInsights,
  buildInterviewInsights,
  buildMaterialInsights,
} from "./review-insights";

const now = new Date("2026-04-19T08:00:00.000Z");

describe("review insights", () => {
  it("builds material coverage and gap guidance", () => {
    const jobs = createMockJobs(now);
    const materials = createMockMaterials(now);

    const insights = buildMaterialInsights(jobs, materials);

    expect(insights.totalMaterials).toBe(6);
    expect(insights.topMaterial?.name).toBe("产品经理通用简历");
    expect(insights.topMaterial?.boundJobCount).toBe(8);
    expect(insights.gaps[0]?.materialLabel).toBe("作品集");
    expect(insights.gaps[0]?.jobs.some((job) => job.company === "腾讯")).toBe(true);
    expect(insights.recommendation).toContain("优先补齐作品集");
  });

  it("builds channel performance and recommendation", () => {
    const jobs = createMockJobs(now);
    const materials = createMockMaterials(now);

    const insights = buildChannelInsights(jobs, materials, now);

    expect(insights.channels.length).toBeGreaterThan(0);
    expect(insights.recommendedChannel).toBeTruthy();
    expect(insights.recommendation).toContain("Agent 建议");
    expect(insights.channels.some((channel) => channel.label === "官网")).toBe(true);
  });

  it("builds interview review summary", () => {
    const jobs = createMockJobs(now);

    const insights = buildInterviewInsights(jobs);

    expect(insights.totalNotes).toBeGreaterThan(0);
    expect(insights.commonQuestions.length).toBeGreaterThan(0);
    expect(insights.recommendation).toContain("复盘");
  });

  it("builds 3 to 5 Agent memory items", () => {
    const jobs = createMockJobs(now);
    const materials = createMockMaterials(now);

    const memories = buildAgentMemoryInsights(jobs, materials, now);

    expect(memories.length).toBeGreaterThanOrEqual(3);
    expect(memories.length).toBeLessThanOrEqual(5);
    expect(memories[0]?.title).toContain("Agent");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm.cmd run test -- src/lib/review-insights.test.ts
```

Expected: FAIL because `src/lib/review-insights.ts` does not exist.

- [ ] **Step 3: Implement insight functions**

Create `src/lib/review-insights.ts` with:

```ts
import { generateRiskTags } from "./rules-engine";
import type { Job, Material, MaterialType, SourceChannel } from "./types";

const MATERIAL_LABELS: Record<MaterialType, string> = {
  resume: "简历",
  portfolio: "作品集",
  transcript: "成绩单",
  certificate: "证书",
  cover_letter: "求职信",
  other: "其他材料",
};

const CHANNEL_LABELS: Record<SourceChannel, string> = {
  official_site: "官网",
  boss: "Boss",
  shixiseng: "实习僧",
  nowcoder: "牛客",
  school_career: "学校就业网",
  referral: "内推",
  campus_talk: "宣讲会",
};

const ADVANCED_STAGES = new Set<Job["stage"]>(["written_test", "interviewing", "offer"]);

export interface MaterialGapInsight {
  type: MaterialType;
  materialLabel: string;
  jobs: Array<{ id: string; company: string; position: string }>;
}

export interface MaterialUsageInsight {
  id: string;
  name: string;
  typeLabel: string;
  boundJobCount: number;
  boundJobs: Array<{ id: string; company: string; position: string }>;
  usageNote: string;
}

export interface MaterialInsights {
  totalMaterials: number;
  topMaterial: MaterialUsageInsight | null;
  materials: MaterialUsageInsight[];
  gaps: MaterialGapInsight[];
  recommendation: string;
}

export interface ChannelInsight {
  channel: SourceChannel;
  label: string;
  totalJobs: number;
  advancedJobs: number;
  offerJobs: number;
  riskCount: number;
}

export interface ChannelInsights {
  channels: ChannelInsight[];
  recommendedChannel: ChannelInsight | null;
  recommendation: string;
}

export interface InterviewInsights {
  totalNotes: number;
  reviewedJobs: number;
  commonQuestions: string[];
  recommendation: string;
}

export interface AgentMemoryInsight {
  title: string;
  body: string;
}

function getJobSummary(job: Job) {
  return { id: job.id, company: job.company, position: job.position };
}

export function getMaterialLabel(type: MaterialType): string {
  return MATERIAL_LABELS[type];
}

export function getChannelLabel(channel: SourceChannel): string {
  return CHANNEL_LABELS[channel];
}

export function buildMaterialInsights(jobs: Job[], materials: Material[]): MaterialInsights {
  const materialsById = new Map(materials.map((material) => [material.id, material]));
  const usages = materials
    .map((material) => {
      const boundJobs = jobs.filter((job) => job.boundMaterialIds.includes(material.id)).map(getJobSummary);
      return {
        id: material.id,
        name: material.name,
        typeLabel: getMaterialLabel(material.type),
        boundJobCount: boundJobs.length,
        boundJobs,
        usageNote:
          boundJobs.length >= 5
            ? `覆盖 ${boundJobs.length} 个岗位，是当前最核心的通用材料。`
            : boundJobs.length > 0
              ? `已服务 ${boundJobs.length} 个岗位，适合继续按方向复用。`
              : "暂未绑定岗位，适合先确认是否还需要维护。",
      };
    })
    .sort((left, right) => right.boundJobCount - left.boundJobCount || left.name.localeCompare(right.name, "zh-CN"));

  const gapMap = new Map<MaterialType, Array<{ id: string; company: string; position: string }>>();
  jobs.forEach((job) => {
    job.requiredMaterials.forEach((type) => {
      const hasMaterial = job.boundMaterialIds.some((materialId) => materialsById.get(materialId)?.type === type);
      if (!hasMaterial) {
        gapMap.set(type, [...(gapMap.get(type) ?? []), getJobSummary(job)]);
      }
    });
  });

  const gaps = [...gapMap.entries()]
    .map(([type, gapJobs]) => ({
      type,
      materialLabel: getMaterialLabel(type),
      jobs: gapJobs,
    }))
    .sort((left, right) => right.jobs.length - left.jobs.length || left.materialLabel.localeCompare(right.materialLabel, "zh-CN"));

  const primaryGap = gaps[0];
  const recommendation = primaryGap
    ? `Agent 建议：优先补齐${primaryGap.materialLabel}，因为它正在影响 ${primaryGap.jobs[0]?.company}${primaryGap.jobs[0]?.position}。`
    : "Agent 建议：当前材料覆盖完整，下一步重点维护高频使用材料的最新版本。";

  return {
    totalMaterials: materials.length,
    topMaterial: usages[0] ?? null,
    materials: usages,
    gaps,
    recommendation,
  };
}

export function buildChannelInsights(jobs: Job[], materials: Material[], now: Date = new Date()): ChannelInsights {
  const channels = [...new Set(jobs.map((job) => job.channel))]
    .map((channel) => {
      const channelJobs = jobs.filter((job) => job.channel === channel);
      return {
        channel,
        label: getChannelLabel(channel),
        totalJobs: channelJobs.length,
        advancedJobs: channelJobs.filter((job) => ADVANCED_STAGES.has(job.stage)).length,
        offerJobs: channelJobs.filter((job) => job.stage === "offer").length,
        riskCount: channelJobs.reduce((count, job) => count + generateRiskTags(job, materials, now).length, 0),
      };
    })
    .sort(
      (left, right) =>
        right.offerJobs - left.offerJobs ||
        right.advancedJobs - left.advancedJobs ||
        right.totalJobs - left.totalJobs ||
        left.label.localeCompare(right.label, "zh-CN"),
    );

  const recommendedChannel = channels[0] ?? null;
  const recommendation = recommendedChannel
    ? `Agent 建议：优先维护${recommendedChannel.label}渠道，它当前带来了 ${recommendedChannel.advancedJobs} 个进入后续阶段的机会。`
    : "Agent 建议：先积累更多申请记录，再判断渠道投入优先级。";

  return { channels, recommendedChannel, recommendation };
}

export function buildInterviewInsights(jobs: Job[]): InterviewInsights {
  const notes = jobs.flatMap((job) => job.interviewNotes);
  const questionCounts = new Map<string, number>();

  notes.forEach((note) => {
    note.questions.forEach((question) => {
      questionCounts.set(question, (questionCounts.get(question) ?? 0) + 1);
    });
  });

  const commonQuestions = [...questionCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "zh-CN"))
    .slice(0, 5)
    .map(([question]) => question);

  return {
    totalNotes: notes.length,
    reviewedJobs: jobs.filter((job) => job.interviewNotes.length > 0).length,
    commonQuestions,
    recommendation:
      notes.length > 0
        ? "Agent 建议：把高频问题沉淀成固定准备清单，每次面试前先复盘项目拆解、指标和动机表达。"
        : "Agent 建议：完成下一场面试后立即补充复盘，避免忘记关键问题。",
  };
}

export function buildAgentMemoryInsights(jobs: Job[], materials: Material[], now: Date = new Date()): AgentMemoryInsight[] {
  const materialInsights = buildMaterialInsights(jobs, materials);
  const channelInsights = buildChannelInsights(jobs, materials, now);
  const interviewInsights = buildInterviewInsights(jobs);

  const memories: AgentMemoryInsight[] = [
    {
      title: "Agent 记忆：渠道策略",
      body: channelInsights.recommendation,
    },
    {
      title: "Agent 记忆：材料策略",
      body: materialInsights.recommendation,
    },
    {
      title: "Agent 记忆：面试策略",
      body: interviewInsights.recommendation,
    },
  ];

  if (materialInsights.topMaterial) {
    memories.push({
      title: "Agent 记忆：核心资产",
      body: `${materialInsights.topMaterial.name} 已覆盖 ${materialInsights.topMaterial.boundJobCount} 个岗位，后续应优先保持这一版最新。`,
    });
  }

  const activeRisks = jobs.reduce((count, job) => count + generateRiskTags(job, materials, now).length, 0);
  memories.push({
    title: "Agent 记忆：风险节奏",
    body: activeRisks > 0 ? `当前申请池仍有 ${activeRisks} 个风险信号，复盘时先看 DDL、材料和面试窗口。` : "当前申请池风险较低，适合把精力转向新岗位拓展。",
  });

  return memories.slice(0, 5);
}
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm.cmd run test -- src/lib/review-insights.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/lib/review-insights.ts src/lib/review-insights.test.ts
git commit -m "feat: add v1.2 review insight engine"
```

## Task 2: Navigation And Materials Center

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/layout/app-sidebar.test.tsx`
- Create: `src/components/materials/material-card.tsx`
- Create: `src/components/materials/material-list.tsx`
- Create: `src/app/materials/page.tsx`
- Create: `src/app/materials/page.test.tsx`

- [ ] **Step 1: Write failing navigation/page tests**

Update `src/components/layout/app-sidebar.test.tsx` to expect:

```tsx
expect(screen.getByRole("link", { name: "材料中心" })).toHaveAttribute("href", "/materials");
expect(screen.getByRole("link", { name: "复盘中心" })).toHaveAttribute("href", "/review");
```

Create `src/app/materials/page.test.tsx`:

```tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobFindProvider } from "@/hooks/use-jobfind-store";
import MaterialsPage from "./page";

describe("MaterialsPage", () => {
  it("shows Agent material dispatch and material versions", () => {
    render(
      <JobFindProvider>
        <MaterialsPage />
      </JobFindProvider>,
    );

    expect(screen.getByRole("heading", { name: "材料中心" })).toBeInTheDocument();
    expect(screen.getByText(/Agent 会把材料版本、绑定岗位和缺口放在一起看/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent 材料调度" })).toBeInTheDocument();
    expect(screen.getByText(/优先补齐作品集/)).toBeInTheDocument();
    expect(screen.getByText("产品经理通用简历")).toBeInTheDocument();
    expect(screen.getByText(/覆盖 8 个岗位/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run focused tests to verify they fail**

Run:

```bash
npm.cmd run test -- src/components/layout/app-sidebar.test.tsx src/app/materials/page.test.tsx
```

Expected: FAIL because nav links and page/components do not exist.

- [ ] **Step 3: Implement nav**

In `src/components/layout/app-sidebar.tsx`, import icons:

```tsx
import { BarChart3, BriefcaseBusiness, FileStack, LayoutDashboard } from "lucide-react";
```

Add nav items:

```tsx
{
  href: "/materials",
  label: "材料中心",
  icon: FileStack,
},
{
  href: "/review",
  label: "复盘中心",
  icon: BarChart3,
},
```

- [ ] **Step 4: Implement material components**

Create `src/components/materials/material-card.tsx`:

```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MaterialUsageInsight } from "@/lib/review-insights";

export function MaterialCard({ material }: { material: MaterialUsageInsight }) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">{material.typeLabel}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-950">{material.name}</h3>
          </div>
          <Badge variant="outline" className="rounded-md border-slate-200">
            覆盖 {material.boundJobCount} 个岗位
          </Badge>
        </div>

        <p className="text-sm leading-6 text-slate-700">{material.usageNote}</p>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">已绑定岗位</p>
          <div className="flex flex-wrap gap-2">
            {material.boundJobs.length > 0 ? (
              material.boundJobs.map((job) => (
                <Badge key={job.id} variant="secondary" className="rounded-md">
                  {job.company} · {job.position}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-slate-500">暂未绑定岗位</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

Create `src/components/materials/material-list.tsx`:

```tsx
"use client";

import { FileCheck2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { buildMaterialInsights } from "@/lib/review-insights";

import { MaterialCard } from "./material-card";

export function MaterialList() {
  const { jobs, materials } = useJobfindStore();
  const insights = buildMaterialInsights(jobs, materials);
  const primaryGap = insights.gaps[0];

  return (
    <div className="space-y-6">
      <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-4 text-slate-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">Agent 材料调度</h2>
          </div>
          <p className="text-sm leading-6 text-slate-700">{insights.recommendation}</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">材料总数</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{insights.totalMaterials}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">覆盖最广</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{insights.topMaterial?.name ?? "暂无材料"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">当前最大缺口</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {primaryGap ? `${primaryGap.materialLabel} · 影响 ${primaryGap.jobs.length} 个岗位` : "暂无缺口"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        {insights.materials.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Implement Materials page**

Create `src/app/materials/page.tsx`:

```tsx
"use client";

import { PageHeader } from "@/components/layout/page-header";
import { MaterialList } from "@/components/materials/material-list";

export default function MaterialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="材料中心"
        description="Agent 会把材料版本、绑定岗位和缺口放在一起看，先补最影响推进的材料。"
      />
      <MaterialList />
    </div>
  );
}
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm.cmd run test -- src/components/layout/app-sidebar.test.tsx src/app/materials/page.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add src/components/layout/app-sidebar.tsx src/components/layout/app-sidebar.test.tsx src/components/materials/material-card.tsx src/components/materials/material-list.tsx src/app/materials/page.tsx src/app/materials/page.test.tsx
git commit -m "feat: add v1.2 materials center"
```

## Task 3: Review Center

**Files:**
- Create: `src/components/review/channel-review.tsx`
- Create: `src/components/review/agent-memory.tsx`
- Create: `src/components/review/interview-review.tsx`
- Create: `src/app/review/page.tsx`
- Create: `src/app/review/page.test.tsx`

- [ ] **Step 1: Write failing page test**

Create `src/app/review/page.test.tsx`:

```tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobFindProvider } from "@/hooks/use-jobfind-store";
import ReviewPage from "./page";

describe("ReviewPage", () => {
  it("shows Agent strategy review across channel, material, and interview memory", () => {
    render(
      <JobFindProvider>
        <ReviewPage />
      </JobFindProvider>,
    );

    expect(screen.getByRole("heading", { name: "复盘中心" })).toBeInTheDocument();
    expect(screen.getByText(/Agent 会把阶段、渠道、材料和面试记录沉淀成下一轮投递策略/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent 策略记忆" })).toBeInTheDocument();
    expect(screen.getByText(/Agent 记忆：渠道策略/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "渠道复盘" })).toBeInTheDocument();
    expect(screen.getByText(/Agent 建议：优先维护/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "面试复盘沉淀" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run focused test to verify it fails**

Run:

```bash
npm.cmd run test -- src/app/review/page.test.tsx
```

Expected: FAIL because page/components do not exist.

- [ ] **Step 3: Implement review components**

Create `src/components/review/agent-memory.tsx`:

```tsx
"use client";

import { BrainCircuit } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { buildAgentMemoryInsights } from "@/lib/review-insights";

export function AgentMemory() {
  const { jobs, materials } = useJobfindStore();
  const memories = buildAgentMemoryInsights(jobs, materials);

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="size-4 text-slate-700" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-950">Agent 策略记忆</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {memories.map((memory) => (
            <article key={memory.title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-950">{memory.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{memory.body}</p>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

Create `src/components/review/channel-review.tsx`:

```tsx
"use client";

import { RadioTower } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { buildChannelInsights } from "@/lib/review-insights";

export function ChannelReview() {
  const { jobs, materials } = useJobfindStore();
  const insights = buildChannelInsights(jobs, materials);

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <RadioTower className="size-4 text-slate-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-950">渠道复盘</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{insights.recommendation}</p>
          </div>
          {insights.recommendedChannel ? (
            <Badge variant="outline" className="rounded-md">
              推荐：{insights.recommendedChannel.label}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-3">
          {insights.channels.map((channel) => (
            <article key={channel.channel} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-950">{channel.label}</h3>
                <span className="text-xs text-slate-500">风险 {channel.riskCount}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <span>岗位 {channel.totalJobs}</span>
                <span>推进 {channel.advancedJobs}</span>
                <span>Offer {channel.offerJobs}</span>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

Create `src/components/review/interview-review.tsx`:

```tsx
"use client";

import { MessagesSquare } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { buildInterviewInsights } from "@/lib/review-insights";

export function InterviewReview() {
  const { jobs } = useJobfindStore();
  const insights = buildInterviewInsights(jobs);

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <MessagesSquare className="size-4 text-slate-700" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-950">面试复盘沉淀</h2>
        </div>
        <p className="text-sm leading-6 text-slate-700">{insights.recommendation}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">已记录复盘</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{insights.totalNotes}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">覆盖岗位</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{insights.reviewedJobs}</p>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-950">高频问题</h3>
          <ul className="space-y-1 text-sm leading-6 text-slate-700">
            {insights.commonQuestions.map((question) => (
              <li key={question} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Implement Review page**

Create `src/app/review/page.tsx`:

```tsx
"use client";

import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { PageHeader } from "@/components/layout/page-header";
import { AgentMemory } from "@/components/review/agent-memory";
import { ChannelReview } from "@/components/review/channel-review";
import { InterviewReview } from "@/components/review/interview-review";

export default function ReviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="复盘中心"
        description="Agent 会把阶段、渠道、材料和面试记录沉淀成下一轮投递策略。"
      />
      <AgentMemory />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ChannelReview />
        <InterviewReview />
      </div>
      <FunnelChart />
    </div>
  );
}
```

- [ ] **Step 5: Run focused test**

Run:

```bash
npm.cmd run test -- src/app/review/page.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add src/components/review src/app/review
git commit -m "feat: add v1.2 review center"
```

## Task 4: Full Verification

**Files:**
- No production files expected.

- [ ] **Step 1: Run all tests**

Run:

```bash
npm.cmd run test
```

Expected: PASS, 0 failed tests.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm.cmd run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
npm.cmd run lint
```

Expected: PASS with no ESLint warnings or errors.

- [ ] **Step 4: Run build**

Run:

```bash
npm.cmd run build
```

Expected: PASS.

- [ ] **Step 5: Playwright smoke**

If port 3000 is not listening, start dev server:

```powershell
$cwd = 'D:\projects\JobFind\.worktrees\jobfind-core-loop'
$out = Join-Path $cwd 'jobfind-dev-server.log'
$err = Join-Path $cwd 'jobfind-dev-server.err.log'
Start-Process -FilePath 'npm.cmd' -ArgumentList @('run','dev','--','--hostname','127.0.0.1','--port','3000') -WorkingDirectory $cwd -RedirectStandardOutput $out -RedirectStandardError $err -PassThru
```

Then run:

```bash
npx.cmd --yes --package @playwright/cli playwright-cli open http://127.0.0.1:3000/ --browser chrome
npx.cmd --yes --package @playwright/cli playwright-cli console
npx.cmd --yes --package @playwright/cli playwright-cli open http://127.0.0.1:3000/materials --browser chrome
npx.cmd --yes --package @playwright/cli playwright-cli console
npx.cmd --yes --package @playwright/cli playwright-cli open http://127.0.0.1:3000/review --browser chrome
npx.cmd --yes --package @playwright/cli playwright-cli console
npx.cmd --yes --package @playwright/cli playwright-cli close
```

Expected: no console errors on `/`, `/materials`, and `/review`.

- [ ] **Step 6: Final status**

Run:

```bash
git status --short
```

Expected: clean working tree.

## Self-Review

- Spec coverage: Materials Center, Review Center, navigation, pure insight functions, Agent visibility, tests, and full verification are all represented.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: All new components consume `Job`, `Material`, and exported insight types from `review-insights`.
- Scope check: This plan does not add backend, upload, model API dependency, or external libraries.
