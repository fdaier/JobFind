# JobFind 编码链路

## 1. 工作原则

JobFind 的第一阶段实现采用文档驱动、分阶段提交、subagent-driven 的编码链路。目标不是最快堆完页面，而是在每个可回退版本里保持需求、实现、验证和审查一致。

当前产品路线为：

1. Stage 1：A - Core Loop Prototype，先完成核心闭环。
2. Stage 1.1：C - Agent Deepening，再深化 Agent 表达和解释能力。
3. Stage 1.2：B - Full MVP Completion，最后补齐完整 MVP 功能面。
4. Stage 2：LLM Agent Upgrade，后续再接入真实模型能力。

第一轮编码只实现 Stage 1。

## 2. 文档输入

编码前必须先完成并确认两类文档：

- 设计文档：`docs/superpowers/specs/2026-04-19-jobfind-core-loop-design.md`
- 实施计划：`docs/superpowers/plans/2026-04-19-jobfind-core-loop.md`

设计文档回答“做什么、为什么、如何验收”。实施计划回答“按什么任务顺序做、改哪些文件、怎么验证”。

后续 worker 和 reviewer 都应以这两份文档为边界，不能随意扩大到 Stage 1.1、Stage 1.2 或 Stage 2。

## 3. Git 与工作区

项目使用 git 保证可回退：

- `main` 保存文档基线和稳定状态。
- `feature/jobfind-core-loop` 用于 Stage 1 实现。
- 实际开发工作区位于 `.worktrees/jobfind-core-loop`。
- `.worktrees/` 已加入 `.gitignore`，避免误提交工作区内容。

每完成一个可验证版本都要提交一次。提交要小而清晰，优先对应一个实施任务或一个审查修复。

## 4. 编码任务链路

每个任务按以下顺序执行：

1. 主控读取实施计划，明确当前任务的文件边界。
2. 派发一个 worker subagent，只允许它实现当前任务。
3. worker 在隔离 worktree 中修改文件、运行验证命令并提交。
4. 主控派发 spec reviewer，检查是否满足计划和验收标准。
5. 如果 spec reviewer 要求修改，返回同一个 worker 修复并重新提交。
6. spec 通过后，主控派发 code quality reviewer。
7. 如果 quality reviewer 要求修改，返回同一个 worker 修复并重新提交。
8. 两轮审查都通过后，当前任务才算完成。
9. 进入下一个任务。

不要并行派发多个会改同一批文件的 worker。并行只适合互不重叠的审查或只读分析。

## 5. 审查强度边界

审查会严格区分阻塞问题和非阻塞问题。

阻塞级问题：

- 构建失败。
- 类型检查失败。
- 测试失败。
- 关键脚本不可用。
- git 工作区存在未解释的脏状态。
- 明显违反已批准 spec 或 implementation plan。
- 会影响后续任务的基础设施或架构问题。

非阻塞问题：

- Next.js 工具链的非阻塞 deprecation warning。
- 可后续统一修的轻微样式偏好。
- 不影响验收的局部文案微调。
- 不影响 Stage 1 的未来扩展建议。

不在 Stage 1 阶段阻塞的问题：

- Stage 1.1 的 Agent 推理链路深化。
- Stage 1.2 的完整材料中心、渠道复盘、求职健康度。
- Stage 2 的真实 LLM API。

## 6. 验证要求

每个任务至少运行与其范围相关的验证命令。常用命令包括：

```powershell
npm run test
npm run typecheck
npm run build
npm run lint
```

涉及静态导出预览时，需要确认：

```powershell
npm run start
```

当前项目使用 `output: "export"`，因此 `start` 脚本应预览 `out` 目录，而不是使用 `next start`。

## 7. 当前任务序列

Stage 1 实施任务按计划执行：

1. Project Scaffold。
2. Install shadcn Components。
3. Types, Mock Data, And Rule Engine Tests。
4. Mock Data And Local Storage。
5. Layout And Navigation。
6. Dashboard。
7. Board And Job Cards。
8. Job Detail Sheet。
9. JD Parsing Flow。
10. Final Polish And Verification。

Task 1 已完成并通过两轮审查。Task 2 完成后继续执行相同链路。

## 8. 完成标准

Stage 1 完成前，必须满足设计文档中的 15 条验收标准，并通过最终整体审查。

最终回复需要说明：

- 完成了哪些 Stage 1 能力。
- 关键提交点。
- 运行过哪些验证命令。
- 已知限制：无后端、无真实 LLM、无拖拽、无真实文件上传。
- 后续建议：进入 Stage 1.1 Agent Deepening。

