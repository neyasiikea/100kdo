'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../AuthContext';
import { API_BASE } from '@/lib/api';
import styles from '../layout.module.css';

interface ToolkitItem {
  slug: string;
  title: string;
  icon: string;
  category: string;
  subcategory: string;
  source: string;
  usage_count: number;
  created_at: string;
}

export default function AdminToolkitsPage() {
  const { password, setPassword } = useAdminAuth();
  const [toolkits, setToolkits] = useState<ToolkitItem[]>([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<'time' | 'category' | 'usage'>('time');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success'|'error'>('success');

  useEffect(() => { document.title = '工具包管理 | 100kdo'; }, []);

  useEffect(() => {
    if (!password) return;
    fetch(`${API_BASE}/api/toolkits`)
      .then(r => r.json())
      .then(d => setToolkits(d.toolkits ?? []))
      .catch(() => {});
  }, [password]);

  const handleDelete = async (slug: string) => {
    if (!confirm(`确定删除 "${slug}"？此操作不可撤销。`)) return;
    const res = await fetch(`${API_BASE}/api/admin/toolkits/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${password}` },
    });
    if (res.ok) {
      setToolkits(prev => prev.filter(t => t.slug !== slug));
      setMsg('删除成功');
      setMsgType('success');
    } else {
      setMsg('删除失败');
      setMsgType('error');
    }
  };

  if (!password) {
    return (
      <div className={styles.login}>
        <h1 className={styles.loginTitle}>🔐 管理员登录</h1>
        <input type="password" className={styles.loginInput} placeholder="输入管理密码"
          onKeyDown={e => { if (e.key === 'Enter') setPassword((e.target as HTMLInputElement).value); }} />
        <button className={styles.loginBtn} onClick={() => {}}>登录</button>
      </div>
    );
  }

  const filtered = toolkits.filter(t =>
    !filter || t.title.toLowerCase().includes(filter.toLowerCase()) ||
    t.slug.toLowerCase().includes(filter.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(filter.toLowerCase())
  );

  // Sort client-side
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'category')
      return (a.category + (a.subcategory || '')).localeCompare(b.category + (b.subcategory || ''));
    if (sort === 'usage')
      return (b.usage_count ?? 0) - (a.usage_count ?? 0);
    // 'time': by created_at descending
    return (b.created_at || '').localeCompare(a.created_at || '');
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>📦 工具包管理 ({toolkits.length})</h1>
        <a href="/admin/toolkits/new" className={`${styles.btn} ${styles.btnPrimary}`}>+ 新建</a>
      </div>

      {msg && <p className={`${styles.msg} ${styles[msgType]}`}>{msg}</p>}

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="搜索标题/slug/分类..."
          value={filter} onChange={e => setFilter(e.target.value)} />
        <select className={styles.select} value={sort} onChange={e => setSort(e.target.value as any)} style={{ width: 140 }}>
          <option value="time">🕐 创建时间</option>
          <option value="category">📂 分类</option>
          <option value="usage">🔥 使用次数</option>
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>标题</th>
            <th>Slug</th>
            <th>分类</th>
            <th>来源</th>
            <th>使用</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(t => (
            <tr key={t.slug}>
              <td>{t.icon} {t.title}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{t.slug}</td>
              <td>{t.category}{t.subcategory ? ` › ${t.subcategory}` : ''}</td>
              <td>
                <span className={`${styles.sourceBadge} ${t.source === 'curated' ? styles.curated : styles.generated}`}>
                  {t.source === 'curated' ? '策展' : 'AI生成'}
                </span>
              </td>
              <td>{t.usage_count ?? 0}</td>
              <td className={styles.actions}>
                <a href={`/admin/toolkits/edit?slug=${encodeURIComponent(t.slug)}`} className={styles.btn}>✏️ 编辑</a>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(t.slug)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && <p style={{ color: 'var(--color-text-secondary)', padding: 20 }}>无匹配结果</p>}
    </div>
  );
}
