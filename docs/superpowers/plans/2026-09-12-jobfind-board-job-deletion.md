# JobFind 申请看板岗位删除实施计划

**目标：** 以低干扰且防误触的方式，让任意阶段的岗位均可删除。

## Task 1：Store 与持久化测试

- 为 `deleteJob(jobId)` 写失败测试：移除岗位、清理所有材料的 `boundJobIds`、关闭被选中的详情，并确认 localStorage 更新。
- 在 `JobFindStoreValue` 中加入方法，采用单次不可变状态更新实现；ID 不存在时返回原状态。

## Task 2：详情抽屉确认交互

- 为“录用”和“已淘汰”岗位编写交互测试，确认二者都有删除入口。
- 为确认与取消分支编写测试：取消后卡片仍存在，确认后卡片与详情消失。
- 在 `JobDetailSheet` 底部增加低强调度危险操作，并使用现有 Radix Dialog 实现二次确认与可访问文案。

## Task 3：回归验证

```powershell
npm.cmd run test -- src/hooks/use-jobfind-store.test.tsx src/app/board/page.test.tsx src/components/board/kanban-board.test.tsx
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
```

人工验证删除一条进行中、录用、已淘汰岗位，并在刷新后确认不恢复。
