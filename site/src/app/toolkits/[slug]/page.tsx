import { getAllToolkitSlugs } from '@/lib/toolkit';
import ToolkitPageClient from './ToolkitPageClient';

export async function generateStaticParams() {
  const slugs = await getAllToolkitSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default function ToolkitPage({
  params,
}: {
  params: { slug: string };
}) {
  return <ToolkitPageClient slug={params.slug} />;
}
