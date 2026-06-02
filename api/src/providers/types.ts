// src/providers/types.ts — AI provider interface for easy model swapping

import type { AIResponse } from '../types';

export interface AIProvider {
  name: string;
  generate(prompt: string): Promise<string>;
}

/** Build the system prompt that instructs the AI to generate a toolkit */
export function buildToolkitGenerationPrompt(userQuery: string): string {
  return `你是一个工具包生成助手。用户提出了一个问题，你需要生成一个完整的AI工具包。

用户问题：${userQuery}

请严格按以下JSON格式返回（不要带markdown代码块标记）：

{
  "title": "工具包标题（10字以内，中文）",
  "description": "工具包简介（30字以内），说明这个工具包能解决什么问题",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "prompt": "这里是专家Prompt的完整内容。需要包含：1.角色定义（你是一位xxx专家）；2.信息来源优先级（当涉及xxx时查询xxx数据库）；3.回答风格要求。",
  "scenarios": [
    {
      "name": "场景名",
      "icon": "对应emoji",
      "ports": ["关联端口ID"]
    }
  ],
  "ports": [
    {
      "id": "端口ID",
      "name": "权威信息源名称",
      "url": "信息源网址",
      "type": "端口类型（rest-api | mcp-server | skill | gpts-action | static-data | web-scraping）",
      "connector": "连接器名称",
      "connectorUrl": "连接器网址或说明",
      "status": "verified | unverified | community",
      "platforms": ["适用平台"]
    }
  ]
}

端口质量要求（极其重要）：
- 每个端口必须指向不同的真实权威信息源，禁止多个端口使用相同的URL或connector名称
- connector名称必须独特且有辨识度（如"china-judgments-mcp"而非"WebScraper"）
- connectorUrl填写真实的官方网站地址或GitHub仓库链接，不得编造或全部相同
- 每个端口的name必须是真实存在的数据库/机构/网站名称
- 至少1个端口type为static-data（指向政府/国际组织的公开静态资料）
- 多个端口间type应该多样化（不要全是web-scraping）
- platforms数组至少包含1-2个平台（如deepseek/kimi/chatgpt/doubao等），不要只填"web"
- status分布：已验证的公开数据库填verified，第三方搜集填community，仅口头提及无链接的填unverified

其他要求：
- prompt要详细、专业，至少300字，包含实用的操作指引
- 提供3-5个场景
- 提供3-6个端口
- 所有内容使用中文`;
}
