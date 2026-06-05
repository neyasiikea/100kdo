// src/mcpServer.ts — Model Context Protocol server for 100kdo Worker
// Streamable HTTP transport — single POST endpoint handles all JSON-RPC methods

import { findAllToolkits, findBySlug } from './db';
import { generateToolkit } from './generator';
import type { GeneratedToolkit } from './types';

interface JSONRPCRequest {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params?: any;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id?: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPServerInfo {
  name: string;
  version: string;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

const SERVER_INFO: MCPServerInfo = {
  name: '100kdo-toolkit-server',
  version: '0.1.2',
};

const TOOLS: MCPTool[] = [
  {
    name: 'search_toolkits',
    description:
      '搜索100kdo平台的AI专家工具包。输入任意问题关键词（如"孩子发烧"、"劳动纠纷"、"面试技巧"），返回匹配的工具包列表。每个工具包包含名称、描述、分类、关键词，方便AI判断是否适用于当前用户问题。',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词，如"育儿"、"法律维权"、"个税"',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_toolkit',
    description:
      '获取指定工具包的完整内容——包括专家Prompt文本、权威数据端口清单、适用场景。获取后，AI应严格遵守Prompt中的角色定义和回答规范来回复用户。',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: '工具包的URL标识，如"parenting"、"labor-rights"',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'generate_toolkit',
    description:
      '当现有工具包无法匹配用户需求时，调用此工具AI实时生成一个新的领域专家工具包。生成后自动存入数据库，下次可通过search_toolkits找到。',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '用户的具体问题，如"我被无故辞退怎么维权"',
        },
      },
      required: ['query'],
    },
  },
];

/** Simple keyword-based search (matches Worker utils.ts logic) */
function matchToolkits(query: string, toolkits: GeneratedToolkit[]): GeneratedToolkit[] {
  const q = query.toLowerCase();
  return toolkits
    .map((t) => {
      let score = 0;
      if (t.title.toLowerCase().includes(q)) score += 10;
      if (t.description.toLowerCase().includes(q)) score += 5;
      const kws = t.keywords || [];
      score += kws.filter((k) => String(k).toLowerCase().includes(q)).length * 8;
      score += kws.filter((k) => q.includes(String(k).toLowerCase())).length * 12;
      return { toolkit: t, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.toolkit)
    .slice(0, 10);
}

/** Generate toolkit content as AI-consumable text */
function formatToolkitForAI(t: GeneratedToolkit): string {
  const lines: string[] = [];
  lines.push(`## ${t.icon || '🗂️'} ${t.title}`);
  lines.push('');
  lines.push(t.description);
  lines.push('');
  lines.push(`分类: ${t.category}${t.subcategory ? ' > ' + t.subcategory : ''}`);
  if (t.keywords?.length) lines.push(`关键词: ${t.keywords.join('、')}`);

  if (t.prompt) {
    lines.push('');
    lines.push('### 专家Prompt');
    lines.push('');
    lines.push(t.prompt);
  }

  if (t.scenarios?.length) {
    lines.push('');
    lines.push('### 适用场景');
    for (const s of t.scenarios) {
      lines.push(`- ${s.icon || ''} ${s.name}`);
    }
  }

  if (t.ports?.length) {
    lines.push('');
    lines.push('### 权威数据端口');
    for (const p of t.ports) {
      lines.push(`- **${p.name}** (${p.type}) — ${p.url}${p.description ? ' | ' + p.description : ''}`);
    }
  }

  return lines.join('\n');
}

export async function handleMCPRequest(
  body: any,
  db: D1Database,
  deepseekApiKey: string,
  deepseekApiUrl?: string
): Promise<JSONRPCResponse> {
  if (!body || body.jsonrpc !== '2.0' || !body.method) {
    return {
      jsonrpc: '2.0',
      id: body?.id ?? null,
      error: { code: -32600, message: 'Invalid Request' },
    };
  }

  const req = body as JSONRPCRequest;

  // --- Initialize ---
  if (req.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      },
    };
  }

  // --- Notification (no response needed) ---
  if (req.method === 'notifications/initialized') {
    return { jsonrpc: '2.0', id: req.id, result: {} };
  }

  // --- List tools ---
  if (req.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: { tools: TOOLS },
    };
  }

  // --- Call tool ---
  if (req.method === 'tools/call') {
    const toolName = req.params?.name;
    const toolArgs = req.params?.arguments ?? {};

    try {
      // search_toolkits
      if (toolName === 'search_toolkits') {
        const query = toolArgs.query?.trim();
        if (!query) {
          return { jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: '请提供搜索关键词' }] } };
        }
        const all = await findAllToolkits(db);
        const matched = matchToolkits(query, all);
        if (!matched.length) {
          return { jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: `未找到与"${query}"匹配的工具包。建议调用 generate_toolkit 动态生成。` }] } };
        }
        const text = matched.map((t) => formatToolkitForAI(t)).join('\n\n---\n\n');
        return { jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text }] } };
      }

      // get_toolkit
      if (toolName === 'get_toolkit') {
        const slug = toolArgs.slug?.trim();
        if (!slug) {
          return { jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: '请提供工具包 slug' }] } };
        }
        const t = await findBySlug(db, slug);
        if (!t) {
          return { jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: `未找到 slug="${slug}" 的工具包` }] } };
        }
        return { jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: formatToolkitForAI(t) }] } };
      }

      // generate_toolkit
      if (toolName === 'generate_toolkit') {
        const query = toolArgs.query?.trim();
        if (!query) {
          return { jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: '请提供问题描述' }] } };
        }
        const t = await generateToolkit(query, db, deepseekApiKey, deepseekApiUrl);
        return { jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: formatToolkitForAI(t) }] } };
      }

      return {
        jsonrpc: '2.0', id: req.id,
        error: { code: -32601, message: `Unknown tool: ${toolName}` },
      };
    } catch (err: any) {
      return {
        jsonrpc: '2.0', id: req.id,
        error: { code: -32603, message: `Tool execution failed: ${err.message}` },
      };
    }
  }

  return {
    jsonrpc: '2.0', id: req.id,
    error: { code: -32601, message: `Unknown method: ${req.method}` },
  };
}
