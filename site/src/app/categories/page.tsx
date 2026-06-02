'use client';

import { useState, useEffect, useMemo } from 'react';
import { pinyin } from 'pinyin-pro';
import ToolkitCard from '@/components/ToolkitCard';
import { API_BASE } from '@/lib/api';
import type { ToolkitMeta } from '@/types';
import styles from './page.module.css';

/** Get the first pinyin letter of a Chinese character, or first alphanumeric char */
function getFirstLetter(title: string): string {
  const first = title.charAt(0);
  if (!first) return '#';

  // English letter or digit
  if (/^[a-zA-Z0-9]$/.test(first)) return first.toUpperCase();

  // Chinese character — get pinyin first letter
  if (/^[一-鿿]$/.test(first)) {
    const py = pinyin(first, { pattern: 'first', toneType: 'none' });
    if (py && /^[a-zA-Z]$/.test(py)) return py.toUpperCase();
  }

  // Emoji or other — try second char
  if (title.length > 1) {
    const second = title.charAt(1);
    if (/^[a-zA-Z]$/.test(second)) return second.toUpperCase();
    if (/^[一-鿿]$/.test(second)) {
      const py = pinyin(second, { pattern: 'first', toneType: 'none' });
      if (py && /^[a-zA-Z]$/.test(py)) return py.toUpperCase();
    }
  }

  return '#';
}

/** Group toolkits by first letter */
function groupByLetter(toolkits: ToolkitMeta[]): Map<string, ToolkitMeta[]> {
  const groups = new Map<string, ToolkitMeta[]>();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  for (const tk of toolkits) {
    const letter = getFirstLetter(tk.title);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(tk);
  }

  // Sort groups by: 0-9, then A-Z, then #
  const sorted = new Map<string, ToolkitMeta[]>();
  for (const d of '0123456789'.split('')) {
    if (groups.has(d)) sorted.set(d, groups.get(d)!);
  }
  for (const l of letters) {
    if (groups.has(l)) sorted.set(l, groups.get(l)!);
  }
  if (groups.has('#')) sorted.set('#', groups.get('#')!);

  return sorted;
}

export default function AllToolkitsPage() {
  const [toolkits, setToolkits] = useState<ToolkitMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/toolkits`)
      .then((r) => r.json())
      .then((d) => setToolkits(d.toolkits ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = '全部工具包 | 100kdo';
  }, []);

  const groups = useMemo(() => groupByLetter(toolkits), [toolkits]);
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>全部工具包</h1>
      <p className={styles.subtitle}>共 {toolkits.length} 个工具包，持续策展中</p>

      {/* Alphabet index bar: 0-9 → A-Z → # */}
      <nav className={styles.alphaNav}>
        {'0123456789'.split('').map((d) =>
          groups.has(d) ? (
            <a key={`num-${d}`} href={`#letter-${d}`} className={styles.alphaLink}>{d}</a>
          ) : (
            <span key={`num-${d}`} className={styles.alphaDisabled}>{d}</span>
          )
        )}
        {allLetters.map((l) => (
          groups.has(l) ? (
            <a key={l} href={`#letter-${l}`} className={styles.alphaLink}>{l}</a>
          ) : (
            <span key={l} className={styles.alphaDisabled}>{l}</span>
          )
        ))}
        {groups.has('#') && (
          <a href="#letter-hash" className={styles.alphaLink}>#</a>
        )}
      </nav>

      {loading ? (
        <p className={styles.loading}>加载中...</p>
      ) : (
        [...groups.entries()].map(([letter, tks]) => (
          <section key={letter} id={`letter-${letter === '#' ? 'hash' : letter}`} className={styles.group}>
            <h2 className={styles.letterHeading}>{letter}</h2>
            <div className={styles.grid}>
              {tks.map((tk) => (
                <ToolkitCard key={tk.slug} toolkit={tk} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
