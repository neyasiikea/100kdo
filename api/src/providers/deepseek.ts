// src/providers/deepseek.ts — DeepSeek V4 Flash provider
// To swap models, implement the AIProvider interface and change the import in generator.ts

import type { AIProvider } from './types';

export class DeepSeekProvider implements AIProvider {
  name = 'deepseek-v4-flash';

  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl?: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl ?? 'https://api.deepseek.com/v1/chat/completions';
  }

  async generate(systemPrompt: string): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个精准的JSON格式输出助手。只返回要求的JSON，不添加任何额外文字或markdown代码块。' },
          { role: 'user', content: systemPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errBody}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('DeepSeek returned empty response');
    }

    return content;
  }
}
