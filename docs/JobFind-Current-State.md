# JobFind 当前状态与新对话交接

> 最后更新：2026-09-14。新对话在修改本项目之前必须先阅读本文。

## 当前事实源

- 工作目录：`D:\projects\JobFind`
- 稳定分支与当前产品提交：`main` / `103c804 feat: add note during JD intake`
- GitHub：<https://github.com/fdaier/JobFind>
- 生产地址：<https://jobfind.fdaier.xyz>
- Vercel 项目：`fdaiers-projects/jobfind-core-loop`
- 当前生产部署：`dpl_9KJeQA2DjwS31F1D8183ByXgnkpB`（2026-09-14，Ready）

根目录 `main` 是当前实施和发布来源。`.worktrees/jobfind-core-loop`、`CODING-CHAIN-NOTES.md` 和旧 Stage 1/v1.2 文档只保留为历史上下文；不得再把其中“worktree 是唯一事实来源”的表述当作当前部署指令。

## 产品现状

JobFind 是面向学生求职的“AI 求职项目经理”原型，核心闭环是：岗位入池 → 阶段推进 → 风险识别与今日任务 → 材料、时间线和面试复盘 → 下一轮策略。

| 路径 | 当前能力 |
| --- | --- |
| `/` | 今日作战台、任务排序、风险雷达、转化漏斗 |
| `/board` | 十阶段校招申请看板、真实 JD 导入（公司/岗位名称/JD）、备注、详情编辑、阶段推进与删除 |
| `/materials` | 材料版本、覆盖关系与缺口提示 |
| `/review` | 渠道、材料、面试与 Agent 策略复盘 |

技术栈为 Next.js App Router、React、TypeScript、Tailwind CSS、Radix UI、Vitest。应用使用静态导出和浏览器 localStorage；没有账号、后端、跨设备同步或真实 LLM API。当前 Agent 是可解释的确定性规则运行时。

## 最近完成：申请看板 V3（待生产发布）

已按确认的 V3 草案完成本地实现：

- 看板流程更新为待投递、已投递、测评、笔试、一面、二面、三面、HR面、录用、已淘汰；阶段推进会保留时间线，终态仍可删除。
- 卡片只展示关键时间、Agent 风险与 20 字以内的备注；材料完成度仅保留在详情的材料页。
- 详情抽屉中，Agent 作战台保持只读；基本信息、材料、时间线与面试复盘均有独立编辑入口、取消和保存。材料关联双向同步。
- 读取旧 localStorage 岗位时，先备份原始 JSON 至 `jobfind.jobs.backup.v3`，再将 `关注中 → 待投递`、`面试 → 一面`（含时间线）做幂等迁移，并补空备注；结构异常数据保留原始值而不再清空整个岗位数组。
- JD 标签改名为“JD 命中的术语（可编辑）”，移除了过宽的 `AI`、`增长`、`原型`匹配规则；当前仍是本地规则，不是 LLM/语义分析。

正式依据：

- `docs/superpowers/specs/2026-09-14-jobfind-board-workflow-and-editing-design.md`
- `docs/superpowers/plans/2026-09-14-jobfind-board-workflow-and-editing.md`

本地已完成 18 个测试文件、55 个测试，`tsc --noEmit`、`npm run lint` 与静态生产构建；本地浏览器已验证十列、卡片备注和基本信息编辑保存。生产部署 `dpl_HZayunEQ2vKtnKR239QVMXQAvke7` Ready，`jobfind.fdaier.xyz/board` 返回 HTTP 200，线上已确认十阶段与备注卡片。

后续小版本 `103c804` 已在生产部署 `dpl_9KJeQA2DjwS31F1D8183ByXgnkpB` Ready：导入 JD 的首屏和预览页均可填写 20 字备注；公司名和岗位名在卡片中使用同级标题样式。该版本同样通过完整测试、类型检查、lint、静态构建与本地/生产浏览器检查，且不改写既有岗位。

## 历史完成：岗位删除

岗位进入“录用”或“已淘汰”后不再卡死在终态列：所有七个阶段均可从详情抽屉底部删除岗位。入口低强调度、删除前二次确认；删除会移除岗位自身的时间线和面试复盘、清理材料的 `boundJobIds`，并通过既有 localStorage 流程持久化。

设计与实施依据：

- `docs/superpowers/specs/2026-09-12-jobfind-board-job-deletion-design.md`
- `docs/superpowers/plans/2026-09-12-jobfind-board-job-deletion.md`

## 已验证状态

- 2026-09-14 真实 JD 导入：18 个测试文件、54 个测试通过，`tsc --noEmit`、`eslint src`、静态生产构建通过；已用“腾讯 · AI 产品经理”完成本地与生产浏览器的录入、预览和保存验证。
- Vercel 生产别名和 `jobfind.fdaier.xyz` 均指向本次部署并返回 HTTP 200；线上 `/board` 已包含真实 JD 导入与岗位删除功能。
- 本地真实 JD 导入要求公司、岗位名称和 JD 正文，DDL 可选；DDL 使用年／月／日输入框和日历选择器，预览和保存共享同一份用户草稿，关键词/材料建议为可编辑的本地规则输出。该交互不迁移或改写既有 localStorage 岗位数据。

## 后续优先级与边界

1. V3 已发布。用户已有数据的安全迁移是长期不变的发布约束，禁止移除或跳过 `jobfind.jobs.backup.v3` 备份。
2. 真实 JD 导入的正式依据：`superpowers/specs/2026-09-14-jobfind-real-jd-intake-design.md` 与对应计划。它是单浏览器、本地存储的申请管理能力，不是自动投递或真实 LLM。
3. 生产浏览器校验时发现一条 React hydration 警告（minified #418）；真实 JD 表单及保存流程未受影响，原因尚未归因。下次前端迭代前应复现并消除该警告。
4. 若推进 V2，下一优先级为 `DRAFT-PRD-JobFind-V2-Review-Center.md` 的结构化复盘输入；它目前尚未实施。
5. 删除功能暂不做回收站或 Undo；本期选择低频、慎重删除，未来再统一设计恢复语义。
6. 只有出现真实、多设备用户数据需求时才引入账号、后端和数据库。
7. 只有验证自然语言体验收益后才接入 LLM；不把开发时使用 A1/Codex 与产品线上模型能力混为一谈。

## 新对话执行规则

1. 先读本文及要修改功能对应的 spec / plan；先检查 `git status` 并保留无关用户改动。
2. 新功能遵循“设计草案 → 用户确认 → 正式文档与实现 → 验证 → git commit”的流程。
3. 发布前确认 Vercel 身份和项目绑定；发布后检查生产域名。详细命令见 `docs/JobFind-Vercel-Deployment.md`。
