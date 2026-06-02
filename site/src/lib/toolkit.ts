// src/lib/toolkit.ts — Fetches toolkit data from D1-backed Worker API
import type { Toolkit, ToolkitMeta } from '@/types';
import { API_BASE } from './api';

const API = API_BASE;

export async function getAllToolkitMetas(): Promise<ToolkitMeta[]> {
  const res = await fetch(`${API}/api/toolkits`);
  const data = await res.json();
  return (data.toolkits ?? []).map((t: any) => ({
    slug: t.slug,
    title: t.title,
    icon: t.icon,
    category: t.category,
    subcategory: t.subcategory || undefined,
    description: t.description,
    keywords: t.keywords ?? [],
    updated: (t.created_at ?? '').slice(0, 10),
    portCount: (t.ports ?? []).length,
    verifiedPortCount: (t.ports ?? []).filter((p: any) => p.status === 'verified').length,
  }));
}

export async function getToolkitBySlug(slug: string): Promise<Toolkit | null> {
  const res = await fetch(`${API}/api/toolkits/${slug}`);
  if (!res.ok) return null;
  const data = await res.json();
  const t = data.toolkit;
  return {
    slug: t.slug,
    title: t.title,
    icon: t.icon,
    category: t.category,
    subcategory: t.subcategory || undefined,
    description: t.description,
    keywords: t.keywords ?? [],
    updated: (t.created_at ?? '').slice(0, 10),
    prompt: t.prompt,
    scenarios: t.scenarios ?? [],
    ports: t.ports ?? [],
  };
}

export async function getAllToolkitSlugs(): Promise<string[]> {
  const metas = await getAllToolkitMetas();
  return metas.map((m) => m.slug);
}
