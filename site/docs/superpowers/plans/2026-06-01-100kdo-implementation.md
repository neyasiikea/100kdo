# 100kdo（十万个干什么）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a content-driven static site where non-technical users discover, copy, and deploy AI toolkit packages (expert prompts + port connectors) to consumer AI platforms with one click.

**Architecture:** Next.js App Router SSG (Static Site Generation) with TypeScript. All toolkit content is stored as Markdown files with YAML frontmatter, parsed at build time into typed data. Client-side search via pre-built index (flexsearch). No database, no API routes, no runtime server — fully static deployment to Cloudflare Pages.

**Tech Stack:** Next.js 14+ (App Router) · TypeScript 5.x · gray-matter (markdown parsing) · Vanilla CSS Modules · Cloudflare Pages

**Design Spec:** `docs/superpowers/specs/2026-06-01-100kdo-design.md`

---

## File Structure

```
100kdo-ai-port/
├── next.config.js
├── tsconfig.json
├── package.json
├── .gitignore
├── public/
│   ├── favicon.svg
│   └── platforms/                  # Platform logo icons (SVG)
│       ├── deepseek.svg
│       ├── chatgpt.svg
│       ├── kimi.svg
│       ├── doubao.svg
│       ├── gemini.svg
│       ├── tongyi.svg
│       └── cherry-studio.svg
├── content/
│   └── toolkits/                   # One .md file per toolkit
│       ├── parenting.md
│       └── job-interview.md
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + metadata
│   │   ├── page.tsx                # Homepage (SSG)
│   │   ├── globals.css             # CSS reset + design tokens
│   │   ├── toolkits/
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Toolkit detail page (SSG)
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Category listing page (SSG)
│   │   ├── search/
│   │   │   └── page.tsx            # Search page (client component)
│   │   └── about/
│   │       └── page.tsx            # About page
│   ├── lib/
│   │   ├── toolkit.ts              # Parse markdown → Toolkit type
│   │   ├── searchIndex.ts          # Build & export search index
│   │   ├── platforms.ts            # Platform config + DeepLink URLs
│   │   ├── clipboard.ts            # Generate clipboard-ready text
│   │   ├── structuredData.ts       # Generate JSON-LD for toolkits
│   │   └── categories.ts           # Category hierarchy definition
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── Header.module.css
│   │   ├── Footer/
│   │   │   ├── Footer.tsx
│   │   │   └── Footer.module.css
│   │   ├── SearchBar/
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchBar.module.css
│   │   ├── ToolkitCard/
│   │   │   ├── ToolkitCard.tsx
│   │   │   └── ToolkitCard.module.css
│   │   ├── CopyButton/
│   │   │   ├── CopyButton.tsx
│   │   │   └── CopyButton.module.css
│   │   ├── PlatformButtons/
│   │   │   ├── PlatformButtons.tsx
│   │   │   └── PlatformButtons.module.css
│   │   ├── PortConnectorList/
│   │   │   ├── PortConnectorList.tsx
│   │   │   └── PortConnectorList.module.css
│   │   ├── PromptPreview/
│   │   │   ├── PromptPreview.tsx
│   │   │   └── PromptPreview.module.css
│   │   ├── ScenarioList/
│   │   │   ├── ScenarioList.tsx
│   │   │   └── ScenarioList.module.css
│   │   ├── CategoryNav/
│   │   │   ├── CategoryNav.tsx
│   │   │   └── CategoryNav.module.css
│   │   └── JsonLd/
│   │       └── JsonLd.tsx
│   └── types/
│       └── index.ts                # All TypeScript type definitions
```

---

## Phase 1: Project Scaffold & Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
.next/
out/
.superpowers/
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "100kdo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

module.exports = nextConfig;
```

> `output: 'export'` enables full static export for Cloudflare Pages. No server required.

- [ ] **Step 5: Create src/app/globals.css — CSS reset + design tokens**

```css
:root {
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-surface-raised: #1c2333;
  --color-border: #30363d;
  --color-text-primary: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-accent: #58a6ff;
  --color-success: #3fb950;
  --color-warning: #d29922;
  --color-danger: #f85149;
  --color-port-verified: #238636;
  --color-port-unverified: #9e6a03;
  --color-port-community: #6e7681;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC',
    sans-serif;
  background: var(--color-bg);
  color: var(--color-text-primary);
  line-height: 1.6;
}

a {
  color: var(--color-accent);
  text-decoration: none;
}

code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--color-surface);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

button {
  cursor: pointer;
  font-family: inherit;
}
```

- [ ] **Step 6: Create src/app/layout.tsx — Root layout**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '100kdo - 十万个干什么',
    template: '%s | 100kdo',
  },
  description:
    '给普通人的 AI 领域专家一键切换平台。搜索你的问题，找到专家工具包，复制粘贴到 AI，秒变专家。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create placeholder src/app/page.tsx**

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>100kdo</h1>
      <p>十万个干什么</p>
    </main>
  );
}
```

- [ ] **Step 8: Install dependencies and verify build**

```bash
cd G:/AICode/100kdo-ai-port && pnpm install && pnpm build
```

Expected: successful install, successful static export to `out/` directory.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js project with SSG config"
```

---

### Task 2: Define TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write all type definitions**

```typescript
// src/types/index.ts

/** Verification status of a port connector */
export type PortStatus = 'verified' | 'unverified' | 'community';

/** Type of port connector */
export type PortType =
  | 'rest-api'
  | 'mcp-server'
  | 'skill'
  | 'gpts-action'
  | 'static-data'
  | 'web-scraping';

/** A single port connector — the core asset of 100kdo */
export interface PortConnector {
  id: string;
  name: string;            // Display name of the authority source
  url: string;             // URL to the data source
  type: PortType;
  connector: string;       // Connector identifier (e.g., "who-growth-mcp")
  connectorUrl: string;    // Link to install/get the connector
  status: PortStatus;
  platforms: string[];     // Platform slugs this connector works on
  contributor?: string;
}

/** A scenario within a toolkit — maps user intent to ports */
export interface Scenario {
  name: string;
  icon: string;            // Emoji
  ports: string[];         // Port IDs used in this scenario
}

/** The complete toolkit data model */
export interface Toolkit {
  slug: string;
  title: string;
  icon: string;
  category: string;
  subcategory?: string;
  description: string;
  keywords: string[];
  updated: string;         // ISO date string
  prompt: string;          // Full expert prompt text
  scenarios: Scenario[];
  ports: PortConnector[];
}

/** Toolkit metadata only (for listing pages, excludes heavy fields) */
export interface ToolkitMeta {
  slug: string;
  title: string;
  icon: string;
  category: string;
  subcategory?: string;
  description: string;
  keywords: string[];
  updated: string;
  portCount: number;
  verifiedPortCount: number;
}

/** Category hierarchy node */
export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
  children?: Category[];
}

/** Platform configuration for DeepLink / delivery */
export interface PlatformConfig {
  slug: string;
  name: string;
  icon: string;            // Path to SVG in /public/platforms/
  /** DeepLink URL template. Use {prompt} as placeholder for encoded prompt text */
  deepLinkTemplate: string | null;
  /** Whether this platform supports one-click DeepLink */
  supportsDeepLink: boolean;
  /** Whether this is a mobile app (affects UX copy) */
  isApp: boolean;
  /** Scenario level: "consumer" for L1, "agent" for L2 */
  level: 'consumer' | 'agent';
}
```

- [ ] **Step 2: Verify types compile**

```bash
cd G:/AICode/100kdo-ai-port && pnpm tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts && git commit -m "feat: define TypeScript types for toolkit data model"
```

---

## Phase 2: Content System

### Task 3: Create Sample Toolkit Data (Markdown)

**Files:**
- Create: `content/toolkits/parenting.md`
- Create: `content/toolkits/job-interview.md`

- [ ] **Step 1: Create content/toolkits/parenting.md**

```markdown
---
slug: parenting
title: 育儿专家
icon: 🧒
category: health
subcategory: child-care
description: 解决0-12岁儿童的喂养、发育、行为引导、疾病判断等问题，通过WHO、CDC、Cochrane等权威端口获取专业指导
keywords:
  - 育儿
  - 带娃
  - 婴儿
  - 儿童
  - 喂养
  - 睡眠训练
  - 疫苗
  - 发烧
  - 辅食
