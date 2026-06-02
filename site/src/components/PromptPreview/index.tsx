'use client';

import { useState } from 'react';
import CopyButton from '@/components/CopyButton';
import styles from './PromptPreview.module.css';

interface PromptPreviewProps {
  prompt: string;
}

export default function PromptPreview({ prompt }: PromptPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`${styles.container} ${expanded ? styles.expanded : ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>📋 专家Prompt</span>
        <div className={styles.actions}>
          <CopyButton text={prompt} label="复制" />
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '收起 ▲' : '展开 ▼'}
          </button>
        </div>
      </div>
      <pre
        className={styles.prompt}
        style={{ maxHeight: expanded ? 2000 : 300 }}
      >
        <code>{prompt}</code>
      </pre>
    </div>
  );
}
