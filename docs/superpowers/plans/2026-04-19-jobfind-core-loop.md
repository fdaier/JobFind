# JobFind Core Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Stage 1 JobFind core-loop prototype: dashboard, board, job detail sheet, rule-based Agent, and JD parsing demo.

**Architecture:** Use a Next.js App Router frontend with local mock data, pure rule-engine functions, React Context, and localStorage. Keep the Agent deterministic in Stage 1: rules diagnose and plan, while the user confirms all state changes.

**Tech Stack:** Next.js 15.x, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, npm, Vitest, React Testing Library, localStorage.

---

## 1. Source Documents

Implement Stage 1 only. Treat these files as the product and architecture source of truth:

- `PRD-JobFind.md`
- `architecture.md`
- `component-selection.md`
- `docs/superpowers/specs/2026-04-19-jobfind-core-loop-design.md`

Do not implement Stage 1.1 Agent deepening or Stage 1.2 full MVP completion during this plan, except for clean extension points.

## 2. File Structure

Create or modify these files:

- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `components.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/board/page.tsx`
- Create: `src/lib/types.ts`
- Create: `src/lib/mock-data.ts`
- Create: `src/lib/rules-engine.ts`
- Create: `src/lib/rules-engine.test.ts`
- Create: `src/lib/storage.ts`
- Create: `src/lib/utils.ts`
- Create: `src/hooks/use-jobfind-store.tsx`
- Create: `src/hooks/use-today-tasks.ts`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/page-header.tsx`
- Create: `src/components/dashboard/stats-summary.tsx`
- Create: `src/components/dashboard/today-tasks.tsx`
- Create: `src/components/dashboard/risk-radar.tsx`
- Create: `src/components/dashboard/mini-kanban.tsx`
- Create: `src/components/dashboard/funnel-chart.tsx`
- Create: `src/components/board/kanban-board.tsx`
- Create: `src/components/board/kanban-column.tsx`
- Create: `src/components/board/job-card.tsx`
- Create: `src/components/job-detail/job-detail-sheet.tsx`
- Create: `src/components/job-detail/job-info-section.tsx`
- Create: `src/components/job-detail/job-timeline.tsx`
- Create: `src/components/job-detail/job-materials.tsx`
- Create: `src/components/job-detail/job-ai-panel.tsx`
- Create: `src/components/job-detail/job-interview-notes.tsx`
- Create: `src/components/ai/jd-parser-dialog.tsx`
- Create: `src/components/ai/jd-parser-result.tsx`
- Create via shadcn CLI: `src/components/ui/badge.tsx`
- Create via shadcn CLI: `src/components/ui/button.tsx`
- Create via shadcn CLI: `src/components/ui/card.tsx`
- Create via shadcn CLI: `src/components/ui/dialog.tsx`
- Create via shadcn CLI: `src/components/ui/progress.tsx`
- Create via shadcn CLI: `src/components/ui/scroll-area.tsx`
- Create via shadcn CLI: `src/components/ui/separator.tsx`
- Create via shadcn CLI: `src/components/ui/sheet.tsx`
- Create via shadcn CLI: `src/components/ui/sidebar.tsx`
- Create via shadcn CLI: `src/components/ui/sonner.tsx`
- Create via shadcn CLI: `src/components/ui/tabs.tsx`
- Create via shadcn CLI: `src/components/ui/textarea.tsx`
- Create via shadcn CLI: `src/components/ui/tooltip.tsx`

## 3. Task Breakdown

### Task 1: Project Scaffold

**Files:**

- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `components.json`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create package manifest**

Create `package.json` with these scripts and dependencies:

```json
{
  "name": "jobfind",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.3.0",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.0.0",
    "tw-animate-css": "^1.2.4",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```powershell
npm install
```

Expected: `node_modules` and `package-lock.json` are created without dependency resolution errors.

- [ ] **Step 3: Add TypeScript and Next config**

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Create `eslint.config.mjs`:

```js
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [...nextVitals];

export default eslintConfig;
```

- [ ] **Step 4: Add shadcn config**

Create `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 5: Add initial app files**

Create `src/app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221 83% 53%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221 83% 53%;
  --radius: 0.5rem;
}

* {
  border-color: hsl(var(--border));
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: Arial, Helvetica, sans-serif;
}
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobFind",
  description: "学生的 AI 求职项目经理",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
