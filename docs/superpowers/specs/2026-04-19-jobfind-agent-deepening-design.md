# JobFind Stage 1.1 Agent Deepening Design

## 1. Decision Summary

Stage 1.1 follows Stage 1 core loop completion and focuses on making the Agent layer feel more like a job-search project manager instead of a simple rule list.

The agreed direction is:

1. Prioritize `Agent explainability` before full conversational UI.
2. Build deterministic, structured Agent outputs first.
3. Leave clean extension points so the same UI and data contracts can later be powered by a real model API.
4. Keep user-confirmed execution as a hard product boundary.

Stage 1.1 is therefore not a “full chat agent” stage. It is the stage that makes the Agent's reasoning legible, credible, and extensible.

## 2. Product Goal

After Stage 1.1, a reviewer should be able to open a job detail panel and immediately understand:

- what the Agent has perceived,
- what risk or opportunity it has diagnosed,
- why one action is ranked ahead of another,
- what concrete next step the user should take,
- and what follow-up support the Agent can provide on demand.

The product goal is to strengthen the “AI job-search project manager” narrative without adding backend dependence or losing the reliability of deterministic demo behavior.

## 3. Scope

### 3.1 In Scope

Stage 1.1 includes:

- Upgrading the current AI suggestion area into a structured Agent panel.
- Explicitly surfacing the Agent chain:
  - Perception
  - Diagnosis
  - Planning
  - Confirmed execution
- Showing “why this matters now” for each recommended action.
- Showing ranking reasons for task priority.
- Providing deterministic on-demand outputs:
  - follow-up message draft,
  - interview preparation checklist,
  - material completion guidance.
- Introducing an Agent runtime abstraction that supports:
  - deterministic local runtime now,
  - model-backed runtime later.
- Keeping all Stage 1.1 behavior compatible with local state and static demo data.

### 3.2 Out of Scope

Stage 1.1 does not include:

- Free-form multi-turn chat.
- Real model API as the default execution path.
- Backend services, auth, persistence beyond localStorage, or remote logging.
- Automatic sending of messages, automatic application submission, or any external action.
- Full materials-center expansion, full strategy analytics, or broad Stage 1.2 feature fill-in.

## 4. User Value

Stage 1 proved that JobFind can identify risk and generate tasks. Stage 1.1 must prove that the Agent is trustworthy and differentiated.

The core user value becomes:

- “I know what needs attention.”
- “I understand why it is urgent.”
- “I know what to do next.”
- “I can ask for one more layer of help without leaving the workflow.”

This makes the Agent feel less like a static checklist generator and more like a lightweight planning partner.

## 5. Experience Design

### 5.1 Agent Panel Upgrade

The `AI 建议` tab should evolve from a flat task list into a structured Agent panel with four sections.

#### Section A: Agent 判断

This section explains what the Agent currently sees for the selected job:

- current stage,
- primary risk or opportunity,
- missing materials or upcoming milestones,
- urgency summary.

Example expression:

> 当前最需要关注的是腾讯产品策划实习。网申时间紧，同时还缺作品集，因此它应该先于其他正常推进中的岗位处理。

#### Section B: 为什么现在重要

This section answers the key user question:

> 为什么先做这件事？

The panel must show ranking reasons such as:

- deadline pressure,
- interview timing,
- material incompleteness,
- long silence after applying,
- relative priority against the rest of the pool.

This explanation must be explicit, not implied.

#### Section C: 下一步建议

This section contains the actionable recommendation:

- action,
- reason,
- priority,
- confirmation state.

The interaction still keeps the current product rule:

> Agent suggests; user confirms before state changes.

#### Section D: 可展开帮助

This section provides deterministic follow-up assistance without becoming a full chat product.

Initial expandable actions:

- `查看排序依据`
- `生成跟进话术`
- `生成面试准备清单`
- `查看材料补齐建议`

These are targeted follow-ups, not free chat.

### 5.2 Presentation Style

The panel should emphasize that this is a project manager style assistant:

- concise,
- operational,
- grounded in current job state,
- never generic motivational copy,
- never pretending to have taken external actions.

The language should remain Chinese-first with common recruiting terms preserved where natural.

## 6. Agent Architecture

### 6.1 Design Principle

UI components should not directly depend on low-level rule functions anymore. Instead, they should consume a structured Agent result object.

This creates one stable boundary:

```text
Job + Materials + Pool Context -> Agent Runtime -> Structured Agent Result -> UI
```

### 6.2 Runtime Abstraction

