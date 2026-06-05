// src/db.ts — D1 database operations
import type { ToolkitRow, GeneratedToolkit } from './types';

function safeParse(raw: string): any[] {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; }
}

function rowToToolkit(row: ToolkitRow): GeneratedToolkit {
  return {
    ...row,
    keywords: safeParse(row.keywords),
    scenarios: safeParse(row.scenarios),
    ports: safeParse(row.ports),
    follow_up_chain: safeParse(row.follow_up_chain ?? ''),
  };
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
    stmt = db.prepare('SELECT * FROM generated_toolkits ORDER BY created_at DESC LIMIT 500');
  }
  const result = await stmt.all<ToolkitRow>();
  return (result.results ?? []).map(rowToToolkit);
}

export async function insertToolkit(db: D1Database, t: GeneratedToolkit): Promise<void> {
  await db.prepare(
    `INSERT OR REPLACE INTO generated_toolkits (id, query_hash, query, slug, title, icon, category, subcategory, description, keywords, prompt, scenarios, ports, response_template, follow_up_chain, disclaimer, example_dialogue, search_guidance, source, review_status, created_at, usage_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(t.id, t.query_hash ?? '', t.query ?? '', t.slug, t.title, t.icon, t.category, t.subcategory ?? '', t.description, JSON.stringify(t.keywords), t.prompt, JSON.stringify(t.scenarios), JSON.stringify(t.ports), t.response_template ?? '', JSON.stringify(t.follow_up_chain ?? []), t.disclaimer ?? '', t.example_dialogue ?? '', t.search_guidance ?? '', t.source ?? 'generated', t.review_status ?? 'auto', t.created_at, t.usage_count ?? 1).run();
}

export async function incrementUsage(db: D1Database, id: string): Promise<void> {
  await db.prepare('UPDATE generated_toolkits SET usage_count = usage_count + 1 WHERE id = ?').bind(id).run();
}

/** Admin: update an existing toolkit */
export async function updateToolkit(db: D1Database, slug: string, updates: Partial<GeneratedToolkit>): Promise<boolean> {
  const sets: string[] = [];
  const vals: any[] = [];

  if (updates.title !== undefined) { sets.push('title = ?'); vals.push(updates.title); }
  if (updates.icon !== undefined) { sets.push('icon = ?'); vals.push(updates.icon); }
  if (updates.category !== undefined) { sets.push('category = ?'); vals.push(updates.category); }
  if (updates.subcategory !== undefined) { sets.push('subcategory = ?'); vals.push(updates.subcategory); }
  if (updates.description !== undefined) { sets.push('description = ?'); vals.push(updates.description); }
  if (updates.keywords !== undefined) { sets.push('keywords = ?'); vals.push(JSON.stringify(updates.keywords)); }
  if (updates.prompt !== undefined) { sets.push('prompt = ?'); vals.push(updates.prompt); }
  if (updates.scenarios !== undefined) { sets.push('scenarios = ?'); vals.push(JSON.stringify(updates.scenarios)); }
  if (updates.ports !== undefined) { sets.push('ports = ?'); vals.push(JSON.stringify(updates.ports)); }
  if (updates.source !== undefined) { sets.push('source = ?'); vals.push(updates.source); }
  if (updates.review_status !== undefined) { sets.push('review_status = ?'); vals.push(updates.review_status); }
  if (updates.response_template !== undefined) { sets.push('response_template = ?'); vals.push(updates.response_template); }
  if (updates.follow_up_chain !== undefined) { sets.push('follow_up_chain = ?'); vals.push(JSON.stringify(updates.follow_up_chain)); }
  if (updates.disclaimer !== undefined) { sets.push('disclaimer = ?'); vals.push(updates.disclaimer); }
  if (updates.example_dialogue !== undefined) { sets.push('example_dialogue = ?'); vals.push(updates.example_dialogue); }
  if (updates.search_guidance !== undefined) { sets.push('search_guidance = ?'); vals.push(updates.search_guidance); }

  if (sets.length === 0) return false;

  vals.push(slug);
  const result = await db.prepare(`UPDATE generated_toolkits SET ${sets.join(', ')} WHERE slug = ?`).bind(...vals).run();
  return result.meta?.changes > 0;
}

/** Admin: delete a toolkit by slug */
export async function deleteToolkit(db: D1Database, slug: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM generated_toolkits WHERE slug = ?').bind(slug).run();
  return result.meta?.changes > 0;
}

export async function countToolkitsByCategory(db: D1Database): Promise<Record<string, number>> {
  const result = await db.prepare('SELECT category, COUNT(*) as cnt FROM generated_toolkits GROUP BY category').all<{ category: string; cnt: number }>();
  const map: Record<string, number> = {};
  for (const r of result.results ?? []) { map[r.category] = r.cnt; }
  return map;
}