updated: 2026-06-01
scenarios:
  - name: 婴儿睡眠训练
    icon: 🛏️
    ports:
      - aap-sleep
  - name: 辅食添加
    icon: 🥣
    ports:
      - who-nutrition
      - cns-dietary
  - name: 疫苗决策
    icon: 💉
    ports:
      - cdc-vaccine
  - name: 疾病自判
    icon: 🤒
    ports:
      - pubmed-pediatrics
      - cochrane-child
  - name: 行为引导
    icon: 🧠
    ports:
      - aap-development
ports:
  - id: who-growth
    name: WHO儿童生长标准数据库
    url: https://www.who.int/tools/child-growth-standards
    type: rest-api
    connector: who-growth-mcp
    connectorUrl: https://github.com/anthropics/mcp-server-example
    status: verified
    platforms:
      - cherry-studio
      - lobechat
  - id: pubmed-pediatrics
    name: PubMed儿科文献检索
    url: https://pubmed.ncbi.nlm.nih.gov/
    type: mcp-server
    connector: pubmed-search-mcp
    connectorUrl: https://github.com/anthropics/mcp-server-example
    status: verified
    platforms:
      - cherry-studio
      - open-webui
  - id: cdc-vaccine
    name: 中国CDC疫苗接种规范
    url: https://www.chinacdc.cn/
    type: skill
    connector: chinese-vaccine-schedule-skill
    connectorUrl: https://github.com/example/vaccine-skill
    status: community
    platforms:
      - cherry-studio
      - lobechat
      - chatgpt
  - id: nhc-health
    name: 国家卫健委公开数据
    url: https://www.nhc.gov.cn/
    type: web-scraping
    connector: nhc-health-data-skill
    connectorUrl: https://github.com/example/nhc-skill
    status: unverified
    platforms:
      - deepseek
      - chatgpt
  - id: cochrane-child
    name: Cochrane儿科循证综述
    url: https://www.cochranelibrary.com/
    type: gpts-action
    connector: cochrane-evidence-gpt
    connectorUrl: https://chat.openai.com/g/g-example-cochrane
    status: verified
    platforms:
      - chatgpt
  - id: aap-sleep
    name: AAP婴儿睡眠安全指南
    url: https://www.aap.org/en/patient-care/safe-sleep/
    type: static-data
    connector: aap-sleep-guidelines
    connectorUrl: https://www.aap.org/en/patient-care/safe-sleep/
    status: verified
    platforms:
      - deepseek
      - chatgpt
      - kimi
  - id: who-nutrition
    name: WHO婴幼儿喂养指南
    url: https://www.who.int/health-topics/complementary-feeding
    type: static-data
    connector: who-nutrition-guidelines
    connectorUrl: https://www.who.int/health-topics/complementary-feeding
    status: verified
    platforms:
      - deepseek
      - chatgpt
  - id: cns-dietary
    name: 中国营养学会膳食指南
    url: https://www.cnsoc.org/
    type: web-scraping
    connector: cns-dietary-skill
    connectorUrl: https://github.com/example/cns-dietary
    status: community
    platforms:
      - deepseek
      - kimi
  - id: aap-development
    name: AAP儿童发育行为指南
    url: https://www.aap.org/
    type: static-data
    connector: aap-development-guidelines
    connectorUrl: https://www.aap.org/
    status: verified
    platforms:
      - chatgpt
      - kimi
---

你是一位拥有15年临床经验的儿科医生和儿童发展专家。在回答用户育儿问题时，请遵循以下规范：

**信息来源优先级：**
1. 当回答涉及儿童发育指标时，调用 who-growth-mcp 查询WHO儿童生长标准百分位数据，不得凭个人经验判断
2. 当回答涉及疫苗接种时，调用 chinese-vaccine-schedule-skill 获取中国CDC最新免疫程序
3. 当回答涉及儿科疾病诊疗时，先通过 pubmed-search-mcp 检索最新循证文献，再结合临床经验回复
4. 当回答涉及公共卫生政策时，优先引用 nhc-health-data-skill 中的国家卫健委公开数据

**回答风格：**
- 使用通俗易懂的中文，避免过多医学术语
- 对每个建议标注信息来源和证据等级
- 明确区分"循证建议"和"临床经验"
- 当无法从权威源找到依据时，明确告知用户"此建议基于通用育儿原则，非特定医学指南"
- 遇到紧急症状（高烧不退、呼吸困难、意识模糊等）必须首先建议立即就医
```

- [ ] **Step 2: Create content/toolkits/job-interview.md**

```markdown
---
slug: job-interview
title: 求职面试教练
icon: 💼
category: career
subcategory: interview
description: 模拟面试、简历优化、薪资谈判、行业洞察——覆盖互联网、金融、外企等热门行业的求职全流程
keywords:
  - 面试
  - 求职
  - 简历
  - 薪资谈判
  - 职业规划
  - 跳槽
updated: 2026-06-01
scenarios:
  - name: 模拟面试
    icon: 🎯
    ports:
      - interview-questions
  - name: 简历优化
    icon: 📝
    ports:
      - resume-templates
  - name: 薪资谈判
    icon: 💰
    ports:
      - salary-data
  - name: 行业选择
    icon: 🧭
    ports:
      - company-reviews
      - salary-data
  - name: 职业规划
    icon: 🗺️
    ports:
      - career-paths
ports:
  - id: salary-data
    name: 行业薪酬数据库
    url: https://www.zhaopin.com/
    type: web-scraping
    connector: salary-data-mcp
    connectorUrl: https://github.com/example/salary-mcp
    status: unverified
    platforms:
      - deepseek
      - chatgpt
  - id: interview-questions
    name: 目标公司面试题库
    url: https://www.nowcoder.com/
    type: web-scraping
    connector: interview-question-bank
    connectorUrl: https://github.com/example/interview-skill
    status: community
    platforms:
      - deepseek
      - kimi
  - id: company-reviews
    name: 公司员工评价聚合
    url: https://www.maimai.cn/
    type: web-scraping
    connector: company-review-skill
    connectorUrl: https://github.com/example/company-review
    status: community
    platforms:
      - deepseek
  - id: resume-templates
    name: 行业简历模板库
    url: https://www.wondercv.com/
    type: static-data
    connector: resume-templates-guide
    connectorUrl: https://github.com/example/resume-guide
    status: verified
    platforms:
      - chatgpt
      - kimi
      - doubao
  - id: career-paths
    name: 职业发展路径数据
    url: https://www.linkedin.com/
    type: static-data
    connector: career-paths-guide
    connectorUrl: https://github.com/example/career-paths
    status: community
    platforms:
      - chatgpt
---

你是一位资深HR总监兼职业规划师，拥有10年以上互联网/金融/外企招聘经验。请按以下规范帮助用户：

**信息来源优先级：**
1. 当涉及行业薪资数据时，调用 salary-data-mcp 查询最新行业薪酬报告
2. 当涉及公司评价时，调用 company-review-skill 获取员工真实反馈
3. 当涉及面试题库时，调用 interview-question-bank 获取目标公司的历史面试题

**回答风格：**
- 给出具体、可执行的建议，而非泛泛而谈
- 提供多家公司的对比视角
- 每次建议后提供"可以这样跟HR说"的话术模板
- 区分"大概率"和"小概率"场景，不做绝对承诺
```
  icon: 🎯
  ports: [interview-questions]
- name: 简历优化
  icon: 📝
  ports: [resume-templates]
- name: 薪资谈判
  icon: 💰
  ports: [salary-data]
- name: 行业选择
  icon: 🧭
  ports: [company-reviews, salary-data]
- name: 职业规划
  icon: 🗺️
  ports: [career-paths]

## ports

- id: salary-data
  name: 行业薪酬数据库
  url: https://www.zhaopin.com/
  type: web-scraping
  connector: salary-data-mcp
  connectorUrl: https://github.com/example/salary-mcp
  status: unverified
  platforms:
    - deepseek
    - chatgpt

- id: interview-questions
  name: 目标公司面试题库
  url: https://www.nowcoder.com/
  type: web-scraping
  connector: interview-question-bank
  connectorUrl: https://github.com/example/interview-skill
  status: community
  platforms:
    - deepseek
    - kimi

- id: company-reviews
  name: 公司员工评价聚合
  url: https://www.maimai.cn/
  type: web-scraping
  connector: company-review-skill
  connectorUrl: https://github.com/example/company-review
  status: community
  platforms:
    - deepseek

- id: resume-templates
  name: 行业简历模板库
  url: https://www.wondercv.com/
  type: static-data
  connector: resume-templates-guide
  connectorUrl: https://github.com/example/resume-guide
  status: verified
  platforms:
    - chatgpt
    - kimi
    - doubao

- id: career-paths
  name: 职业发展路径数据
  url: https://www.linkedin.com/
  type: static-data
  connector: career-paths-guide
  connectorUrl: https://github.com/example/career-paths
  status: community
  platforms:
    - chatgpt
```

