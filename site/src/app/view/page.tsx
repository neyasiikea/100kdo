'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import PlatformButtons from '@/components/PlatformButtons';
import PortConnectorList from '@/components/PortConnectorList';
import PromptPreview from '@/components/PromptPreview';
import ScenarioList from '@/components/ScenarioList';
import { API_BASE } from '@/lib/api';
import { getCategoryBySlug } from '@/lib/categories';
import styles from '../toolkits/[slug]/page.module.css';

export default function ViewPage() {
  const [toolkit, setToolkit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Raw query string manual parse (avoids double-encoding from URLSearchParams)
    const search = window.location.search.slice(1);
    let slug = '';
    if (search) {
      const parts = search.split('&');
      for (const part of parts) {
        const [key, val] = part.split('=');
        if (key === 'slug') {
          slug = decodeURIComponent(val ?? '');
          break;
        }
      }
    }

    if (!slug) {
      const parts = window.location.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && parts[0] === 'toolkits') {
        slug = parts.slice(1).join('/');
      }
    }

    if (!slug) { setLoading(false); return; }

    fetch(`${API_BASE}/api/toolkits/${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => {
        if (d?.toolkit) {
          setToolkit(d.toolkit);
          document.title = `${d.toolkit.icon || '🤖'} ${d.toolkit.title} | 100kdo`;
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ViewShell><p className={styles.loading}>加载中...</p></ViewShell>;
  if (!toolkit) return <ViewShell><p className={styles.loading}>工具包未找到</p><Link href="/">← 返回首页</Link></ViewShell>;

  const prompt = toolkit.prompt || '';
  const ports = toolkit.ports || [];
  const scenarios = toolkit.scenarios || [];
  const categoryInfo = getCategoryBySlug(toolkit.category);
  const subcategoryInfo = toolkit.subcategory ? getCategoryBySlug(toolkit.subcategory) : undefined;

  return (
    <main className={styles.main}>
      <nav className={styles.breadcrumb}>
        <Link href="/">首页</Link>
        <span className={styles.sep}>›</span>
        {categoryInfo && (
          <>
            <Link href={`/categories/${categoryInfo.slug}`}>{categoryInfo.icon} {categoryInfo.name}</Link>
            <span className={styles.sep}>›</span>
          </>
        )}
        {subcategoryInfo && (
          <>
            <Link href={`/categories/${subcategoryInfo.slug}`}>{subcategoryInfo.icon} {subcategoryInfo.name}</Link>
            <span className={styles.sep}>›</span>
          </>
        )}
        {toolkit.title}
        {toolkit.source === 'generated' && <span style={{marginLeft:8,fontSize:'0.75rem',color:'var(--color-warning)'}}>🤖 AI 生成</span>}
      </nav>

      <section className={styles.hero}>
        <span className={styles.icon}>{toolkit.icon || '🤖'}</span>
        <h1 className={styles.title}>{toolkit.title}</h1>
        <p className={styles.description}>{toolkit.description}</p>
      </section>

      <section className={styles.deliveryBox}>
        <h2 className={styles.deliveryTitle}>🚀 一键获取专家工具包</h2>
        <CopyButton text={`【${toolkit.icon||'🤖'} ${toolkit.title}】\n\n${prompt}\n\n---\n由 100kdo.ccwu.cc 提供`} label="📋 复制完整工具包" className={styles.copyBtn} />
        <p className={styles.deliveryHint}>复制后粘贴到任意 AI 对话中即可使用</p>
        <PlatformButtons promptText={prompt} />
      </section>

      <section className={styles.section}><PromptPreview prompt={prompt} /></section>

      {ports.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔌 权威数据端口</h2>
          <PortConnectorList ports={ports} />
        </section>
      )}

      {scenarios.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 适用场景</h2>
          <ScenarioList scenarios={scenarios} />
        </section>
      )}
    </main>
  );
}

function ViewShell({ children }: { children: React.ReactNode }) {
  return <main className={styles.main}>{children}</main>;
}
