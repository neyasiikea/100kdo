// src/lib/platforms.ts
import type { PlatformConfig } from '@/types';

const PLATFORMS: PlatformConfig[] = [
  {
    slug: 'doubao',
    name: '豆包',
    icon: '/platforms/doubao.svg',
    webUrl: 'https://www.doubao.com/chat/',
    isApp: true,
    level: 'consumer',
  },
  {
    slug: 'deepseek',
    name: 'DeepSeek',
    icon: '/platforms/deepseek.svg',
    webUrl: 'https://chat.deepseek.com/',
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'kimi',
    name: 'Kimi',
    icon: '/platforms/kimi.svg',
    webUrl: 'https://kimi.moonshot.cn/',
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    icon: '/platforms/chatgpt.svg',
    webUrl: 'https://chat.openai.com/',
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'gemini',
    name: 'Gemini',
    icon: '/platforms/gemini.svg',
    webUrl: 'https://gemini.google.com/',
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'tongyi',
    name: '通义千问',
    icon: '/platforms/tongyi.svg',
    webUrl: 'https://tongyi.aliyun.com/qianwen/',
    isApp: false,
    level: 'consumer',
  },
  {
    slug: 'cherry-studio',
    name: 'Cherry Studio',
    icon: '/platforms/cherry-studio.svg',
    webUrl: 'https://cherrystudio.app/',
    isApp: false,
    level: 'agent',
  },
  {
    slug: 'lobechat',
    name: 'LobeChat',
    icon: '/platforms/lobechat.svg',
    webUrl: 'https://lobechat.com/',
    isApp: false,
    level: 'agent',
  },
  {
    slug: 'open-webui',
    name: 'Open WebUI',
    icon: '/platforms/open-webui.svg',
    webUrl: 'https://openwebui.com/',
    isApp: false,
    level: 'agent',
  },
];

export function getAllPlatforms(): PlatformConfig[] {
  return PLATFORMS;
}

export function getPlatformBySlug(slug: string): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.slug === slug);
}

export function getConsumerPlatforms(): PlatformConfig[] {
  return PLATFORMS.filter((p) => p.level === 'consumer');
}

export function getAgentPlatforms(): PlatformConfig[] {
  return PLATFORMS.filter((p) => p.level === 'agent');
}
