import SearchBar from '@/components/SearchBar';
import SearchResults from './SearchResults';
import styles from './page.module.css';

export default function SearchPage() {
  return (
    <main className={styles.main}>
      <div className={styles.searchWrapper}>
        <SearchBar large />
      </div>
      <SearchResults />
    </main>
  );
}
