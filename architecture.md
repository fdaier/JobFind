# JobFind 技术架构规划

> 本文档是 JobFind 项目从 PRD 到代码执行的桥梁，作为所有编码阶段的 Single Source of Truth。

## 1. 技术栈确认

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| UI Components | shadcn/ui | latest |
| State | React Context + localStorage | — |
| Package Manager | npm | — |
| Deployment | Vercel (static export) | — |

---

## 2. 数据模型定义

### 2.1 核心类型

```typescript
// ===== 枚举类型 =====

/** 岗位当前阶段 */
type JobStage =
  | "interested"    // 感兴趣
  | "to_apply"      // 待投递
  | "applied"       // 已投递
  | "written_test"  // 笔试/测评
  | "interviewing"  // 面试中
  | "offer"         // Offer
  | "rejected";     // 拒绝/归档

/** 岗位类型 */
type JobType = "campus" | "intern" | "management_trainee" | "social";

/** 招聘批次 */
type RecruitBatch = "autumn" | "spring" | "supplementary" | "summer_intern" | "daily_intern";

/** 来源渠道 */
type SourceChannel =
  | "official_site" | "boss" | "shixiseng" | "nowcoder"
  | "school_career" | "referral" | "campus_talk";

/** 风险等级 */
type RiskLevel = "critical" | "warning" | "normal";

/** 材料类型 */
type MaterialType = "resume" | "portfolio" | "transcript" | "certificate" | "cover_letter" | "other";

/** 任务优先级 */
type TaskPriority = "urgent" | "high" | "medium" | "low";

/** 任务类型 */
type TaskActionType =
  | "submit_application"  // 投递申请
  | "bind_material"       // 绑定材料
  | "prepare_interview"   // 准备面试
  | "follow_up"           // 跟进 HR
  | "take_test"           // 参加笔试/测评
  | "update_material"     // 更新材料
  | "review_interview";   // 面试复盘
```

### 2.2 岗位模型

```typescript
interface Job {
  id: string;
  company: string;
  position: string;
  jobType: JobType;
  batch: RecruitBatch;
  channel: SourceChannel;
  stage: JobStage;
  
  // 时间节点
  applicationDeadline: string | null;  // ISO date
  writtenTestDate: string | null;
  interviewDate: string | null;
  appliedDate: string | null;
  
  // JD 信息
  jdText: string;
  keywords: string[];
  requirements: string[];
  
  // 材料
  requiredMaterials: MaterialType[];
  boundMaterialIds: string[];
  
  // 联系人
  contactName: string | null;
  contactInfo: string | null;
  
  // AI 生成
  riskTags: RiskTag[];
  aiSuggestions: AISuggestion[];
  
  // 时间线
  timeline: TimelineEvent[];
  
  // 面试记录
  interviewNotes: InterviewNote[];
  
  createdAt: string;
  updatedAt: string;
}
```

### 2.3 其他模型

```typescript
interface RiskTag {
  type: "deadline" | "material_gap" | "silence" | "interview_prep";
  level: RiskLevel;
  message: string;
}

interface AISuggestion {
  id: string;
  action: string;        // "补充作品集" / "准备一面"
  reason: string;        // "网申截止还剩 18 小时"
  priority: TaskPriority;
  actionType: TaskActionType;
  completed: boolean;
}

interface TimelineEvent {
  date: string;
  stage: JobStage;
  description: string;
}

interface InterviewNote {
  round: string;         // "一面" / "二面" / "HR面"
  date: string;
  questions: string[];
  reflection: string;
  result: "passed" | "failed" | "pending";
}

interface Material {
  id: string;
  name: string;
  type: MaterialType;
  targetDirection: string;     // "产品经理" / "产品运营" / "通用"
  version: string;             // "v2.1"
  lastUpdated: string;
  boundJobIds: string[];
}

interface TodayTask {
  id: string;
  jobId: string;
  company: string;
  position: string;
  action: string;
  reason: string;
  priority: TaskPriority;
  actionType: TaskActionType;
  completed: boolean;
}

interface FunnelData {
  interested: number;
  toApply: number;
  applied: number;
  writtenTest: number;
  interviewing: number;
  offer: number;
  rejected: number;
}
```

---

## 3. 完整样例数据

### 3.1 样例岗位（8 条）

> 日期基准：相对于当前日期动态计算，确保演示时风险状态正确。代码中用 `new Date()` 动态偏移。

