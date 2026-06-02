'use client';

import { useState } from 'react';
import CopyButton from '@/components/CopyButton';
import PlatformButtons from '@/components/PlatformButtons';
import ScenarioList from '@/components/ScenarioList';
import type { PortConnector, Scenario } from '@/types';
import styles from './AIGeneratedToolkit.module.css';

interface AIGeneratedToolkitProps {
  toolkit: {
    slug: string;
    title: string;
    icon: string;
    description: string;
    keywords: string[];
    prompt: string;
    scenarios: Scenario[];
    ports: PortConnector[];
  };
}

const PORT_TYPE_LABELS: Record<string, string> = {
  'rest-api': 'REST API',
  'mcp-server': 'MCP Server',
  skill: 'Skill文件',
  'gpts-action': 'GPTs Action',
  'static-data': '静态数据',
  'web-scraping': '网页抓取',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  verified: { label: '✅已验证', className: 'statusVerified' },
  unverified: { label: '⚠️待验证', className: 'statusUnverified' },
  community: { label: '📦社区贡献', className: 'statusCommunity' },
};

function generateClipboardText(
  toolkit: AIGeneratedToolkitProps['toolkit']
): string {
  const lines: string[] = [];

  // Header
  lines.push(`【${toolkit.icon} ${toolkit.title}】`);
  lines.push('');

  // Expert prompt
  lines.push(toolkit.prompt.trim());
  lines.push('');

  // Port connectors reference
  if (toolkit.ports.length > 0) {
    lines.push('---');
    lines.push('可使用的权威数据源：');
    for (const port of toolkit.ports) {
      lines.push(
        `- ${port.connector}：${port.name} (${PORT_TYPE_LABELS[port.type] ?? port.type})`
      );
    }
    lines.push('');
  }

  // Scenarios
  if (toolkit.scenarios.length > 0) {
    lines.push('---');
    lines.push('常见场景处理流程：');
    for (const s of toolkit.scenarios) {
      lines.push(`${s.icon} ${s.name}`);
    }
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push('由 AI 生成 · 100kdo.ccwu.cc · 仅供参考');

  return lines.join('\n');
}

export default function AIGeneratedToolkit({
  toolkit,
}: AIGeneratedToolkitProps) {
  const [promptExpanded, setPromptExpanded] = useState(false);

  return (
    <div className={styles.container}>
      {/* AI Badge */}
      <div className={styles.badge}>🤖 AI 生成 · 仅供参考</div>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.icon}>{toolkit.icon}</span>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>{toolkit.title}</h3>
          <p className={styles.description}>{toolkit.description}</p>
        </div>
      </div>

      {/* Keywords */}
      {Array.isArray(toolkit.keywords) && toolkit.keywords.length > 0 && (
        <div className={styles.keywords}>
          {(toolkit.keywords).map((kw) => (
            <span key={kw} className={styles.keyword}>
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Delivery — Copy + Platform buttons */}
      <div className={styles.delivery}>
        <CopyButton
          text={generateClipboardText(toolkit)}
          label="📋 复制完整工具包"
        />
        <p className={styles.deliveryHint}>复制后粘贴到任意 AI 对话中即可使用</p>
        <PlatformButtons promptText={toolkit.prompt} />
      </div>

      {/* Prompt Preview */}
      <div className={styles.promptSection}>
        <div className={styles.promptHeader}>
          <span className={styles.promptTitle}>📋 专家Prompt</span>
          <div className={styles.promptActions}>
            <CopyButton
              text={generateClipboardText(toolkit)}
              label="复制完整内容"
            />
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setPromptExpanded(!promptExpanded)}
            >
              {promptExpanded ? '收起 ▲' : '展开 ▼'}
            </button>
          </div>
        </div>
        <pre
          className={styles.prompt}
          style={{ maxHeight: promptExpanded ? 2000 : 200 }}
        >
          <code>{toolkit.prompt}</code>
        </pre>
      </div>

      {/* Ports */}
      {toolkit.ports.length > 0 && (
        <>
          <p className={styles.sectionTitle}>
            🔌 权威数据源 ({toolkit.ports.length})
          </p>
          <div className={styles.portList}>
            {toolkit.ports.map((port) => {
              const status =
                STATUS_CONFIG[port.status] ?? STATUS_CONFIG.community;
              return (
                <div key={port.id} className={styles.port}>
                  <div className={styles.portHeader}>
                    <span
                      className={`${styles.portStatus} ${styles[status.className]}`}
                    >
                      {status.label}
                    </span>
                    <span className={styles.portConnector}>
                      {port.connector}
                    </span>
                  </div>
                  <div className={styles.portBody}>
                    <span className={styles.portName}>{port.name}</span>
                    <span className={styles.portType}>
                      {PORT_TYPE_LABELS[port.type] ?? port.type}
                    </span>
                  </div>
                  <div className={styles.portFooter}>
                    {port.platforms.map((p) => (
                      <span key={p} className={styles.portPlatform}>
                        {p}
                      </span>
                    ))}
                    <a
                      href={port.connectorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.portUrl}
                    >
                      {port.connectorUrl}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Scenarios */}
      {toolkit.scenarios.length > 0 && (
        <>
          <p className={styles.sectionTitle}>🎯 使用场景</p>
          <div className={styles.scenarios}>
            <ScenarioList scenarios={toolkit.scenarios} />
          </div>
        </>
      )}
    </div>
  );
}
