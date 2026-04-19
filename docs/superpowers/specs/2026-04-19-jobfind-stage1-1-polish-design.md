# JobFind Stage 1.1 Polish Design

## 1. Decision Summary

本轮是 `Stage 1.1 polish`，不是 `Stage 1.2`。

目标是把已经完成的 Agent 能力做得更完整，而不是继续大范围补功能。

本轮采用的策略是：

1. 前置 Agent 价值表达。
2. 显性化最有辨识度的帮助能力。
3. 补齐一个最关键的流程断点。
4. 修掉会伤害可信度的实现细节。

## 2. Scope

### 2.1 In Scope

- 首页任务区增加 Agent 解释层。
- 详情页 `AI 建议` 面板默认展开最相关帮助项。
- 面试复盘支持新增一条记录并持久化。
- 看板卡片时间判断统一到实时逻辑。
- JD 解析说明文案改成用户视角表达。

### 2.2 Out of Scope

- 自由聊天 Agent
- 模型主路径接入
- 完整材料中心扩展
- 渠道/策略分析
- 其他 Stage 1.2 功能补齐

## 3. Experience Changes

### 3.1 首页：今日任务升级

首页不再只是显示“前 5 个动作”，而应补一层 Agent 解释。

建议表达方式：

- 保留任务列表
- 在任务区顶部增加一句当前 Agent 判断摘要
- 或给每条任务补一个更短的“为什么排在前面”的解释

关键目标：

> 用户不进入详情页，也能感知 JobFind 的 Agent 不是普通任务清单。

### 3.2 详情页：帮助默认展开

现在用户需要先理解每个按钮的价值，再点击才能看到内容。

本轮应改为：

- 打开 `AI 建议` tab 时，自动展开最相关的一项帮助内容
- 仍允许用户切换其他帮助项

推荐映射规则：

- 有面试准备风险 -> 默认展开 `生成面试准备清单`
- 有沉默风险 -> 默认展开 `生成跟进话术`
- 有材料缺口 -> 默认展开 `查看材料补齐建议`
- 其他情况 -> 默认展开 `查看排序依据`

### 3.3 面试复盘：最小可用录入

新增能力只做最小闭环：

- 新增入口按钮
- 录入表单
- 保存到本地状态
- 立即展示在当前 tab

字段范围：

- 面试轮次
- 日期
- 高频问题（按换行切分）
- 复盘内容
- 结果

不做复杂编辑器、不做多条批量操作、不做高级筛选。

### 3.4 可信度细节

#### 看板时间逻辑

看板卡片当前不应使用固定参考时间。应改为基于当前时间计算关键节点状态，保持和风险标签一致。

#### JD 解析文案

说明文案应从“技术说明”切换到“产品说明”，例如强调：

- 系统会先整理岗位关键信息
- 保存后自动纳入 Agent 判断

而不是直接强调“不连接真实后端/AI”。

## 4. Architecture Impact

### 4.1 Agent Runtime

当前 `deterministic runtime` 不需要重构，但需要支持：

- 为首页输出更短的解释摘要
- 暴露默认帮助项的选择依据

### 4.2 Store

需要为面试复盘新增状态写入能力，例如：

- `addInterviewNote(jobId, note)`

仍然通过 localStorage 持久化。

### 4.3 UI Components

受影响的主要组件：

- `src/components/dashboard/today-tasks.tsx`
- `src/components/board/job-card.tsx`
- `src/components/job-detail/job-ai-panel.tsx`
- `src/components/job-detail/job-interview-notes.tsx`
- `src/components/ai/jd-parser-dialog.tsx`
- `src/hooks/use-jobfind-store.tsx`

## 5. Acceptance Criteria

本轮完成时必须满足：

1. 首页能更清楚表达 Agent 为什么优先处理当前任务。
2. 岗位详情中的 `AI 建议` 默认展开一项最相关帮助内容。
3. 用户可以新增一条面试复盘，并立即看到结果。
4. 新增复盘内容会持久化到 localStorage。
5. 看板卡片时间状态与风险判断不再失真。
6. JD 解析弹窗不再使用削弱产品感的实现说明。
7. 本轮没有扩张成自由聊天或完整 MVP。

## 6. Guardrails

为了确保仍属于 Stage 1.1，本轮必须坚持：

- 解释优先于功能堆叠
- 最小闭环优先于完整系统
- 一个关键断点优先于多个次要补丁
- 不引入必须依赖模型 API 的能力

## 7. Expected Outcome

完成本轮之后，JobFind 的 Stage 1.1 应该从：

> “已经有 Agent 面板了”

升级为：

> “首页就能看出它像一个 AI 求职项目经理，详情页也能承接关键动作，整体表达更完整、更可信。”