| # | 公司 | 岗位 | 阶段 | 渠道 | 核心演示点 |
|---|------|------|------|------|-----------|
| 1 | 腾讯 | 产品策划实习 | applied | official_site | **DDL 当日截止** + 作品集未绑定 |
| 2 | 字节跳动 | AI 产品经理实习 | interviewing | boss | **明天一面** + 需准备推荐系统案例 |
| 3 | 小红书 | 产品运营实习 | applied | referral | **已投递 12 天无反馈** + 跟进建议 |
| 4 | 美团 | 产品经理（校招） | written_test | nowcoder | 笔试已通过，等待面试通知 |
| 5 | 阿里巴巴 | 产品实习 | interested | school_career | DDL 5 天后，还没投递 |
| 6 | 网易 | 游戏策划实习 | offer | campus_talk | 已拿 Offer，需决定 |
| 7 | 京东 | 产品运营 | rejected | official_site | 被拒，归档参考 |
| 8 | 快手 | 产品经理实习 | to_apply | shixiseng | 待投递，材料齐全，正常状态 |

### 3.2 样例材料（6 条）

| # | 名称 | 类型 | 方向 | 版本 | 绑定岗位 |
|---|------|------|------|------|---------|
| 1 | 产品经理简历 | resume | 产品经理 | v2.3 | 腾讯、字节、美团、阿里、快手 |
| 2 | 运营方向简历 | resume | 产品运营 | v1.8 | 小红书、京东 |
| 3 | AI 产品作品集 | portfolio | 产品经理 | v1.2 | 字节（未绑定到腾讯→材料缺口） |
| 4 | 本科成绩单 | transcript | 通用 | 2025 春 | 腾讯、阿里 |
| 5 | 游戏策划作品集 | portfolio | 游戏策划 | v1.0 | 网易 |
| 6 | CET-6 证书 | certificate | 通用 | — | 美团 |

---

## 4. 目录结构

```
src/
├── app/
│   ├── layout.tsx              # 全局布局：Sidebar + Main Content
│   ├── page.tsx                # 首页：今日求职作战台（Dashboard）
│   ├── board/
│   │   └── page.tsx            # 申请看板页
│   ├── materials/
│   │   └── page.tsx            # 材料中心页
│   └── globals.css             # 全局样式 + Tailwind 导入
│
├── components/
│   ├── layout/
│   │   ├── app-sidebar.tsx     # 侧边栏导航（使用 shadcn Sidebar）
│   │   └── page-header.tsx     # 页面标题栏
│   │
│   ├── dashboard/
│   │   ├── stats-summary.tsx   # 顶部统计卡片行（4 个指标）
│   │   ├── today-tasks.tsx     # 今日优先任务列表
│   │   ├── risk-radar.tsx      # 风险雷达面板
│   │   ├── mini-kanban.tsx     # 首页迷你看板预览
│   │   └── funnel-chart.tsx    # 申请漏斗图
│   │
│   ├── board/
│   │   ├── kanban-board.tsx    # 看板容器（管理列）
│   │   ├── kanban-column.tsx   # 看板单列（阶段列）
│   │   └── job-card.tsx        # 岗位卡片
│   │
│   ├── job-detail/
│   │   ├── job-detail-sheet.tsx    # 岗位详情抽屉（Sheet 容器）
│   │   ├── job-info-section.tsx    # JD 和基本信息
│   │   ├── job-timeline.tsx        # 时间线
│   │   ├── job-materials.tsx       # 已绑定材料 + 缺口
│   │   ├── job-ai-panel.tsx        # AI 建议面板
│   │   └── job-interview-notes.tsx # 面试记录
│   │
│   ├── materials/
│   │   ├── material-list.tsx   # 材料列表
│   │   └── material-card.tsx   # 材料卡片（版本、绑定关系）
│   │
│   ├── ai/
│   │   ├── jd-parser-dialog.tsx    # JD 解析 Dialog
│   │   └── jd-parser-result.tsx    # 解析结果预览
│   │
│   └── ui/                    # shadcn/ui 组件（CLI 安装）
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── progress.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── sonner.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
│
├── lib/
│   ├── types.ts               # 所有 TypeScript 类型定义
│   ├── mock-data.ts           # 样例岗位 + 材料数据
│   ├── rules-engine.ts        # 规则引擎（风险、优先级、材料缺口）
│   ├── storage.ts             # localStorage 读写封装
│   └── utils.ts               # 工具函数（日期格式化、cn 合并等）
│
└── hooks/
    ├── use-jobs.ts            # 岗位 CRUD + 状态管理
    ├── use-materials.ts       # 材料数据管理
    └── use-today-tasks.ts     # 今日任务计算
```

