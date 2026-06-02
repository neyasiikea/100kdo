import type { Scenario } from '@/types';
import styles from './ScenarioList.module.css';

interface ScenarioListProps {
  scenarios: Scenario[];
}

export default function ScenarioList({ scenarios }: ScenarioListProps) {
  if (scenarios.length === 0) return null;

  return (
    <div className={styles.list}>
      {scenarios.map((scenario) => (
        <span key={scenario.name} className={styles.pill}>
          <span className={styles.icon}>{scenario.icon}</span>
          <span className={styles.name}>{scenario.name}</span>
        </span>
      ))}
    </div>
  );
}
