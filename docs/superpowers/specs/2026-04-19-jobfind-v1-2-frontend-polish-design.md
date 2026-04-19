# JobFind v1.2 Frontend Polish Design

## 1. Background

JobFind v1.2 is already a complete, runnable, demoable frontend product version. The goal of this design is not to rebuild the product, change the information architecture, rewrite page responsibilities, or introduce future capabilities that do not exist in v1.2.

This round focuses only on improving the frontend finish level on top of the current shipped structure:

- Keep the same core routes: `/`, `/board`, `/materials`, `/review`
- Keep the same product story: "student AI job-search project manager"
- Keep the current deterministic / rule-based Agent positioning
- Do not present unfinished future LLM abilities as already implemented

The work should make the product feel more complete, more premium, more readable, and more presentation-ready without changing the underlying v1.2 logic.

## 2. Design Goal

Upgrade the current interface from "functional MVP UI" to "high-finish product UI" while preserving the existing workflow and demo logic.

By the end of this polish pass, the product should feel like:

- a real product, not a stitched demo
- a calm but distinctive AI work surface, not a generic dashboard
- visually intentional enough for showcase, demo, and recording
- stronger on both desktop and mobile reading comfort

## 3. Confirmed Decisions

The following decisions are already confirmed and should be treated as hard constraints for implementation:

1. The structural direction is **B2**:
   - keep the stronger editorial / command-deck composition
   - keep the product feel
   - avoid turning the app into a marketing landing page

2. The color and atmosphere direction is:
   - **light, premium, soft-atmosphere UI**
   - subtle large-area gradients in the page background only
   - warm ivory and soft white surfaces
   - graphite / ink-navy text
   - no game-like, neon, cyber, or sci-fi presentation

3. `AgentLogo.png` usage rule:
   - only crop and visually clean the provided asset
   - do not generate a new face or replace the character
   - do not redraw the avatar into a different person

4. `Agent 今日指挥` content hierarchy:
   - the main speech bubble uses this exact line:
     - `JobFind-Agent 已按风险和时间窗口排好今日优先级，先处理最容易影响结果的动作！`
   - the current second sentence becomes a weaker supporting hint below:
     - `Agent 判断：为什么现在先做这件事：字节跳动 AI 产品经理实习生已经进入临近面试窗口，准备质量会直接影响下一轮。`

5. The user explicitly wants:
   - the "character says one sentence" effect to remain
   - that effect to feel product-native and premium, not game UI

## 4. Visual Thesis

**JobFind should feel like a premium light-theme command workspace for a student's job-search day: calm, intelligent, softly atmospheric, and decisively action-oriented.**

The interface should communicate:

- "you are in control"
- "the Agent has already triaged the day"
- "this is a serious product surface"

It should not communicate:

- flashy AI demo
- gaming mission screen
- generic SaaS metrics board

## 5. Frontend Composition Model

Following the frontend polish workflow, this design uses:

- **visual thesis**: premium light command workspace with gentle atmospheric gradients
- **content plan**:
  - hero / header: orient the user into today's job-search battle
  - support: show top priorities and risks first
  - detail: expose board, material, and review depth cleanly
  - final action: keep the app visibly actionable, not purely descriptive
- **interaction thesis**:
  - soft page-load reveal for the top surface
  - stronger presence for the Agent command module
  - restrained hover / emphasis transitions on task, board, and material units

## 6. Visual System

### 6.1 Color Direction

Use a premium light palette with low-saturation atmosphere:

- page background:
  - warm ivory base
  - ultra-soft mist gradients using pale fog blue, powder pink, and pearl-lilac
  - gradients should be broad, blurred, and low contrast
- content surfaces:
  - soft white to ivory
  - subtle elevation rather than strong shadows
- typography:
  - main: ink navy / graphite
  - secondary: cool gray-blue
- semantic states:
  - urgent: muted brick red rather than bright warning red
  - warning: sand amber rather than saturated orange
  - success: muted evergreen rather than bright green

Hard constraints:

- no strong cyber blue glow
- no purple-heavy fantasy styling
- no dark gaming panel treatment
- no pure black surfaces as the main visual anchor

### 6.2 Background Treatment

The premium feeling should come from the background atmosphere, not from decorative chrome.

Rules:

- the main page canvas may use a subtle ambient gradient wash
- routine panels remain mostly clean and readable
- gradients should support depth, not decorate every block
- the app should still look premium if decorative shadows are reduced

### 6.3 Surface Language

Move away from default card-mosaic feeling.

Rules:

- keep panels, but reduce "box after box after box" sameness
- use grouped surfaces and stronger page bands where helpful
- vary panel emphasis by scale, internal spacing, and typography before adding more borders
- use softer radii and thinner borders
- make the top section feel more like a composed product canvas than a list of widgets

### 6.4 Typography

Typography should carry more of the premium feel than before.

Rules:

- make page titles larger and more assured
- keep subtitles short and operational
- reduce the repeated "JobFind" meta label prominence where it does not add value
- use stronger type contrast between:
  - page title
  - section title
  - support text
  - metrics

## 7. Agent Presence Design