每个文件的最大复杂度控制在 150 行以内，确保 AI 能在单次交互中完整生成。

---

## 5. 组件树

### 5.1 首页（今日求职作战台）

```
page.tsx (Dashboard)
├── PageHeader ("今日求职作战台")
├── StatsSummary
│   ├── StatCard × 4（本周投递、待处理、高风险、即将面试）
├── div.grid (3 column layout)
│   ├── TodayTasks (左侧)
│   │   └── TaskItem × 3~5
│   ├── MiniKanban (中间)
│   │   └── MiniColumn × 7（各阶段卡片数量）
│   └── RiskRadar (右侧)
│       └── RiskItem × N
└── FunnelChart (底部)
```

### 5.2 申请看板

```
page.tsx (Board)
├── PageHeader ("申请看板") + Button("粘贴 JD 添加岗位")
├── KanbanBoard
│   └── KanbanColumn × 7
│       └── JobCard × N
│           ├── Badge (风险标签)
│           ├── 公司 + 岗位
│           ├── DDL 信息
│           └── 材料完整度 Progress
└── JDParserDialog (点击按钮触发)
    └── JDParserResult

点击 JobCard → 打开 JobDetailSheet
```

### 5.3 岗位详情抽屉

```
JobDetailSheet (Sheet, 从右侧滑入)
├── SheetHeader (公司 + 岗位 + 阶段 Badge)
├── Tabs
│   ├── Tab: 基本信息
│   │   └── JobInfoSection (JD、关键词、要求、联系人)
│   ├── Tab: 时间线
│   │   └── JobTimeline (TimelineEvent 列表)
│   ├── Tab: 材料
│   │   └── JobMaterials (已绑定 + 缺口列表)
│   ├── Tab: AI 建议
│   │   └── JobAIPanel (AISuggestion 列表 + 行动按钮)
│   └── Tab: 面试记录
│       └── JobInterviewNotes (面试轮次 + 问题 + 复盘)
└── SheetFooter (推进阶段按钮)
```

### 5.4 材料中心

```
page.tsx (Materials)
├── PageHeader ("材料中心")
├── MaterialList
│   └── MaterialCard × N
│       ├── 材料名称 + 类型 Badge
│       ├── 版本 + 更新时间
│       ├── 适用方向
│       └── 绑定岗位列表
```

---

## 6. 规则引擎逻辑

### 6.1 风险判断规则

```
输入：Job 对象 + 当前时间
输出：RiskTag[]

规则（按优先级排序）：

1. DDL 紧急（critical）：
   IF stage IN [interested, to_apply, applied]
   AND applicationDeadline exists
   AND 距离 DDL ≤ 24 小时
   → { type: "deadline", level: "critical", message: "网申截止还剩 X 小时" }

2. DDL 临近（warning）：
   IF stage IN [interested, to_apply, applied]
   AND applicationDeadline exists
   AND 距离 DDL ≤ 3 天 AND > 24 小时
   → { type: "deadline", level: "warning", message: "网申截止还剩 X 天" }

3. 材料缺口（warning）：
   IF requiredMaterials 中有材料未在 boundMaterialIds 中
   → { type: "material_gap", level: "warning", message: "缺少 X 份材料：[材料名]" }

4. 面试临近（critical）：
   IF stage == "interviewing"
   AND interviewDate exists
   AND 距离面试 ≤ 3 天
   → { type: "interview_prep", level: "critical", message: "X 面试还剩 X 天" }

5. 长期无反馈（warning）：
   IF stage == "applied"
   AND appliedDate exists
   AND 距今 ≥ 10 天
   → { type: "silence", level: "warning", message: "已投递 X 天无反馈" }
```

### 6.2 今日任务生成规则

```
输入：所有 Job 对象
输出：TodayTask[]，按优先级排序，最多 5 条

优先级评分：
  - critical 风险 → 权重 100
  - warning 风险 → 权重 50
  - DDL 距离越近 → 额外加分（24h 内 +50，3天内 +20）
  - 面试类任务 → 额外 +30

任务映射：
  - deadline + critical → "立即投递 [公司][岗位]"
  - material_gap → "为 [公司][岗位] 绑定 [材料名]"
  - interview_prep → "准备 [公司] [面试轮次]"
  - silence → "跟进 [公司][岗位] HR"
```

