# AI招聘助手

把 JD 和简历交给 AI，快速筛出「谁值得推进」。

在线体验：https://shiraishigm0120-commits.github.io/ai-recruiter-assistant/

## 产品定位

一个「简历预筛判断器」：HR 在招聘网站上看到简历，粘贴进来，AI 秒出「分数 + 技能缺口 + 一句话点评」，快速判断哪些人值得推进到招聘系统（如 Moka）。

## 使用流程

1. **新建岗位**：填岗位名称 + JD
2. **进入岗位**：粘贴简历（文字 / 截图），或上传文件（PDF / Word / 图片 / 文本）
3. **开始匹配**：AI 打分排序，结果页显示「判断条 + 简历原样」
4. 历史筛选自动留存，可随时回看

## 支持的文件格式

| 格式 | 解析方式 |
|------|---------|
| PDF | pdf.js 提取文字 |
| Word (.docx) | mammoth 解析 |
| 图片 (png/jpg/…) | OCR 识别 |
| 纯文本 (.txt / .md) | 直接读取 |
| 粘贴文字 / 截图 | 直接读取 / OCR |

> 注：老格式 `.doc`（非 `.docx`）是二进制，浏览器无法解析，请另存为 `.docx` 或 PDF。

## 打分模式

| 模式 | 说明 |
|------|------|
| DeepSeek 真模型 | **默认启用**，走内置 Worker 代理，真 AI 打分 + 生成点评 |
| 演示模式 | 代理失效时自动降级，用关键词粗筛打分（结果页会标注） |

## 接真大模型（默认已配好）

产品默认内置了 Cloudflare Worker 代理地址，打开即用真 DeepSeek。

如需换成自己的代理：

1. 部署 `worker.js`（见文件说明），在 Worker 里添加 `DEEPSEEK_KEY` 密钥
2. 产品右上角「设置」→ 在「代理地址」填入你的 Worker URL → 保存

## 本地运行

直接双击 `index.html` 用浏览器打开即可。

## 文件说明

- `index.html` — 产品（单文件，5 页面）
- `lib/` — 本地化依赖（pdf.js、mammoth.js，不依赖国外 CDN）
- `worker.js` — Cloudflare Worker 代理（接真 DeepSeek 用）

