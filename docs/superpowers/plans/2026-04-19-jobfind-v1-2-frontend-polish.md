# JobFind v1.2 Frontend Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the existing JobFind v1.2 interface into a premium light command workspace without changing routes, information architecture, deterministic Agent logic, or product scope.

**Architecture:** Keep the current Next.js App Router structure and existing component responsibilities. Add a small reusable `AgentAvatar` component, copy the provided `AgentLogo.png` into `public`, and polish existing surfaces through Tailwind classes and global visual tokens. Behavioral changes are limited to fixed Agent brief copy required by the spec.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 4, shadcn/Radix UI primitives, Vitest, Testing Library, Playwright CLI for browser checks.

---

## File Structure

- Create: `public/agent/agent-logo.png`
  - Copied from `D:\projects\JobFind\AgentLogo.png`.
  - Used as the only Agent image asset.
- Create: `src/components/layout/agent-avatar.tsx`
  - Centralizes image cropping, rounded mask, and product-avatar presentation.
- Modify: `src/app/globals.css`
  - Defines warm ivory / soft white product canvas, subtle ambient background, border/ring/card tone, and reusable polish utility classes.
- Modify: `src/app/layout.tsx`
  - Applies the premium canvas and slightly wider product frame.
- Modify: `src/components/ui/card.tsx`
  - Keeps shared card radius within 8px and aligns default surfaces with the polish system.
- Modify: `src/components/layout/app-sidebar.tsx`
  - Adds Agent identity, more product-like active navigation, and calmer surface treatment.
- Modify: `src/components/layout/page-header.tsx`
  - Turns page headers into composed command-surface bands while preserving `title`, `description`, and `action`.
- Modify: `src/components/dashboard/today-tasks.tsx`
  - Main polish anchor. Adds Agent avatar, required main speech bubble, weaker judgment strip, and premium task list surface.
- Modify: `src/components/dashboard/stats-summary.tsx`
  - Makes metrics less template-like and more editorial.
- Modify: `src/components/dashboard/risk-radar.tsx`
  - Makes risk radar feel like a controlled briefing panel.
- Modify: `src/components/dashboard/mini-kanban.tsx`
  - Improves stage summary density and visual hierarchy.
- Modify: `src/components/dashboard/funnel-chart.tsx`
  - Polishes funnel rhythm without adding chart dependencies.
- Modify: `src/components/board/kanban-board.tsx`
  - Improves horizontal board reading and scroll affordance.
- Modify: `src/components/board/kanban-column.tsx`
  - Makes columns feel like workspace lanes rather than plain cards.
- Modify: `src/components/board/job-card.tsx`
  - Improves job card scan hierarchy, status, risk, and material completion treatment.
- Modify: `src/components/materials/material-card.tsx`
  - Makes material cards feel like curated assets with version, direction, freshness, and bound jobs.
- Modify: `src/components/materials/material-list.tsx`
  - Polishes Agent material dispatch summary.
- Modify: `src/app/materials/page.tsx`
  - Keeps route responsibility and benefits from shared page header.
- Modify: `src/components/review/agent-memory.tsx`
  - Makes Agent memory first-class and reflective.
- Modify: `src/components/review/channel-review.tsx`
  - Improves strategy review hierarchy.
- Modify: `src/components/review/interview-review.tsx`
  - Improves interview review readability and note hierarchy.
- Modify: `src/app/review/page.tsx`
  - Keeps review page structure and benefits from polished components.
- Test: `src/components/dashboard/today-tasks.test.tsx`
  - Locks the fixed Agent speech, weaker judgment copy, and AgentLogo asset source.
- Test: Existing page/component tests
  - Run after polish to ensure accessibility names, text content, and interactions still pass.

## Visual Thesis

JobFind should feel like a premium light command workspace for a student's job-search day: calm ivory canvas, graphite text, subtle fog-blue and powder-pink atmosphere, controlled editorial panels, and a clearly present Agent assistant.

## Interaction Thesis

- Use restrained hover transitions on task, job, material, and review units.
- Use stronger first-screen hierarchy through PageHeader plus Agent command surface.
- Avoid ornamental animation; polish comes from spacing, surfaces, alignment, and tonal control.

---

### Task 1: Lock Agent Command Acceptance Tests

**Files:**
- Modify: `src/components/dashboard/today-tasks.test.tsx`
- Create: `public/agent/agent-logo.png`

- [x] **Step 1: Copy the provided Agent image**

Run:

```powershell
New-Item -ItemType Directory -Force public\agent | Out-Null
Copy-Item -LiteralPath D:\projects\JobFind\AgentLogo.png -Destination public\agent\agent-logo.png -Force
```

