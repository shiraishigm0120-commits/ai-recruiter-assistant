# AI招聘助手 · 专注AIGC岗位

把 JD 和简历交给 AI，10 分钟筛完一个 AIGC 岗位。

在线体验：https://shiraishigm0120-commits.github.io/ai-recruiter-assistant/

## 产品功能

- 粘贴 JD + 多份简历 → AI 拆解技能、逐份打分排序
- 每份候选人显示：匹配度分数 + 技能覆盖 + 一句 AI 点评
- 点进详情看「技能缺口清单」，标记推进/淘汰

## 两种模式

| 模式 | 说明 |
|------|------|
| 演示模式 | 没配置 key 时自动启用，用内置规则打分，能演示完整流程 |
| DeepSeek 真模型 | 配好代理后，用真 AI 打分 + 生成点评句 |

## 接真大模型（DeepSeek）步骤

浏览器无法直接调用 DeepSeek（跨域限制），需要用一个 Cloudflare Worker 做代理，key 藏在 Worker 里。

### 1. 部署 Worker 代理

1. 注册 https://cloudflare.com 账号（免费）
2. 进「Workers & Pages」→「Create」→「Create Worker」
3. 把本仓库的 `worker.js` 内容**全部粘贴**进去（覆盖默认代码）
4. 点「Deploy」
5. 进该 Worker 的「Settings」→「Variables and Secrets」→ 添加一个 Secret：
   - 名称：`DEEPSEEK_KEY`
   - 值：你的 DeepSeek API key（sk- 开头）
6. 回到代码页再点一次「Deploy」让 Secret 生效

### 2. 把代理地址填进产品

1. 复制 Worker 的 URL（形如 `https://你的名字.workers.dev`）
2. 打开产品 → 右上角「设置」
3. 在「代理地址」栏粘贴 Worker URL → 保存

之后点「开始匹配」，右上角会显示「DeepSeek 模式」，点评句就是真 AI 生成的。

## 本地运行

直接双击 `index.html` 用浏览器打开即可（演示模式可完整跑通）。

## 文件说明

- `index.html` — 产品（单文件，4 页面）
- `worker.js` — Cloudflare Worker 代理（接真 DeepSeek 用）
