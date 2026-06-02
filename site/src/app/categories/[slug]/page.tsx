import { getAllCategories } from '@/lib/categories';
import CategoryPageClient from './CategoryPageClient';

export function generateStaticParams() {
  const categories = getAllCategories();
  const slugs: string[] = [];
  for (const cat of categories) {
    slugs.push(cat.slug);
    if (cat.children) {
      for (const child of cat.children) {
        slugs.push(child.slug);
      }
    }
  }
  return slugs.map((slug) => ({ slug }));
}

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  return <CategoryPageClient slug={params.slug} />;
}
