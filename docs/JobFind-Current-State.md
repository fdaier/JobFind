# JobFind 当前状态与新对话交接

> 最后更新：2026-09-14。新对话在修改本项目之前必须先阅读本文。

## 当前事实源

- 工作目录：`D:\projects\JobFind`
- 稳定分支与当前产品提交：`main` / `68259b7 feat: support real JD intake on application board`
- GitHub：<https://github.com/fdaier/JobFind>
- 生产地址：<https://jobfind.fdaier.xyz>
- Vercel 项目：`fdaiers-projects/jobfind-core-loop`
- 当前生产部署：`dpl_Fx5QpB5bPbdtY4e2L7nVL3PueU2E`（2026-09-14，Ready）

根目录 `main` 是当前实施和发布来源。`.worktrees/jobfind-core-loop`、`CODING-CHAIN-NOTES.md` 和旧 Stage 1/v1.2 文档只保留为历史上下文；不得再把其中“worktree 是唯一事实来源”的表述当作当前部署指令。

## 产品现状

JobFind 是面向学生求职的“AI 求职项目经理”原型，核心闭环是：岗位入池 → 阶段推进 → 风险识别与今日任务 → 材料、时间线和面试复盘 → 下一轮策略。

| 路径 | 当前能力 |
| --- | --- |
| `/` | 今日作战台、任务排序、风险雷达、转化漏斗 |
| `/board` | 七阶段申请看板、真实 JD 导入（公司/岗位名称/JD）、详情、阶段推进与删除 |
| `/materials` | 材料版本、覆盖关系与缺口提示 |
| `/review` | 渠道、材料、面试与 Agent 策略复盘 |

技术栈为 Next.js App Router、React、TypeScript、Tailwind CSS、Radix UI、Vitest。应用使用静态导出和浏览器 localStorage；没有账号、后端、跨设备同步或真实 LLM API。当前 Agent 是可解释的确定性规则运行时。

## 最近完成：岗位删除

岗位进入“录用”或“已淘汰”后不再卡死在终态列：所有七个阶段均可从详情抽屉底部删除岗位。入口低强调度、删除前二次确认；删除会移除岗位自身的时间线和面试复盘、清理材料的 `boundJobIds`，并通过既有 localStorage 流程持久化。

设计与实施依据：

- `docs/superpowers/specs/2026-09-12-jobfind-board-job-deletion-design.md`
- `docs/superpowers/plans/2026-09-12-jobfind-board-job-deletion.md`

## 已验证状态

- 2026-09-14 真实 JD 导入：18 个测试文件、53 个测试通过，`tsc --noEmit`、`eslint src`、静态生产构建通过；已用“腾讯 · AI 产品经理”完成本地与生产浏览器的录入、预览和保存验证。
- Vercel 生产别名和 `jobfind.fdaier.xyz` 均指向本次部署并返回 HTTP 200；线上 `/board` 已包含真实 JD 导入与岗位删除功能。
- 本地真实 JD 导入要求公司、岗位名称和 JD 正文，DDL 可选；预览和保存共享同一份用户草稿，关键词/材料建议为可编辑的本地规则输出。

## 后续优先级与边界

1. 真实 JD 导入的正式依据：`superpowers/specs/2026-09-14-jobfind-real-jd-intake-design.md` 与对应计划。它是单浏览器、本地存储的申请管理能力，不是自动投递或真实 LLM。
2. 若推进 V2，下一优先级为 `DRAFT-PRD-JobFind-V2-Review-Center.md` 的结构化复盘输入；它目前尚未实施。
3. 删除功能暂不做回收站或 Undo；本期选择低频、慎重删除，未来再统一设计恢复语义。
4. 只有出现真实、多设备用户数据需求时才引入账号、后端和数据库。
5. 只有验证自然语言体验收益后才接入 LLM；不把开发时使用 A1/Codex 与产品线上模型能力混为一谈。

## 新对话执行规则

1. 先读本文及要修改功能对应的 spec / plan；先检查 `git status` 并保留无关用户改动。
2. 新功能遵循“设计草案 → 用户确认 → 正式文档与实现 → 验证 → git commit”的流程。
3. 发布前确认 Vercel 身份和项目绑定；发布后检查生产域名。详细命令见 `docs/JobFind-Vercel-Deployment.md`。
