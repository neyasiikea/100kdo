// src/migrate.ts — Import all curated markdown toolkits into D1 via local HTTP calls
// Run: npx tsx src/migrate.ts
// Requires: Worker running locally with `npx wrangler dev`

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const API_BASE = process.env.API_BASE ?? 'https://api.100kdo.ccwu.cc';
const TOOLKITS_DIR = path.join(process.cwd(), '..', '100kdo-ai-port', 'content', 'toolkits');

interface ToolkitPayload {
  id: string;
  slug: string;
  title: string;
  icon: string;
  category: string;
  subcategory: string;
  description: string;
  keywords: string[];
  prompt: string;
  scenarios: any[];
  ports: any[];
  source: string;
  review_status: string;
  updated: string;
}

async function main() {
  const files = fs.readdirSync(TOOLKITS_DIR).filter((f) => f.endsWith('.md'));

  console.log(`Migrating ${files.length} curated toolkits to ${API_BASE}/api/migrate/import`);

  // Build payloads
  const payloads: ToolkitPayload[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(TOOLKITS_DIR, file), 'utf8');
    const { data, content } = matter(raw);

    payloads.push({
      id: `curated_${data.slug}`,
      slug: data.slug,
      title: data.title,
      icon: data.icon ?? '🗂️',
      category: data.category ?? 'life',
      subcategory: data.subcategory ?? '',
      description: data.description ?? '',
      keywords: data.keywords ?? [],
      prompt: content.trim(),
      scenarios: data.scenarios ?? [],
      ports: data.ports ?? [],
      source: 'curated',
      review_status: 'reviewed',
      updated: data.updated ?? '2026-06-01',
    });
  }

  // Send in batches to avoid timeouts
  for (let i = 0; i < payloads.length; i++) {
    const p = payloads[i];
    try {
      const res = await fetch(`${API_BASE}/api/migrate/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (res.ok) {
        console.log(`[${i + 1}/${payloads.length}] ✅ ${p.title}`);
      } else {
        const err = await res.text();
        console.error(`[${i + 1}/${payloads.length}] ❌ ${p.title}: ${res.status} ${err}`);
      }
    } catch (e: any) {
      console.error(`[${i + 1}/${payloads.length}] ❌ ${p.title}: ${e.message}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