- [ ] **Step 3: Verify files parse correctly** (pre-check with Node)

```bash
cd G:/AICode/100kdo-ai-port && node -e "
const fm = require('gray-matter');
const fs = require('fs');
const f1 = fm(fs.readFileSync('content/toolkits/parenting.md','utf8'));
const f2 = fm(fs.readFileSync('content/toolkits/job-interview.md','utf8'));
console.log('parenting keys:', Object.keys(f1.data));
console.log('job-interview keys:', Object.keys(f2.data));
"
```

- [ ] **Step 4: Commit**

```bash
git add content/toolkits/ && git commit -m "feat: add sample toolkit data (parenting, job-interview)"
```

---

### Task 4: Toolkit Data Parser

**Files:**
- Create: `src/lib/toolkit.ts`

- [ ] **Step 1: Write the parser**

```typescript
// src/lib/toolkit.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Toolkit, ToolkitMeta } from '@/types';

const TOOLKITS_DIR = path.join(process.cwd(), 'content', 'toolkits');

/** Parse a single .md file into a Toolkit object */
export function getToolkitBySlug(slug: string): Toolkit | null {
  const filePath = path.join(TOOLKITS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return {
    slug: data.slug,
    title: data.title,
    icon: data.icon,
    category: data.category,
    subcategory: data.subcategory ?? undefined,
    description: data.description,
    keywords: data.keywords ?? [],
    updated: data.updated,
    prompt: content.trim(),
    scenarios: data.scenarios ?? [],
    ports: data.ports ?? [],
  } as Toolkit;
}

/** Parse all toolkits and return their metadata (lightweight, for listing) */
export function getAllToolkitMetas(): ToolkitMeta[] {
  if (!fs.existsSync(TOOLKITS_DIR)) return [];

  const files = fs.readdirSync(TOOLKITS_DIR).filter((f) => f.endsWith('.md'));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(TOOLKITS_DIR, file), 'utf8');
      const { data } = matter(raw);
      const ports = (data.ports ?? []) as Toolkit['ports'];
      return {
        slug: data.slug,
        title: data.title,
        icon: data.icon,
        category: data.category,
        subcategory: data.subcategory ?? undefined,
        description: data.description,
        keywords: data.keywords ?? [],
        updated: data.updated,
        portCount: ports.length,
        verifiedPortCount: ports.filter((p) => p.status === 'verified').length,
      } satisfies ToolkitMeta;
    })
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

/** Get all unique slugs for generateStaticParams */
export function getAllToolkitSlugs(): string[] {
  if (!fs.existsSync(TOOLKITS_DIR)) return [];
  return fs
    .readdirSync(TOOLKITS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace('.md', ''));
}
```

- [ ] **Step 2: Verify it works**

```bash
cd G:/AICode/100kdo-ai-port && node -e "
const { getAllToolkitMetas, getToolkitBySlug } = require('./src/lib/toolkit');
console.log('Metas:', JSON.stringify(getAllToolkitMetas(), null, 2));
" 2>&1 || echo "Will verify after TS compilation"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/toolkit.ts && git commit -m "feat: add markdown toolkit parser with section extraction"
```

---

### Task 5: Categories Definition

**Files:**
- Create: `src/lib/categories.ts`

```typescript
// src/lib/categories.ts
import type { Category } from '@/types';

const CATEGORIES: Category[] = [
  {
    slug: 'health',
    name: '健康医疗',
    icon: '🏥',
    description: '疾病自判、用药指导、育儿健康、心理健康',
    children: [
      { slug: 'child-care', name: '育儿健康', icon: '🧒', description: '婴幼儿喂养、发育、常见病' },
      { slug: 'mental', name: '心理健康', icon: '🧠', description: '情绪管理、心理咨询、压力疏导' },
      { slug: 'chronic', name: '慢病管理', icon: '💊', description: '高血压、糖尿病等慢性病日常管理' },
    ],
  },
  {
    slug: 'career',
    name: '职业发展',
    icon: '💼',
    description: '求职面试、简历优化、薪资谈判、职业规划',
    children: [
      { slug: 'interview', name: '求职面试', icon: '🎯', description: '模拟面试、公司题库、薪资谈判' },
      { slug: 'workplace', name: '职场技能', icon: '📊', description: '沟通技巧、向上管理、时间管理' },
    ],
  },
  {
    slug: 'legal',
    name: '法律维权',
    icon: '⚖️',
    description: '劳动纠纷、消费维权、租房纠纷、婚姻家庭',
    children: [
      { slug: 'labor', name: '劳动纠纷', icon: '👷', description: '辞退补偿、加班费、工伤认定' },
      { slug: 'consumer', name: '消费维权', icon: '🛒', description: '退货退款、虚假宣传、欺诈索赔' },
      { slug: 'housing', name: '租房房产', icon: '🏠', description: '租房纠纷、购房合同、物业维权' },
    ],
  },
  {
    slug: 'finance',
    name: '金融理财',
    icon: '💰',
    description: '保险选购、税务筹划、贷款指南、投资入门',
    children: [
      { slug: 'insurance', name: '保险选购', icon: '🛡️', description: '重疾险、医疗险、车险对比' },
      { slug: 'tax', name: '税务筹划', icon: '🧾', description: '个税汇算、专项扣除、自由职业报税' },
    ],
  },
  {
    slug: 'education',
    name: '教育学习',
    icon: '📚',
    description: '学习方法、考试辅导、留学规划、亲子教育',
    children: [
      { slug: 'study', name: '学习方法', icon: '✏️', description: '高效记忆、笔记方法、考试技巧' },
      { slug: 'abroad', name: '留学规划', icon: '✈️', description: '选校申请、签证准备、语言考试' },
    ],
  },
  {
    slug: 'life',
    name: '生活服务',
    icon: '🏠',
    description: '装修指南、出行规划、数码选购、宠物养护',
    children: [
      { slug: 'travel', name: '出行规划', icon: '🧳', description: '旅行攻略、签证办理、酒店机票' },
      { slug: 'renovation', name: '装修指南', icon: '🔨', description: '预算规划、材料选择、合同审核' },
      { slug: 'digital', name: '数码选购', icon: '📱', description: '手机/电脑/家电参数对比与推荐' },
    ],
  },
];

export function getAllCategories(): Category[] {
  return CATEGORIES;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  for (const cat of CATEGORIES) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      const child = cat.children.find((c) => c.slug === slug);
      if (child) return child;
    }
  }
  return undefined;
}
```

- [ ] **Step 1: Write the file** as shown above.

- [ ] **Step 2: Commit**

```bash
git add src/lib/categories.ts && git commit -m "feat: define category hierarchy (6 top-level, 15 subcategories)"
```

---

### Task 6: Platform Config & DeepLink URLs

**Files:**
- Create: `src/lib/platforms.ts`

