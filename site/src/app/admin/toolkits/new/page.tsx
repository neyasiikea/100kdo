'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/app/admin/AuthContext';
import { API_BASE } from '@/lib/api';
import { getAllCategories } from '@/lib/categories';
import styles from '../../layout.module.css';

export default function AdminToolkitNewPage() {
  const { password } = useAdminAuth();
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', icon: '🗂️', category: 'digital', subcategory: '',
    description: '', keywords: '', prompt: '',
    scenarios: '[]', ports: '[]',
  });

  useEffect(() => { document.title = '新建工具包 | 100kdo'; }, []);

  const categories = getAllCategories();
  const selectedCat = categories.find(c => c.slug === form.category);
  const subcats = selectedCat?.children ?? [];

  const handleSave = async () => {
    if (!form.title || !form.prompt) { setMsg('标题和Prompt必填'); return; }
    setSaving(true);
    const res = await fetch(`${API_BASE}/api/admin/toolkits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
      body: JSON.stringify({
        title: form.title,
        icon: form.icon,
        category: form.category,
        subcategory: form.subcategory,
        description: form.description,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        prompt: form.prompt,
        scenarios: safeJson(form.scenarios),
        ports: safeJson(form.ports),
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setMsg(`创建成功！slug: ${d.slug}`);
      window.location.href = `/admin/toolkits/${encodeURIComponent(d.slug)}`;
    } else {
      setMsg('创建失败');
    }
    setSaving(false);
  };

  if (!password) return <LoginPrompt />;

  return (
    <div>
      <h1 className={styles.pageTitle}>➕ 新建工具包</h1>
      <ToolkitForm form={form} setForm={setForm} categories={categories} subcats={subcats}
        onCategoryChange={c => setForm({...form, category: c, subcategory: ''})} />
      <div className={styles.saveBar}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '💾 创建'}
        </button>
        <a href="/admin/toolkits" className={styles.btn}>取消</a>
        {msg && <span className={`${styles.msg} ${msg.includes('成功') ? styles.success : styles.error}`}>{msg}</span>}
      </div>
    </div>
  );
}

// ── Shared Components ──

function LoginPrompt() {
  return <div className={styles.login}><h1 className={styles.loginTitle}>🔐 管理员登录</h1></div>;
}

function safeJson(s: string): any[] {
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch { return []; }
}

function ToolkitForm({ form, setForm, categories, subcats, onCategoryChange }: {
  form: any; setForm: (f: any) => void; categories: any[]; subcats: any[];
  onCategoryChange: (cat: string) => void;
}) {
  return (
    <div className={styles.form}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className={styles.field}>
          <label className={styles.label}>标题 *</label>
          <input className={styles.input} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>图标</label>
          <input className={styles.input} value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="🗂️" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className={styles.field}>
          <label className={styles.label}>主领域 *</label>
          <select className={styles.select} value={form.category} onChange={e => onCategoryChange(e.target.value)}>
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
      </div>
      <div className={styles.field}>
        <label className={styles.label}>描述</label>
        <input className={styles.input} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>关键词（逗号分隔）</label>
        <input className={styles.input} value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} placeholder="育儿, 带娃, 发烧" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>专家 Prompt *</label>
        <textarea className={styles.textarea} value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>场景 (JSON)</label>
        <textarea className={styles.textarea} style={{ minHeight: 80 }} value={form.scenarios}
          onChange={e => setForm({...form, scenarios: e.target.value})}
          placeholder='[{"name":"场景名","icon":"🎯","ports":["port-id"]}]' />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>端口 (JSON)</label>
        <textarea className={styles.textarea} style={{ minHeight: 120 }} value={form.ports}
          onChange={e => setForm({...form, ports: e.target.value})}
          placeholder='[{"id":"xxx","name":"...","url":"...","type":"static-data","connector":"...","connectorUrl":"...","status":"verified","platforms":["deepseek"]}]' />
      </div>
    </div>
  );
}
