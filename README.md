# 100kdo — 十万个干什么

> 🚀 **[100kdo.ccwu.cc](https://100kdo.ccwu.cc)** — 给普通人的 AI 领域专家，一键复制即用。

你不需要学会写 Prompt，不需要理解 RAG、MCP、Agent。你只需要：**搜索 → 复制 → 粘贴到 ChatGPT / 豆包 / Kimi / DeepSeek → 秒变专家**。

---

## 这是什么

**100kdo** 是一个 AI 专家工具包（Expert Prompt Toolkit）开放平台。每个工具包不是冷冰冰的 JSON API，而是一段精心设计的**即用型 Prompt**——包含角色定义、信息来源指引、回答格式模板、追问链、示例对话和权威数据端口。

把它粘贴到任何消费者 AI（ChatGPT、豆包、Kimi、DeepSeek、通义千问、Gemini）中，AI 就会切换到对应专家的思考模式回答你。

### 目前覆盖 22 个领域 · 80+ 个工具包

医疗健康、心理健康、育儿亲子、职业发展、法律维权、金融理财、教育培训、数码产品、家居装修、烹饪美食、旅游出行、消费购物、政务办事、人际关系、宠物养护、娱乐爱好、美容护肤、养老规划、创业管理、安全应急、AI 工具、通用生活。

---

## 怎么用

```
1. 打开 https://100kdo.ccwu.cc
2. 搜索你的问题（如"被辞退怎么维权"、"孩子发烧怎么办"）
3. 点进工具包，点击「📋 复制完整工具包」
4. 粘贴到 ChatGPT / 豆包 / Kimi / DeepSeek 输入框
5. AI 按专家模式回答你
```

每个工具包的完整版包含：

| 组成部分 | 说明 |
|----------|------|
| **专家 Prompt** | 角色定义 + 信息来源优先级 + 回答风格 + 关键知识速查 |
| **回答格式模板** | 规定 AI 用结构化 Markdown 输出（核心要点 → 步骤分析 → 关键数据 → 注意事项 → 官方渠道） |
| **追问链** | 3-5 个渐进式追问，把一次性问答变成微型咨询 |
| **示例对话** | few-shot 示例，AI 会模仿示例的回答水平 |
| **安全声明** | 医疗/法律/金融等敏感领域的免责提醒 |
| **权威数据端口** | 经过人工验证的真实官方数据源 URL，指导 AI 联网搜索时去哪里找 |

---

## v0.2.1 核心特性

### 🤖 AI 生成 + 人工策展双轨

- **AI 生成**：用户输入任意问题，DeepSeek V4 Flash 实时生成完整工具包（含 6 个增强字段），自动匹配权威数据源，自动分类 → 存入数据库，下次搜索即可找到
- **人工策展**：30 个精选工具包，内容经 AI 生成后由人工审核调整，覆盖高频需求场景
- **MCP Server**：提供 `search_toolkits` / `get_toolkit` / `generate_toolkit` 三个工具，AI Agent 可直接调用

### 🔗 权威数据端口（v0.2.1 重构）

- **41 个预验证来源库**：覆盖医疗、法律、金融、交通、教育、出入境等 12 个分类，每个 URL 经人工确认真实有效
- **域名规范化 + 回填**：AI 生成的端口自动与来源库匹配，非库内 URL 被剔除，AI 遗漏的来源自动补入
- **消费者 AI 友好**：删除了对普通用户无用的 `connector` / `connectorUrl`（MCP/REST API 等），改为 `description` 描述字段

### 🏷️ 智能分类系统

- **三级判定**：AI 输出分类 → 关键词计分推理 → 不确定则归入「待定」由人工处理
- **108 条关键词规则** 覆盖 22 个主分类、88 个子分类
- 兜底不再瞎猜一个分类，而是明确标记「待定」

### 📱 多平台一键跳转

支持 ChatGPT、豆包、DeepSeek、Kimi、Gemini、通义千问、Cherry Studio、LobeChat、Open WebUI 等平台的「复制 + 打开」快捷操作。

### 🔍 AI 搜索引擎优化

- JSON-LD 结构化数据（Schema.org SoftwareApplication + Dataset + HowTo）
- 隐藏 `<pre>` 嵌入完整 Prompt 文本，供爬虫索引
- `/api/llms` 端点输出全量工具包 Markdown，供 AI 模型一次性加载
- Sitemap + 静态生成（SSG），Google / Bing 友好

---

## 架构

```
用户 → 100kdo.ccwu.cc (Cloudflare Pages, Next.js SSG)
                ↓ API 调用
       api.100kdo.ccwu.cc (Cloudflare Worker, Hono)
                ↓
    ┌──────────┼──────────┐
    ↓                     ↓
   D1 (SQLite)        DeepSeek API
  (工具包数据库)       (AI 生成引擎)
```

- **前端**：Next.js 14 App Router + TypeScript + CSS Modules，全站 SSG 输出到 Cloudflare Pages
- **后端**：Cloudflare Workers + Hono 框架，提供 REST API + MCP Server
- **数据库**：Cloudflare D1（SQLite），存储所有工具包和增强字段
- **AI**：DeepSeek V4 Flash（via API），生成工具包内容
- **部署**：全栈 Cloudflare（Pages + Workers + D1），零服务器运维

---

## 项目结构

```
100kdo/
├── site/                          # 前端 — Next.js 14 SSG
│   └── src/
│       ├── app/                   # 页面路由
│       │   ├── page.tsx           # 首页（搜索 + 分类）
│       │   ├── view/page.tsx      # 工具包详情页（旧路由）
│       │   ├── toolkits/[slug]/   # 工具包详情页（新路由, SSG）
│       │   ├── categories/        # 分类浏览页
│       │   ├── admin/             # 管理后台（新建/编辑/删除）
│       │   └── about/             # 关于页面
│       ├── components/            # 共享组件
│       │   ├── PortConnectorList/ # 权威数据端口展示组件
│       │   ├── AIGeneratedToolkit/# AI 生成工具包卡片
│       │   ├── PlatformButtons/   # 多平台跳转按钮
│       │   └── ...
│       ├── lib/                   # 工具函数
│       │   ├── clipboard.ts       # 复制文本组装（完整版/精简版）
│       │   ├── toolkit.ts         # API 数据获取
│       │   └── structuredData.ts  # JSON-LD 生成
│       └── types/                 # TypeScript 类型定义
│
└── api/                           # 后端 — Cloudflare Worker
    └── src/
        ├── index.ts               # Hono 路由 + REST API
        ├── generator.ts           # 工具包生成编排（含端口规范化）
        ├── db.ts                  # D1 数据库操作
        ├── mcpServer.ts           # MCP JSON-RPC 服务端
        ├── utils.ts               # 分类推理 + 关键词规则
        ├── types.ts               # 共享类型定义
        ├── providers/
        │   ├── types.ts           # AI Provider 接口 + Prompt 模版
        │   └── deepseek.ts        # DeepSeek 适配器
        └── data/
            └── authority-sources.json  # 41 个权威来源库
```

---

## 开发

```bash
# 克隆
git clone https://github.com/neyasiikea/100kdo.git
cd 100kdo

# 前端
cd site
npm install
npm run dev          # http://localhost:3000

# 后端
cd api
npm install
npx wrangler dev     # http://localhost:8787
```

### 环境变量

后端 `api/.dev.vars`：
```
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
ADMIN_PASSWORD=your_admin_password
```

### 数据库

本地开发使用 `wrangler d1`：
```bash
npx wrangler d1 execute 100kdo-db --local --file=migration_001.sql
```

---

## 许可

MIT License

---

> 🌐 **[100kdo.ccwu.cc](https://100kdo.ccwu.cc)** — 每天搜索一次，少上网冲浪一小时
