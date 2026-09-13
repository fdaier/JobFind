# JobFind 部署交接提示词

将以下内容复制到新的部署对话：

```text
你现在接手 JobFind 的生产发布。先阅读 D:\projects\JobFind\AGENTS.md、docs\JobFind-Current-State.md 和 docs\JobFind-Vercel-Deployment.md；它们是当前事实源。

工作目录与发布来源是 D:\projects\JobFind 的 main 分支。不要使用 .worktrees\jobfind-core-loop 作为发布源，它只保留历史 Stage 1/v1.2 上下文。

当前 Vercel 目标是 fdaiers-projects/jobfind-core-loop，自定义生产域名是 https://jobfind.fdaier.xyz。先确认 vercel whoami，再链接既有项目，使用生产发布命令部署；不要新建同名项目。发布后必须通过 vercel inspect 和访问 /board 验证自定义域名命中最新部署。

产品是规则型 Agent 原型，不要宣称已接入真实 LLM API。除部署必要调整外，不重构产品，不扩张需求；若发现权限或账号阻塞，清楚说明阻塞点。
```

