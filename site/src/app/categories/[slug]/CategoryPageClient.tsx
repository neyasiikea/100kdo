'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllCategories, getCategoryBySlug } from '@/lib/categories';
import { API_BASE } from '@/lib/api';
import type { ToolkitMeta } from '@/types';
import ToolkitCard from '@/components/ToolkitCard';
import styles from './page.module.css';

interface Props {
  slug: string;
}

export default function CategoryPageClient({ slug }: Props) {
  const [toolkits, setToolkits] = useState<ToolkitMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const category = getCategoryBySlug(slug);

  // Set page title
  useEffect(() => {
    if (category) {
      document.title = `${category.icon} ${category.name}`;
    }
  }, [category]);

  // Fetch toolkits from Worker API
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/toolkits`)
      .then((r) => r.json())
      .then((d) => {
        const all = (d.toolkits ?? []) as ToolkitMeta[];
        setToolkits(
          all.filter(
            (tk) => tk.category === slug || tk.subcategory === slug
          )
        );
        setLoading(false);
      })
      .catch(() => {
        setToolkits([]);
        setLoading(false);
      });
  }, [slug]);

  if (!category) {
    return (
      <main className={styles.main}>
        <div className={styles.notFound}>
          <p>未找到分类</p>
          <Link href="/">返回首页</Link>
        </div>
      </main>
    );
  }

  // Find parent if this is a subcategory
  const allCategories = getAllCategories();
  let parentCategory = null;
  if (category.children) {
    parentCategory = category;
  } else {
    for (const cat of allCategories) {
      if (cat.children?.some((c) => c.slug === slug)) {
        parentCategory = cat;
        break;
      }
    }
  }

  return (
    <main className={styles.main}>
      {/* Header */}
      <section className={styles.header}>
        <span className={styles.icon}>{category.icon}</span>
        <h1 className={styles.title}>{category.name}</h1>
        <p className={styles.description}>{category.description}</p>
      </section>

      {/* Subcategory pills (if top-level and has children) */}
      {category.children && category.children.length > 0 && (
        <section className={styles.subSection}>
          <h2 className={styles.subTitle}>子领域</h2>
          <div className={styles.pills}>
            {category.children.map((child) => (
              <Link
                key={child.slug}
                href={`/categories/${child.slug}`}
                className={styles.pill}
              >
                {child.icon} {child.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Toolkit list */}
      <section className={styles.toolkitsSection}>
        <h2 className={styles.sectionTitle}>工具包 ({toolkits.length})</h2>

        {loading ? (
          <p className={styles.loading}>加载中...</p>
        ) : toolkits.length > 0 ? (
          <div className={styles.grid}>
            {toolkits.map((tk) => (
              <ToolkitCard key={tk.slug} toolkit={tk} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>该领域暂无工具包，敬请期待</p>
          </div>
        )}

        {/* Back link for subcategories */}
        {parentCategory && parentCategory.slug !== slug && (
          <Link
            href={`/categories/${parentCategory.slug}`}
            className={styles.backLink}
          >
            ← 返回 {parentCategory.icon} {parentCategory.name}
          </Link>
        )}
      </section>
    </main>
  );
}
