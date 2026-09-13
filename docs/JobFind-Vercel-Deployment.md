# JobFind Vercel 与阿里云域名部署 SOP

## 当前生产环境

- 自定义域名：<https://jobfind.fdaier.xyz>
- Vercel 生产别名：<https://jobfind-core-loop.vercel.app>
- Vercel 团队 / 项目：`fdaiers-projects/jobfind-core-loop`
- 当前生产部署：`dpl_8k9G4Qeox1mCDLxuM397tQnzfHkh`（2026-09-14）

根目录 `D:\projects\JobFind` 的 `main` 是当前发布来源。不要再从历史 `.worktrees/jobfind-core-loop` 发布。

## 可重复发布

在项目根目录执行：

```powershell
npx vercel whoami
npx vercel link --project jobfind-core-loop --scope fdaiers-projects --yes
npx vercel deploy . --prod --yes --scope fdaiers-projects
```

部署完成后，使用命令返回的部署 URL 验证状态，并确认域名指向同一部署：

```powershell
npx vercel inspect https://jobfind.fdaier.xyz --scope fdaiers-projects
Invoke-WebRequest https://jobfind.fdaier.xyz/board -UseBasicParsing
```

## 阿里云域名状态

`jobfind.fdaier.xyz` 已作为 Vercel 项目别名生效，当前无需修改阿里云 DNS。域名注册商仍为第三方 / 阿里云 DNS；若未来新增域名或迁移解析，先在 Vercel 项目添加域名，再严格按 Vercel 控制台展示的记录更新阿里云解析，最后用 `vercel domains inspect <domain> --scope fdaiers-projects` 核验。
