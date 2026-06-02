// src/index.ts — Hono app entry point for Cloudflare Worker

import { Hono } from 'hono';
import { generateToolkit } from './generator';
import { findBySlug, findAllToolkits, insertToolkit } from './db';
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
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
    c.header('Access-Control-Max-Age', '86400');
  }
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
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

app.notFound(c => c.json({ error: 'Not found' }, 404));

export default app;
