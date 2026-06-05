// src/generator.ts — Toolkit generation orchestration

import type { GeneratedToolkit, GeneratedPort, AIResponse } from './types';
import { buildToolkitGenerationPrompt, matchAuthoritySources } from './providers/types';
import { DeepSeekProvider } from './providers/deepseek';
import { hashQuery, generateSlug, generateId, inferCategory, validateCategory } from './utils';
import AUTHORITY_SOURCES from './data/authority-sources.json';

/** Strip markdown code fences from AI output before JSON parsing */
function cleanAIResponse(raw: string): string {
  let cleaned = raw.trim();
  // Remove ```json ... ``` wrapper
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return cleaned;
}

/** Normalize AI-generated ports against the authority sources library.
 *  ONLY library-matched ports are kept. Non-matching ports are silently dropped.
 *  backfillMissingSources() then fills in any matched sources the AI missed. */
function canonicalizePorts(aiPorts: GeneratedPort[]): GeneratedPort[] {
  const sources = (AUTHORITY_SOURCES as Array<{name:string;url:string;description:string;category:string;keywords:string[]}>);

  const result: GeneratedPort[] = [];
  const seenDomains = new Set<string>();

  for (const p of aiPorts) {
    if (!p.url || p.url.startsWith('http://example') || p.url.includes('example.com')) continue;

    const pDomain = extractDomain(p.url);
    if (seenDomains.has(pDomain)) continue;

    const libSource = sources.find((s) => extractDomain(s.url) === pDomain);
    if (!libSource) continue; // Drop non-library URLs entirely

    seenDomains.add(pDomain);
    result.push({
      id: `p${String(result.length + 1).padStart(2, '0')}`,
      name: libSource.name,
      url: libSource.url,
      type: 'static-data',
      description: libSource.description,
      status: 'verified' as const,
      platforms: ['web'],
    });
  }

  return result;
}

/** Add library sources that the AI missed but should have been included */
function backfillMissingSources(
  canonicalized: GeneratedPort[],
  query: string,
): GeneratedPort[] {
  const matchedSources = matchAuthoritySources(query);
  if (matchedSources.length <= canonicalized.length) return canonicalized;

  const usedDomains = new Set(canonicalized.map((p) => extractDomain(p.url)));
  const unused = matchedSources.filter((s) => !usedDomains.has(extractDomain(s.url)));

  // Add at most enough to reach 6 total
  const toAdd = unused.slice(0, Math.max(0, 6 - canonicalized.length));
  const extras: GeneratedPort[] = toAdd.map((s, i) => ({
    id: `p${String(canonicalized.length + i + 1).padStart(2, '0')}`,
    name: s.name,
    url: s.url,
    type: 'static-data',
    description: s.description,
    status: 'verified' as const,
    platforms: ['web'],
  }));

  return [...canonicalized, ...extras];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Generate a toolkit, returning from cache if available */
export async function generateToolkit(
  query: string,
  db: D1Database,
  deepseekApiKey: string,
  deepseekApiUrl?: string
): Promise<GeneratedToolkit> {
  // 1. Check D1 cache
  const qHash = await hashQuery(query);
  const cached = await import('./db').then((m) => m.findByQueryHash(db, qHash));

  if (cached) {
    await import('./db').then((m) => m.incrementUsage(db, cached.id));
    return cached;
  }

  // 2. Generate via AI
  const provider = new DeepSeekProvider(deepseekApiKey, deepseekApiUrl);
  const systemPrompt = buildToolkitGenerationPrompt(query);
  const rawResponse = await provider.generate(systemPrompt);
  const cleaned = cleanAIResponse(rawResponse);
  const aiData: AIResponse = JSON.parse(cleaned);

  // 3. Category — priority: AI output → keyword inference → 待定
  const keywordCat = inferCategory(query);
  const aiCatRaw = (aiData as any).category as string | undefined;
  const aiCat = validateCategory(aiCatRaw);
  const aiSubcat = (aiData as any).subcategory as string | undefined;

  let category: string;
  let subcategory: string;

  if (aiCat) {
    // AI gave a valid known category — use it
    category = aiCat;
    subcategory = aiSubcat || keywordCat.subcategory;
  } else if (keywordCat.category !== '待定') {
    // Keyword inference confident
    category = keywordCat.category;
    subcategory = keywordCat.subcategory;
  } else {
    // Neither AI nor keyword confident → 待定
    category = '待定';
    subcategory = '';
  }

  // 4. Post-process ports against authority library
  const queryText = query.trim();
  let aiPorts = (aiData.ports ?? []).map((p) => ({
    ...p,
    status: p.status || 'community',
    platforms: p.platforms ?? [],
  }));
  const canonicalPorts = canonicalizePorts(aiPorts);
  const finalPorts = backfillMissingSources(canonicalPorts, queryText);

  // 5. Build the toolkit object
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const toolkit: GeneratedToolkit = {
    id: generateId(),
    query_hash: qHash,
    query: queryText,
    slug: generateSlug(aiData.title) || `dynamic-${Date.now()}`,
    title: aiData.title,
    icon: '🤖',
    category,
    subcategory,
    description: aiData.description,
    keywords: (aiData.keywords ?? []).map((k: any) => typeof k === 'string' ? k : String(k)),
    prompt: aiData.prompt,
    scenarios: aiData.scenarios ?? [],
    ports: finalPorts,
    source: 'generated',
    review_status: 'auto',
    created_at: now,
    usage_count: 1,
    response_template: aiData.response_template || undefined,
    follow_up_chain: aiData.follow_up_chain || undefined,
    disclaimer: aiData.disclaimer || undefined,
    example_dialogue: aiData.example_dialogue || undefined,
    search_guidance: aiData.search_guidance || undefined,
  };

  // 6. Store in D1
  await import('./db').then((m) => m.insertToolkit(db, toolkit));

  return toolkit;
}
