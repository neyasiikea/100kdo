import Link from 'next/link';
import type { ToolkitMeta } from '@/types';
import styles from './ToolkitCard.module.css';

interface ToolkitCardProps {
  toolkit: ToolkitMeta;
}

export default function ToolkitCard({ toolkit }: ToolkitCardProps) {
  return (
    <Link href={`/toolkits/${toolkit.slug}`} className={styles.card}>
      <span className={styles.icon}>{toolkit.icon}</span>
      <h3 className={styles.title}>{toolkit.title}</h3>
      <p className={styles.description}>{toolkit.description}</p>
      <div className={styles.meta}>
        <span className={styles.stat}>
          ✅ {toolkit.verifiedPortCount}/{toolkit.portCount} 已验证端口
        </span>
        <span className={styles.date}>更新于 {toolkit.updated}</span>
      </div>
    </Link>
  );
}
