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
  response_template?: string;
  follow_up_chain?: string[];
  disclaimer?: string;
  example_dialogue?: string;
  search_guidance?: string;
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
  description?: string;
  status: 'verified' | 'unverified' | 'community';
  platforms: string[];
  // NOTE: connector 和 connectorUrl 已废弃——对消费者 AI 无实际价值
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
  response_template?: string;
  follow_up_chain?: string[];
  disclaimer?: string;
  example_dialogue?: string;
  search_guidance?: string;
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
  response_template?: string;
  follow_up_chain?: string;
  disclaimer?: string;
  example_dialogue?: string;
  search_guidance?: string;
  source?: string;
  review_status?: string;
  created_at: string;
  usage_count: number;
}
