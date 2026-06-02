'use client';

import { useState, FormEvent } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
}

export default function SearchBar({ initialQuery = '', large = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      window.location.href = `/search?q=${encodeURIComponent(trimmed)}`;
    }
  };

  return (
    <form
      className={`${styles.form} ${large ? styles.large : ''}`}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索你想解决的问题，例如：怎么处理孩子发烧..."
      />
      <button type="submit" className={styles.submit}>
        🔍 搜索
      </button>
    </form>
  );
}