```typescript
// src/lib/platforms.ts
import type { PlatformConfig } from '@/types';

const PLATFORMS: PlatformConfig[] = [
  {
    slug: 'deepseek',
    name: 'DeepSeek',
    icon: '/platforms/deepseek.svg',
    deepLinkTemplate: 'https://chat.deepseek.com/?q={prompt}',
    supportsDeepLink: true,
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'kimi',
    name: 'Kimi',
    icon: '/platforms/kimi.svg',
    deepLinkTemplate: 'https://kimi.moonshot.cn/?text={prompt}',
    supportsDeepLink: true,
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'tongyi',
    name: '通义千问',
    icon: '/platforms/tongyi.svg',
    deepLinkTemplate: 'https://tongyi.aliyun.com/qianwen/?q={prompt}',
    supportsDeepLink: true,
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    icon: '/platforms/chatgpt.svg',
    deepLinkTemplate: null, // No stable prompt parameter
    supportsDeepLink: false,
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'gemini',
    name: 'Gemini',
    icon: '/platforms/gemini.svg',
    deepLinkTemplate: null,
    supportsDeepLink: false,
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'doubao',
    name: '豆包',
    icon: '/platforms/doubao.svg',
    deepLinkTemplate: null, // Only URL scheme to wake app, no param for text
    supportsDeepLink: false,
    isApp: true,
    level: 'consumer',
  },
  {
    slug: 'cherry-studio',
    name: 'Cherry Studio',
    icon: '/platforms/cherry-studio.svg',
    deepLinkTemplate: null, // Uses config file import, not URL
    supportsDeepLink: false,
    isApp: false,
    level: 'agent',
  },
  {
    slug: 'lobechat',
    name: 'LobeChat',
    icon: '/platforms/lobechat.svg',
    deepLinkTemplate: null,
    supportsDeepLink: false,
    isApp: false,
    level: 'agent',
  },
  {
    slug: 'open-webui',
    name: 'Open WebUI',
    icon: '/platforms/open-webui.svg',
    deepLinkTemplate: null,
    supportsDeepLink: false,
    isApp: false,
    level: 'agent',
  },
];

export function getAllPlatforms(): PlatformConfig[] {
  return PLATFORMS;
}

export function getPlatformBySlug(slug: string): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.slug === slug);
}

/**
 * Build the DeepLink URL for a platform.
 * Returns null if the platform doesn't support DeepLink.
 */
export function buildDeepLink(
  platformSlug: string,
  prompt: string
): string | null {
  const platform = getPlatformBySlug(platformSlug);
  if (!platform?.deepLinkTemplate) return null;

  return platform.deepLinkTemplate.replace(
    '{prompt}',
    encodeURIComponent(prompt)
  );
}

/** Get consumer-level platforms (L1) */
export function getConsumerPlatforms(): PlatformConfig[] {
  return PLATFORMS.filter((p) => p.level === 'consumer');
}

/** Get agent-level platforms (L2) */
export function getAgentPlatforms(): PlatformConfig[] {
  return PLATFORMS.filter((p) => p.level === 'agent');
}
```

- [ ] **Step 1: Write the file** as shown above.

- [ ] **Step 2: Commit**

```bash
git add src/lib/platforms.ts && git commit -m "feat: add platform config with DeepLink URL templates"
```

---

### Task 7: Clipboard Text Generator

**Files:**
- Create: `src/lib/clipboard.ts`

```typescript
// src/lib/clipboard.ts
import type { Toolkit, PortConnector } from '@/types';

const PORT_TYPE_LABELS: Record<string, string> = {
  'rest-api': 'REST API',
  'mcp-server': 'MCP Server',
  skill: 'Skill文件',
  'gpts-action': 'GPTs Action',
  'static-data': '静态数据',
  'web-scraping': '网页抓取',
};

/** Generate the full clipboard text that users paste into AI */
export function generateClipboardText(toolkit: Toolkit): string {
  const lines: string[] = [];

  // Header
  lines.push(`【${toolkit.icon} ${toolkit.title}】`);
  lines.push('');

  // Expert prompt (L2)
  lines.push(toolkit.prompt.trim());
  lines.push('');

  // Port connectors reference (L3)
  if (toolkit.ports.length > 0) {
    lines.push('---');
    lines.push('可使用的权威数据源（如已配置对应连接器）：');
    for (const port of toolkit.ports) {
      lines.push(
        `- ${port.connector}：${port.name} (${PORT_TYPE_LABELS[port.type] ?? port.type})`
      );
    }
    lines.push('');
  }

  // Scenarios (L1)
  if (toolkit.scenarios.length > 0) {
    lines.push('---');
    lines.push('常见场景处理流程：');
    for (const scenario of toolkit.scenarios) {
      lines.push(`${scenario.icon} ${scenario.name}`);
    }
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push(`工具包来源：100kdo.com/toolkits/${toolkit.slug}`);
  lines.push(`更新日期：${toolkit.updated}`);

  return lines.join('\n');
}

/** Generate prompt-only text (for single copy of just the prompt) */
export function generatePromptOnlyText(toolkit: Toolkit): string {
  return toolkit.prompt.trim();
}

/** Generate port-only reference text */
export function generatePortReferenceText(ports: PortConnector[]): string {
  return ports
    .map(
      (p) =>
        `${p.connector}: ${p.name}\n  类型: ${PORT_TYPE_LABELS[p.type] ?? p.type} | 状态: ${statusLabel(p.status)}\n  连接器: ${p.connectorUrl}\n  信息源: ${p.url}`
    )
    .join('\n\n');
}

function statusLabel(status: string): string {
  switch (status) {
    case 'verified': return '✅已验证';
    case 'unverified': return '⚠️待验证';
    case 'community': return '📦社区贡献';
    default: return status;
  }
}
```

- [ ] **Step 1: Write the file** as shown above.

- [ ] **Step 2: Commit**

```bash
git add src/lib/clipboard.ts && git commit -m "feat: add clipboard text generator with full/prompt/port modes"
```

---

### Task 8: JSON-LD Structured Data Generator

**Files:**
- Create: `src/lib/structuredData.ts`

```typescript
// src/lib/structuredData.ts
import type { Toolkit } from '@/types';

/**
 * Generate JSON-LD structured data for a toolkit page.
 * Uses Schema.org types: SoftwareApplication + HowTo.
 * This is the "branch 1" enabler — AI search engines consume this.
 */
export function generateToolkitJsonLd(toolkit: Toolkit): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${toolkit.icon} ${toolkit.title} - 100kdo AI工具包`,
    description: toolkit.description,
    applicationCategory: 'AIApplication',
    operatingSystem: 'Web',
    url: `https://100kdo.com/toolkits/${toolkit.slug}`,
    dateModified: toolkit.updated,
    keywords: toolkit.keywords?.join(', '),
    author: {
      '@type': 'Organization',
      name: '100kdo',
      url: 'https://100kdo.com',
    },
    // HowTo steps for L1 scenarios
    hasPart: toolkit.scenarios?.map((s) => ({
      '@type': 'HowTo',
      name: s.name,
      description: `使用AI处理${s.name}场景`,
    })),
    // Additional port connector data (custom vocabulary)
    subjectOf: toolkit.ports?.map((p) => ({
      '@type': 'DataFeed',
      name: p.name,
      url: p.url,
      description: `连接方式: ${p.type}, 连接器: ${p.connector}, 状态: ${p.status}`,
    })),
  };
}
```

- [ ] **Step 1: Write the file** as shown above.

- [ ] **Step 2: Commit**

```bash
git add src/lib/structuredData.ts && git commit -m "feat: add JSON-LD generator for AI-readable structured data"
```

---

## Phase 3: Shared Components

### Task 9: Header Component

**Files:**
- Create: `src/components/Header/Header.tsx`
- Create: `src/components/Header/Header.module.css`

- [ ] **Step 1: Write Header.module.css**

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logoAccent {
  color: var(--color-accent);
}

.nav {
  display: flex;
  gap: 20px;
  align-items: center;
}

.navLink {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.15s;
}

.navLink:hover {
  color: var(--color-text-primary);
}
```

- [ ] **Step 2: Write Header.tsx**

```tsx
import Link from 'next/link';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoAccent}>100k</span>do
      </Link>
      <nav className={styles.nav}>
        <Link href="/about" className={styles.navLink}>
          关于
        </Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Integrate into layout**

Update `src/app/layout.tsx` — add Header import and use it:

```tsx
import { Header } from '@/components/Header/Header';

// inside <body>:
<Header />
{children}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Header/ src/app/layout.tsx && git commit -m "feat: add sticky header with logo and nav"
```

---

### Task 10: Footer Component

**Files:**
- Create: `src/components/Footer/Footer.tsx`
- Create: `src/components/Footer/Footer.module.css`

- [ ] **Step 1: Write Footer.module.css**

```css
.footer {
  padding: 32px 24px;
  border-top: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  margin-top: 80px;
}

