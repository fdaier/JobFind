# JobFind v1.2 Complete Product Design

## 1. Background

Stage 1.1 已经完成了核心闭环和 Agent 前置表达：用户可以从今日作战台进入申请看板，打开岗位详情，看到 Agent 作战台，完成 JD 解析、岗位新增、阶段推进和面试复盘录入。

v1.2 的目标不是接入真实后端、真实文件上传或真实模型 API，而是把 PRD 中尚未完整表达的 P1 产品面补齐，让 JobFind 从“核心流可演示”升级为“完整 MVP 可讲清楚”。

## 2. Product Goal

让评审和用户在 3 分钟内看到一个完整的学生求职项目经理：

- Agent 会安排今日优先级。
- Agent 会盯岗位风险。
- Agent 会管理材料版本与缺口。
- Agent 会沉淀渠道、面试和材料策略复盘。
- 用户仍然保留确认权，系统不宣称全自动执行。

## 3. Scope

### In Scope

1. 新增 `材料中心` 页面。
   - 展示所有材料版本、方向、更新时间、绑定岗位。
   - 展示 Agent 材料调度建议：哪些材料覆盖面高，哪些岗位缺材料，下一步该补什么。
   - 支持从侧边栏进入。

2. 新增 `复盘中心` 页面。
   - 展示申请阶段漏斗。
   - 展示渠道复盘：不同渠道的岗位数量、推进数量、Offer 数、风险数。
   - 展示 Agent 策略记忆：从当前申请池中总结可执行的投递策略建议。
   - 展示面试复盘沉淀：已记录面试问题、复盘数量和下一步建议。
   - 支持从侧边栏进入。

3. 新增纯函数洞察层。
   - 从现有 `jobs` 与 `materials` 计算材料覆盖、渠道表现、面试复盘、Agent 记忆。
   - 不引入新后端，不引入伪造异步，不引入模型 API 依赖。

4. 保持 Agent 可感知。
   - 页面标题、说明、核心卡片都用 `Agent` 视角表达。
   - 复盘不是普通统计报表，而是“Agent 根据当前申请池形成策略记忆”。

### Out Of Scope

- 登录、账号、权限。
- 真实文件上传和云存储。
- 真实招聘平台、邮箱、日历同步。
- 真实 LLM Agent 主路径。
- 自动发送邮件或自动投递。
- 大型图表库和复杂 BI 报表。

## 4. Information Architecture

v1.2 后主导航为：

1. `今日作战台`
2. `申请看板`
3. `材料中心`
4. `复盘中心`

首页仍是日常入口；申请看板仍是岗位推进入口；材料中心承接“材料版本与缺口”；复盘中心承接“策略与长期记忆”。

## 5. Core Experience

### 5.1 Materials Center

用户打开材料中心后，应立即看到：

- 页面标题：`材料中心`
- 页面说明：`Agent 会把材料版本、绑定岗位和缺口放在一起看，先补最影响推进的材料。`
- Agent 调度卡：
  - 已管理材料数量。
  - 覆盖岗位最多的材料。
  - 当前缺口最多的材料类型。
  - 一条明确建议，例如：`优先补齐作品集，因为它正在影响腾讯 AI 产品实习生。`
- 材料卡列表：
  - 材料名、类型、版本、方向、最近更新。
  - 已绑定岗位列表。
  - Agent 使用判断，例如：`覆盖 8 个岗位，是当前最核心的通用材料。`

### 5.2 Review Center

用户打开复盘中心后，应立即看到：

- 页面标题：`复盘中心`
- 页面说明：`Agent 会把阶段、渠道、材料和面试记录沉淀成下一轮投递策略。`
- 转化漏斗：复用现有阶段数据，但文案升级为策略复盘。
- 渠道复盘：
  - 每个渠道的岗位数、推进数、Offer 数、风险数。
  - Agent 推荐优先维护的渠道。
- Agent 策略记忆：
  - 渠道策略，例如 `Boss 与官网渠道更容易推进到后续阶段。`
  - 材料策略，例如 `产品经理方向简历覆盖面最高，作品集仍是主要缺口。`
  - 面试策略，例如 `已有面试复盘中，项目拆解与指标问题出现频率较高。`
- 面试复盘沉淀：
  - 已记录复盘数量。
  - 高频问题摘要。
  - 下一步建议。

## 6. Data And Logic

新增 `src/lib/review-insights.ts`，只做纯计算：

- `buildMaterialInsights(jobs, materials)`
  - 材料总数。
  - 覆盖岗位最多的材料。
  - 缺口材料类型及受影响岗位。
  - 材料建议文案。

- `buildChannelInsights(jobs, materials)`
  - 每个渠道的岗位数、推进数、Offer 数、风险数。
  - 推荐渠道。
  - 渠道建议文案。

- `buildInterviewInsights(jobs)`
  - 面试复盘总数。
  - 高频问题。
  - 下一步建议。

- `buildAgentMemoryInsights(jobs, materials)`
  - 聚合材料、渠道、面试三类记忆，输出 3 到 5 条用户可读策略建议。

这些函数不改动数据，只根据现有 state 计算结果。

## 7. Acceptance Criteria

### Product

1. 侧边栏出现 `材料中心` 和 `复盘中心`。
2. `/materials` 页面可访问，并展示 Agent 材料调度建议和全部材料卡。
3. `/review` 页面可访问，并展示渠道复盘、策略记忆、面试复盘沉淀。
4. 新页面不能出现“模拟”“本地规则”“无后端”等破坏产品沉浸感的实现说明。
5. Agent 必须在新页面上被显性看见，而不是只在代码或标题里出现。

### Technical

1. 洞察计算在纯函数中完成，并有单元测试。
2. 页面测试覆盖侧边栏入口、新页面关键标题和 Agent 文案。
3. 不新增外部依赖。
4. 不破坏现有 Stage 1.1 流程。
5. 全量 `test`、`typecheck`、`lint`、`build` 通过。
6. Playwright 冒烟验证 `/`、`/board`、`/materials`、`/review` 无控制台错误。

## 8. Design Self-Review

- Placeholder scan: No TBD/TODO placeholders remain.
- Scope check: This is one coherent v1.2 slice focused on P1 MVP completion, not backend/productization.
- Consistency check: The design reuses existing `jobs`, `materials`, `FunnelChart`, Context state, and deterministic Agent positioning.
- Ambiguity check: v1.2 explicitly excludes real uploads, real backend, and model API dependency.
