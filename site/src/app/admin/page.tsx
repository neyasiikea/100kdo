'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/app/admin/AuthContext';
import { API_BASE } from '@/lib/api';
import styles from './layout.module.css';

export default function AdminHomePage() {
  const { password } = useAdminAuth();
  const [stats, setStats] = useState<any>(null);
  const [loginPwd, setLoginPwd] = useState('');
  const { setPassword } = useAdminAuth();

  useEffect(() => {
    document.title = '管理后台 | 100kdo';
  }, []);

  useEffect(() => {
    if (!password) return;
    fetch(`${API_BASE}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${password}` },
    })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [password]);

  if (!password) {
    return (
      <div className={styles.login}>
        <h1 className={styles.loginTitle}>🔐 管理员登录</h1>
        <input
          type="password"
          className={styles.loginInput}
          placeholder="输入管理密码"
          value={loginPwd}
          onChange={e => setLoginPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setPassword(loginPwd)}
        />
        <button className={styles.loginBtn} onClick={() => setPassword(loginPwd)}>
          登录
        </button>
      </div>
    );
  }

  if (!stats) return <p className={styles.msg}>加载中...</p>;

  return (
    <div>
      <h1 className={styles.pageTitle}>📊 仪表盘</h1>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>总工具包</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.curated}</div>
          <div className={styles.statLabel}>官方策展</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.generated}</div>
          <div className={styles.statLabel}>AI 生成</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>分类分布</h2>
      {stats.byCategory && (
        <div className={styles.catGrid}>
          {Object.entries(stats.byCategory as Record<string, number>)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => (
              <div key={cat} className={styles.catItem}>
                <span className={styles.catName}>{cat}</span>
                <span className={styles.catCount}>{count as number}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
