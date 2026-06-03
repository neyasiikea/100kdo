// src/index.ts — Hono app entry point for Cloudflare Worker

import { Hono } from 'hono';
import { generateToolkit } from './generator';
import { findBySlug, findAllToolkits, insertToolkit, updateToolkit, deleteToolkit, countToolkitsByCategory } from './db';
import { handleMCPRequest } from './mcpServer';
import { generateSlug } from './utils';
import type { GeneratedToolkit } from './types';

type Bindings = {
  DB: D1Database;
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_API_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin') ?? '';
  const allowed = ['100kdo.ccwu.cc', '100kdo-site.pages.dev', 'localhost', '127.0.0.1'];
  const ok = allowed.some(p => origin.includes(p));
  if (ok) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Max-Age', '86400');
  }
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400' } });
  }
  await next();
});

app.get('/api/health', c => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// List ALL toolkits (curated + generated), optionally filtered by category
app.get('/api/toolkits', async (c) => {
  const category = c.req.query('category') ?? undefined;
  const toolkits = await findAllToolkits(c.env.DB, category);
  return c.json({ count: toolkits.length, toolkits });
});

// Get single toolkit by slug (any source)
app.get('/api/toolkits/:slug', async (c) => {
  const slug = c.req.param('slug');
  const toolkit = await findBySlug(c.env.DB, slug);
  if (!toolkit) return c.json({ error: 'Not found' }, 404);
  return c.json({ toolkit });
});

// AI generate toolkit
app.post('/api/generate', async (c) => {
  const apiKey = c.env.DEEPSEEK_API_KEY;
  if (!apiKey) return c.json({ error: 'DEEPSEEK_API_KEY not configured' }, 500);

  let body: { query?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const query = body.query?.trim();
  if (!query || query.length < 2) return c.json({ error: 'Query too short' }, 400);
  if (query.length > 200) return c.json({ error: 'Query too long' }, 400);

  try {
    const toolkit = await generateToolkit(query, c.env.DB, apiKey, c.env.DEEPSEEK_API_URL);
    return c.json({ success: true, toolkit });
  } catch (err: any) {
    return c.json({ error: 'Generation failed', detail: err.message }, 500);
  }
});

// Migration endpoint: import a single curated toolkit
app.post('/api/migrate/import', async (c) => {
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const slug = body.slug || generateSlug(body.title) || `toolkit-${Date.now()}`;
  const now = body.updated ? `${body.updated} 00:00:00` : new Date().toISOString().slice(0, 19).replace('T', ' ');

  const toolkit: GeneratedToolkit = {
    id: body.id || `curated_${slug}`,
    slug,
    title: body.title || '',
    icon: body.icon || '🗂️',
    category: body.category || 'life',
    subcategory: body.subcategory || '',
    description: body.description || '',
    keywords: body.keywords || [],
    prompt: body.prompt || '',
    scenarios: body.scenarios || [],
    ports: body.ports || [],
    source: body.source || 'curated',
    review_status: body.review_status || 'reviewed',
    created_at: now,
    usage_count: body.usage_count || 0,
  };

  try {
    await insertToolkit(c.env.DB, toolkit);
    return c.json({ success: true, slug });
  } catch (err: any) {
    return c.json({ error: 'Insert failed', detail: err.message }, 500);
  }
});

// ── Admin Routes (require ADMIN_PASSWORD secret) ──

function adminAuth(c: any): boolean {
  const auth = c.req.header('Authorization') ?? '';
  const pwd = (c.env.ADMIN_PASSWORD as string) ?? '';
  if (!pwd) return false;
  return auth === `Bearer ${pwd}`;
}

function requireAdmin(c: any, next: any) {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401);
  return next();
}

// Stats for admin dashboard
app.get('/api/admin/stats', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401);
  const all = await findAllToolkits(c.env.DB);
  const byCategory = await countToolkitsByCategory(c.env.DB);
  return c.json({
    total: all.length,
    curated: all.filter(t => t.source === 'curated').length,
    generated: all.filter(t => t.source === 'generated').length,
    byCategory,
  });
});

// Update toolkit
app.put('/api/admin/toolkits/:slug', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401);
  const slug = c.req.param('slug');
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }
  const ok = await updateToolkit(c.env.DB, slug, body);
  return ok ? c.json({ success: true }) : c.json({ error: 'Toolkit not found or no changes' }, 404);
});

