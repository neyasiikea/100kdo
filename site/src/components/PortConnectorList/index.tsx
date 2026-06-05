import type { PortConnector } from '@/types';
import styles from './PortConnectorList.module.css';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  verified: { label: '✅已验证', className: 'statusVerified' },
  unverified: { label: '⚠️待验证', className: 'statusUnverified' },
  community: { label: '📦社区贡献', className: 'statusCommunity' },
};

const TYPE_LABELS: Record<string, string> = {
  'rest-api': 'REST API',
  'mcp-server': 'MCP Server',
  skill: 'Skill',
  'gpts-action': 'GPTs Action',
  'static-data': '静态数据',
  'web-scraping': '网页抓取',
};

interface PortConnectorListProps {
  ports: PortConnector[];
}

export default function PortConnectorList({ ports }: PortConnectorListProps) {
  if (ports.length === 0) return null;

  return (
    <div className={styles.list}>
      {ports.map((port) => {
        const status = STATUS_CONFIG[port.status] ?? {
          label: port.status,
          className: 'statusCommunity',
        };
        const hasRealSourceUrl = port.url && port.url.startsWith('http');
        return (
          <div key={port.id} className={styles.port}>
            <div className={styles.header}>
              <span className={`${styles.status} ${styles[status.className]}`}>
                {status.label}
              </span>
              <span className={styles.connectorName}>{port.name}</span>
            </div>
            {port.description && (
              <p className={styles.portDescription}>{port.description}</p>
            )}
            <div className={styles.body}>
              <span className={styles.sourceName}>
                {hasRealSourceUrl ? (
                  <a href={port.url} target="_blank" rel="noopener noreferrer">
                    {port.url}
                  </a>
                ) : (
                  port.url || '无链接'
                )}
              </span>
              <span className={styles.typeBadge}>
                {TYPE_LABELS[port.type] ?? port.type}
              </span>
            </div>
            <div className={styles.footer}>
              <span className={styles.platformList}>
                {(port.platforms ?? []).map((p) => (
                  <span key={p} className={styles.platformBadge}>
                    {p}
                  </span>
                ))}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
