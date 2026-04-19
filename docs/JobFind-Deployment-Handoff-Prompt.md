# JobFind 部署交接提示词

下面这段提示词可直接复制到本项目的另一个对话中，用于把当前版本部署到线上并产出可访问链接。

```text
你现在接手的是 JobFind 项目的线上部署工作。请先不要改产品需求，不要重构功能，也不要重新规划版本；目标是把当前已经完成的 v1.2 产品稳定部署到线上，让别人可以直接访问和体验。

先阅读并理解以下上下文，再开始执行：

1. 真实开发现场不在仓库根目录 main，而在这个 worktree：
   D:\projects\JobFind\.worktrees\jobfind-core-loop

2. 当前应以这棵 worktree 为唯一事实来源：
   - branch: feature/jobfind-core-loop
   - 最新完成提交: 0eb0fec fix: complete v1.2 review findings

3. 当前版本已经完成并验证过，核心页面包括：
   - /
   - /board
   - /materials
   - /review

4. 当前版本定位：
   - 这是 JobFind v1.2，一个可运行、可演示、可回退的完整前端产品版本
   - 产品核心是“学生的 AI 求职项目经理”
   - 当前 Agent 是规则型 / deterministic runtime，不是已接真实大模型 API 的最终形态
   - 允许为了部署做必要的工程调整，但不要改变产品结构、信息架构和演示逻辑

5. 已有文档请优先阅读：
   - D:\projects\JobFind\.worktrees\jobfind-core-loop\PRD-JobFind.md
   - D:\projects\JobFind\.worktrees\jobfind-core-loop\architecture.md
   - D:\projects\JobFind\.worktrees\jobfind-core-loop\component-selection.md
   - D:\projects\JobFind\.worktrees\jobfind-core-loop\docs\superpowers\specs\2026-04-19-jobfind-v1-2-complete-product-design.md
   - D:\projects\JobFind\.worktrees\jobfind-core-loop\docs\superpowers\plans\2026-04-19-jobfind-v1-2-complete-product.md
   - D:\projects\JobFind\.worktrees\jobfind-core-loop\docs\JobFind-Product-Manual.md

6. 部署任务目标：
   - 判断最适合当前项目的线上部署方案
   - 完成生产可用的部署配置
   - 处理构建、静态资源、环境变量、路由和启动问题
   - 输出最终线上访问地址
   - 产出最短可执行的部署说明，便于后续重复发布

7. 工作原则：
   - 先确认当前项目的启动、构建和产物形态，再决定部署方案
   - 优先选择对 Next.js 当前结构最稳妥、改动最小的方案
   - 不要为了“上云”而重写产品
   - 不要把未完成的未来能力伪装成已完成能力
   - 如果发现仓库根目录和 worktree 内容不一致，以 worktree 为准

8. 交付要求：
   - 给出你实际采用的部署方案及原因
   - 给出修改过的文件列表
   - 给出验证步骤
   - 给出最终线上 URL
   - 如果部署平台需要额外账号/权限/Token，请明确列出缺什么

请直接开始执行，不需要重新问我要不要部署，也不要把任务退回给我做“方案选择”。如果遇到确实无法绕过的账号或平台权限问题，再准确说明阻塞点。
```