Stage 1.1 should introduce an Agent runtime interface with two intended implementations:

1. `deterministic runtime`  
   Default for Stage 1.1. Uses current rule engine plus templates and structured derivation.

2. `llm runtime`  
   Not implemented as the primary path yet, but the interface and file boundaries must make it easy to add later.

The runtime contract should support outputs such as:

- summary,
- diagnosis,
- priority explanation,
- suggested actions,
- follow-up drafts,
- interview prep checklist,
- material guidance.

### 6.3 Deterministic Runtime Responsibilities

The deterministic runtime should:

- reuse existing risk and task logic,
- derive a single “primary focus” for the selected job,
- explain why that focus outranks alternatives,
- generate small structured outputs for helper actions,
- keep formatting predictable and testable.

The deterministic runtime should not attempt to simulate open-ended intelligence. It should stay within reliable templates and rule-backed explanations.

### 6.4 Future LLM Runtime Boundary

To support future model integration, Stage 1.1 should define input and output contracts clearly enough that a later runtime can swap in without changing the panel structure.

Future runtime responsibilities may include:

- richer phrasing,
- better synthesis across multiple weak signals,
- more adaptive interview prep suggestions,
- more context-sensitive follow-up drafts.

But Stage 1.1 should not require model access to remain complete.

## 7. Data and Output Design

### 7.1 New Agent Result Shape

The Agent panel should be driven by a structured result model that separates reasoning layers instead of flattening everything into tasks.

The result should conceptually include:

- `focus summary`
- `perception bullets`
- `diagnosis`
- `priority explanation`
- `recommended actions`
- `helper artifacts`

Where:

- `recommended actions` remain user-confirmable.
- `helper artifacts` are read-only drafts or checklists.

### 7.2 Helper Artifact Types

Stage 1.1 should support at least:

- **Follow-up draft**
  - polite, concise, recruiter-safe wording,
  - based on applied date / silence context.

- **Interview prep checklist**
  - based on job keywords, stage, and upcoming interview timing,
  - broken into concrete preparation items.

- **Material guidance**
  - lists missing required materials,
  - highlights the most blocking gap first.

### 7.3 Pool Context

Even when the UI is job-level, the Agent explanation should be able to reference pool-level context when relevant:

- “this is one of the most urgent jobs in your pool,”
- “other jobs are progressing normally,”
- “this one is elevated because the deadline is closer than your other active applications.”

This is important because project-manager value comes from prioritization across the whole pool, not only per-job reasoning.

## 8. UX Constraints

Stage 1.1 must preserve the current Stage 1 interaction character:

- no fake typing effect,
- no chat transcript UI,
- no blank “Ask anything” box,
- no free-form assistant persona drift,
- no external action claims.

Expandable helper outputs should feel like focused tools inside a job workflow, not like a separate chatbot product.

## 9. Testing Strategy

Stage 1.1 should be validated with deterministic tests that cover:

- structured Agent result generation,
- explanation consistency with risk/task state,
- helper artifact generation,
- panel rendering for different job scenarios,
- user confirmation behavior still working after panel upgrade.

At minimum, the test suite should prove:

- Tencent shows deadline + missing portfolio as the primary focus.
- ByteDance shows interview preparation support.
- Xiaohongshu shows a follow-up draft path for long silence.
- helper sections are stable and visible only when relevant.

## 10. Acceptance Criteria

Stage 1.1 is complete when:

1. The `AI 建议` tab becomes a structured Agent panel instead of only a flat task list.
2. The panel clearly shows what the Agent perceived and diagnosed for the selected job.
3. Each recommended action explicitly answers “为什么现在重要”.
4. Users can inspect a ranking explanation for why an action is prioritized.
5. Users can generate a deterministic follow-up draft for silence-related jobs.
6. Users can generate a deterministic interview prep checklist for interview-stage jobs.
7. Users can inspect deterministic material guidance for jobs with missing required materials.
8. Confirming an action still requires explicit user interaction.
9. The runtime boundary exists so a future model-backed Agent can replace the deterministic implementation without redesigning the UI.
10. Stage 1.1 still works fully without backend services or model API access.

## 11. Non-Goals and Guardrails

To keep Stage 1.1 focused, the following must remain true:

- We are not building a chat app yet.
- We are not pretending the Agent can autonomously act outside the product.
- We are not broadening into full Stage 1.2 feature completion.
- We are not making model integration mandatory for demo quality.

The product story should remain:

> JobFind helps students turn scattered applications into clear next steps, and its Agent explains those next steps like a focused job-search project manager.
