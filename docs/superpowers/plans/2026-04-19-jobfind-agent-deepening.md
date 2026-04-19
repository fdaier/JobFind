# JobFind Agent Deepening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Stage 1 `AI 建议` into a structured Agent panel with deterministic explainability and helper artifacts, while introducing a runtime boundary for future model-backed execution.

**Architecture:** Add a new `src/lib/agent` layer that converts jobs, materials, and pool context into a structured Agent result. Keep Stage 1.1 deterministic by composing the existing rules engine with targeted helper generators. Update the job AI panel to render the Agent result instead of directly rendering raw task rows.

**Tech Stack:** Next.js 15.x, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Vitest, React Testing Library, localStorage.

---

## 1. Source Documents

Implement Stage 1.1 only. Treat these files as the source of truth:

- `PRD-JobFind.md`
- `architecture.md`
- `component-selection.md`
- `docs/superpowers/specs/2026-04-19-jobfind-core-loop-design.md`
- `docs/superpowers/specs/2026-04-19-jobfind-agent-deepening-design.md`

Do not implement free-form chat, backend services, or model API as the default path in this plan.

## 2. File Structure

Create or modify these files:

- Create: `src/lib/agent/types.ts`
- Create: `src/lib/agent/runtime.ts`
- Create: `src/lib/agent/deterministic-runtime.ts`
- Create: `src/lib/agent/templates.ts`
- Create: `src/lib/agent/deterministic-runtime.test.ts`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/rules-engine.ts`
- Modify: `src/lib/rules-engine.test.ts`
- Modify: `src/components/job-detail/job-ai-panel.tsx`
- Modify: `src/app/board/page.test.tsx`

## 3. Task Breakdown

### Task 1: Define Agent Contracts

**Files:**
- Create: `src/lib/agent/types.ts`
- Create: `src/lib/agent/runtime.ts`
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Write the failing type-level runtime test**

Add a runtime contract test to `src/lib/agent/deterministic-runtime.test.ts` that imports the future `buildDeterministicAgentResult` and asserts it returns:

```ts
expect(result).toEqual(
  expect.objectContaining({
    summary: expect.any(String),
    diagnosis: expect.objectContaining({
      headline: expect.any(String),
      reasons: expect.any(Array),
    }),
    recommendations: expect.any(Array),
    helperArtifacts: expect.any(Object),
  }),
);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test -- src/lib/agent/deterministic-runtime.test.ts`
Expected: FAIL because `src/lib/agent/deterministic-runtime.ts` and related exports do not exist yet.

- [ ] **Step 3: Add minimal Agent contracts**

Create `src/lib/agent/types.ts` and `src/lib/agent/runtime.ts` with focused interfaces:

```ts
export interface AgentArtifactSection {
  title: string;
  items: string[];
}

export interface AgentDiagnosis {
  headline: string;
  reasons: string[];
  urgencyLabel: string;
}

export interface AgentRecommendation {
  taskId: string;
  action: string;
  reason: string;
  priorityLabel: string;
  whyNow: string;
  actionType: TaskActionType;
}

export interface AgentHelperArtifacts {
  rankingExplanation: AgentArtifactSection | null;
  followUpDraft: AgentArtifactSection | null;
  interviewPrepChecklist: AgentArtifactSection | null;
  materialGuidance: AgentArtifactSection | null;
}

export interface AgentResult {
  summary: string;
  perception: string[];
  diagnosis: AgentDiagnosis;
  recommendations: AgentRecommendation[];
  helperArtifacts: AgentHelperArtifacts;
}
```

And:

```ts
export interface AgentRuntimeContext {
  job: Job;
  jobs: Job[];
  materials: Material[];
  completedTaskIds: string[];
  now?: Date;
}

export interface AgentRuntime {
  buildResult(context: AgentRuntimeContext): AgentResult;
}
```

Only extend `src/lib/types.ts` when existing shared enums or types are needed by the new contract.

- [ ] **Step 4: Run the targeted test again**

Run: `npm.cmd run test -- src/lib/agent/deterministic-runtime.test.ts`
Expected: FAIL because the deterministic runtime implementation still does not exist.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agent/types.ts src/lib/agent/runtime.ts src/lib/types.ts src/lib/agent/deterministic-runtime.test.ts
git commit -m "feat: define agent runtime contracts"
```

### Task 2: Build Deterministic Agent Runtime

**Files:**
- Create: `src/lib/agent/deterministic-runtime.ts`
- Create: `src/lib/agent/templates.ts`
- Modify: `src/lib/rules-engine.ts`
- Modify: `src/lib/rules-engine.test.ts`
- Modify: `src/lib/agent/deterministic-runtime.test.ts`

- [ ] **Step 1: Expand the failing tests for concrete scenarios**

In `src/lib/agent/deterministic-runtime.test.ts`, add scenario tests for:

```ts
it("explains Tencent as deadline plus missing portfolio focus", () => {
  expect(result.summary).toContain("腾讯");
  expect(result.diagnosis.headline).toContain("网申");
  expect(result.helperArtifacts.materialGuidance?.items).toContain("优先补齐作品集");
});

it("builds an interview checklist for ByteDance-like jobs", () => {
  expect(result.helperArtifacts.interviewPrepChecklist?.items.length).toBeGreaterThan(0);
});

it("builds a follow-up draft for silence-related jobs", () => {
  expect(result.helperArtifacts.followUpDraft?.items[0]).toContain("您好");
});
```

Also add one rules-engine test proving pool-level comparison support, for example by checking a new helper that identifies whether a job is among the most urgent jobs.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm.cmd run test -- src/lib/agent/deterministic-runtime.test.ts src/lib/rules-engine.test.ts`
Expected: FAIL because no deterministic runtime or pool-priority helper exists yet.

- [ ] **Step 3: Implement deterministic Agent helpers**

Create `src/lib/agent/templates.ts` with small deterministic template builders:

```ts
export function buildFollowUpDraft(job: Job): AgentArtifactSection { ... }
export function buildInterviewPrepChecklist(job: Job): AgentArtifactSection { ... }
export function buildMaterialGuidance(job: Job, missing: MaterialType[]): AgentArtifactSection { ... }
```

Update `src/lib/rules-engine.ts` to expose small composable helpers instead of pushing all logic into the panel:

```ts
export function getTaskPriorityLabel(priority: TaskPriority): string { ... }
export function getJobUrgencyRank(job: Job, jobs: Job[], materials: Material[], now?: Date): number { ... }
export function getTopJobTasks(job: Job, materials: Material[], now?: Date): TodayTask[] { ... }
```

Then create `src/lib/agent/deterministic-runtime.ts`:

```ts
export function buildDeterministicAgentResult(context: AgentRuntimeContext): AgentResult {
  // gather risks
  // gather top tasks
  // summarize perception
  // derive diagnosis
  // attach helper artifacts only when relevant
}

export const deterministicAgentRuntime: AgentRuntime = {
  buildResult: buildDeterministicAgentResult,
};
```

Keep it deterministic, template-backed, and pool-aware.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm.cmd run test -- src/lib/agent/deterministic-runtime.test.ts src/lib/rules-engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/agent/deterministic-runtime.ts src/lib/agent/templates.ts src/lib/agent/deterministic-runtime.test.ts src/lib/rules-engine.ts src/lib/rules-engine.test.ts
git commit -m "feat: add deterministic agent runtime"
```

### Task 3: Upgrade the Job AI Panel

**Files:**
- Modify: `src/components/job-detail/job-ai-panel.tsx`
- Modify: `src/app/board/page.test.tsx`

- [ ] **Step 1: Write the failing UI tests**

Update `src/app/board/page.test.tsx` so the AI panel expectations move from a flat list to the new structure:

```ts
expect(aiPanel).toHaveTextContent("Agent 判断");
expect(aiPanel).toHaveTextContent("为什么现在重要");
expect(aiPanel).toHaveTextContent("下一步建议");
expect(aiPanel).toHaveTextContent("可展开帮助");
expect(aiPanel).toHaveTextContent("生成面试准备清单");
expect(aiPanel).toHaveTextContent("生成跟进话术");
```

Keep the confirmation button assertions too.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test -- src/app/board/page.test.tsx`
Expected: FAIL because the current panel still renders the old task-only layout.

- [ ] **Step 3: Implement the panel upgrade**

Refactor `src/components/job-detail/job-ai-panel.tsx` so it:

- imports the deterministic runtime,
- builds an `AgentResult`,
- renders four sections:
  - `Agent 判断`
  - `为什么现在重要`
  - `下一步建议`
  - `可展开帮助`
- only shows relevant helper artifacts,
- preserves explicit user confirmation for recommended actions.

Use compact components inside the same file unless a split is clearly needed. Keep the UI focused and deterministic.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test -- src/app/board/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/job-detail/job-ai-panel.tsx src/app/board/page.test.tsx
git commit -m "feat: upgrade agent panel with explainability"
```

### Task 4: Full Verification and Polish

**Files:**
- Modify only if verification reveals a real defect.

- [ ] **Step 1: Run the focused Stage 1.1 test set**

Run:

```bash
npm.cmd run test -- src/lib/agent/deterministic-runtime.test.ts src/lib/rules-engine.test.ts src/app/board/page.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run full project verification**

Run:

```bash
npm.cmd run test
npm.cmd run typecheck
npm.cmd run lint
```

Expected:
- tests: PASS
- typecheck: PASS
- lint: PASS (deprecation note about `next lint` is acceptable)

- [ ] **Step 3: Review Stage 1.1 acceptance criteria against the spec**

Check the implementation against `docs/superpowers/specs/2026-04-19-jobfind-agent-deepening-design.md` and confirm:

- structured Agent panel exists,
- explanation layer exists,
- helper artifacts are relevant and deterministic,
- model runtime boundary is present,
- no free-form chat was added.

- [ ] **Step 4: Commit final Stage 1.1 implementation**

```bash
git add .
git commit -m "feat: complete stage 1.1 agent deepening"
```