### 6.3 材料完整度计算

```
输入：Job.requiredMaterials + Job.boundMaterialIds + 材料库
输出：{ percentage: number, missing: MaterialType[] }

percentage = (已绑定且存在的材料数 / 要求材料数) × 100
missing = 要求但未绑定的材料类型列表
```

### 6.4 漏斗数据计算

```
输入：所有 Job 对象
输出：FunnelData

直接按 stage 分组计数。
rejected 不参与漏斗主流，单独显示在侧边。
```

---

## 7. 状态管理方案

```
AppContext (React Context)
├── jobs: Job[]                    // 所有岗位
├── materials: Material[]          // 所有材料
├── setJobs / setMaterials         // 更新函数
├── selectedJobId: string | null   // 当前打开详情的岗位
├── setSelectedJobId               // 控制详情抽屉开关
└── isJDParserOpen: boolean        // JD 解析 Dialog 开关

数据流：
1. 首次加载 → 检查 localStorage
   - 有数据 → 加载到 Context
   - 无数据 → 加载 mock-data.ts 默认数据
2. 用户操作（切换阶段、标记完成等）→ 更新 Context → 同步写入 localStorage
3. 规则引擎是纯函数，每次渲染时从 Context 读数据实时计算

不使用 Zustand / Redux：项目规模小，Context + localStorage 足够，避免额外依赖。
```

---

## 8. 交互状态机

### 8.1 JD 解析流程

```
[空闲] → 点击"粘贴 JD 添加岗位"
  → [Dialog 打开: 输入状态] 显示 Textarea
    → 用户粘贴 JD 文本 + 点击"解析"
      → [解析中状态] 显示 Spinner（模拟 1 秒延迟）
        → [预览状态] 显示解析结果卡片
          → 用户点击"保存到看板"
            → 写入 jobs 数据 → 关闭 Dialog → Sonner 提示"岗位已添加"
          → 用户点击"取消"
            → 关闭 Dialog
```

### 8.2 阶段推进流程

```
用户在看板或详情页点击"推进阶段"
  → 显示 Select 选择下一阶段
    → 确认 → 更新 job.stage + 添加 TimelineEvent
      → 规则引擎重新计算风险和任务
```

### 8.3 任务标记完成

```
用户在今日任务或 AI 建议面板点击 ✓
  → suggestion.completed = true
    → 任务从列表中标记为已完成（不移除，划线显示）
```

---

## 9. 视觉设计规范

### 9.1 色彩体系

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色 | `hsl(221, 83%, 53%)` (蓝) | 品牌色、主要按钮 |
| 成功 | `hsl(142, 76%, 36%)` (绿) | 正常状态、Offer |
| 警告 | `hsl(38, 92%, 50%)` (琥珀) | 3 天内 DDL、材料缺口 |
| 危险 | `hsl(0, 84%, 60%)` (红) | 24h 内 DDL、紧急面试 |
| 中性 | `hsl(220, 9%, 46%)` (灰) | 已归档/拒绝 |
| 背景 | 浅色模式为主 | 匹配 shadcn 默认浅色主题，保持清爽干净 |

### 9.2 阶段颜色映射

| 阶段 | 颜色 | Badge Variant |
|------|------|---------------|
| interested | 蓝灰 | outline |
| to_apply | 蓝 | default |
| applied | 靛蓝 | default |
| written_test | 紫 | secondary |
| interviewing | 琥珀 | warning |
| offer | 绿 | success |
| rejected | 灰 | destructive |

---

## 10. 分阶段执行计划

### Phase 1：基础层（数据 + 规则 + 骨架）

**目标**：项目能跑起来，数据层完整，规则引擎可用。

