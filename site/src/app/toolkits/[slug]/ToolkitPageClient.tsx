'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/categories';
import { API_BASE } from '@/lib/api';
import { generateClipboardText, generatePromptOnlyText } from '@/lib/clipboard';
import { generateToolkitJsonLd } from '@/lib/structuredData';
import type { Toolkit } from '@/types';
import CopyButton from '@/components/CopyButton';
import PlatformButtons from '@/components/PlatformButtons';
import PortConnectorList from '@/components/PortConnectorList';
import PromptPreview from '@/components/PromptPreview';
import ScenarioList from '@/components/ScenarioList';
import styles from './page.module.css';

interface Props {
  slug: string;
}

export default function ToolkitPageClient({ slug }: Props) {
  const [toolkit, setToolkit] = useState<Toolkit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/toolkits/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((d) => {
        setToolkit(d.toolkit);
        document.title = `${d.toolkit.icon} ${d.toolkit.title} - AI 专家工具包`;
        setLoading(false);
      })
      .catch(() => {
        setToolkit(null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <main className={styles.main}>
        <p className={styles.loading}>加载中...</p>
      </main>
    );
  }

  if (!toolkit) {
    return (
      <main className={styles.main}>
        <div className={styles.notFound}>
          <p>未找到工具包</p>
          <Link href="/">返回首页</Link>
        </div>
      </main>
    );
  }

  const category = getCategoryBySlug(toolkit.category);
  const subcategory = toolkit.subcategory
    ? getCategoryBySlug(toolkit.subcategory)
    : undefined;
  const ports = Array.isArray(toolkit.ports) ? toolkit.ports : [];
  const scenarios = Array.isArray(toolkit.scenarios) ? toolkit.scenarios : [];
  const followUpChain = Array.isArray(toolkit.follow_up_chain) ? toolkit.follow_up_chain : [];
  const clipboardText = generateClipboardText(toolkit);
  const promptOnlyText = generatePromptOnlyText(toolkit);

  const verifiedCount = ports.filter(
    (p) => p?.status === 'verified'
  ).length;
  const uniquePlatforms = new Set(
    ports.flatMap((p) => p?.platforms ?? [])
  ).size;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateToolkitJsonLd(toolkit)),
        }}
      />

      <main className={styles.main}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">首页</Link>
          <span className={styles.sep}>›</span>
          {category && (
            <>
              <Link href={`/categories/${category.slug}`}>
                {category.icon} {category.name}
              </Link>
              <span className={styles.sep}>›</span>
            </>
          )}
          {subcategory && (
            <>
              <Link href={`/categories/${subcategory.slug}`}>
                {subcategory.icon} {subcategory.name}
              </Link>
              <span className={styles.sep}>›</span>
            </>
          )}
          <span className={styles.current}>{toolkit.title}</span>
        </nav>

        {/* Hero */}
        <section className={styles.hero}>
          <span className={styles.icon}>{toolkit.icon}</span>
          <h1 className={styles.title}>{toolkit.title}</h1>
          <p className={styles.description}>{toolkit.description}</p>
        </section>

        {/* Delivery box */}
        <section className={styles.deliveryBox}>
          <h2 className={styles.deliveryTitle}>🚀 一键获取专家工具包</h2>
          <div className={styles.copyGroup}>
            <CopyButton
              text={clipboardText}
              label="📋 复制完整工具包"
              className={styles.copyBtn}
            />
            <CopyButton
              text={promptOnlyText}
              label="📋 复制精简版（仅Prompt）"
              className={styles.copyBtnSecondary}
            />
          </div>
          <p className={styles.deliveryHint}>
            复制后粘贴到 ChatGPT/豆包/Kimi 等任意 AI 对话中即可使用
          </p>
          <PlatformButtons promptText={toolkit.prompt} />
        </section>

        {/* Expert prompt */}
        <section className={styles.section}>
          <PromptPreview prompt={toolkit.prompt} />
        </section>

        {/* Search guidance */}
        {toolkit.search_guidance && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🔍 搜索指导</h2>
            <div className={styles.enhancedBlock}>
              <p>{toolkit.search_guidance}</p>
            </div>
          </section>
        )}

        {/* Response template */}
        {toolkit.response_template && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📝 回答格式</h2>
            <div className={styles.enhancedBlock}>
              <pre className={styles.enhancedPre}>{toolkit.response_template}</pre>
            </div>
          </section>
        )}

        {/* Follow-up chain */}
        {followUpChain.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💬 追问链</h2>
            <p className={styles.sectionHint}>AI 会在回答后主动按以下顺序追问</p>
            <div className={styles.followUpList}>
              {followUpChain.map((q: string, i: number) => (
                <div key={i} className={styles.followUpItem}>
                  <span className={styles.followUpNum}>{i + 1}</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Example dialogue */}
        {toolkit.example_dialogue && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💡 示例对话</h2>
            <details className={styles.exampleDetails}>
              <summary className={styles.exampleSummary}>点击展开查看示例</summary>
              <pre className={styles.enhancedPre}>{toolkit.example_dialogue}</pre>
            </details>
          </section>
        )}

        {/* Disclaimer */}
        {toolkit.disclaimer && (
          <section className={styles.section}>
            <div className={styles.disclaimerBox}>
              <strong>⚠️ 重要提醒</strong>
              <p>{toolkit.disclaimer}</p>
            </div>
          </section>
        )}

        {/* Port connectors */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔌 权威数据端口</h2>
          <PortConnectorList ports={ports} />
        </section>

        {/* Scenarios */}
        {scenarios.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📋 适用场景</h2>
            <ScenarioList scenarios={scenarios} />
          </section>
        )}

        {/* Stats bar */}
        <div className={styles.statsBar}>
          <span>📅 更新于 {(toolkit.updated || toolkit.created_at || '').slice(0, 10) || '—'}</span>
          <span>
            ✅ {verifiedCount}/{ports.length} 已验证端口
          </span>
          <span>🖥️ {uniquePlatforms} 个平台</span>
        </div>

        {/* Share */}
        <div className={styles.share}>
          <span className={styles.shareLabel}>分享：</span>
          <CopyButton
            text={`https://100kdo.ccwu.cc/toolkits/${toolkit.slug}`}
            label="📎 复制链接"
          />
        </div>
      </main>
    </>
  );
}
