// src/generator.ts — Toolkit generation orchestration

import type { GeneratedToolkit, AIResponse } from './types';
import { buildToolkitGenerationPrompt } from './providers/types';
import { DeepSeekProvider } from './providers/deepseek';
import { hashQuery, generateSlug, generateId, inferCategory } from './utils';

/** Strip markdown code fences from AI output before JSON parsing */
function cleanAIResponse(raw: string): string {
  let cleaned = raw.trim();
  // Remove ```json ... ``` wrapper
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return cleaned;
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

  // 3. Infer category from query keywords
  const { category, subcategory } = inferCategory(query);

  // 4. Build the toolkit object
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const toolkit: GeneratedToolkit = {
    id: generateId(),
    query_hash: qHash,
    query: query.trim(),
    slug: generateSlug(aiData.title) || `dynamic-${Date.now()}`,
    title: aiData.title,
    icon: '🤖',
    category,
    subcategory,
    description: aiData.description,
    keywords: aiData.keywords ?? [],
    prompt: aiData.prompt,
    scenarios: aiData.scenarios ?? [],
    ports: (aiData.ports ?? []).map((p) => ({
      ...p,
      status: p.status || 'community',
      platforms: p.platforms ?? [],
    })),
    source: 'generated',
    review_status: 'auto',
    created_at: now,
    usage_count: 1,
  };

  // 5. Store in D1
  await import('./db').then((m) => m.insertToolkit(db, toolkit));

  return toolkit;
}