| 任务 | 文件 | 产出 |
|------|------|------|
| 初始化 Next.js 项目 | — | 项目可 `npm run dev` |
| 安装 shadcn/ui + 所需组件 | components/ui/* | 所有 UI 组件就绪 |
| 定义类型 | lib/types.ts | 所有 interface/type |
| 编写样例数据 | lib/mock-data.ts | 8 岗位 + 6 材料完整数据 |
| 编写规则引擎 | lib/rules-engine.ts | 风险判断 + 任务生成 + 材料检查 |
| 编写存储封装 | lib/storage.ts | localStorage 读写 |
| 编写 Context | hooks/use-jobs.ts 等 | 全局状态可用 |
| 全局布局 + 侧边栏 | app/layout.tsx + app-sidebar.tsx | 侧边栏页面框架 |

**验证**：打开浏览器，侧边栏可点击，控制台能打印 mock data。

---

### Phase 2：首页 + 看板

**目标**：核心两个页面可看可交互。

| 任务 | 文件 | 产出 |
|------|------|------|
| 统计卡片行 | dashboard/stats-summary.tsx | 4 个指标数字 |
| 今日任务面板 | dashboard/today-tasks.tsx | 3~5 条任务，可标记完成 |
| 风险雷达面板 | dashboard/risk-radar.tsx | 风险列表，红黄绿标签 |
| 迷你看板 | dashboard/mini-kanban.tsx | 各阶段数量预览 |
| 漏斗图 | dashboard/funnel-chart.tsx | 转化漏斗可视化 |
| 首页组装 | app/page.tsx | Dashboard 完整 |
| 看板容器 | board/kanban-board.tsx | 7 列布局 |
| 看板列 | board/kanban-column.tsx | 阶段列 + 计数 |
| 岗位卡片 | board/job-card.tsx | 公司、岗位、DDL、风险、材料完整度 |
| 看板页组装 | app/board/page.tsx | Kanban 完整 |

**验证**：首页能看到今日任务和风险；看板页能看到 8 个岗位卡片分布在不同列。

---

### Phase 3：详情 + 材料

**目标**：岗位深潜信息完整，材料中心可用。

| 任务 | 文件 | 产出 |
|------|------|------|
| 详情抽屉容器 | job-detail/job-detail-sheet.tsx | Sheet 滑入，Tabs 切换 |
| 基本信息 Tab | job-detail/job-info-section.tsx | JD、要求、联系人 |
| 时间线 Tab | job-detail/job-timeline.tsx | 状态变更记录 |
| 材料 Tab | job-detail/job-materials.tsx | 已绑定 + 缺口 |
| AI 建议 Tab | job-detail/job-ai-panel.tsx | 建议列表 + 行动按钮 |
| 面试记录 Tab | job-detail/job-interview-notes.tsx | 面试问题 + 复盘 |
| 阶段推进 | job-detail-sheet.tsx footer | Select 选择 + 确认 |
| 材料列表 | materials/material-list.tsx | 材料分组展示 |
| 材料卡片 | materials/material-card.tsx | 版本、方向、绑定关系 |
| 材料中心页 | app/materials/page.tsx | 完整页面 |

**验证**：点击看板卡片能打开详情抽屉，5 个 Tab 都有内容；材料中心能看到 6 份材料和绑定关系。

---

### Phase 4：AI 流程 + 打磨

**目标**：JD 解析演示可走通，整体视觉打磨完成。

| 任务 | 文件 | 产出 |
|------|------|------|
| JD 解析 Dialog | ai/jd-parser-dialog.tsx | 输入 → 解析 → 预览 → 保存 |
| JD 解析结果 | ai/jd-parser-result.tsx | 解析出的卡片预览 |
| 预设 JD 样例 | lib/mock-data.ts 追加 | 一段完整的样例 JD 文本 |
| 视觉打磨 | globals.css + 各组件 | 动画、间距、颜色微调 |
| 空状态处理 | 各列表组件 | Empty 态展示 |
| 操作反馈 | 使用 Sonner | 保存、推进等操作的 Toast |
| 演示路径验证 | — | 按 PRD Demo Script 走一遍 |

**验证**：按 PRD 8.3 Demo Script 完整走一遍，所有步骤顺畅。

---

## 11. 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| Tailwind v4 + shadcn 兼容问题 | 初始化卡住 | 查看 shadcn 最新安装文档，必要时回退 v3 |
| 组件太多导致一天写不完 | Phase 3/4 缩水 | Phase 1/2 是底线，Phase 3 优先详情抽屉（P0），材料中心降级 |
| 规则引擎边界情况 | 风险标签不准 | 样例数据先硬编码调通，再提取为通用规则 |
| 浅色模式排版问题 | 某些文字层次不清 | 用 shadcn 内置 light mode token，避免硬编码颜色 |

---

## 已确认的设计决策

| 问题 | 决策 |
|------|------|
| 深色 vs 浅色模式 | **默认浅色模式**，保持干净、清爽、高效的工具感 |
| UI 语言 | **全中文界面**，特定行业术语保留英文（如 Offer、JD、HR、DDL、Boss 等） |
| 移动端适配 | **首版只做 PC 端**，不做响应式适配 |
| 前端编码 | 由 frontend-design skill 执行，本文档作为其输入规格 |
