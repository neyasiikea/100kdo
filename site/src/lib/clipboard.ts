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

  // Expert prompt
  lines.push(toolkit.prompt.trim());
  lines.push('');

  // Search guidance
  if (toolkit.search_guidance) {
    lines.push('---');
    lines.push('## 搜索指令');
    lines.push(toolkit.search_guidance.trim());
    lines.push('');
  }

  // Response template
  if (toolkit.response_template) {
    lines.push('---');
    lines.push('## 回答格式要求');
    lines.push(toolkit.response_template.trim());
    lines.push('');
  }

  // Follow-up chain
  if (toolkit.follow_up_chain?.length) {
    lines.push('---');
    lines.push('## 追问指引（在给出初步建议后，请按顺序主动追问用户）');
    for (const q of toolkit.follow_up_chain) {
      lines.push(`- ${q}`);
    }
    lines.push('');
  }

  // Example dialogue
  if (toolkit.example_dialogue) {
    lines.push('---');
    lines.push('## 示例对话');
    lines.push(toolkit.example_dialogue.trim());
    lines.push('');
  }

  // Disclaimer
  if (toolkit.disclaimer) {
    lines.push('---');
    lines.push('## 重要提醒');
    lines.push(toolkit.disclaimer.trim());
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push(`由 100kdo.ccwu.cc 提供`);
  lines.push(`工具包链接：https://100kdo.ccwu.cc/toolkits/${toolkit.slug}`);

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
        `${p.name}: ${p.url}\n  类型: ${PORT_TYPE_LABELS[p.type] ?? p.type} | 状态: ${statusLabel(p.status)}${p.description ? '\n  说明: ' + p.description : ''}`
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
