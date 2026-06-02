import { MetadataRoute } from 'next';
import { getAllToolkitSlugs } from '@/lib/toolkit';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://100kdo.com';
  const slugs = await getAllToolkitSlugs();
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...slugs.map((slug) => ({
      url: `${baseUrl}/toolkits/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