Expected: `public/agent/agent-logo.png` exists and has the same file size as the source image.

- [x] **Step 2: Write the failing test**

Add these assertions to `src/components/dashboard/today-tasks.test.tsx`:

```tsx
expect(
  screen.getByText("JobFind-Agent 已按风险和时间窗口排好今日优先级，先处理最容易影响结果的动作！"),
).toBeInTheDocument();
expect(
  screen.getByText(
    "Agent 判断：为什么现在先做这件事：字节跳动 AI 产品经理实习生已经进入临近面试窗口，准备质量会直接影响下一轮。",
  ),
).toBeInTheDocument();
expect(screen.getByAltText("JobFind Agent")).toHaveAttribute("src", "/agent/agent-logo.png");
```

- [x] **Step 3: Run test to verify it fails**

Run:

```powershell
npm.cmd run test -- src/components/dashboard/today-tasks.test.tsx
```

Expected: FAIL because the current component still shows the old Agent explanation and no `JobFind Agent` image.

- [ ] **Step 4: Implement minimal code**

Create `src/components/layout/agent-avatar.tsx`:

```tsx
import React from "react";

import { cn } from "@/lib/utils";

type AgentAvatarProps = {
  className?: string;
  imageClassName?: string;
};

export function AgentAvatar({ className, imageClassName }: AgentAvatarProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-white/70 bg-[#f8f3ea]", className)}>
      <img
        src="/agent/agent-logo.png"
        alt="JobFind Agent"
        className={cn("h-full w-full object-cover object-[50%_28%]", imageClassName)}
      />
    </div>
  );
}
```

Update `src/components/dashboard/today-tasks.tsx` to render:

```tsx
const agentSpeech = "JobFind-Agent 已按风险和时间窗口排好今日优先级，先处理最容易影响结果的动作！";
const agentJudgment =
  "Agent 判断：为什么现在先做这件事：字节跳动 AI 产品经理实习生已经进入临近面试窗口，准备质量会直接影响下一轮。";
```

Then place `AgentAvatar`, `agentSpeech`, and `agentJudgment` above the task list.

- [ ] **Step 5: Run test to verify it passes**

Run:

```powershell
npm.cmd run test -- src/components/dashboard/today-tasks.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

Run:

```powershell
git add public/agent/agent-logo.png src/components/layout/agent-avatar.tsx src/components/dashboard/today-tasks.tsx src/components/dashboard/today-tasks.test.tsx
git commit -m "feat: polish agent command brief"
```

Expected: commit succeeds and only Task 1 files are included.

---

### Task 2: Establish Premium Light Visual System

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/ui/card.tsx`

- [ ] **Step 1: Update global tokens**

In `src/app/globals.css`, set root tokens toward:

```css
--background: oklch(0.975 0.015 82);
--foreground: oklch(0.215 0.025 258);
--card: oklch(0.992 0.007 85);
--primary: oklch(0.255 0.032 258);
--border: oklch(0.86 0.018 248);
--radius: 0.625rem;
```

Add broad background layers:

```css
body {
  background:
    linear-gradient(145deg, rgba(246, 241, 231, 0.96) 0%, rgba(250, 250, 247, 0.98) 42%, rgba(236, 243, 247, 0.78) 100%),
    linear-gradient(90deg, rgba(246, 224, 225, 0.22), rgba(232, 239, 248, 0.26));
}
```

Add reusable classes:

```css
.premium-surface { ... }
.editorial-panel { ... }
.quiet-strip { ... }
```

- [ ] **Step 2: Keep card radius within 8px**

In `src/components/ui/card.tsx`, change `rounded-xl` to `rounded-lg`.

- [ ] **Step 3: Update root layout frame**

In `src/app/layout.tsx`, remove the hard `bg-slate-50` body class and use:

```tsx
<div className="mx-auto flex min-h-screen w-full max-w-[90rem] flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
```

- [ ] **Step 4: Run smoke tests**

Run:

```powershell
npm.cmd run test -- src/app/layout.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

Run:

```powershell
git add src/app/globals.css src/app/layout.tsx src/components/ui/card.tsx
git commit -m "style: establish premium light visual system"
```

Expected: commit succeeds.

---

### Task 3: Polish Layout Shell and Page Header

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/layout/page-header.tsx`
- Test: `src/components/layout/app-sidebar.test.tsx`
- Test: `src/components/layout/page-header.test.tsx`

- [ ] **Step 1: Update sidebar**

Use `AgentAvatar` in the brand block, keep existing nav items and labels, and style active links with graphite background and champagne icon color.

Expected active link pattern:

