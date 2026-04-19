# JobFind Stage 1.1 Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish Stage 1.1 so Agent value is visible on the dashboard, the most relevant helper opens by default, interview notes support minimal creation, and the remaining credibility issues are fixed without expanding into Stage 1.2.

**Architecture:** Keep the existing deterministic Agent runtime as the source of truth. Extend it with a short dashboard-facing explanation and a default helper selection rule. Update the store with one focused `addInterviewNote` action and thread that through a minimal local form in the interview-notes tab. Fix board time logic by removing the frozen reference date and keep all persistence inside the existing localStorage flow.

**Tech Stack:** Next.js 15.x, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Vitest, React Testing Library, localStorage.

---

## 1. Source Documents

Implement Stage 1.1 polish only. Treat these files as the source of truth:

- `PRD-JobFind.md`
- `PRD-JobFind-Stage1.1-Polish.md`
- `docs/reviews/2026-04-19-stage1-1-product-experience-review.md`
- `docs/superpowers/specs/2026-04-19-jobfind-agent-deepening-design.md`
- `docs/superpowers/specs/2026-04-19-jobfind-stage1-1-polish-design.md`

Do not add free-form chat, backend services, or any broader Stage 1.2 feature work in this plan.

## 2. File Structure

Create or modify these files:

- Modify: `src/lib/agent/types.ts`
- Modify: `src/lib/agent/deterministic-runtime.ts`
- Modify: `src/lib/agent/deterministic-runtime.test.ts`
- Modify: `src/components/dashboard/today-tasks.tsx`
- Modify: `src/components/board/job-card.tsx`
- Modify: `src/components/board/job-card.test.tsx`
- Modify: `src/components/job-detail/job-ai-panel.tsx`
- Modify: `src/components/job-detail/job-interview-notes.tsx`
- Modify: `src/hooks/use-jobfind-store.tsx`
- Modify: `src/hooks/use-jobfind-store.test.tsx`
- Modify: `src/app/board/page.test.tsx`
- Modify: `src/components/job-detail/job-detail-date-safety.test.tsx` only if date-flow changes require it
- Modify: `src/components/ai/jd-parser-dialog.tsx`

## 3. Task Breakdown

### Task 1: Fix Board Time Credibility and Add Agent Dashboard Summary

**Files:**
- Modify: `src/components/board/job-card.tsx`
- Modify: `src/components/board/job-card.test.tsx`
- Modify: `src/lib/agent/types.ts`
- Modify: `src/lib/agent/deterministic-runtime.ts`
- Modify: `src/lib/agent/deterministic-runtime.test.ts`
- Modify: `src/components/dashboard/today-tasks.tsx`

- [ ] **Step 1: Write the failing tests**

Update `src/components/board/job-card.test.tsx` to prove that milestone labels use the actual `now` prop instead of a frozen constant:

```tsx
it("shows overdue milestone state when the supplied now is past the deadline", () => {
  render(<JobCard job={job} materials={materials} now={new Date("2026-04-21T08:00:00.000Z")} />);
  expect(screen.getByText("已过期")).toBeInTheDocument();
});
```

Expand `src/lib/agent/deterministic-runtime.test.ts` to assert a short dashboard explanation exists:

```ts
expect(result.dashboardBrief).toContain("为什么");
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm.cmd run test -- src/components/board/job-card.test.tsx src/lib/agent/deterministic-runtime.test.ts
```

Expected: FAIL because the board still relies on a frozen reference date and the Agent result has no dashboard-facing explanation yet.

- [ ] **Step 3: Implement the minimal production changes**

In `src/components/board/job-card.tsx`, remove the frozen reference date:

```ts
export function JobCard({ job, materials, now = new Date() }: JobCardProps) { ... }
```

In `src/lib/agent/types.ts`, extend the result contract:

```ts
export interface AgentResult {
  summary: string;
  dashboardBrief: string;
  perception: string[];
  ...
}
```

In `src/lib/agent/deterministic-runtime.ts`, add a concise dashboard summary:

```ts
function buildDashboardBrief(job: Job, primaryRisk: RiskTag | null): string { ... }
```

Then update `src/components/dashboard/today-tasks.tsx` so the card header or top-most item clearly exposes one Agent explanation sentence derived from the most urgent task/job.

- [ ] **Step 4: Run the targeted tests to verify they pass**

Run:

```bash
npm.cmd run test -- src/components/board/job-card.test.tsx src/lib/agent/deterministic-runtime.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/board/job-card.tsx src/components/board/job-card.test.tsx src/lib/agent/types.ts src/lib/agent/deterministic-runtime.ts src/lib/agent/deterministic-runtime.test.ts src/components/dashboard/today-tasks.tsx
git commit -m "feat: surface agent reasoning on dashboard"
```

### Task 2: Default-Open the Most Relevant Agent Helper and Polish JD Parser Copy

**Files:**
- Modify: `src/components/job-detail/job-ai-panel.tsx`
- Modify: `src/app/board/page.test.tsx`
- Modify: `src/components/ai/jd-parser-dialog.tsx`