.footer a {
  color: var(--color-accent);
}
```

- [ ] **Step 2: Write Footer.tsx**

```tsx
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        100kdo — 给普通人的 AI 专家工具包平台{' '}
        <a href="https://github.com/100kdo" target="_blank" rel="noopener">
          GitHub
        </a>
      </p>
    </footer>
  );
}
```

- [ ] **Step 3: Integrate into layout** — add `<Footer />` after `{children}` in `layout.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer/ src/app/layout.tsx && git commit -m "feat: add footer component"
```

---

### Task 11: CopyButton Component

**Files:**
- Create: `src/components/CopyButton/CopyButton.tsx`
- Create: `src/components/CopyButton/CopyButton.module.css`

- [ ] **Step 1: Write CopyButton.module.css**

```css
.button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s, transform 0.1s;
}

.button:hover {
  background: #4090e0;
}

.button:active {
  transform: scale(0.97);
}

.copied {
  background: var(--color-success);
}

.copied:hover {
  background: var(--color-success);
}

.icon {
  font-size: 1rem;
}
```

- [ ] **Step 2: Write CopyButton.tsx**

```tsx
'use client';

import { useState, useCallback } from 'react';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = '复制', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`${styles.button} ${copied ? styles.copied : ''} ${className ?? ''}`}
    >
      <span className={styles.icon}>{copied ? '✅' : '📋'}</span>
      {copied ? '已复制！' : label}
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CopyButton/ && git commit -m "feat: add CopyButton with clipboard API + fallback"
```

---

### Task 12: PlatformButtons Component

**Files:**
- Create: `src/components/PlatformButtons/PlatformButtons.tsx`
- Create: `src/components/PlatformButtons/PlatformButtons.module.css`

- [ ] **Step 1: Write PlatformButtons.module.css**

```css
.section {
  margin-top: 16px;
}

.sectionTitle {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: 0.8125rem;
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}

.button:hover {
  border-color: var(--color-accent);
  background: var(--color-surface);
}

.buttonNoDeepLink {
  cursor: pointer;
}

.buttonDeepLink {
  border-color: var(--color-success);
}

.icon {
  width: 18px;
  height: 18px;
  border-radius: 3px;
}
```

- [ ] **Step 2: Write PlatformButtons.tsx**

```tsx
import { getAllPlatforms, buildDeepLink } from '@/lib/platforms';
import { CopyButton } from '@/components/CopyButton/CopyButton';
import styles from './PlatformButtons.module.css';

interface PlatformButtonsProps {
  /** The full prompt text to deliver */
  promptText: string;
  /** Called when a non-DeepLink platform is clicked */
  onCopyForPlatform: (platformName: string) => void;
}