```tsx
isActive
  ? "bg-slate-950 text-white shadow-[0_12px_28px_rgba(22,28,40,0.16)]"
  : "text-slate-600 hover:bg-white/72 hover:text-slate-950"
```

- [ ] **Step 2: Update page header**

Wrap the header with:

```tsx
<header className="premium-surface flex flex-col gap-4 rounded-lg px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
```

Keep `title`, `description`, and `action` behavior unchanged.

- [ ] **Step 3: Run layout tests**

Run:

```powershell
npm.cmd run test -- src/components/layout/app-sidebar.test.tsx src/components/layout/page-header.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit Task 3**

Run:

```powershell
git add src/components/layout/app-sidebar.tsx src/components/layout/page-header.tsx src/components/layout/agent-avatar.tsx
git commit -m "style: polish app shell and headers"
```

Expected: commit succeeds.

---

### Task 4: Polish Homepage Command Surface

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/dashboard/today-tasks.tsx`
- Modify: `src/components/dashboard/stats-summary.tsx`
- Modify: `src/components/dashboard/risk-radar.tsx`
- Modify: `src/components/dashboard/mini-kanban.tsx`
- Modify: `src/components/dashboard/funnel-chart.tsx`
- Test: `src/components/dashboard/today-tasks.test.tsx`

- [ ] **Step 1: Make `TodayTasks` the visual anchor**

Use a premium surface, Agent avatar, main speech bubble, weak `quiet-strip` insight strip, and keep existing task mapping:

```tsx
tasks.slice(0, 5).map((task, index) => ...)
```

Do not change `useTodayTasks`, `markTaskComplete`, priorities, or task completion behavior.

- [ ] **Step 2: Polish metric cards**

Use softer surfaces:

```tsx
<Card className="editorial-panel rounded-lg">
```

Use icon blocks with warm ivory / cool slate backgrounds and keep metric calculations unchanged.

- [ ] **Step 3: Polish risk radar**

Use muted brick red / amber risk surfaces. Keep `generateRiskTags` and sorting logic unchanged.

- [ ] **Step 4: Polish mini kanban and funnel**

Keep existing counts and labels. Change only panel treatment, spacing, bar colors, and mobile grid rhythm.

- [ ] **Step 5: Run homepage-related tests**

Run:

```powershell
npm.cmd run test -- src/components/dashboard/today-tasks.test.tsx src/components/dashboard/today-tasks.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

Run:

```powershell
git add src/app/page.tsx src/components/dashboard/today-tasks.tsx src/components/dashboard/stats-summary.tsx src/components/dashboard/risk-radar.tsx src/components/dashboard/mini-kanban.tsx src/components/dashboard/funnel-chart.tsx src/components/dashboard/today-tasks.test.tsx
git commit -m "style: polish today command surface"
```

Expected: commit succeeds.

---

### Task 5: Polish Board Workspace

**Files:**
- Modify: `src/app/board/page.tsx`
- Modify: `src/components/board/kanban-board.tsx`
- Modify: `src/components/board/kanban-column.tsx`
- Modify: `src/components/board/job-card.tsx`
- Test: `src/app/board/page.test.tsx`
- Test: `src/components/board/job-card.test.tsx`
- Test: `src/components/board/kanban-board.test.tsx`

- [ ] **Step 1: Add controlled board frame**

Wrap `KanbanBoard` horizontal scroll in an editorial surface and keep `aria-label="申请看板"`.

- [ ] **Step 2: Polish kanban columns**

Use lane-like styling:

```tsx
"flex w-[19rem] min-w-[19rem] shrink-0 flex-col rounded-lg border border-slate-200/80 bg-white/70 shadow-[0_10px_28px_rgba(43,51,69,0.06)]"
```

Keep stages, counts, and empty state unchanged.

- [ ] **Step 3: Polish job cards**

Improve hierarchy of company, position, status, milestone, material progress, and Agent risk. Keep `onClick={() => setSelectedJobId(job.id)}` unchanged.

- [ ] **Step 4: Run board tests**

Run:

```powershell
npm.cmd run test -- src/app/board/page.test.tsx src/components/board/job-card.test.tsx src/components/board/kanban-board.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 5**

Run:

```powershell
git add src/app/board/page.tsx src/components/board/kanban-board.tsx src/components/board/kanban-column.tsx src/components/board/job-card.tsx
git commit -m "style: polish board workspace"
```

Expected: commit succeeds.

---

### Task 6: Polish Materials and Review Centers

