'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/app/admin/AuthContext';
import { API_BASE } from '@/lib/api';
import { getAllCategories } from '@/lib/categories';
import styles from '../../layout.module.css';

function safeJson(s: string): any[] {
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch { return []; }
}

export default function AdminToolkitEditPage() {
  const { password } = useAdminAuth();
  const [slug, setSlug] = useState('');
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    document.title = '编辑工具包 | 100kdo';
    const params = new URLSearchParams(window.location.search);
    const s = params.get('slug') ?? '';
    setSlug(decodeURIComponent(s));
  }, []);

  useEffect(() => {
    if (!slug || !password) return;
    fetch(`${API_BASE}/api/toolkits/${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => {
        const t = d.toolkit;
        if (t) {
          setForm({
            title: t.title || '', icon: t.icon || '🗂️',
            category: t.category || 'digital', subcategory: t.subcategory || '',
            description: t.description || '',
            keywords: (t.keywords || []).join(', '),
            prompt: t.prompt || '',
            scenarios: JSON.stringify(t.scenarios || [], null, 2),
            ports: JSON.stringify(t.ports || [], null, 2),
            source: t.source || 'curated',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, password]);

  const categories = getAllCategories();
  const selectedCat = categories.find(c => c.slug === form?.category);
  const subcats = selectedCat?.children ?? [];

  const handleSave = async () => {
    if (!form) return;
    setMsg('保存中...');
    try {
      const res = await fetch(`${API_BASE}/api/admin/toolkits/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({
        title: form.title, icon: form.icon, category: form.category,
        subcategory: form.subcategory, description: form.description,
        keywords: form.keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
        prompt: form.prompt, scenarios: safeJson(form.scenarios),
        ports: safeJson(form.ports), source: form.source,
      }),
    });
      setMsg(res.ok ? '✅ 保存成功' : `❌ 保存失败 (${res.status})`);
    } catch (e: any) {
      setMsg(`❌ 网络错误: ${e.message}`);
    }
  };

  if (!password) return <div className={styles.login}><h1 className={styles.loginTitle}>🔐 管理员登录</h1></div>;
  if (loading) return <p className={styles.msg}>加载中...</p>;
  if (!form) return <p className={styles.msg}>工具包未找到</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>✏️ 编辑：{form.title}</h1>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Slug: <code>{slug}</code></span>
      </div>

      <div className={styles.form}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className={styles.field}>
            <label className={styles.label}>标题</label>
            <input className={styles.input} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>图标</label>
            <input className={styles.input} value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className={styles.field}>
            <label className={styles.label}>主领域</label>
            <select className={styles.select} value={form.category} onChange={e => setForm({...form, category: e.target.value, subcategory: ''})}>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>子领域</label>
            <select className={styles.select} value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})}>
              <option value="">无</option>
              {subcats.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>来源</label>
            <select className={styles.select} value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
              <option value="curated">策展</option>
              <option value="generated">AI 生成</option>
            </select>
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>描述</label>
          <input className={styles.input} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>关键词（逗号分隔）</label>
          <input className={styles.input} value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>专家 Prompt</label>
          <textarea className={styles.textarea} value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>场景 (JSON)</label>
          <textarea className={styles.textarea} style={{ minHeight: 80 }} value={form.scenarios} onChange={e => setForm({...form, scenarios: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>端口 (JSON)</label>
          <textarea className={styles.textarea} style={{ minHeight: 120 }} value={form.ports} onChange={e => setForm({...form, ports: e.target.value})} />
        </div>
      </div>

      <div className={styles.saveBar}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>💾 保存</button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={async () => {
          if (!confirm(`确定删除 "${form.title}"？`)) return;
          await fetch(`${API_BASE}/api/admin/toolkits/${encodeURIComponent(slug)}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${password}` },
          });
          window.location.href = '/admin/toolkits';
        }}>🗑️ 删除</button>
        <a href="/admin/toolkits" className={styles.btn}>取消</a>
        {msg && <span className={`${styles.msg} ${msg.includes('✅') ? styles.success : styles.error}`}>{msg}</span>}
      </div>
    </div>
  );
}