export default function HomePage() {
  return <main>JobFind 初始化完成</main>;
}
```

- [ ] **Step 6: Verify scaffold**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both commands complete successfully.

If this workspace is a git repository by implementation time, commit:

```powershell
git add package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs components.json src
git commit -m "chore: scaffold JobFind app"
```

If it is still not a git repository, record "not a git repository" in the implementation notes and continue.

### Task 2: Install shadcn Components

**Files:**

- Create: `src/components/ui/*`
- Modify: `src/app/globals.css`
- Modify: `src/lib/utils.ts`

- [ ] **Step 1: Create utility helper**

Create `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Run shadcn add command**

Run:

```powershell
npx shadcn@latest add badge button card dialog progress scroll-area separator sheet sidebar sonner tabs textarea tooltip
```

Expected: the command creates the listed files under `src/components/ui`.

- [ ] **Step 3: Verify imports**

Run:

```powershell
npm run typecheck
```

Expected: TypeScript resolves `@/components/ui/*` and `@/lib/utils`.

Commit if git is available:

```powershell
git add src/components/ui src/lib/utils.ts src/app/globals.css components.json package.json package-lock.json
git commit -m "chore: add shadcn components"
```

### Task 3: Types, Mock Data, And Rule Engine Tests

**Files:**

- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/lib/types.ts`
- Create: `src/lib/mock-data.ts`
- Create: `src/lib/rules-engine.ts`
- Create: `src/lib/rules-engine.test.ts`

- [ ] **Step 1: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Define data model**

Create `src/lib/types.ts` with the JobFind Stage 1 types:

```ts
export type JobStage =
  | "interested"
  | "to_apply"
  | "applied"
  | "written_test"
  | "interviewing"
  | "offer"
  | "rejected";

export type JobType = "campus" | "intern" | "management_trainee" | "social";
export type RecruitBatch = "autumn" | "spring" | "supplementary" | "summer_intern" | "daily_intern";
export type SourceChannel =
  | "official_site"
  | "boss"
  | "shixiseng"
  | "nowcoder"
  | "school_career"
  | "referral"
  | "campus_talk";
export type RiskLevel = "critical" | "warning" | "normal";
export type MaterialType = "resume" | "portfolio" | "transcript" | "certificate" | "cover_letter" | "other";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskActionType =
  | "submit_application"
  | "bind_material"
  | "prepare_interview"
  | "follow_up"
  | "take_test"
  | "update_material"
  | "review_interview";

export interface RiskTag {
  type: "deadline" | "material_gap" | "silence" | "interview_prep";
  level: RiskLevel;
  message: string;
}

export interface AISuggestion {
  id: string;
  action: string;
  reason: string;
  priority: TaskPriority;
  actionType: TaskActionType;
  completed: boolean;
}

export interface TimelineEvent {
  date: string;
  stage: JobStage;
  description: string;
}

export interface InterviewNote {
  round: string;
  date: string;
  questions: string[];
  reflection: string;
  result: "passed" | "failed" | "pending";
}

export interface Job {
  id: string;
  company: string;
  position: string;
  jobType: JobType;
  batch: RecruitBatch;
  channel: SourceChannel;
  stage: JobStage;
  applicationDeadline: string | null;
  writtenTestDate: string | null;
  interviewDate: string | null;
  appliedDate: string | null;
  jdText: string;
  keywords: string[];
  requirements: string[];
  requiredMaterials: MaterialType[];
  boundMaterialIds: string[];
  contactName: string | null;
  contactInfo: string | null;
  timeline: TimelineEvent[];
  interviewNotes: InterviewNote[];
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  targetDirection: string;
  version: string;
  lastUpdated: string;
  boundJobIds: string[];
}

export interface TodayTask {
  id: string;
  jobId: string;
  company: string;
  position: string;
  action: string;
  reason: string;
  priority: TaskPriority;
  actionType: TaskActionType;
  completed: boolean;
  score: number;
}

export interface FunnelData {
  interested: number;
  toApply: number;
  applied: number;
  writtenTest: number;
  interviewing: number;
  offer: number;
  rejected: number;
}
```

- [ ] **Step 3: Write failing rule-engine tests**

Create `src/lib/rules-engine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Job, Material } from "./types";
import {
  calculateFunnelData,
  calculateMaterialCompleteness,
  generateRiskTags,
  generateTodayTasks,
} from "./rules-engine";

const now = new Date("2026-04-19T08:00:00+08:00");

const materials: Material[] = [
  {
    id: "resume-pm",
    name: "产品经理简历",
    type: "resume",
    targetDirection: "产品经理",
    version: "v2.3",
    lastUpdated: "2026-04-01",
    boundJobIds: ["tencent"],
  },
  {
    id: "portfolio-ai",
    name: "AI 产品作品集",
    type: "portfolio",
    targetDirection: "产品经理",
    version: "v1.2",
    lastUpdated: "2026-04-10",
    boundJobIds: [],
  },
];

const baseJob: Job = {
  id: "tencent",
  company: "腾讯",
  position: "产品策划实习",
  jobType: "intern",
  batch: "daily_intern",
  channel: "official_site",
  stage: "applied",
  applicationDeadline: "2026-04-19T23:59:00+08:00",
  writtenTestDate: null,
  interviewDate: null,
  appliedDate: "2026-04-18T10:00:00+08:00",
  jdText: "负责产品策划和用户研究。",
  keywords: ["产品策划", "用户研究"],
  requirements: ["能独立完成竞品分析"],
  requiredMaterials: ["resume", "portfolio"],
  boundMaterialIds: ["resume-pm"],
  contactName: "校园招聘组",
  contactInfo: "campus@example.com",
  timeline: [],
  interviewNotes: [],
  createdAt: "2026-04-18T10:00:00+08:00",
  updatedAt: "2026-04-18T10:00:00+08:00",
};

describe("rules-engine", () => {
  it("detects critical deadline and missing material risk", () => {
    const risks = generateRiskTags(baseJob, materials, now);
    expect(risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "deadline", level: "critical" }),
        expect.objectContaining({ type: "material_gap", level: "warning" }),
      ]),
    );
  });

  it("calculates material completeness", () => {
    expect(calculateMaterialCompleteness(baseJob, materials)).toEqual({
      percentage: 50,
      missing: ["portfolio"],
    });
  });

  it("generates sorted today tasks from risks", () => {
    const tasks = generateTodayTasks([baseJob], materials, now);
    expect(tasks[0]).toMatchObject({
      jobId: "tencent",
      priority: "urgent",
      actionType: "submit_application",
    });
    expect(tasks.some((task) => task.actionType === "bind_material")).toBe(true);
  });

  it("calculates funnel data by stage", () => {
    expect(calculateFunnelData([baseJob])).toMatchObject({
      applied: 1,
      offer: 0,
      rejected: 0,
    });
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run:

```powershell
npm run test
```

Expected: FAIL because `rules-engine.ts` does not exist or exported functions are missing.

- [ ] **Step 5: Implement rule engine**

Create `src/lib/rules-engine.ts`:

```ts
import type { FunnelData, Job, Material, MaterialType, RiskTag, TaskPriority, TodayTask } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function hoursUntil(date: string, now: Date) {
  return (new Date(date).getTime() - now.getTime()) / (60 * 60 * 1000);
}

function daysSince(date: string, now: Date) {
  return Math.floor((now.getTime() - new Date(date).getTime()) / DAY_MS);
}

function materialNames(types: MaterialType[], materials: Material[]) {
  return types.map((type) => materials.find((material) => material.type === type)?.name ?? type);
}

export function calculateMaterialCompleteness(job: Job, materials: Material[]) {
  if (job.requiredMaterials.length === 0) {
    return { percentage: 100, missing: [] as MaterialType[] };
  }

  const boundTypes = new Set(
    job.boundMaterialIds
      .map((id) => materials.find((material) => material.id === id)?.type)
      .filter(Boolean),
  );
  const missing = job.requiredMaterials.filter((type) => !boundTypes.has(type));
  const percentage = Math.round(((job.requiredMaterials.length - missing.length) / job.requiredMaterials.length) * 100);

  return { percentage, missing };
}

export function generateRiskTags(job: Job, materials: Material[], now = new Date()): RiskTag[] {
  const risks: RiskTag[] = [];
  const deadlineStages = new Set<Job["stage"]>(["interested", "to_apply", "applied"]);

  if (job.applicationDeadline && deadlineStages.has(job.stage)) {
    const hours = hoursUntil(job.applicationDeadline, now);
    if (hours >= 0 && hours <= 24) {
      risks.push({ type: "deadline", level: "critical", message: `网申截止还剩 ${Math.max(1, Math.ceil(hours))} 小时` });
    } else if (hours > 24 && hours <= 72) {
      risks.push({ type: "deadline", level: "warning", message: `网申截止还剩 ${Math.ceil(hours / 24)} 天` });
    }
  }

  const materialState = calculateMaterialCompleteness(job, materials);
  if (materialState.missing.length > 0) {
    risks.push({
      type: "material_gap",
      level: "warning",
      message: `缺少 ${materialState.missing.length} 份材料：${materialNames(materialState.missing, materials).join("、")}`,
    });
  }

  if (job.stage === "interviewing" && job.interviewDate) {
    const hours = hoursUntil(job.interviewDate, now);
    if (hours >= 0 && hours <= 72) {
      risks.push({ type: "interview_prep", level: "critical", message: `面试还剩 ${Math.max(1, Math.ceil(hours / 24))} 天` });
    }
  }

  if (job.stage === "applied" && job.appliedDate) {
    const days = daysSince(job.appliedDate, now);
    if (days >= 10) {
      risks.push({ type: "silence", level: "warning", message: `已投递 ${days} 天无反馈` });
    }
  }

  return risks;
}

function priorityFromScore(score: number): TaskPriority {
  if (score >= 130) return "urgent";
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export function generateTodayTasks(jobs: Job[], materials: Material[], now = new Date()): TodayTask[] {
  const tasks = jobs.flatMap((job) => {
    const risks = generateRiskTags(job, materials, now);
    return risks.map((risk, index): TodayTask => {
      const baseScore = risk.level === "critical" ? 100 : 50;
      const deadlineBoost = risk.type === "deadline" ? 50 : 0;
      const interviewBoost = risk.type === "interview_prep" ? 30 : 0;
      const score = baseScore + deadlineBoost + interviewBoost;
      const actionType =
        risk.type === "deadline"
          ? "submit_application"
          : risk.type === "material_gap"
            ? "bind_material"
            : risk.type === "interview_prep"
              ? "prepare_interview"
              : "follow_up";
      const action =
        actionType === "submit_application"
          ? `立即处理 ${job.company}${job.position} 的网申截止`
          : actionType === "bind_material"
            ? `为 ${job.company}${job.position} 补齐材料`
            : actionType === "prepare_interview"
              ? `准备 ${job.company}${job.position} 面试`
              : `跟进 ${job.company}${job.position} HR`;

      return {
        id: `${job.id}-${risk.type}-${index}`,
        jobId: job.id,
        company: job.company,
        position: job.position,
        action,
        reason: risk.message,
        priority: priorityFromScore(score),
        actionType,
        completed: false,
        score,
      };
    });
  });

  return tasks.sort((a, b) => b.score - a.score).slice(0, 5);
}

export function calculateFunnelData(jobs: Job[]): FunnelData {
  return jobs.reduce<FunnelData>(
    (data, job) => {
      const key = job.stage === "to_apply" ? "toApply" : job.stage === "written_test" ? "writtenTest" : job.stage;
      data[key] += 1;
      return data;
    },
    { interested: 0, toApply: 0, applied: 0, writtenTest: 0, interviewing: 0, offer: 0, rejected: 0 },
  );
}
```

- [ ] **Step 6: Verify rule engine**

Run:

```powershell
npm run test
npm run typecheck
```

Expected: tests pass and TypeScript passes.

Commit if git is available:

```powershell
git add vitest.config.ts src/test src/lib/types.ts src/lib/rules-engine.ts src/lib/rules-engine.test.ts
git commit -m "feat: add JobFind rule engine"
```

### Task 4: Mock Data And Local Storage

**Files:**

- Create: `src/lib/mock-data.ts`
- Create: `src/lib/storage.ts`
- Create: `src/hooks/use-jobfind-store.tsx`
- Create: `src/hooks/use-today-tasks.ts`

- [ ] **Step 1: Implement mock data factory**

Create `src/lib/mock-data.ts` exporting:

```ts
import type { Job, Material } from "./types";

function addDays(days: number, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

export const sampleJD = `公司：B站
岗位：AI 产品实习生
截止时间：3 天后 23:59
岗位要求：理解推荐系统、内容社区、用户增长；能完成竞品分析和需求文档。
材料要求：产品经理简历、AI 产品作品集。`;

export function createMockMaterials(): Material[] {
  return [
    { id: "resume-pm", name: "产品经理简历", type: "resume", targetDirection: "产品经理", version: "v2.3", lastUpdated: daysAgo(7), boundJobIds: ["tencent", "bytedance", "meituan", "alibaba", "kuaishou"] },
    { id: "resume-ops", name: "运营方向简历", type: "resume", targetDirection: "产品运营", version: "v1.8", lastUpdated: daysAgo(10), boundJobIds: ["xiaohongshu", "jd"] },
    { id: "portfolio-ai", name: "AI 产品作品集", type: "portfolio", targetDirection: "产品经理", version: "v1.2", lastUpdated: daysAgo(5), boundJobIds: ["bytedance"] },
    { id: "transcript", name: "本科成绩单", type: "transcript", targetDirection: "通用", version: "2025 春", lastUpdated: daysAgo(20), boundJobIds: ["tencent", "alibaba"] },
    { id: "portfolio-game", name: "游戏策划作品集", type: "portfolio", targetDirection: "游戏策划", version: "v1.0", lastUpdated: daysAgo(14), boundJobIds: ["netease"] },
    { id: "cet6", name: "CET-6 证书", type: "certificate", targetDirection: "通用", version: "2025", lastUpdated: daysAgo(90), boundJobIds: ["meituan"] },
  ];
}

export function createMockJobs(): Job[] {
  return [
    {
      id: "tencent",
      company: "腾讯",
      position: "产品策划实习",
      jobType: "intern",
      batch: "daily_intern",
      channel: "official_site",
      stage: "applied",
      applicationDeadline: addDays(0, 23),
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: daysAgo(1),
      jdText: "参与内容产品策划、用户研究和需求分析，要求提交产品经理简历、成绩单和作品集。",
      keywords: ["内容产品", "用户研究", "需求分析"],
      requirements: ["能独立完成竞品分析", "熟悉内容社区产品", "有作品集"],
      requiredMaterials: ["resume", "portfolio", "transcript"],
      boundMaterialIds: ["resume-pm", "transcript"],
      contactName: "校园招聘组",
      contactInfo: "campus@tencent.com",
      timeline: [{ date: daysAgo(1), stage: "applied", description: "已提交网申，待补作品集。" }],
      interviewNotes: [],
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
    },
    {
      id: "bytedance",
      company: "字节跳动",
      position: "AI 产品经理实习",
      jobType: "intern",
      batch: "summer_intern",
      channel: "boss",
      stage: "interviewing",
      applicationDeadline: null,
      writtenTestDate: null,
      interviewDate: addDays(1, 14),
      appliedDate: daysAgo(5),
      jdText: "负责 AI 推荐和增长方向产品调研，关注推荐系统、数据指标和用户增长。",
      keywords: ["AI 产品", "推荐系统", "用户增长"],
      requirements: ["理解推荐系统", "能拆解增长指标", "有 AI 产品作品集"],
      requiredMaterials: ["resume", "portfolio"],
      boundMaterialIds: ["resume-pm", "portfolio-ai"],
      contactName: "HR Fiona",
      contactInfo: "Boss 直聘",
      timeline: [{ date: daysAgo(5), stage: "applied", description: "通过 Boss 投递。" }, { date: daysAgo(1), stage: "interviewing", description: "收到一面邀请。" }],
      interviewNotes: [{ round: "一面", date: addDays(1, 14), questions: ["介绍一个推荐系统产品", "如何定义增长指标"], reflection: "准备推荐系统和用户增长案例。", result: "pending" }],
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
    {
      id: "xiaohongshu",
      company: "小红书",
      position: "产品运营实习",
      jobType: "intern",
      batch: "daily_intern",
      channel: "referral",
      stage: "applied",
      applicationDeadline: null,
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: daysAgo(12),
      jdText: "负责社区产品运营、用户增长活动和内容分析。",
      keywords: ["产品运营", "社区", "用户增长"],
      requirements: ["熟悉内容社区", "能做活动复盘"],
      requiredMaterials: ["resume"],
      boundMaterialIds: ["resume-ops"],
      contactName: "内推学姐",
      contactInfo: "微信",
      timeline: [{ date: daysAgo(12), stage: "applied", description: "通过内推投递，暂无反馈。" }],
      interviewNotes: [],
      createdAt: daysAgo(12),
      updatedAt: daysAgo(12),
    },
    {
      id: "meituan",
      company: "美团",
      position: "产品经理（校招）",
      jobType: "campus",
      batch: "spring",
      channel: "nowcoder",
      stage: "written_test",
      applicationDeadline: null,
      writtenTestDate: daysAgo(1),
      interviewDate: null,
      appliedDate: daysAgo(8),
      jdText: "面向本地生活业务，负责需求分析、数据复盘和产品方案推进。",
      keywords: ["本地生活", "数据复盘", "产品方案"],
      requirements: ["通过笔试", "准备业务理解和指标拆解"],
      requiredMaterials: ["resume", "certificate"],
      boundMaterialIds: ["resume-pm", "cet6"],
      contactName: "美团校招助手",
      contactInfo: "nowcoder",
      timeline: [
        { date: daysAgo(8), stage: "applied", description: "通过牛客投递校招岗位。" },
        { date: daysAgo(1), stage: "written_test", description: "笔试已通过，等待面试通知。" },
      ],
      interviewNotes: [],
      createdAt: daysAgo(8),
      updatedAt: daysAgo(1),
    },
    {
      id: "alibaba",
      company: "阿里巴巴",
      position: "产品实习",
      jobType: "intern",
      batch: "daily_intern",
      channel: "school_career",
      stage: "interested",
      applicationDeadline: addDays(5, 23),
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: null,
      jdText: "参与商家工具产品调研，支持需求收集、竞品分析和数据看板设计。",
      keywords: ["商家工具", "竞品分析", "数据看板"],
      requirements: ["熟悉 B 端产品", "能输出结构化需求文档"],
      requiredMaterials: ["resume", "transcript"],
      boundMaterialIds: ["resume-pm", "transcript"],
      contactName: "学校就业网",
      contactInfo: "career.alumni.example",
      timeline: [{ date: daysAgo(2), stage: "interested", description: "从学校就业网收藏岗位，尚未投递。" }],
      interviewNotes: [],
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: "netease",
      company: "网易",
      position: "游戏策划实习",
      jobType: "intern",
      batch: "summer_intern",
      channel: "campus_talk",
      stage: "offer",
      applicationDeadline: null,
      writtenTestDate: daysAgo(9),
      interviewDate: daysAgo(3),
      appliedDate: daysAgo(18),
      jdText: "参与玩法设计、用户反馈分析和版本活动策划。",
      keywords: ["游戏策划", "玩法设计", "版本活动"],
      requirements: ["有游戏策划作品集", "熟悉至少一类长线运营游戏"],
      requiredMaterials: ["resume", "portfolio"],
      boundMaterialIds: ["resume-pm", "portfolio-game"],
      contactName: "宣讲会 HR",
      contactInfo: "校园宣讲会",
      timeline: [
        { date: daysAgo(18), stage: "applied", description: "宣讲会现场投递。" },
        { date: daysAgo(9), stage: "written_test", description: "完成策划笔试。" },
        { date: daysAgo(3), stage: "interviewing", description: "完成业务面试。" },
        { date: daysAgo(1), stage: "offer", description: "收到 Offer，待确认。" },
      ],
      interviewNotes: [{ round: "业务面", date: daysAgo(3), questions: ["拆解一款常玩的游戏活动", "如何评估活动留存"], reflection: "活动指标回答较完整。", result: "passed" }],
      createdAt: daysAgo(18),
      updatedAt: daysAgo(1),
    },
    {
      id: "jd",
      company: "京东",
      position: "产品运营",
      jobType: "campus",
      batch: "spring",
      channel: "official_site",
      stage: "rejected",
      applicationDeadline: null,
      writtenTestDate: daysAgo(14),
      interviewDate: null,
      appliedDate: daysAgo(24),
      jdText: "负责电商产品运营、活动复盘和用户增长策略。",
      keywords: ["电商运营", "活动复盘", "用户增长"],
      requirements: ["熟悉电商运营", "有数据分析经验"],
      requiredMaterials: ["resume"],
      boundMaterialIds: ["resume-ops"],
      contactName: "京东校招系统",
      contactInfo: "official_site",
      timeline: [
        { date: daysAgo(24), stage: "applied", description: "官网投递。" },
        { date: daysAgo(14), stage: "written_test", description: "完成测评。" },
        { date: daysAgo(5), stage: "rejected", description: "收到流程结束通知，归档复盘。" },
      ],
      interviewNotes: [],
      createdAt: daysAgo(24),
      updatedAt: daysAgo(5),
    },
    {
      id: "kuaishou",
      company: "快手",
      position: "产品经理实习",
      jobType: "intern",
      batch: "daily_intern",
      channel: "shixiseng",
      stage: "to_apply",
      applicationDeadline: addDays(7, 23),
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: null,
      jdText: "负责短视频社区产品体验优化，支持用户调研、需求分析和实验复盘。",
      keywords: ["短视频", "用户调研", "实验复盘"],
      requirements: ["熟悉短视频社区", "能完成用户访谈和需求分析"],
      requiredMaterials: ["resume", "portfolio"],
      boundMaterialIds: ["resume-pm", "portfolio-ai"],
      contactName: "实习僧投递入口",
      contactInfo: "shixiseng",
      timeline: [{ date: daysAgo(1), stage: "to_apply", description: "已整理材料，待投递。" }],
      interviewNotes: [],
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ];
}
```

- [ ] **Step 2: Implement storage wrapper**

Create `src/lib/storage.ts`:

```ts
import type { Job, Material } from "./types";

const JOBS_KEY = "jobfind.jobs";
const MATERIALS_KEY = "jobfind.materials";
const COMPLETED_TASKS_KEY = "jobfind.completedTasks";

export function loadJobs() {
  return loadJson<Job[]>(JOBS_KEY);
}

export function saveJobs(jobs: Job[]) {
  saveJson(JOBS_KEY, jobs);
}

export function loadMaterials() {
  return loadJson<Material[]>(MATERIALS_KEY);
}

export function saveMaterials(materials: Material[]) {
  saveJson(MATERIALS_KEY, materials);
}

export function loadCompletedTaskIds() {
  return loadJson<string[]>(COMPLETED_TASKS_KEY) ?? [];
}

export function saveCompletedTaskIds(ids: string[]) {
  saveJson(COMPLETED_TASKS_KEY, ids);
}

function loadJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function saveJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
```

- [ ] **Step 3: Implement store provider**

Create `src/hooks/use-jobfind-store.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createMockJobs, createMockMaterials } from "@/lib/mock-data";
import { loadCompletedTaskIds, loadJobs, loadMaterials, saveCompletedTaskIds, saveJobs, saveMaterials } from "@/lib/storage";
import type { Job, JobStage, Material } from "@/lib/types";

interface JobFindStore {
  jobs: Job[];
  materials: Material[];
  selectedJobId: string | null;
  isJDParserOpen: boolean;
  completedTaskIds: string[];
  selectedJob: Job | null;
  setSelectedJobId: (id: string | null) => void;
  setJDParserOpen: (open: boolean) => void;
  addJob: (job: Job) => void;
  advanceJobStage: (jobId: string, stage: JobStage) => void;
  markTaskComplete: (taskId: string) => void;
}

const JobFindContext = createContext<JobFindStore | null>(null);

export function JobFindProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isJDParserOpen, setJDParserOpen] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    setJobs(loadJobs() ?? createMockJobs());
    setMaterials(loadMaterials() ?? createMockMaterials());
    setCompletedTaskIds(loadCompletedTaskIds());
  }, []);

  useEffect(() => {
    if (jobs.length > 0) saveJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    if (materials.length > 0) saveMaterials(materials);
  }, [materials]);

  useEffect(() => {
    saveCompletedTaskIds(completedTaskIds);
  }, [completedTaskIds]);

  const value = useMemo<JobFindStore>(() => {
    const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;
    return {
      jobs,
      materials,
      selectedJobId,
      isJDParserOpen,
      completedTaskIds,
      selectedJob,
      setSelectedJobId,
      setJDParserOpen,
      addJob: (job) => setJobs((current) => [job, ...current]),
      advanceJobStage: (jobId, stage) =>
        setJobs((current) =>
          current.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  stage,
                  updatedAt: new Date().toISOString(),
                  timeline: [{ date: new Date().toISOString(), stage, description: `推进到 ${stage}` }, ...job.timeline],
                }
              : job,
          ),
        ),
      markTaskComplete: (taskId) => setCompletedTaskIds((current) => Array.from(new Set([...current, taskId]))),
    };
  }, [completedTaskIds, isJDParserOpen, jobs, materials, selectedJobId]);

  return <JobFindContext.Provider value={value}>{children}</JobFindContext.Provider>;
}

export function useJobFindStore() {
  const context = useContext(JobFindContext);
  if (!context) {
    throw new Error("useJobFindStore must be used inside JobFindProvider");
  }
  return context;
}
```

- [ ] **Step 4: Implement today tasks hook**

Create `src/hooks/use-today-tasks.ts`:

```ts
import { generateTodayTasks } from "@/lib/rules-engine";
import { useJobFindStore } from "./use-jobfind-store";

export function useTodayTasks() {
  const { jobs, materials, completedTaskIds } = useJobFindStore();
  return generateTodayTasks(jobs, materials).map((task) => ({
    ...task,
    completed: completedTaskIds.includes(task.id),
  }));
}
```

- [ ] **Step 5: Wrap app with provider**

Modify `src/app/layout.tsx` so it uses `JobFindProvider`:

```tsx
import type { Metadata } from "next";
import { JobFindProvider } from "@/hooks/use-jobfind-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobFind",
  description: "学生的 AI 求职项目经理",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <JobFindProvider>{children}</JobFindProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify data layer**

Run:

```powershell
npm run test
npm run typecheck
```

Expected: tests and typecheck pass.

Commit if git is available:

```powershell
git add src/lib/mock-data.ts src/lib/storage.ts src/hooks src/app/layout.tsx
git commit -m "feat: add JobFind local state"
```

### Task 5: Layout And Navigation

**Files:**

- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/page-header.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create page header**

Create `src/components/layout/page-header.tsx`:

```tsx
export function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-blue-600">JobFind</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
```

- [ ] **Step 2: Create sidebar**

Create `src/components/layout/app-sidebar.tsx`:

```tsx
import Link from "next/link";
import { BriefcaseBusiness, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/", label: "今日作战台", icon: LayoutDashboard },
  { href: "/board", label: "申请看板", icon: BriefcaseBusiness },
];

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-white px-4 py-5">
      <div className="rounded-lg border p-4">
        <p className="text-sm font-semibold text-blue-600">JobFind</p>
        <p className="mt-1 text-xs text-muted-foreground">学生的 AI 求职项目经理</p>
      </div>
      <nav className="mt-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Update root layout shell**

Modify `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { JobFindProvider } from "@/hooks/use-jobfind-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobFind",
  description: "学生的 AI 求职项目经理",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <JobFindProvider>
          <AppSidebar />
          <main className="min-h-screen bg-slate-50 pl-64">
            <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
          </main>
          <Toaster richColors />
        </JobFindProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify layout**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both pass.

Commit if git is available:

```powershell
git add src/app/layout.tsx src/components/layout
git commit -m "feat: add app layout"
```

### Task 6: Dashboard

**Files:**

- Create: `src/components/dashboard/stats-summary.tsx`
- Create: `src/components/dashboard/today-tasks.tsx`
- Create: `src/components/dashboard/risk-radar.tsx`
- Create: `src/components/dashboard/mini-kanban.tsx`
- Create: `src/components/dashboard/funnel-chart.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create dashboard components**

Implement:

- `StatsSummary`: computes weekly application count, pending task count, high-risk job count, upcoming interview count.
- `TodayTasks`: renders `useTodayTasks()` and calls `markTaskComplete`.
- `RiskRadar`: flattens `generateRiskTags(job, materials)` for all jobs.
- `MiniKanban`: groups jobs by stage and shows counts.
- `FunnelChart`: uses `calculateFunnelData(jobs)` to render horizontal bars.

Use these UI primitives:

- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Badge`
- `Button`
- `Progress`

- [ ] **Step 2: Assemble dashboard page**

Modify `src/app/page.tsx`:

```tsx
"use client";

import { PageHeader } from "@/components/layout/page-header";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { MiniKanban } from "@/components/dashboard/mini-kanban";
import { RiskRadar } from "@/components/dashboard/risk-radar";
import { StatsSummary } from "@/components/dashboard/stats-summary";
import { TodayTasks } from "@/components/dashboard/today-tasks";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="今日求职作战台"
        description="Agent 已读取你的申请池，优先提醒 DDL、材料缺口、面试准备和长期无反馈事项。"
      />
      <StatsSummary />
      <section className="grid grid-cols-[1fr_1.3fr_1fr] gap-4">
        <TodayTasks />
        <MiniKanban />
        <RiskRadar />
      </section>
      <FunnelChart />
    </div>
  );
}
```

- [ ] **Step 3: Verify dashboard acceptance**

Run:

```powershell
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000`.

Expected:

- The dashboard displays today's tasks, risk radar, and stage distribution.
- Tencent, ByteDance, and Xiaohongshu risks are visible.
- Marking a task complete changes its visual state.

Commit if git is available:

```powershell
git add src/app/page.tsx src/components/dashboard
git commit -m "feat: build dashboard workbench"
```

### Task 7: Board And Job Cards

**Files:**

- Create: `src/app/board/page.tsx`
- Create: `src/components/board/kanban-board.tsx`
- Create: `src/components/board/kanban-column.tsx`
- Create: `src/components/board/job-card.tsx`

- [ ] **Step 1: Implement board components**

Component responsibilities:

- `KanbanBoard`: renders seven columns in the order from the approved spec.
- `KanbanColumn`: receives `stage`, `title`, and `jobs`.
- `JobCard`: shows company, position, DDL, risk badges, material completeness, and calls `setSelectedJobId(job.id)` when clicked.

Use `calculateMaterialCompleteness` and `generateRiskTags` inside `JobCard`.

- [ ] **Step 2: Assemble board page**

Create `src/app/board/page.tsx`:

```tsx
"use client";

import { JDParserDialog } from "@/components/ai/jd-parser-dialog";
import { KanbanBoard } from "@/components/board/kanban-board";
import { JobDetailSheet } from "@/components/job-detail/job-detail-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useJobFindStore } from "@/hooks/use-jobfind-store";

export default function BoardPage() {
  const { setJDParserOpen } = useJobFindStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="申请看板"
        description="按阶段查看所有岗位。首版不做拖拽，先保证详情、风险和 Agent 建议可演示。"
        action={<Button onClick={() => setJDParserOpen(true)}>粘贴 JD 添加岗位</Button>}
      />
      <KanbanBoard />
      <JobDetailSheet />
      <JDParserDialog />
    </div>
  );
}
```

- [ ] **Step 3: Verify board acceptance**

Run:

```powershell
npm run typecheck
npm run build
```

Open `http://localhost:3000/board`.

Expected:

- 8 job cards appear across seven stages.
- Cards show company, position, risk tags, and material completeness.
- Clicking a card sets selected job state. The sheet can remain empty until Task 8.

Commit if git is available:

```powershell
git add src/app/board src/components/board
git commit -m "feat: build application board"
```

### Task 8: Job Detail Sheet

**Files:**

- Create: `src/components/job-detail/job-detail-sheet.tsx`
- Create: `src/components/job-detail/job-info-section.tsx`
- Create: `src/components/job-detail/job-timeline.tsx`
- Create: `src/components/job-detail/job-materials.tsx`
- Create: `src/components/job-detail/job-ai-panel.tsx`
- Create: `src/components/job-detail/job-interview-notes.tsx`

- [ ] **Step 1: Implement detail sections**

Component responsibilities:

- `JobInfoSection`: renders JD, keywords, requirements, contact.
- `JobTimeline`: renders timeline events with separators.
- `JobMaterials`: renders required materials, bound materials, missing materials, and completeness.
- `JobAIPanel`: renders tasks and suggestions for the selected job from generated risks.
- `JobInterviewNotes`: renders interview notes; shows an empty state when none exist.

- [ ] **Step 2: Implement sheet container**

Create `src/components/job-detail/job-detail-sheet.tsx` using `Sheet` and `Tabs`.

Required behavior:

- Open when `selectedJob` is not null.
- Close by setting `selectedJobId` to null.
- Show stage badge in header.
- Include a simple stage-advance button group in the footer.

- [ ] **Step 3: Verify detail acceptance**

Run:

```powershell
npm run typecheck
npm run build
```

Open `http://localhost:3000/board` and click the Tencent card.

Expected:

- Right-side detail sheet opens.
- Basic info, timeline, materials, AI suggestions, and interview notes tabs exist.
- Tencent materials tab shows portfolio missing.
- AI tab shows action, reason, priority, and confirmable next step.

Commit if git is available:

```powershell
git add src/components/job-detail
git commit -m "feat: add job detail sheet"
```

### Task 9: JD Parsing Flow

**Files:**

- Create: `src/components/ai/jd-parser-dialog.tsx`
- Create: `src/components/ai/jd-parser-result.tsx`
- Modify: `src/lib/mock-data.ts`

- [ ] **Step 1: Implement parser result**

Create `JDParserResult` to preview:

- Company: B站.
- Position: AI 产品实习生.
- Stage: to_apply.
- DDL: 3 days from now.
- Keywords: 推荐系统, 内容社区, 用户增长.
- Required materials: resume, portfolio.
- Next action: 保存到看板后补齐 AI 产品作品集.

- [ ] **Step 2: Implement parser dialog**

Create `JDParserDialog` with three states:

- `input`
- `parsing`
- `preview`

Required behavior:

- Textarea defaults to `sampleJD`.
- Clicking "解析 JD" enters `parsing` for 800ms.
- Preview state shows `JDParserResult`.
- Clicking "保存到看板" creates a new `Job`, calls `addJob`, closes the dialog, and shows `toast.success("岗位已添加到看板")`.

- [ ] **Step 3: Verify JD parsing acceptance**

Run:

```powershell
npm run typecheck
npm run build
```

Open `http://localhost:3000/board`.

Expected:

- Clicking "粘贴 JD 添加岗位" opens the dialog.
- Clicking "解析 JD" shows a loading state and then a preview.
- Saving adds the B站 job to the board.
- Returning to dashboard includes the new job in task and risk calculations when applicable.

Commit if git is available:

```powershell
git add src/components/ai src/lib/mock-data.ts
git commit -m "feat: add JD parsing demo"
```

### Task 10: Final Polish And Verification

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/components/dashboard/stats-summary.tsx`
- Modify: `src/components/dashboard/today-tasks.tsx`
- Modify: `src/components/dashboard/risk-radar.tsx`
- Modify: `src/components/dashboard/mini-kanban.tsx`
- Modify: `src/components/dashboard/funnel-chart.tsx`
- Modify: `src/components/board/kanban-board.tsx`
- Modify: `src/components/board/kanban-column.tsx`
- Modify: `src/components/board/job-card.tsx`
- Modify: `src/components/job-detail/job-detail-sheet.tsx`
- Modify: `src/components/job-detail/job-info-section.tsx`
- Modify: `src/components/job-detail/job-timeline.tsx`
- Modify: `src/components/job-detail/job-materials.tsx`
- Modify: `src/components/job-detail/job-ai-panel.tsx`
- Modify: `src/components/job-detail/job-interview-notes.tsx`
- Modify: `src/components/ai/jd-parser-dialog.tsx`
- Modify: `src/components/ai/jd-parser-result.tsx`

- [ ] **Step 1: Polish copy and spacing**

Check all user-facing copy:

- It must be Chinese-first.
- It must not describe the UI itself.
- It must express Agent as diagnosing and planning, not auto-executing.

- [ ] **Step 2: Run automated verification**

Run:

```powershell
npm run test
npm run typecheck
npm run build
```

Expected:

- Tests pass.
- TypeScript passes.
- Next build succeeds.

- [ ] **Step 3: Run demo script manually**

Run:

```powershell
npm run dev
```

Open `http://localhost:3000` and verify:

1. Dashboard shows today's priority tasks, risk radar, and stage distribution.
2. Go to board.
3. Open Tencent detail.
4. Confirm Tencent has same-day DDL and missing portfolio.
5. Open JD parser.
6. Parse sample JD.
7. Save generated job.
8. Return to dashboard and confirm tasks/risk state updates.

- [ ] **Step 4: Final implementation notes**

Create an implementation summary in the final response with:

- Files changed.
- Verification commands and results.
- Known limitations: no backend, no real LLM, no drag-and-drop, no real file upload.

Commit if git is available:

```powershell
git add .
git commit -m "feat: complete JobFind core loop"
```

If git is not available, do not initialize it unless the user asks.

## 4. Spec Coverage Review

This plan covers the Stage 1 spec as follows:

- Dashboard workbench: Task 6.
- Application board: Task 7.
- Job detail sheet: Task 8.
- Rule-based Agent: Task 3 and Task 6/8 consumers.
- JD parsing dialog: Task 9.
- 8 jobs and 6 materials: Task 4.
- localStorage state: Task 4.
- Stage 1 non-goals: excluded from all tasks.

No task implements Stage 1.1 Agent deepening, Stage 1.2 full MVP completion, or Stage 2 LLM Agent upgrade.

## 5. Recommended Subagent Split

Use subagents only after the plan is approved and implementation begins.

Recommended ownership:

- Worker 1: data model, mock data, rule engine, storage, tests.
- Worker 2: dashboard and layout.
- Worker 3: board, job cards, detail sheet.
- Worker 4: JD parser and final integration.

Workers are not alone in the codebase. Each worker must avoid reverting changes made by others and must adjust to existing implementation when integrating.
