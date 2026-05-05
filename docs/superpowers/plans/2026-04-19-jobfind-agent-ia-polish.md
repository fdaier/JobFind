# JobFind Agent IA Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Agent the visible primary experience in JobFind by moving it to the first detail tab and strengthening Agent language across the dashboard and board.

**Architecture:** This is an information architecture and copy polish over the existing deterministic Agent runtime. No new runtime, model API, backend, or state shape is required. The UI continues to consume `deterministicAgentRuntime.buildResult(...)` and existing risk/task helpers.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Testing Library, Tailwind utility classes, Radix UI tabs/sheet.

---

## File Structure

- Modify `src/app/board/page.test.tsx`
  - Covers detail tab order, default selected tab, Agent panel visibility, and renamed tab labels.
- Modify `src/components/job-detail/job-detail-sheet.tsx`
  - Sets `Agent 作战台` as first/default tab.
  - Reorders tab contents.
  - Updates sheet header copy.
- Modify `src/components/job-detail/job-ai-panel.tsx`
  - Adds a lightweight Agent context summary above existing sections.
- Modify `src/components/dashboard/today-tasks.test.tsx`
  - Covers renamed Agent dashboard entry point.
- Modify `src/components/dashboard/today-tasks.tsx`
  - Renames `今日任务` to `Agent 今日指挥`.
  - Updates description copy to emphasize Agent prioritization.
- Modify `src/components/dashboard/risk-radar.tsx`
  - Renames risk radar to explicitly surface Agent perception.
- Modify `src/components/board/job-card.tsx`
  - Renames card risk label from `风险` to `Agent 风险`.

## Task 1: Detail Sheet Agent-First IA

**Files:**
- Modify: `src/app/board/page.test.tsx`
- Modify: `src/components/job-detail/job-detail-sheet.tsx`
- Modify: `src/components/job-detail/job-ai-panel.tsx`

- [ ] **Step 1: Write the failing detail IA test**

Update the first detail test in `src/app/board/page.test.tsx` to expect the Agent tab first and selected by default:

```tsx
it("opens Tencent detail sheet with Agent workspace as the first default tab", async () => {
  renderBoardPage();

  fireEvent.click(screen.getByRole("button", { name: /腾讯/ }));

  await waitFor(() => {
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
  expect(tabs).toEqual(["Agent 作战台", "基本信息", "材料", "时间线", "面试复盘"]);
  expect(screen.getByRole("tab", { name: "Agent 作战台", selected: true })).toBeInTheDocument();

  const agentPanel = screen.getByRole("tabpanel", { name: "Agent 作战台" });
  expect(agentPanel).toHaveTextContent("Agent 岗位快照");
  expect(agentPanel).toHaveTextContent("腾讯 · AI 产品实习生 · 已投递");
  expect(agentPanel).toHaveTextContent("Agent 判断");
  expect(screen.getByText("Agent 会先判断风险和下一步，你再确认是否推进。")).toBeInTheDocument();
});
```

Update later references in `src/app/board/page.test.tsx`:

```tsx
fireEvent.mouseDown(screen.getByRole("tab", { name: "Agent 作战台" }));
fireEvent.click(screen.getByRole("tab", { name: "Agent 作战台" }));
await waitFor(() => {
  expect(screen.getByRole("tab", { name: "Agent 作战台", selected: true })).toBeInTheDocument();
});
const aiPanel = screen.getByRole("tabpanel", { name: "Agent 作战台" });
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm.cmd run test -- src/app/board/page.test.tsx
```

Expected: FAIL because the UI still uses `AI 建议`, `基本信息` is selected by default, and the Agent snapshot is missing.

- [ ] **Step 3: Implement Agent-first tabs**

In `src/components/job-detail/job-detail-sheet.tsx`:

- Change `useState("info")` to `useState("ai")`.
- Change reset effect to `setTabValue("ai")`.
- Change sheet description to `Agent 会先判断风险和下一步，你再确认是否推进。`.
- Reorder tab triggers to:

```tsx
<TabsTrigger value="ai">Agent 作战台</TabsTrigger>
<TabsTrigger value="info">基本信息</TabsTrigger>
<TabsTrigger value="materials">材料</TabsTrigger>
<TabsTrigger value="timeline">时间线</TabsTrigger>
<TabsTrigger value="notes">面试复盘</TabsTrigger>
```

- Reorder tab content to match the trigger order:

```tsx
<TabsContent value="ai" className="mt-0">
  <JobAIPanel job={selectedJob} materials={materials} />
</TabsContent>

<TabsContent value="info" className="mt-0">
  <JobInfoSection job={selectedJob} />
</TabsContent>

<TabsContent value="materials" className="mt-0">
  <JobMaterials job={selectedJob} materials={materials} />
</TabsContent>

<TabsContent value="timeline" className="mt-0">
  <JobTimeline job={selectedJob} />
</TabsContent>

<TabsContent value="notes" className="mt-0">
  <JobInterviewNotes job={selectedJob} />
</TabsContent>
```

- [ ] **Step 4: Add Agent context summary**

In `src/components/job-detail/job-ai-panel.tsx`, add stage labels:

