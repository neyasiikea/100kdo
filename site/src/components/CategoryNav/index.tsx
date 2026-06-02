import Link from 'next/link';
import { getAllCategories } from '@/lib/categories';
import styles from './CategoryNav.module.css';

export default function CategoryNav() {
  const categories = getAllCategories();

  return (
    <div className={styles.grid}>
      {categories.map((cat) => (
        <Link key={cat.slug} href={`/categories/${cat.slug}`} className={styles.card}>
          <span className={styles.icon}>{cat.icon}</span>
          <div className={styles.content}>
            <h3 className={styles.name}>{cat.name}</h3>
            <p className={styles.description}>{cat.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
