'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import PlatformButtons from '@/components/PlatformButtons';
import PortConnectorList from '@/components/PortConnectorList';
import PromptPreview from '@/components/PromptPreview';
import ScenarioList from '@/components/ScenarioList';
import { API_BASE } from '@/lib/api';
import styles from '../[slug]/page.module.css';

interface ToolkitData {
  slug: string;
  title: string;
  icon: string;
  description: string;
  category: string;
  subcategory?: string;
  prompt: string;
  scenarios: any[];
  ports: any[];
  updated?: string;
  source?: string;
}

function getQueryParam(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') ?? '';
}

export default function ToolkitFallbackPage() {
  const [toolkit, setToolkit] = useState<ToolkitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = getQueryParam();
    if (!slug) { setLoading(false); return; }

    document.title = '加载中... | 100kdo';

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

  if (loading) return <main className={styles.main}><p className={styles.loading}>加载中...</p></main>;
  if (!toolkit) return <main className={styles.main}><p className={styles.loading}>工具包未找到</p><Link href="/">← 返回首页</Link></main>;

  const prompt = toolkit.prompt || '';
  const clipboardText = `【${toolkit.icon || '🤖'} ${toolkit.title}】\n\n${prompt}\n\n---\n由 100kdo.ccwu.cc 提供`;

  return (
    <main className={styles.main}>
      <nav className={styles.breadcrumb}>
        <Link href="/">首页</Link> › {toolkit.title}
        {toolkit.source === 'generated' && <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--color-warning)' }}>🤖 AI 生成</span>}
      </nav>

      <section className={styles.hero}>
        <span className={styles.icon}>{toolkit.icon || '🤖'}</span>
        <h1 className={styles.title}>{toolkit.title}</h1>
        <p className={styles.description}>{toolkit.description}</p>
      </section>

      <section className={styles.deliveryBox}>
        <h2 className={styles.deliveryTitle}>🚀 一键获取专家工具包</h2>
        <CopyButton text={clipboardText} label="📋 复制完整工具包" className={styles.copyBtn} />
        <p className={styles.deliveryHint}>复制后粘贴到任意 AI 对话中即可使用</p>
        <PlatformButtons promptText={prompt} />
      </section>

      <section className={styles.section}>
        <PromptPreview prompt={prompt} />
      </section>

      {toolkit.ports && toolkit.ports.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔌 权威数据端口</h2>
          <PortConnectorList ports={toolkit.ports} />
        </section>
      )}

      {toolkit.scenarios && toolkit.scenarios.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 适用场景</h2>
          <ScenarioList scenarios={toolkit.scenarios} />
        </section>
      )}

      <div className={styles.statsBar}>
        <span>{toolkit.source === 'generated' ? '🤖 AI 生成' : '✅ 官方策展'}</span>
        {toolkit.updated && <span>📅 {toolkit.updated}</span>}
      </div>
    </main>
  );
}