export function PlatformButtons({ promptText, onCopyForPlatform }: PlatformButtonsProps) {
  const platforms = getAllPlatforms();

  const handleNoDeepLink = (platformName: string) => {
    // Copy first, then notify parent
    navigator.clipboard.writeText(promptText).then(() => {
      onCopyForPlatform(platformName);
    }).catch(() => {
      onCopyForPlatform(platformName);
    });
  };

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>在以下平台打开：</p>
      <div className={styles.buttons}>
        {platforms.map((platform) => {
          const deepLink = buildDeepLink(platform.slug, promptText);

          if (deepLink) {
            return (
              <a
                key={platform.slug}
                href={deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.button} ${styles.buttonDeepLink}`}
                title={`一键打开 ${platform.name} 并自动填入提示词`}
              >
                <img src={platform.icon} alt="" className={styles.icon} />
                {platform.name}
              </a>
            );
          }

          return (
            <button
              key={platform.slug}
              onClick={() => handleNoDeepLink(platform.name)}
              className={`${styles.button} ${styles.buttonNoDeepLink}`}
              title={`复制提示词后打开 ${platform.name}`}
            >
              <img src={platform.icon} alt="" className={styles.icon} />
              {platform.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PlatformButtons/ && git commit -m "feat: add PlatformButtons with DeepLink routing and copy fallback"
```

---

### Task 13: PortConnectorList Component

**Files:**
- Create: `src/components/PortConnectorList/PortConnectorList.tsx`
- Create: `src/components/PortConnectorList/PortConnectorList.module.css`

- [ ] **Step 1: Write PortConnectorList.module.css**

```css
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.15s;
}

.item:hover {
  border-color: var(--color-accent);
}

.statusBadge {
  flex-shrink: 0;
  font-size: 0.6875rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
  margin-top: 2px;
}

.verified {
  background: rgba(63, 185, 80, 0.15);
  color: var(--color-success);
}

.unverified {
  background: rgba(210, 153, 34, 0.15);
  color: var(--color-warning);
}

.community {
  background: rgba(110, 118, 129, 0.15);
  color: var(--color-text-secondary);
}

.content {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.metaItem {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge {
  font-size: 0.6875rem;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
}

.platformBadges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.platformBadge {
  font-size: 0.6875rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--color-surface-raised);
  color: var(--color-text-secondary);
}

.link {
  font-size: 0.75rem;
  color: var(--color-accent);
  word-break: break-all;
}
```

- [ ] **Step 2: Write PortConnectorList.tsx**

```tsx
import type { PortConnector } from '@/types';
import styles from './PortConnectorList.module.css';

interface PortConnectorListProps {
  ports: PortConnector[];
}

const PORT_TYPE_LABELS: Record<string, string> = {
  'rest-api': 'REST API',
  'mcp-server': 'MCP Server',
  skill: 'Skill',
  'gpts-action': 'GPTs Action',
  'static-data': '静态数据',
  'web-scraping': '网页抓取',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  verified: { label: '✅ 已验证', className: 'verified' },
  unverified: { label: '⚠️ 待验证', className: 'unverified' },
  community: { label: '📦 社区贡献', className: 'community' },
};

export function PortConnectorList({ ports }: PortConnectorListProps) {
  return (
    <div className={styles.list}>
      {ports.map((port) => {
        const status = STATUS_CONFIG[port.status] ?? STATUS_CONFIG.community;
        return (
          <div key={port.id} className={styles.item}>
            <span className={`${styles.statusBadge} ${styles[status.className]}`}>
              {status.label}
            </span>
            <div className={styles.content}>
              <div className={styles.name}>{port.connector}</div>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  📂 {port.name}
                </span>
                <span className={styles.badge}>
                  {PORT_TYPE_LABELS[port.type] ?? port.type}
                </span>
              </div>
              <div className={styles.platformBadges}>
                {port.platforms.map((p) => (
                  <span key={p} className={styles.platformBadge}>
                    {p}
                  </span>
                ))}
              </div>
              <a
                href={port.connectorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {port.connectorUrl}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PortConnectorList/ && git commit -m "feat: add PortConnectorList component with status badges and platform tags"
```

---

### Task 14: PromptPreview Component

**Files:**
- Create: `src/components/PromptPreview/PromptPreview.tsx`
- Create: `src/components/PromptPreview/PromptPreview.module.css`

- [ ] **Step 1: Write PromptPreview.module.css**

```css
.container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
}

.title {
  font-size: 0.875rem;
  font-weight: 600;
}

.content {
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.7;
  white-space: pre-wrap;
  color: var(--color-text-secondary);
  max-height: 300px;
  overflow-y: auto;
  transition: max-height 0.3s ease;
}

.expanded {
  max-height: 2000px;
}
```

- [ ] **Step 2: Write PromptPreview.tsx**

```tsx
'use client';

import { useState } from 'react';
import { CopyButton } from '@/components/CopyButton/CopyButton';
import styles from './PromptPreview.module.css';

interface PromptPreviewProps {
  prompt: string;
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>📋 专家Prompt</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            {expanded ? '收起' : '展开查看完整prompt'}
          </button>
          <CopyButton text={prompt} label="复制" />
        </div>
      </div>
      <div className={`${styles.content} ${expanded ? styles.expanded : ''}`}>
        {prompt}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PromptPreview/ && git commit -m "feat: add PromptPreview with expand/collapse and copy"
```

---

### Task 15: ScenarioList Component

**Files:**
- Create: `src/components/ScenarioList/ScenarioList.tsx`
- Create: `src/components/ScenarioList/ScenarioList.module.css`

- [ ] **Step 1: Write ScenarioList.module.css**

```css
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}

.item:hover {
  border-color: var(--color-accent);
  background: var(--color-surface-raised);
}

.icon {
  font-size: 1.125rem;
}
```

- [ ] **Step 2: Write ScenarioList.tsx**

```tsx
import type { Scenario } from '@/types';
import styles from './ScenarioList.module.css';

interface ScenarioListProps {
  scenarios: Scenario[];
}

export function ScenarioList({ scenarios }: ScenarioListProps) {
  return (
    <div className={styles.list}>
      {scenarios.map((scenario) => (
        <div key={scenario.name} className={styles.item}>
          <span className={styles.icon}>{scenario.icon}</span>
          {scenario.name}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ScenarioList/ && git commit -m "feat: add ScenarioList component for L1 workflow scenarios"
```

---

### Task 16: ToolkitCard Component (for listing pages)

**Files:**
- Create: `src/components/ToolkitCard/ToolkitCard.tsx`
- Create: `src/components/ToolkitCard/ToolkitCard.module.css`

- [ ] **Step 1: Write ToolkitCard.module.css**

```css
.card {
  display: block;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: border-color 0.15s, transform 0.1s;
}

.card:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}

.icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.title {
  font-size: 1.0625rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.description {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
}

.meta {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
```

- [ ] **Step 2: Write ToolkitCard.tsx**

```tsx
import Link from 'next/link';
import type { ToolkitMeta } from '@/types';
import styles from './ToolkitCard.module.css';

interface ToolkitCardProps {
  toolkit: ToolkitMeta;
}

export function ToolkitCard({ toolkit }: ToolkitCardProps) {
  return (
    <Link href={`/toolkits/${toolkit.slug}`} className={styles.card}>
      <div className={styles.icon}>{toolkit.icon}</div>
      <h3 className={styles.title}>{toolkit.title}</h3>
      <p className={styles.description}>{toolkit.description}</p>
      <div className={styles.meta}>
        <span className={styles.stat}>
          🔌 {toolkit.verifiedPortCount}/{toolkit.portCount} 已验证端口
        </span>
        <span>更新于 {toolkit.updated}</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ToolkitCard/ && git commit -m "feat: add ToolkitCard component for listing pages"
```

---

### Task 17: SearchBar Component

**Files:**
- Create: `src/components/SearchBar/SearchBar.tsx`
- Create: `src/components/SearchBar/SearchBar.module.css`

- [ ] **Step 1: Write SearchBar.module.css**

```css
.wrapper {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.form {
  display: flex;
  gap: 0;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color 0.15s;
  background: var(--color-surface);
}

.form:focus-within {
  border-color: var(--color-accent);
}

.input {
  flex: 1;
  padding: 14px 20px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: 1rem;
}

.input::placeholder {
  color: var(--color-text-secondary);
}

.button {
  padding: 14px 24px;
  background: var(--color-accent);
  border: none;
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.button:hover {
  background: #4090e0;
}
```

- [ ] **Step 2: Write SearchBar.tsx**

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
}

export function SearchBar({ initialQuery = '', large = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索你想解决的问题，例如：怎么处理孩子发烧..."
          className={styles.input}
          style={large ? { padding: '18px 24px', fontSize: '1.125rem' } : undefined}
        />
        <button type="submit" className={styles.button}>
          搜索
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchBar/ && git commit -m "feat: add SearchBar with client-side navigation to search page"
```

---

### Task 18: CategoryNav Component

**Files:**
- Create: `src/components/CategoryNav/CategoryNav.tsx`
- Create: `src/components/CategoryNav/CategoryNav.module.css`

- [ ] **Step 1: Write CategoryNav.module.css**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.category {
  display: block;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: border-color 0.15s;
}

.category:hover {
  border-color: var(--color-accent);
}

.icon {
  font-size: 1.75rem;
  margin-bottom: 8px;
}

.name {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.desc {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
```

- [ ] **Step 2: Write CategoryNav.tsx**

```tsx
import Link from 'next/link';
import { getAllCategories } from '@/lib/categories';
import styles from './CategoryNav.module.css';

export function CategoryNav() {
  const categories = getAllCategories();

  return (
    <div className={styles.grid}>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/categories/${cat.slug}`}
          className={styles.category}
        >
          <div className={styles.icon}>{cat.icon}</div>
          <div className={styles.name}>{cat.name}</div>
          <div className={styles.desc}>{cat.description}</div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CategoryNav/ && git commit -m "feat: add CategoryNav grid component"
```

---

### Task 19: JsonLd Component

**Files:**
- Create: `src/components/JsonLd/JsonLd.tsx`

```tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 1: Write the file** as shown above.

- [ ] **Step 2: Commit**

```bash
git add src/components/JsonLd/ && git commit -m "feat: add JsonLd script component for structured data"
```

---

## Phase 4: Pages

### Task 20: Homepage

**Files:**
- Create: `src/app/page.tsx` (replace placeholder)
- Create: `src/app/page.module.css`

- [ ] **Step 1: Write page.module.css**

```css
.hero {
  text-align: center;
  padding: 80px 24px 48px;
}

.heroTitle {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.heroAccent {
  color: var(--color-accent);
}

.heroSubtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.heroSearch {
  margin-bottom: 16px;
}

.heroHint {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.section {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 24px;
}

.sectionTitle {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.toolkitGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .toolkitGrid {
    grid-template-columns: 1fr;
  }
}

.viewAll {
  display: inline-block;
  margin-top: 20px;
  font-size: 0.875rem;
  color: var(--color-accent);
}
```

- [ ] **Step 2: Write page.tsx**

```tsx
import Link from 'next/link';
import { getAllToolkitMetas } from '@/lib/toolkit';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { CategoryNav } from '@/components/CategoryNav/CategoryNav';
import { ToolkitCard } from '@/components/ToolkitCard/ToolkitCard';
import styles from './page.module.css';

export default function HomePage() {
  const toolkits = getAllToolkitMetas();
  const latest = toolkits.slice(0, 4);

  return (
    <main>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroAccent}>100k</span>do
        </h1>
        <p className={styles.heroSubtitle}>
          十万个干什么 — 搜索你的问题，找到专家工具包，<br />
          复制粘贴到 AI，秒变专家。
        </p>
        <div className={styles.heroSearch}>
          <SearchBar large />
        </div>
        <p className={styles.heroHint}>
          试试搜索：孩子发烧怎么办 · 被辞退怎么维权 · 怎么选重疾险
        </p>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>按领域浏览</h2>
        <CategoryNav />
      </section>

      {/* Latest toolkits */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>最新工具包</h2>
        <div className={styles.toolkitGrid}>
          {latest.map((tk) => (
            <ToolkitCard key={tk.slug} toolkit={tk} />
          ))}
        </div>
        {toolkits.length > 4 && (
          <Link href="/categories" className={styles.viewAll}>
            查看全部 {toolkits.length} 个工具包 →
          </Link>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/app/page.module.css && git commit -m "feat: implement homepage with hero, category grid, and latest toolkits"
```

---

### Task 21: Toolkit Detail Page

**Files:**
- Create: `src/app/toolkits/[slug]/page.tsx`
- Create: `src/app/toolkits/[slug]/page.module.css`

- [ ] **Step 1: Write page.module.css**

```css
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.breadcrumb {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.breadcrumb a {
  color: var(--color-text-secondary);
}

.breadcrumb a:hover {
  color: var(--color-accent);
}

.hero {
  margin-bottom: 32px;
}

.icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.description {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
}

.deliveryBox {
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
}

.deliveryTitle {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.copySection {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section {
  margin-bottom: 32px;
}

.sectionTitle {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.stats {
  display: flex;
  gap: 20px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.stats strong {
  color: var(--color-text-primary);
}

.shareSection {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 24px;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  z-index: 200;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateX(-50%) translateY(10px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}
```

- [ ] **Step 2: Write page.tsx**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getToolkitBySlug, getAllToolkitSlugs } from '@/lib/toolkit';
import { generateClipboardText } from '@/lib/clipboard';
import { generateToolkitJsonLd } from '@/lib/structuredData';
import { CopyButton } from '@/components/CopyButton/CopyButton';
import { PlatformButtons } from '@/components/PlatformButtons/PlatformButtons';
import { PortConnectorList } from '@/components/PortConnectorList/PortConnectorList';
import { PromptPreview } from '@/components/PromptPreview/PromptPreview';
import { ScenarioList } from '@/components/ScenarioList/ScenarioList';
import { JsonLd } from '@/components/JsonLd/JsonLd';
import styles from './page.module.css';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllToolkitSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const toolkit = getToolkitBySlug(params.slug);
  if (!toolkit) return { title: '未找到' };

  return {
    title: `${toolkit.title}`,
    description: toolkit.description,
    keywords: toolkit.keywords,
    openGraph: {
      title: `${toolkit.icon} ${toolkit.title} - 100kdo AI工具包`,
      description: toolkit.description,
      url: `https://100kdo.com/toolkits/${toolkit.slug}`,
    },
  };
}

export default function ToolkitDetailPage({ params }: Props) {
  const toolkit = getToolkitBySlug(params.slug);
  if (!toolkit) notFound();

  const clipboardText = generateClipboardText(toolkit);
  const jsonLd = generateToolkitJsonLd(toolkit);

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className={styles.page}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">首页</Link> &rsaquo;{' '}
          <Link href={`/categories/${toolkit.category}`}>{toolkit.category}</Link>
          {toolkit.subcategory && (
            <> &rsaquo; <Link href={`/categories/${toolkit.subcategory}`}>{toolkit.subcategory}</Link></>
          )}
          {' '}&rsaquo; {toolkit.title}
        </nav>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.icon}>{toolkit.icon}</div>
          <h1 className={styles.title}>{toolkit.title}</h1>
          <p className={styles.description}>{toolkit.description}</p>
        </div>

        {/* Delivery Box */}
        <div className={styles.deliveryBox}>
          <p className={styles.deliveryTitle}>🚀 一键获取专家工具包</p>
          <div className={styles.copySection}>
            <CopyButton text={clipboardText} label="复制完整工具包" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              复制后粘贴到任意 AI 对话中即可使用
            </span>
          </div>
          <PlatformButtons
            promptText={clipboardText}
            onCopyForPlatform={(platformName) => {
              // The copy already happened in PlatformButtons.
              // We use a simple approach: show no extra toast since the CopyButton already
              // gives visual feedback. For non-DeepLink platforms, the user expectation
              // is clear: open the platform app and paste.
            }}
          />
        </div>

        {/* L2: Prompt */}
        <div className={styles.section}>
          <PromptPreview prompt={toolkit.prompt} />
        </div>

        {/* L3: Port Connectors */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            🔌 端口连接器（{toolkit.ports.length}个）
          </h2>
          <PortConnectorList ports={toolkit.ports} />
        </div>

        {/* L1: Scenarios */}
        {toolkit.scenarios.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🔄 常用场景</h2>
            <ScenarioList scenarios={toolkit.scenarios} />
          </div>
        )}

        {/* Stats */}
        <div className={styles.stats}>
          <span>更新：<strong>{toolkit.updated}</strong></span>
          <span>已验证端口：<strong>{toolkit.ports.filter((p) => p.status === 'verified').length}/{toolkit.ports.length}</strong></span>
          <span>适用平台：<strong>{new Set(toolkit.ports.flatMap((p) => p.platforms)).size}个</strong></span>
        </div>

        {/* Share */}
        <div className={styles.shareSection}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>分享：</span>
          <CopyButton text={`https://100kdo.com/toolkits/${toolkit.slug}`} label="复制链接" />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/toolkits/ && git commit -m "feat: implement toolkit detail page with SSG, JSON-LD, and full delivery system"
```

---

### Task 22: Category Listing Page

**Files:**
- Create: `src/app/categories/[slug]/page.tsx`
- Create: `src/app/categories/[slug]/page.module.css`

- [ ] **Step 1: Write page.module.css**

```css
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
}

.header {
  margin-bottom: 32px;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.description {
  color: var(--color-text-secondary);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-secondary);
}

.subCategories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.subCat {
  padding: 6px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  text-decoration: none;
}

.subCat:hover {
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}
```

- [ ] **Step 2: Write page.tsx**

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getAllCategories } from '@/lib/categories';
import { getAllToolkitMetas } from '@/lib/toolkit';
import { ToolkitCard } from '@/components/ToolkitCard/ToolkitCard';
import styles from './page.module.css';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  const cats = getAllCategories();
  const slugs: { slug: string }[] = [];
  for (const cat of cats) {
    slugs.push({ slug: cat.slug });
    if (cat.children) {
      for (const child of cat.children) {
        slugs.push({ slug: child.slug });
      }
    }
  }
  return slugs;
}

export default function CategoryPage({ params }: Props) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  const allToolkits = getAllToolkitMetas();

  // Find toolkits that match this category or any of its parent/children
  const toolkits = allToolkits.filter(
    (tk) =>
      tk.category === params.slug || tk.subcategory === params.slug
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {category.icon} {category.name}
        </h1>
        <p className={styles.description}>{category.description}</p>
      </div>

      {/* Subcategories (if this is a top-level category) */}
      {category.children && category.children.length > 0 && (
        <div className={styles.subCategories}>
          {category.children.map((child) => (
            <Link
              key={child.slug}
              href={`/categories/${child.slug}`}
              className={styles.subCat}
            >
              {child.icon} {child.name}
            </Link>
          ))}
        </div>
      )}

      {/* Toolkit listing */}
      {toolkits.length > 0 ? (
        <div className={styles.grid}>
          {toolkits.map((tk) => (
            <ToolkitCard key={tk.slug} toolkit={tk} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>该领域暂无工具包，敬请期待</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/categories/ && git commit -m "feat: implement category listing page with subcategory nav"
```

---

### Task 23: Search Page

**Files:**
- Create: `src/lib/searchIndex.ts`
- Create: `src/app/search/page.tsx`
- Create: `src/app/search/page.module.css`

- [ ] **Step 1: Write searchIndex.ts — build-time search index**

```typescript
// src/lib/searchIndex.ts
import { getAllToolkitMetas } from '@/lib/toolkit';
import type { ToolkitMeta } from '@/types';

/** Build a simple in-memory search index at build time */
export function buildSearchIndex(): ToolkitMeta[] {
  return getAllToolkitMetas();
}

/**
 * Client-side search function.
 * Simple but effective: matches against title, description, and keywords.
 */
export function searchToolkits(
  query: string,
  toolkits: ToolkitMeta[]
): ToolkitMeta[] {
  const q = query.toLowerCase().trim();
  if (!q) return toolkits;

  return toolkits
    .map((tk) => {
      let score = 0;

      // Exact title match = highest score
      if (tk.title.toLowerCase().includes(q)) score += 10;
      if (tk.title.toLowerCase() === q) score += 20;

      // Description match
      if (tk.description.toLowerCase().includes(q)) score += 5;

      // Keyword match
      const keywordMatches = tk.keywords.filter((kw) =>
        kw.toLowerCase().includes(q)
      ).length;
      score += keywordMatches * 8;

      // Category match
      if (tk.category.toLowerCase().includes(q)) score += 3;
      if (tk.subcategory?.toLowerCase().includes(q)) score += 3;

      return { toolkit: tk, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.toolkit);
}
```

- [ ] **Step 2: Write page.module.css**

```css
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
}

.searchHeader {
  margin-bottom: 32px;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.resultCount {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-secondary);
}

.emptyTitle {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 24px;
}

.suggestion {
  padding: 6px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: var(--color-accent);
  text-decoration: none;
}
```

- [ ] **Step 3: Write page.tsx**

```tsx
'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { ToolkitCard } from '@/components/ToolkitCard/ToolkitCard';
import { buildSearchIndex, searchToolkits } from '@/lib/searchIndex';
import styles from './page.module.css';

// Build once at module load (this is a client component, so it runs in browser)
const allToolkits = buildSearchIndex();

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const results = useMemo(
    () => searchToolkits(query, allToolkits),
    [query]
  );

  return (
    <div className={styles.page}>
      <div className={styles.searchHeader}>
        <h1 className={styles.title}>搜索工具包</h1>
        <SearchBar initialQuery={query} />
      </div>

      {query && (
        <p className={styles.resultCount}>
          找到 {results.length} 个相关工具包
          {results.length > 0 ? '' : '，试试其他关键词'}
        </p>
      )}

      {results.length > 0 ? (
        <div className={styles.grid}>
          {results.map((tk) => (
            <ToolkitCard key={tk.slug} toolkit={tk} />
          ))}
        </div>
      ) : query ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>未找到匹配的工具包</p>
          <p>试试用更短的关键词搜索，或浏览以下建议：</p>
          <div className={styles.suggestions}>
            <Link href="/search?q=育儿" className={styles.suggestion}>育儿</Link>
            <Link href="/search?q=面试" className={styles.suggestion}>面试</Link>
            <Link href="/search?q=法律" className={styles.suggestion}>法律</Link>
            <Link href="/search?q=保险" className={styles.suggestion}>保险</Link>
            <Link href="/search?q=装修" className={styles.suggestion}>装修</Link>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>输入关键词搜索</p>
          <p>搜索"育儿""求职""法律维权"等关键词找到对应工具包</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/searchIndex.ts src/app/search/ && git commit -m "feat: implement client-side search with scoring and suggestions"
```

---

### Task 24: About Page

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/about/page.module.css`

- [ ] **Step 1: Write page.module.css**

```css
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px;
}

.title {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 24px;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.section p,
.section li {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.section ol {
  padding-left: 20px;
}

.section li {
  margin-bottom: 8px;
}

.note {
  margin-top: 40px;
  padding: 16px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.note strong {
  color: var(--color-text-primary);
}
```

- [ ] **Step 2: Write page.tsx**

```tsx
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: '关于 100kdo',
  description: '100kdo（十万个干什么）是一个给普通人的 AI 领域专家一键切换平台。',
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>关于 100kdo</h1>

      <div className={styles.section}>
        <h2>这是什么？</h2>
        <p>
          100kdo（十万个干什么）是一个给普通人的 AI 专家工具包平台。
          你不需要学 Prompt 工程，不需要知道什么是 MCP 或 Skill
          —— 只需搜索你遇到的问题，找到对应的工具包，复制粘贴到你的 AI（DeepSeek、ChatGPT、豆包等），AI 就会自动变成该领域的专家。
        </p>
      </div>

      <div className={styles.section}>
        <h2>怎么用？</h2>
        <ol>
          <li><strong>搜索或浏览</strong> —— 在首页搜索你的问题，或按领域分类浏览</li>
          <li><strong>找到工具包</strong> —— 点击进入工具包详情页，了解包含的专家 Prompt 和权威数据端口</li>
          <li><strong>一键使用</strong> —— 点击复制，粘贴到你的 AI 对话中，AI 自动变成专家</li>
          <li><strong>选择平台</strong> —— 支持 DeepSeek、ChatGPT、Kimi、豆包、通义千问等主流 AI</li>
        </ol>
      </div>

      <div className={styles.section}>
        <h2>什么是端口（Port）？</h2>
        <p>
          端口是可以连接权威信息源的接口 —— 比如 WHO 儿童生长标准数据库、中国 CDC 疫苗接种规范、PubMed 医学文献等。
          每个专家工具包都内置了精心策展的端口连接器清单，告诉 AI 去哪里找最可靠的信息，而不是凭空编造。
        </p>
      </div>

      <div className={styles.note}>
        <p>
          <strong>100kdo 不是什么：</strong>我们不替代 AI，不教 Prompt 工程，不卖 AI 工具。
          我们只是一个策展层 —— 把最好的端口连接器和专家 Prompt 打包好，让你拿来就用。
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/about/ && git commit -m "feat: add about page explaining 100kdo concept and usage"
```

---

## Phase 5: SEO & Static Assets

### Task 25: Platform Icons (SVG placeholders)

**Files:**
- Create: `public/platforms/deepseek.svg`, `chatgpt.svg`, `kimi.svg`, `doubao.svg`, `gemini.svg`, `tongyi.svg`, `cherry-studio.svg`

- [ ] **Step 1: Create placeholder SVG icons**

For MVP, create minimal recognizable SVGs. Each is a 48x48 rounded square with the platform's first letter.

```bash
mkdir -p public/platforms
```

Example for `public/platforms/deepseek.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="8" fill="#4F46E5"/>
  <text x="24" y="32" text-anchor="middle" fill="white" font-size="22" font-family="sans-serif" font-weight="bold">D</text>
</svg>
```

Create similar files for: chatgpt (#10A37F, "G"), kimi (#6C5CE7, "K"), doubao (#FF6B6B, "豆"), gemini (#4285F4, "G"), tongyi (#FF6A00, "通"), cherry-studio (#6366F1, "C").

- [ ] **Step 2: Create favicon**

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0d1117"/>
  <text x="16" y="23" text-anchor="middle" fill="#58a6ff" font-size="18" font-family="sans-serif" font-weight="800">100</text>
</svg>
```

- [ ] **Step 3: Commit**

```bash
git add public/ && git commit -m "feat: add platform SVG icons and favicon"
```

---

### Task 26: SEO — Sitemap & Robots

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Write sitemap.ts**

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllToolkitSlugs } from '@/lib/toolkit';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://100kdo.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  const toolkitPages: MetadataRoute.Sitemap = getAllToolkitSlugs().map((slug) => ({
    url: `${baseUrl}/toolkits/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...toolkitPages];
}
```

- [ ] **Step 2: Write robots.ts**

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://100kdo.com/sitemap.xml',
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts && git commit -m "feat: add sitemap.xml and robots.txt for SEO"
```

---

## Phase 6: Verification & Polish

### Task 27: Full Build Verification

- [ ] **Step 1: Install all dependencies and build**

```bash
cd G:/AICode/100kdo-ai-port && pnpm install && pnpm build
```

Expected: successful build with zero errors. Static export to `out/`.

- [ ] **Step 2: Verify key outputs**

```bash
# Check that all expected pages were statically generated
ls out/toolkits/parenting.html 2>/dev/null && echo "✅ parenting" || echo "❌ parenting missing"
ls out/toolkits/job-interview.html 2>/dev/null && echo "✅ job-interview" || echo "❌ job-interview missing"
ls out/index.html 2>/dev/null && echo "✅ homepage" || echo "❌ homepage missing"
ls out/sitemap.xml 2>/dev/null && echo "✅ sitemap" || echo "❌ sitemap missing"
ls out/robots.txt 2>/dev/null && echo "✅ robots" || echo "❌ robots missing"
```

- [ ] **Step 3: Check JSON-LD presence in toolkit page**

```bash
grep -c 'application/ld+json' out/toolkits/parenting.html && echo "✅ JSON-LD found" || echo "❌ JSON-LD missing"
```

- [ ] **Step 4: Commit if any fixes were needed, or confirm build is clean**

```bash
git status
```

---

### Task 28: Not Found Page

**Files:**
- Create: `src/app/not-found.tsx`

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '120px 24px',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>404</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
        这个工具包还没有策展，或者链接可能已失效。
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: 'var(--color-accent)',
          color: '#fff',
          borderRadius: 'var(--radius-sm)',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        返回首页
      </Link>
    </div>
  );
}
```

- [ ] **Step 1: Write the file** as shown above.

- [ ] **Step 2: Commit**

```bash
git add src/app/not-found.tsx && git commit -m "feat: add 404 not-found page"
```

---

## Summary: Build Order

| Phase | Tasks | What It Delivers |
|-------|-------|-----------------|
| **Phase 1** | Task 1-2 | Next.js scaffold, TypeScript types |
| **Phase 2** | Task 3-8 | Content system: markdown data, parser, categories, platforms, clipboard, JSON-LD |
| **Phase 3** | Task 9-19 | All shared UI components |
| **Phase 4** | Task 20-24 | All pages: home, toolkit detail, category, search, about |
| **Phase 5** | Task 25-26 | Static assets, SEO (sitemap, robots) |
| **Phase 6** | Task 27-28 | Build verification, 404 page |

## Verification Checklist

After full build, verify the following manually:

- [ ] Homepage loads with category grid and latest toolkits
- [ ] Clicking a category navigates to category listing
- [ ] Toolkit detail page shows: delivery box, prompt preview, port connectors, scenarios
- [ ] "复制完整工具包" copies text to clipboard
- [ ] DeepLink platforms (DeepSeek, Kimi, 通义千问) open with pre-filled prompt
- [ ] Non-DeepLink platforms (ChatGPT, Gemini, 豆包) copy text and show open prompt
- [ ] Search returns relevant results for "育儿", "面试"
- [ ] JSON-LD script tag present in page source of toolkit detail
- [ ] sitemap.xml and robots.txt accessible
- [ ] 404 page renders for unknown routes
- [ ] Mobile responsive: all pages render correctly at 375px width
