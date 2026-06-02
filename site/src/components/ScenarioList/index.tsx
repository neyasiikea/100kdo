import type { Scenario } from '@/types';
import styles from './ScenarioList.module.css';

interface ScenarioListProps {
  scenarios: Scenario[];
}

export default function ScenarioList({ scenarios }: ScenarioListProps) {
  const list = scenarios ?? [];
  if (list.length === 0) return null;

  return (
    <div className={styles.list}>
      {list.map((scenario) => (
        <span key={scenario.name} className={styles.pill}>
          <span className={styles.icon}>{scenario.icon}</span>
          <span className={styles.name}>{scenario.name}</span>
        </span>
      ))}
    </div>
  );
}