// Delete toolkit
app.delete('/api/admin/toolkits/:slug', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401);
  const slug = c.req.param('slug');
  const ok = await deleteToolkit(c.env.DB, slug);
  return ok ? c.json({ success: true }) : c.json({ error: 'Toolkit not found' }, 404);
});

// Create curated toolkit
app.post('/api/admin/toolkits', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401);
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  if (!body.title || !body.prompt || !body.category) {
    return c.json({ error: 'title, prompt, and category are required' }, 400);
  }

  const slug = body.slug || generateSlug(body.title) || `toolkit-${Date.now()}`;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const toolkit: GeneratedToolkit = {
    id: `curated_${slug}`,
    slug,
    title: body.title,
    icon: body.icon || '🗂️',
    category: body.category,
    subcategory: body.subcategory || '',
    description: body.description || '',
    keywords: body.keywords || [],
    prompt: body.prompt,
    scenarios: body.scenarios || [],
    ports: body.ports || [],
    source: 'curated',
    review_status: 'reviewed',
    created_at: now,
    usage_count: 0,
  };

  await insertToolkit(c.env.DB, toolkit);
  return c.json({ success: true, slug });
});

// MCP Server — GET returns server info, POST handles JSON-RPC
app.get('/mcp', (c) =>
  c.json({
    name: '100kdo MCP Server',
    version: '0.1.2',
    protocol: 'Model Context Protocol (Streamable HTTP)',
    endpoint: 'POST /mcp',
    tools: ['search_toolkits', 'get_toolkit', 'generate_toolkit'],
  })
);

app.post('/mcp', async (c) => {
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }

  const apiKey = c.env.DEEPSEEK_API_KEY;
  const response = await handleMCPRequest(body, c.env.DB, apiKey, c.env.DEEPSEEK_API_URL);
  return c.json(response);
});

// AI LLMS endpoint — returns full toolkit data as Markdown for AI model consumption
app.get('/api/llms', async (c) => {
  const toolkits = await findAllToolkits(c.env.DB);
  const curated = toolkits.filter(t => t.source === 'curated');
  const generated = toolkits.filter(t => t.source === 'generated');

  let md = '# 100kdo 全量工具包数据\n\n';
  md += '> 本文件包含所有工具包的完整 prompt 和端口连接器数据，供 AI 模型一次性加载。\n';
  md += '> 更新时间：' + new Date().toISOString().slice(0, 10) + '\n\n';

  // Table of contents
  md += '## 目录\n\n';
  for (const t of curated) {
    md += '- ' + (t.icon || '🗂️') + ' [' + t.title + '](#' + encodeURIComponent(t.slug) + ')\n';
  }
  md += '\n## 策展工具包\n\n';

  for (const t of curated) {
    md += '### ' + (t.icon || '🗂️') + ' ' + t.title + ' {#' + t.slug + '}\n\n';
    md += '**描述**: ' + t.description + '\n\n';
    md += '**分类**: ' + t.category + (t.subcategory ? ' > ' + t.subcategory : '') + '\n';
    md += '**关键词**: ' + (t.keywords || []).join('、') + '\n\n';
    md += '#### 专家 Prompt\n\n' + (t.prompt || '') + '\n\n';

    const scenarios = t.scenarios || [];
    if (scenarios.length > 0) {
      md += '#### 适用场景\n\n';
      for (const s of scenarios) { md += '- ' + (s.icon || '') + ' ' + s.name + '\n'; }
      md += '\n';
    }

    const ports = t.ports || [];
    if (ports.length > 0) {
      md += '#### 权威数据端口\n\n';
      for (const p of ports) {
        md += '- **' + p.connector + '** → ' + p.name + ' (' + p.type + ')\n';
        md += '  信息源: ' + p.url + ' | 状态: ' + p.status + '\n';
      }
      md += '\n';
    }
    md += '---\n\n';
  }

  // AI-generated toolkits summary
  if (generated.length > 0) {
    md += '## AI 动态生成工具包 (' + generated.length + '个)\n\n';
    for (const t of generated) {
      md += '- ' + (t.icon || '🤖') + ' ' + t.title + ': ' + t.description + '\n';
    }
    md += '\n> 动态工具包的完整数据可通过 GET /api/toolkits/:slug 获取\n';
  }

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

app.notFound(c => c.json({ error: 'Not found' }, 404));

export default app;