```tsx
const STAGE_LABELS: Record<Job["stage"], string> = {
  interested: "关注中",
  to_apply: "待投递",
  applied: "已投递",
  written_test: "笔试",
  interviewing: "面试",
  offer: "录用",
  rejected: "已淘汰",
};
```

Before the existing `Agent 判断` section, render:

```tsx
<section className="rounded-md border border-slate-200 bg-slate-50 p-4">
  <p className="text-xs font-medium text-slate-500">Agent 岗位快照</p>
  <h3 className="mt-2 text-base font-semibold text-slate-950">
    {job.company} · {job.position} · {STAGE_LABELS[job.stage]}
  </h3>
  <p className="mt-2 text-sm leading-6 text-slate-700">{result.summary}</p>
  <p className="mt-2 text-sm leading-6 text-slate-600">{result.dashboardBrief}</p>
</section>
```

- [ ] **Step 5: Run the focused test to verify it passes**

Run:

```bash
npm.cmd run test -- src/app/board/page.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/app/board/page.test.tsx src/components/job-detail/job-detail-sheet.tsx src/components/job-detail/job-ai-panel.tsx
git commit -m "feat: make agent workspace the primary detail tab"
```

## Task 2: Dashboard And Board Agent Touchpoints

**Files:**
- Modify: `src/components/dashboard/today-tasks.test.tsx`
- Modify: `src/components/dashboard/today-tasks.tsx`
- Modify: `src/components/dashboard/risk-radar.tsx`
- Modify: `src/components/board/job-card.tsx`

- [ ] **Step 1: Write the failing dashboard Agent test**

Update `src/components/dashboard/today-tasks.test.tsx`:

```tsx
expect(screen.getByRole("heading", { name: "Agent 今日指挥" })).toBeInTheDocument();
expect(screen.getByText(/Agent 已按风险和时间窗口排好今日优先级/)).toBeInTheDocument();
expect(screen.getByText(/Agent 判断：为什么现在先做这件事/)).toBeInTheDocument();
```

- [ ] **Step 2: Add board-level assertion**

In `src/app/board/page.test.tsx`, update the card risk label expectation by adding this inside the test that opens the board and uses Tencent:

```tsx
expect(screen.getAllByText("Agent 风险").length).toBeGreaterThan(0);
```

- [ ] **Step 3: Run focused tests to verify they fail**

Run:

```bash
npm.cmd run test -- src/components/dashboard/today-tasks.test.tsx src/app/board/page.test.tsx
```

Expected: FAIL because titles and labels still use old wording.

- [ ] **Step 4: Implement dashboard copy**

In `src/components/dashboard/today-tasks.tsx`:

- Change heading text from `今日任务` to `Agent 今日指挥`.
- Change description to:

```tsx
Agent 已按风险和时间窗口排好今日优先级，先处理最容易影响结果的动作。
```

- [ ] **Step 5: Implement risk radar copy**

In `src/components/dashboard/risk-radar.tsx`:

- Change heading from `风险雷达` to `Agent 风险雷达`.
- Change description to:

```tsx
Agent 已识别 DDL、材料、面试和沉默风险，先看红色项，再处理黄色项。
```

- [ ] **Step 6: Implement board card label**

In `src/components/board/job-card.tsx`, change the label text:

```tsx
<p className="text-xs font-medium text-slate-500">Agent 风险</p>
```

- [ ] **Step 7: Run focused tests to verify they pass**

Run:

```bash
npm.cmd run test -- src/components/dashboard/today-tasks.test.tsx src/app/board/page.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 2**

Run:

```bash
git add src/components/dashboard/today-tasks.test.tsx src/components/dashboard/today-tasks.tsx src/components/dashboard/risk-radar.tsx src/components/board/job-card.tsx src/app/board/page.test.tsx
git commit -m "feat: surface agent touchpoints across dashboard"
```

## Task 3: Verification

**Files:**
- No production files expected.

- [ ] **Step 1: Run full test suite**

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

- [ ] **Step 4: Run production build**

Run:

```bash
npm.cmd run build
```

Expected: PASS.

- [ ] **Step 5: Run Playwright smoke check**

Run:

```bash
npx --yes --package @playwright/cli playwright-cli open http://127.0.0.1:3000/ --browser chrome
npx --yes --package @playwright/cli playwright-cli console
npx --yes --package @playwright/cli playwright-cli click <申请看板 link ref from snapshot>
npx --yes --package @playwright/cli playwright-cli console
npx --yes --package @playwright/cli playwright-cli close
```

Expected: no console errors.

- [ ] **Step 6: Final git status**

Run:

```bash
git status --short
```

Expected: clean working tree.

## Self-Review

- Spec coverage: This plan covers default Agent tab, first tab ordering, Agent summary, header copy, homepage Agent entry, risk/card Agent touchpoints, tests, and full verification.
- Placeholder scan: No TBD/TODO placeholders remain. The Playwright link ref is intentionally discovered from snapshot because refs are generated at runtime.
- Type consistency: Existing `ai` tab value is reused, `Agent 作战台` is display text only, and no new data model is introduced.
