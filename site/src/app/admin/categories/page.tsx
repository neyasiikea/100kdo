'use client';

import { useEffect } from 'react';
import { useAdminAuth } from '../AuthContext';
import { getAllCategories } from '@/lib/categories';
import styles from '../layout.module.css';

export default function AdminCategoriesPage() {
  const { password } = useAdminAuth();

  useEffect(() => {
    document.title = '分类管理 | 100kdo';
  }, []);

  if (!password) {
    return (
      <div className={styles.login}>
        <h1 className={styles.loginTitle}>🔐 管理员登录</h1>
      </div>
    );
  }

  const categories = getAllCategories();

  return (
    <div>
      <h1 className={styles.pageTitle}>📂 分类结构</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', marginBottom: 20 }}>
        当前分类在代码中定义。如需修改，编辑 <code>src/lib/categories.ts</code> 后重新部署。
      </p>

      {categories.map(cat => (
        <div key={cat.slug} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
            {cat.icon} {cat.name} <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, fontSize: '0.8125rem' }}>({cat.slug})</span>
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{cat.description}</p>
          {cat.children && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 8 }}>
              {cat.children.map(child => (
                <span key={child.slug} style={{
                  padding: '4px 10px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem'
                }}>
                  {child.icon} {child.name} <span style={{ color: 'var(--color-text-secondary)' }}>({child.slug})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
