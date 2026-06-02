import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.accent}>100k</span>do
        </Link>
        <nav className={styles.nav}>
          <Link href="/about" className={styles.navLink}>
            关于
          </Link>
        </nav>
      </div>
    </header>
  );
}
