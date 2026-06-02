# 100kdo — 十万个干什么

给普通人的 AI 领域专家一键切换平台。

## 项目结构

```
100kdo/
├── site/          # 前端 — Next.js 14 SSG
└── api/           # 后端 — Cloudflare Worker (Hono + D1)
```

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | Next.js 14 (App Router) + TypeScript + CSS Modules |
| 后端 | Cloudflare Workers + Hono + D1 (SQLite) |
| AI 模型 | DeepSeek V4 Flash |
| 部署 | Cloudflare Pages + Workers |

## 快速开始

```bash
# 前端
cd site
npm install
npm run dev          # http://localhost:3000

# 后端
cd api
npm install
npx wrangler dev     # http://localhost:8787
```
