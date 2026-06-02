// src/lib/toolkit.ts — Fetches toolkit data from D1-backed Worker API
import type { Toolkit, ToolkitMeta } from '@/types';
import { API_BASE } from './api';

const API = API_BASE;

function safeArr(v: unknown): any[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { const a = JSON.parse(v); return Array.isArray(a) ? a : []; } catch { return []; } }
  return [];
}

function safeKeywords(v: unknown): string[] {
  if (!v) return [];
  const arr = safeArr(v);
  return arr.map(k => String(k ?? ''));
}

export async function getAllToolkitMetas(): Promise<ToolkitMeta[]> {
  const res = await fetch(`${API}/api/toolkits`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.toolkits ?? []).map((t: any) => ({
    slug: String(t.slug ?? ''),
    title: String(t.title ?? ''),
    icon: String(t.icon ?? '🗂️'),
    category: String(t.category ?? ''),
    subcategory: t.subcategory || undefined,
    description: String(t.description ?? ''),
    keywords: safeKeywords(t.keywords),
    updated: String((t.created_at ?? '')).slice(0, 10),
    portCount: safeArr(t.ports).length,
    verifiedPortCount: safeArr(t.ports).filter((p: any) => p?.status === 'verified').length,
  }));
}

export async function getToolkitBySlug(slug: string): Promise<Toolkit | null> {
  const res = await fetch(`${API}/api/toolkits/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const t = data.toolkit;
  if (!t) return null;
  return {
    slug: String(t.slug ?? slug),
    title: String(t.title ?? ''),
    icon: String(t.icon ?? '🗂️'),
    category: String(t.category ?? ''),
    subcategory: t.subcategory || undefined,
    description: String(t.description ?? ''),
    keywords: safeKeywords(t.keywords),
    updated: String((t.created_at ?? '')).slice(0, 10),
    prompt: String(t.prompt ?? ''),
    scenarios: safeArr(t.scenarios) as any,
    ports: safeArr(t.ports) as any,
  };
}

export async function getAllToolkitSlugs(): Promise<string[]> {
  const metas = await getAllToolkitMetas();
  return metas.map(m => m.slug);
}
