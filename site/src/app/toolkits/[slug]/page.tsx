import { getToolkitBySlug, getAllToolkitSlugs } from '@/lib/toolkit';
import type { Toolkit } from '@/types';
import ToolkitPageClient from './ToolkitPageClient';

export async function generateStaticParams() {
  const slugs = await getAllToolkitSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ToolkitPage({ params }: { params: { slug: string } }) {
  // Fetch toolkit data at build time for static HTML embedding
  let toolkit: Toolkit | null = null;
  try {
    toolkit = await getToolkitBySlug(params.slug);
  } catch {
    // Toolkit not found — client will handle
  }

  return (
    <>
      {/* Embed toolkit data as JSON for crawlers (AI, Google, etc.) */}
      {toolkit && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: `${toolkit.icon} ${toolkit.title} — 100kdo AI工具包`,
              description: toolkit.description,
              applicationCategory: 'AIApplication',
              operatingSystem: 'Web',
              url: `https://100kdo.ccwu.cc/toolkits/${toolkit.slug}`,
              dateModified: toolkit.updated,
              keywords: toolkit.keywords?.join(', '),
              author: { '@type': 'Organization', name: '100kdo', url: 'https://100kdo.ccwu.cc' },
              // Embed the actual prompt as "softwareHelp" for AI crawl
              softwareHelp: {
                '@type': 'CreativeWork',
                text: toolkit.prompt,
              },
              // Port connectors as "subjectOf" datasets
              subjectOf: (toolkit.ports ?? []).map((p: any) => ({
                '@type': 'Dataset',
                name: p.name,
                url: p.url,
                description: `端口类型: ${p.type}, 状态: ${p.status}${p.description ? ', ' + p.description : ''}`,
                creator: { '@type': 'Organization', name: p.name },
              })),
              // Scenarios as HowTo
              hasPart: (toolkit.scenarios ?? []).map((s: any) => ({
                '@type': 'HowTo',
                name: s.name,
                description: `${s.icon} 使用AI处理${s.name}场景`,
              })),
            }),
          }}
        />
      )}
      {/* Hidden pre with prompt text for crawlers that don't parse JSON-LD */}
      {toolkit && (
        <pre
          style={{ display: 'none' }}
          aria-hidden="true"
          data-100kdo="toolkit-data"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              title: toolkit.title,
              description: toolkit.description,
              prompt: toolkit.prompt,
              keywords: toolkit.keywords,
              ports: (toolkit.ports ?? []).map((p: any) => ({
                name: p.name,
                url: p.url,
                type: p.type,
                description: p.description,
              })),
              scenarios: toolkit.scenarios,
            }),
          }}
        />
      )}
      <ToolkitPageClient slug={params.slug} />
    </>
  );
}
