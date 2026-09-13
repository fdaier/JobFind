# JobFind 真实 JD 录入实施计划

**目标：** 让用户可将真实公司、岗位名称和 JD 原文可靠保存到本地申请看板，并在保存前编辑本地规则生成的建议。

## Task 1：本地草稿与整理函数

- 新建 `src/lib/jd-intake.ts`，定义输入草稿、预览草稿、关键词/材料提取与 Job 创建函数。
- 为腾讯 AI 产品经理 JD 编写单元测试，验证事实字段、命中词、空 DDL 和 `manual-jd-*` ID；移除旧 B站解析工厂的测试与产品路径依赖。

## Task 2：录入与预览界面

- 将弹窗改为公司、岗位名称、JD、DDL、阶段表单，移除样例预填和“解析”话术。
- 将结果页改为可编辑预览：事实字段、关键词增删、材料勾选、返回修改和保存。
- 维持现有应用的简洁表面和对话框交互，不新增不必要的卡片或装饰。

## Task 3：端到端状态与回归

- 以“腾讯 · AI 产品经理”覆盖输入、校验、预览、返回、保存、选中和 localStorage 持久化。
- 保留岗位删除与阶段推进的回归测试。

## Task 4：验证与发布

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

- 在本地浏览器验证真实 JD 的输入、编辑、保存、刷新及删除。
- 提交产品和文档改动，确认 Vercel 项目身份后部署生产；验证 `https://jobfind.fdaier.xyz/board`。
