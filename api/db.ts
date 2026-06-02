// src/db.ts — D1 database operations
import type { ToolkitRow, GeneratedToolkit } from './types';

function safeParse(raw: string): any[] {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; }
}

function rowToToolkit(row: ToolkitRow): GeneratedToolkit {
  return { ...row, keywords: safeParse(row.keywords), scenarios: safeParse(row.scenarios), ports: safeParse(row.ports) };
}

export async function findByQueryHash(db: D1Database, queryHash: string): Promise<GeneratedToolkit | null> {
  const row = await db.prepare('SELECT * FROM generated_toolkits WHERE query_hash = ?').bind(queryHash).first<ToolkitRow>();
  return row ? rowToToolkit(row) : null;
}

export async function findBySlug(db: D1Database, slug: string): Promise<GeneratedToolkit | null> {
  const row = await db.prepare('SELECT * FROM generated_toolkits WHERE slug = ?').bind(slug).first<ToolkitRow>();
  return row ? rowToToolkit(row) : null;
}

export async function findAllToolkits(db: D1Database, category?: string): Promise<GeneratedToolkit[]> {
  let stmt;
  if (category) {
    stmt = db.prepare('SELECT * FROM generated_toolkits WHERE category = ? OR subcategory = ? ORDER BY source DESC, usage_count DESC LIMIT 50').bind(category, category);
  } else {
    stmt = db.prepare('SELECT * FROM generated_toolkits ORDER BY source DESC, usage_count DESC LIMIT 100');
  }
  const result = await stmt.all<ToolkitRow>();
  return (result.results ?? []).map(rowToToolkit);
}

export async function insertToolkit(db: D1Database, t: GeneratedToolkit): Promise<void> {
  await db.prepare(
    `INSERT OR REPLACE INTO generated_toolkits (id, query_hash, query, slug, title, icon, category, subcategory, description, keywords, prompt, scenarios, ports, source, review_status, created_at, usage_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(t.id, t.query_hash ?? '', t.query ?? '', t.slug, t.title, t.icon, t.category, t.subcategory ?? '', t.description, JSON.stringify(t.keywords), t.prompt, JSON.stringify(t.scenarios), JSON.stringify(t.ports), t.source ?? 'generated', t.review_status ?? 'auto', t.created_at, t.usage_count ?? 1).run();
}

export async function incrementUsage(db: D1Database, id: string): Promise<void> {
  await db.prepare('UPDATE generated_toolkits SET usage_count = usage_count + 1 WHERE id = ?').bind(id).run();
}
