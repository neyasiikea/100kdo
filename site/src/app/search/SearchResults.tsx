'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ToolkitMeta, PortConnector, Scenario } from '@/types';
import ToolkitCard from '@/components/ToolkitCard';
import AIGeneratedToolkit from '@/components/AIGeneratedToolkit/AIGeneratedToolkit';
import { API_BASE } from '@/lib/api';
import styles from './page.module.css';

function safeLower(v: unknown): string {
  return String(v ?? '').toLowerCase();
}

function searchToolkits(query: string, toolkits: ToolkitMeta[]): ToolkitMeta[] {
  const q = query.toLowerCase().trim();
  if (!q) return toolkits;
  return toolkits
    .map((tk) => {
      let score = 0;
      if (safeLower(tk.title).includes(q)) score += 10;
      if (safeLower(tk.title) === q) score += 20;
      if (safeLower(tk.description).includes(q)) score += 5;
      const kwMatches = (tk.keywords ?? []).filter((kw) => safeLower(kw).includes(q)).length;
      score += kwMatches * 8;
      if (safeLower(tk.category).includes(q)) score += 3;
      if (tk.subcategory && safeLower(tk.subcategory).includes(q)) score += 3;
      return { toolkit: tk, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.toolkit);
}

interface SearchResultsProps {
  allToolkits?: ToolkitMeta[];
}

interface AIToolkit {
  slug: string;
  title: string;
  icon: string;
  description: string;
  keywords: string[];
  prompt: string;
  scenarios: Scenario[];
  ports: PortConnector[];
}

function getQueryFromURL(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('q') ?? '';
}

export default function SearchResults({ allToolkits: initialToolkits }: SearchResultsProps) {
  const [allToolkits, setAllToolkits] = useState<ToolkitMeta[]>(initialToolkits ?? []);
  const [query, setQuery] = useState('');

  // Fetch toolkits from Worker API if not provided as prop
  useEffect(() => {
    if (!initialToolkits || initialToolkits.length === 0) {
      fetch(`${API_BASE}/api/toolkits`)
        .then((r) => r.json())
        .then((d) => setAllToolkits(d.toolkits ?? []))
        .catch(() => {
          // Silently fail — API may be unavailable
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setQuery(getQueryFromURL());
  }, []);

  const results = useMemo(
    () => searchToolkits(query, allToolkits),
    [query, allToolkits]
  );

  const [generating, setGenerating] = useState(false);
  const [generatedToolkit, setGeneratedToolkit] = useState<AIToolkit | null>(null);
  const [generateError, setGenerateError] = useState('');

  async function handleGenerate() {
    if (!query.trim()) return;
    setGenerating(true);
    setGenerateError('');
    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedToolkit(data.toolkit);
      } else {
        setGenerateError(data.error ?? '生成失败，请稍后重试');
      }
    } catch {
      setGenerateError('网络请求失败，请检查网络连接后重试');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className={styles.results}>
      {/* Results info */}
      {query ? (
        <p className={styles.resultCount}>
          搜索 &quot;{query}&quot; — 找到 {results.length} 个工具包
        </p>
      ) : (
        <p className={styles.prompt}>输入关键词搜索你需要的专家工具包</p>
      )}

      {/* AI Generated Toolkit */}
      {generatedToolkit && (
        <AIGeneratedToolkit toolkit={generatedToolkit} />
      )}

      {/* No results */}
      {query && results.length === 0 && !generatedToolkit && (
        <div className={styles.noResults}>
          <p className={styles.noResultsTitle}>没有找到匹配的工具包</p>
          <p className={styles.noResultsHint}>
            试试这些关键词：
          </p>
          <div className={styles.suggestions}>
            {['育儿', '面试', '法律', '保险', '装修'].map((word) => (
              <a
                key={word}
                href={`/search?q=${encodeURIComponent(word)}`}
                className={styles.suggestionPill}
              >
                {word}
              </a>
            ))}
          </div>

          {/* AI Generation prompt */}
          <div className={styles.aiSection}>
            <p className={styles.aiHint}>或者让 AI 为你生成一个工具包</p>
            <button
              type="button"
              className={styles.generateButton}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <span className={styles.generatingLabel}>
                  <span className={styles.spinner} />
                  生成中...
                </span>
              ) : (
                '🤖 AI 为你生成'
              )}
            </button>
            {generateError && (
              <p className={styles.generateError}>{generateError}</p>
            )}
          </div>
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className={styles.grid}>
          {results.map((tk) => (
            <ToolkitCard key={tk.slug} toolkit={tk} />
          ))}
        </div>
      )}
    </div>
  );
}
