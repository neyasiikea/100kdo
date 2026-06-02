// src/types/index.ts

/** Verification status of a port connector */
export type PortStatus = 'verified' | 'unverified' | 'community';

/** Type of port connector */
export type PortType =
  | 'rest-api'
  | 'mcp-server'
  | 'skill'
  | 'gpts-action'
  | 'static-data'
  | 'web-scraping';

/** A single port connector — the core asset of 100kdo */
export interface PortConnector {
  id: string;
  name: string;            // Display name of the authority source
  url: string;             // URL to the data source
  type: PortType;
  connector: string;       // Connector identifier (e.g., "who-growth-mcp")
  connectorUrl: string;    // Link to install/get the connector
  status: PortStatus;
  platforms: string[];     // Platform slugs this connector works on
  contributor?: string;
}

/** A scenario within a toolkit — maps user intent to ports */
export interface Scenario {
  name: string;
  icon: string;            // Emoji
  ports: string[];         // Port IDs used in this scenario
}

/** The complete toolkit data model */
export interface Toolkit {
  slug: string;
  title: string;
  icon: string;
  category: string;
  subcategory?: string;
  description: string;
  keywords: string[];
  updated: string;         // ISO date string
  prompt: string;          // Full expert prompt text
  scenarios: Scenario[];
  ports: PortConnector[];
}

/** Toolkit metadata only (for listing pages, excludes heavy fields) */
export interface ToolkitMeta {
  slug: string;
  title: string;
  icon: string;
  category: string;
  subcategory?: string;
  description: string;
  keywords: string[];
  updated: string;
  portCount: number;
  verifiedPortCount: number;
}

/** Category hierarchy node */
export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
  children?: Category[];
}

/** Platform configuration for delivery links */
export interface PlatformConfig {
  slug: string;
  name: string;
  icon: string;            // Path to SVG in /public/platforms/
  /** URL to open when user clicks the platform button (after copying prompt) */
  webUrl: string;
  /** Whether this is a mobile app (affects UX copy) */
  isApp: boolean;
  /** Scenario level: "consumer" for L1, "agent" for L2 */
  level: 'consumer' | 'agent';
}
