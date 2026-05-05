# JobFind

JobFind 是一个面向学生求职场景的 AI 求职项目经理。它把岗位、截止时间、材料、面试和复盘串成一条推进链路，帮助用户知道今天最该处理什么、哪里有风险、下一步该补什么材料。

## 立即体验

阿里云访问链接：

[https://jobfind.fdaier.xyz](https://jobfind.fdaier.xyz)

打开链接即可直接使用 JobFind，无需安装或登录。

## 产品亮点

- 今日作战台：用 Agent 今日指挥、风险雷达和转化漏斗告诉用户优先级。
- 申请看板：按岗位阶段管理申请进度，并在岗位卡片上提示风险。
- 材料中心：围绕简历、作品集、推荐信等材料做状态管理。
- 复盘中心：把渠道表现、面试记录和策略记忆沉淀成下一轮行动。

## 页面入口

- `/`：今日作战台
- `/board`：申请看板
- `/materials`：材料中心
- `/review`：复盘中心

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
npm run build
npm run test
npm run typecheck
```

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Vitest

## 说明

当前版本是可演示的规则型 Agent 体验，用确定性规则模拟求职过程中的优先级判断、风险识别、材料调度和复盘沉淀。后续可以接入真实大模型 API，把规则型判断升级为更完整的求职 Agent。