### 7.1 Agent Avatar

Use the provided [AgentLogo.png](D:/projects/JobFind/AgentLogo.png) only.

Implementation rules:

- crop the face / upper body into a product-avatar composition
- remove or visually suppress the original busy background and the `MY AGENT` headline
- keep the recognizable face and identity intact
- present it as a polished assistant avatar, not a poster image

Suggested placements:

- sidebar brand / agent identity area
- `Agent 今日指挥` header
- selected secondary Agent surfaces in `/review`

### 7.2 Agent 今日指挥 Module

This becomes the main narrative surface of the homepage.

Desired structure:

1. Section heading and module identity
2. Agent avatar
3. Main speech bubble with the fixed line:
   - `JobFind-Agent 已按风险和时间窗口排好今日优先级，先处理最容易影响结果的动作！`
4. Weaker supporting insight line below:
   - `Agent 判断：为什么现在先做这件事：字节跳动 AI 产品经理实习生已经进入临近面试窗口，准备质量会直接影响下一轮。`
5. Priority actions list beneath the briefing

Presentation rules:

- the main speech bubble should feel elegant and product-native
- do not imitate game quest UI
- the supporting judgment should be quieter and secondary
- the module should feel like the day's command brief, not just another content card

## 8. Page-by-Page Direction

### 8.1 `/` Today Command Surface

Target feeling:

- "today's battle desk"
- more composed first viewport
- immediate understanding of priorities, risks, and control

Changes:

- strengthen the page header into a more commanding top band
- make the Agent module the visual anchor of the page
- keep metrics, but make them feel more premium and less template-like
- rebalance the relationship between:
  - Agent 今日指挥
  - 风险雷达
  - metrics row
  - lower stage / funnel summaries

### 8.2 `/board` Job Progress Workspace

Target feeling:

- "application progress war room"
- clearer momentum and status scanning

Changes:

- keep the board structure and stages
- improve column rhythm, visual grouping, and board density
- reduce the plain spreadsheet-card feel
- make job cards more premium and easier to scan quickly
- improve mobile behavior so the horizontal board still feels intentional rather than cramped

### 8.3 `/materials` Material Asset Center

Target feeling:

- "asset vault"
- more archival, more controlled, more systemized

Changes:

- make the summary zone feel like material control, not generic stats
- improve material card hierarchy:
  - version
  - direction
  - freshness
  - usage coverage
- make bound-job information feel curated and legible

### 8.4 `/review` Strategy Review Center

Target feeling:

- "strategy notebook" or "review console"
- a place where the Agent leaves accumulated judgment

Changes:

- emphasize Agent memory and strategy summaries as first-class content
- make review surfaces feel more editorial and reflective than operational
- keep funnel and review components, but reduce plain dashboard repetition

## 9. Mobile Strategy

This polish pass must improve mobile readability and browsing comfort, unlike the earlier PC-first constraint.

Rules:

- ensure the top header and main modules stack with clear breathing room
- reduce dead empty space in large cards on narrow screens
- preserve the intended command hierarchy on mobile
- horizontal board browsing is acceptable, but the board entry should feel controlled and previewable
- typography and paddings must be rebalanced for smaller widths

## 10. Motion Direction

Use motion sparingly and intentionally.

Allowed:

- gentle entrance / reveal on top-level sections
- refined hover or focus transitions
- subtle emphasis shifts for active / urgent content

Avoid:

- playful floating effects
- dramatic parallax
- ornamental micro-animation everywhere

## 11. Non-Goals

This design does **not** include:

- route changes
- feature changes
- workflow changes
- information architecture changes
- new product claims beyond current v1.2
- fake LLM interactions
- real file upload or backend capability expansion

## 12. Implementation Impact

This design is expected to affect:

- `src/app/globals.css`
- layout shell
- page header system
- sidebar branding area
- homepage dashboard surfaces
- board columns and job cards
- materials summary and material cards
- review summary surfaces

Minimal engineering adjustments are allowed when necessary to support:

- background layering
- avatar cropping / placement
- refined responsive behavior
- module composition changes

## 13. Acceptance Criteria

The polish pass is successful when:

1. The product still behaves like current v1.2.
2. The four core pages keep the same responsibilities.
3. The UI no longer feels like a default shadcn/Tailwind dashboard.
4. The homepage has a clear visual anchor in the `Agent 今日指挥` module.
5. The background and color system feel premium, light, and softly atmospheric.
6. `AgentLogo.png` is used only via crop / cleanup, never via regenerated character art.
7. The main speech bubble and secondary Agent judgment follow the confirmed copy hierarchy.
8. Desktop and mobile layouts both remain readable and intentional.
9. `npm run build` still passes after implementation.

## 14. Design Self-Review

- Placeholder scan: no TBD / TODO placeholders remain.
- Scope check: this stays within frontend polish, not product redesign.
- Consistency check: all decisions match the user's confirmed direction, especially B2, light premium atmosphere, and AgentLogo constraints.
- Ambiguity check: the Agent module now has a fixed primary line and a secondary supporting hint, which removes prior uncertainty about hierarchy.
