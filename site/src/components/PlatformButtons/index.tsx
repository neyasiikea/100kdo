'use client';

import { useCallback } from 'react';
import { getAllPlatforms } from '@/lib/platforms';
import type { PlatformConfig } from '@/types';
import styles from './PlatformButtons.module.css';

interface PlatformButtonsProps {
  promptText: string;
}

export default function PlatformButtons({ promptText }: PlatformButtonsProps) {
  const platforms = getAllPlatforms();
  const consumerPlatforms = platforms.filter((p) => p.level === 'consumer');
  const agentPlatforms = platforms.filter((p) => p.level === 'agent');

  const handleClick = useCallback(
    (platform: PlatformConfig) => {
      // 1. Open platform first (sync — avoids popup blocker)
      window.open(platform.webUrl, '_blank', 'noopener,noreferrer');

      // 2. Copy prompt to clipboard (async, can lag behind)
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(promptText);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = promptText;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
      } catch {
        // Clipboard failure is non-critical
      }
    },
    [promptText]
  );

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>💬 AI 对话平台</h3>
        <p className={styles.sectionHint}>点击复制提示词并打开对应平台，在输入框中粘贴即可</p>
        <div className={styles.grid}>
          {consumerPlatforms.map((platform) => (
            <button
              key={platform.slug}
              type="button"
              className={styles.platformButton}
              onClick={() => handleClick(platform)}
            >
              <img src={platform.icon} alt="" className={styles.icon} />
              <span className={styles.name}>{platform.name}</span>
              <span className={styles.hint}>复制+打开</span>
            </button>
          ))}
        </div>
      </div>
      {agentPlatforms.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🤖 Agent 平台</h3>
          <p className={styles.sectionHint}>复制提示词后，在对应平台的输入框中粘贴使用</p>
          <div className={styles.grid}>
            {agentPlatforms.map((platform) => (
              <button
                key={platform.slug}
                type="button"
                className={styles.platformButton}
                onClick={() => handleClick(platform)}
              >
                <img src={platform.icon} alt="" className={styles.icon} />
                <span className={styles.name}>{platform.name}</span>
                <span className={styles.hint}>复制+打开</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