- [ ] **Step 1: Write the failing UI test**

Update `src/app/board/page.test.tsx` so it asserts the most relevant helper content is visible immediately for a Tencent-like job:

```tsx
expect(aiPanel).toHaveTextContent("材料补齐建议");
expect(aiPanel).toHaveTextContent("优先补齐作品集");
```

Also add an assertion that the JD parser description no longer contains infrastructure wording:

```tsx
expect(screen.queryByText(/不连接真实后端|AI 接口/)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm.cmd run test -- src/app/board/page.test.tsx
```

Expected: FAIL because helpers are collapsed by default and the JD parser still exposes implementation-oriented copy.

- [ ] **Step 3: Implement the minimal production changes**

In `src/components/job-detail/job-ai-panel.tsx`, derive the default helper from the available artifacts:

```ts
function getDefaultHelperKey(result: AgentResult): HelperKey { ... }

useEffect(() => {
  setActiveHelper(getDefaultHelperKey(result));
}, [job.id, result]);
```

Priority order:

1. `interviewPrepChecklist`
2. `followUpDraft`
3. `materialGuidance`
4. `rankingExplanation`

In `src/components/ai/jd-parser-dialog.tsx`, replace the description with product-facing copy, for example:

```tsx
<DialogDescription>系统会先整理岗位关键信息，再把它纳入你的申请池和 Agent 判断。</DialogDescription>
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
npm.cmd run test -- src/app/board/page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/job-detail/job-ai-panel.tsx src/app/board/page.test.tsx src/components/ai/jd-parser-dialog.tsx
git commit -m "feat: default open relevant agent helper"
```

### Task 3: Add Minimal Interview Note Creation Flow

**Files:**
- Modify: `src/hooks/use-jobfind-store.tsx`
- Modify: `src/hooks/use-jobfind-store.test.tsx`
- Modify: `src/components/job-detail/job-interview-notes.tsx`
- Modify: `src/app/board/page.test.tsx`

- [ ] **Step 1: Write the failing store and UI tests**

Add a store test in `src/hooks/use-jobfind-store.test.tsx`:

```tsx
it("adds an interview note to the selected job and persists it in state", () => {
  // call addInterviewNote("tencent", note)
  // expect selected job interviewNotes to contain the new note
});
```

Add a board-page flow test that opens the notes tab, creates a note, and sees it rendered:

```tsx
fireEvent.click(screen.getByRole("button", { name: "新增复盘" }));
fireEvent.change(screen.getByLabelText("面试轮次"), { target: { value: "二面" } });
...
fireEvent.click(screen.getByRole("button", { name: "保存复盘" }));
expect(screen.getByText("二面")).toBeInTheDocument();
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm.cmd run test -- src/hooks/use-jobfind-store.test.tsx src/app/board/page.test.tsx
```

Expected: FAIL because the store has no `addInterviewNote` action and the UI has no creation flow.

- [ ] **Step 3: Implement the minimal production changes**

Extend the store contract in `src/hooks/use-jobfind-store.tsx`:

```ts
addInterviewNote: (jobId: string, note: InterviewNote) => void;
```

Implementation should:

- append the new note to the job,
- update `updatedAt`,
- optionally prepend a timeline event like `补充面试复盘`,
- reuse existing localStorage persistence.

Then update `src/components/job-detail/job-interview-notes.tsx` with a minimal local form:

```tsx
round
date
questions (Textarea split by line)
reflection
result
```

Keep it compact and inline. No modal, no advanced validation beyond required non-empty fields.

- [ ] **Step 4: Run the targeted tests to verify they pass**

Run:

```bash
npm.cmd run test -- src/hooks/use-jobfind-store.test.tsx src/app/board/page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-jobfind-store.tsx src/hooks/use-jobfind-store.test.tsx src/components/job-detail/job-interview-notes.tsx src/app/board/page.test.tsx
git commit -m "feat: add interview note creation flow"
```

### Task 4: Full Verification and Scope Check

**Files:**
- Modify only if verification reveals a real defect.

- [ ] **Step 1: Run the focused polish test set**

Run:

```bash
npm.cmd run test -- src/components/board/job-card.test.tsx src/lib/agent/deterministic-runtime.test.ts src/hooks/use-jobfind-store.test.tsx src/app/board/page.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run full project verification**

Run:

```bash
npm.cmd run test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Expected:
- tests: PASS
- typecheck: PASS
- lint: PASS (the `next lint` deprecation note is acceptable)
- build: PASS

- [ ] **Step 3: Review against the polish acceptance criteria**

Confirm the implementation matches `docs/superpowers/specs/2026-04-19-jobfind-stage1-1-polish-design.md`:

- homepage expresses Agent reasoning more clearly,
- AI helper auto-opens relevant content,
- interview notes can be added and persisted,
- board time logic no longer drifts,
- JD parser copy no longer breaks product immersion,
- no Stage 1.2 features slipped in.

- [ ] **Step 4: Commit final polish integration**

```bash
git add .
git commit -m "feat: complete stage 1.1 polish"
```
