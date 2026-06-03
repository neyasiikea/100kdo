'use client';

import { useState, useEffect } from 'react';
import styles from './WeChatBanner.module.css';

export default function WeChatBanner() {
  const [isWeChat, setIsWeChat] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    if (ua.includes('MicroMessenger') || ua.includes('WeChat')) {
      setIsWeChat(true);
    }
  }, []);

  if (!isWeChat || dismissed) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.text}>
        ⚠️ 微信内浏览受限，点击右上角 <strong>···</strong> → <strong>在浏览器中打开</strong>
      </span>
      <button
        type="button"
        className={styles.close}
        onClick={() => setDismissed(true)}
      >
        ✕
      </button>
    </div>
  );
}