**Files:**
- Modify: `src/app/materials/page.tsx`
- Modify: `src/components/materials/material-list.tsx`
- Modify: `src/components/materials/material-card.tsx`
- Modify: `src/app/review/page.tsx`
- Modify: `src/components/review/agent-memory.tsx`
- Modify: `src/components/review/channel-review.tsx`
- Modify: `src/components/review/interview-review.tsx`
- Test: `src/app/materials/page.test.tsx`
- Test: `src/app/review/page.test.tsx`

- [ ] **Step 1: Polish material asset surfaces**

Keep `buildMaterialInsights` and all displayed fields. Make material cards more archival by emphasizing version, direction, freshness, and bound jobs as curated metadata.

- [ ] **Step 2: Polish Agent material dispatch summary**

Keep the current recommendation text and counts. Change only the surface, spacing, and summary stat treatment.

- [ ] **Step 3: Polish Agent memory**

Use `AgentAvatar` lightly in the strategy memory header. Keep `buildAgentMemoryInsights` unchanged.

- [ ] **Step 4: Polish channel and interview review**

Keep all insight calculations unchanged. Improve review cards, metric cells, and high-frequency question list readability.

- [ ] **Step 5: Run materials/review tests**

Run:

```powershell
npm.cmd run test -- src/app/materials/page.test.tsx src/app/review/page.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 6**

Run:

```powershell
git add src/app/materials/page.tsx src/components/materials/material-list.tsx src/components/materials/material-card.tsx src/app/review/page.tsx src/components/review/agent-memory.tsx src/components/review/channel-review.tsx src/components/review/interview-review.tsx
git commit -m "style: polish material and review centers"
```

Expected: commit succeeds.

---

### Task 7: Full Verification and Browser Review

**Files:**
- No production files expected.

- [ ] **Step 1: Run full tests**

Run:

```powershell
npm.cmd run test
```

Expected: all test files pass.

- [ ] **Step 2: Run typecheck**

Run:

```powershell
npm.cmd run typecheck
```

Expected: `tsc --noEmit` passes.

- [ ] **Step 3: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: no ESLint errors or warnings. If Next prints its `next lint` deprecation note, document it as tooling noise.

- [ ] **Step 4: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: Next.js build succeeds and lists `/`, `/board`, `/materials`, `/review`.

- [ ] **Step 5: Restart local dev server cleanly**

Run:

```powershell
$listeners = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
foreach ($listener in $listeners) { Stop-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2
$cwd = 'D:\projects\JobFind\.worktrees\jobfind-core-loop'
Start-Process -FilePath 'npm.cmd' -ArgumentList @('run','dev','--','--hostname','127.0.0.1','--port','3000') -WorkingDirectory $cwd -RedirectStandardOutput (Join-Path $cwd 'jobfind-dev-server.log') -RedirectStandardError (Join-Path $cwd 'jobfind-dev-server.err.log') -PassThru | Out-Null
Start-Sleep -Seconds 8
```

Expected: `http://127.0.0.1:3000/` responds.

- [ ] **Step 6: Browser check desktop pages**

Run Playwright CLI against:

```text
http://127.0.0.1:3000/
http://127.0.0.1:3000/board
http://127.0.0.1:3000/materials
http://127.0.0.1:3000/review
```

Expected:
- Page loads.
- Console has no errors.
- AgentLogo is visible and uses `/agent/agent-logo.png`.
- Homepage main speech copy is exact.
- Secondary Agent judgment is visually weaker.

- [ ] **Step 7: Browser check mobile viewport**

Use Playwright `resize 390 844` and visit the same routes.

Expected:
- Text does not overflow.
- Header and Agent module stack cleanly.
- Board horizontal browsing remains usable.
- Materials and review content remain readable.

- [ ] **Step 8: Commit final verification notes if needed**

If only logs/artifacts changed, do not commit generated artifacts. If a small final polish fix is required, commit it:

```powershell
git add <changed-source-files>
git commit -m "style: finish frontend polish verification"
```

Expected: working tree clean except ignored/generated artifacts.

---

## Self-Review

Spec coverage:
- B2 high-end light command workspace: Tasks 2, 3, 4.
- AgentLogo from provided asset only: Task 1.
- Fixed Agent speech and weaker judgment strip: Tasks 1 and 4.
- Board as job progress workspace: Task 5.
- Materials as asset center: Task 6.
- Review as strategy center: Task 6.
- No route, logic, IA, or future-feature changes: enforced in every task.
- Desktop and mobile verification: Task 7.

Placeholder scan:
- No TBD, TODO, or deferred implementation placeholders remain.

Type consistency:
- `AgentAvatar` has only optional `className` and `imageClassName`.
- Tests reference the actual `img` alt text and static image path.
- Existing `JobFindProvider`, `useTodayTasks`, `useJobfindStore`, and insight builders are preserved.
