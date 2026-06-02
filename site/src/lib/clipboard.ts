// src/lib/clipboard.ts
import type { Toolkit, PortConnector } from '@/types';

const PORT_TYPE_LABELS: Record<string, string> = {
  'rest-api': 'REST API',
  'mcp-server': 'MCP Server',
  skill: 'Skill文件',
  'gpts-action': 'GPTs Action',
  'static-data': '静态数据',
  'web-scraping': '网页抓取',
};

/** Generate the full clipboard text that users paste into AI */
export function generateClipboardText(toolkit: Toolkit): string {
  const lines: string[] = [];

  // Header
  lines.push(`【${toolkit.icon} ${toolkit.title}】`);
  lines.push('');

  // Expert prompt (L2)
  lines.push(toolkit.prompt.trim());
  lines.push('');

  // Port connectors reference (L3)
  const safePorts = toolkit.ports ?? [];
  if (safePorts.length > 0) {
    lines.push('---');
    lines.push('可使用的权威数据源（如已配置对应连接器）：');
    for (const port of safePorts) {
      lines.push(
        `- ${port.connector}：${port.name} (${PORT_TYPE_LABELS[port.type] ?? port.type})`
      );
    }
    lines.push('');
  }

  // Scenarios (L1)
  const safeScenarios = toolkit.scenarios ?? [];
  if (safeScenarios.length > 0) {
    lines.push('---');
    lines.push('常见场景处理流程：');
    for (const scenario of toolkit.scenarios) {
      lines.push(`${scenario.icon} ${scenario.name}`);
    }
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push(`工具包来源：100kdo.ccwu.cc/toolkits/${toolkit.slug}`);
  lines.push(`更新日期：${toolkit.updated}`);

  return lines.join('\n');
}

/** Generate prompt-only text */
export function generatePromptOnlyText(toolkit: Toolkit): string {
  return toolkit.prompt.trim();
}

/** Generate port-only reference text */
export function generatePortReferenceText(ports: PortConnector[]): string {
  return ports
    .map(
      (p) =>
        `${p.connector}: ${p.name}\n  类型: ${PORT_TYPE_LABELS[p.type] ?? p.type} | 状态: ${statusLabel(p.status)}\n  连接器: ${p.connectorUrl}\n  信息源: ${p.url}`
    )
    .join('\n\n');
}

function statusLabel(status: string): string {
  switch (status) {
    case 'verified': return '✅已验证';
    case 'unverified': return '⚠️待验证';
    case 'community': return '📦社区贡献';
    default: return status;
  }
}
