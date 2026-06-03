'use client';

import { useState, useEffect } from 'react';
import { AdminAuthProvider } from './AuthContext';
import styles from './layout.module.css';

function getCurrentPath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState('');

  useEffect(() => {
    setPath(getCurrentPath());
  }, []);

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <a href="/admin" className={styles.logo}>⚙️ 管理后台</a>
        <nav className={styles.nav}>
          <a href="/admin/toolkits" className={`${styles.navLink} ${path.startsWith('/admin/toolkits') ? styles.active : ''}`}>📦 工具包</a>
          <a href="/admin/categories" className={`${styles.navLink} ${path.startsWith('/admin/categories') ? styles.active : ''}`}>📂 分类</a>
        </nav>
        <a href="/" className={styles.backLink}>← 返回网站</a>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
