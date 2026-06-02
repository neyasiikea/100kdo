// src/types.ts — Shared types mirroring frontend, adapted for Worker

export interface GeneratedToolkit {
  id: string;
  query_hash?: string;
  query?: string;
  slug: string;
  title: string;
  icon: string;
  category: string;
  subcategory: string;
  description: string;
  keywords: string[];
  prompt: string;
  scenarios: GeneratedScenario[];
  ports: GeneratedPort[];
  source?: string;
  review_status?: string;
  created_at: string;
  usage_count: number;
}

export interface GeneratedScenario {
  name: string;
  icon: string;
  ports: string[];
}

export interface GeneratedPort {
  id: string;
  name: string;
  url: string;
  type: string;
  connector: string;
  connectorUrl: string;
  status: 'verified' | 'unverified' | 'community';
  platforms: string[];
}

/** Raw AI response before parsing */
export interface AIResponse {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  keywords: string[];
  prompt: string;
  scenarios: GeneratedScenario[];
  ports: GeneratedPort[];
}

/** D1 row format (JSON strings for complex fields) */
export interface ToolkitRow {
  id: string;
  query_hash?: string;
  query?: string;
  slug: string;
  title: string;
  icon: string;
  category: string;
  subcategory: string;
  description: string;
  keywords: string;
  prompt: string;
  scenarios: string;
  ports: string;
  source?: string;
  review_status?: string;
  created_at: string;
  usage_count: number;
}
