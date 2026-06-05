'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import CategoryNav from '@/components/CategoryNav';
import ToolkitCard from '@/components/ToolkitCard';
import { API_BASE } from '@/lib/api';
import type { ToolkitMeta } from '@/types';
import styles from './page.module.css';

export default function HomePage() {
  const [toolkits, setToolkits] = useState<ToolkitMeta[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/toolkits`)
      .then((r) => r.json())
      .then((d) => setToolkits(d.toolkits ?? []))
      .catch(() => {
        // Silently fail — API may be unavailable
      });
  }, []);

  const latest = toolkits.slice(0, 4);
  const remaining = toolkits.length - 4;

  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          <span className={styles.accent}>100k</span>do
        </h1>
        <p className={styles.heroSubtitle}>
          搜索你的问题，找到对应领域的专家 AI 工具包，一键复制，秒变专家
        </p>
        <SearchBar large />
        <p className={styles.hint}>
          试试搜索：孩子发烧怎么办 · 被辞退怎么维权 · 怎么选重疾险
        </p>
        <p className={styles.tip}>
          💡 找到工具包 → 复制 → 粘贴到 ChatGPT / 豆包 / Kimi 即可使用
        </p>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>按领域浏览</h2>
        <CategoryNav />
      </section>

      {/* Latest toolkits */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>最新工具包</h2>
        <div className={styles.grid}>
          {latest.map((tk) => (
            <ToolkitCard key={tk.slug} toolkit={tk} />
          ))}
        </div>
        {remaining > 0 && (
          <Link href="/categories" className={styles.viewAll}>
            查看全部 {toolkits.length} 个工具包 →
          </Link>
        )}
      </section>
    </main>
  );
}
