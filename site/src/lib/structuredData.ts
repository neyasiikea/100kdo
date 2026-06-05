// src/lib/structuredData.ts
import type { Toolkit } from '@/types';

/**
 * Generate JSON-LD structured data for a toolkit page.
 * Uses Schema.org types: SoftwareApplication + HowTo.
 * This is the "branch 1" enabler — AI search engines consume this.
 */
export function generateToolkitJsonLd(toolkit: Toolkit): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${toolkit.icon} ${toolkit.title} - 100kdo AI工具包`,
    description: toolkit.description,
    applicationCategory: 'AIApplication',
    operatingSystem: 'Web',
    url: `https://100kdo.ccwu.cc/toolkits/${toolkit.slug}`,
    dateModified: toolkit.updated,
    keywords: toolkit.keywords?.join(', '),
    author: {
      '@type': 'Organization',
      name: '100kdo',
      url: 'https://100kdo.ccwu.cc',
    },
    hasPart: toolkit.scenarios?.map((s) => ({
      '@type': 'HowTo',
      name: s.name,
      description: `使用AI处理${s.name}场景`,
    })),
    subjectOf: toolkit.ports?.map((p) => ({
      '@type': 'DataFeed',
      name: p.name,
      url: p.url,
      description: `端口类型: ${p.type}, 状态: ${p.status}${p.description ? ', 说明: ' + p.description : ''}`,
    })),
  };
}
