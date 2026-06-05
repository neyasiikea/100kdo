// src/providers/types.ts — AI provider interface for easy model swapping

import type { AIResponse } from '../types';
import AUTHORITY_SOURCES from '../data/authority-sources.json';

export interface AIProvider {
  name: string;
  generate(prompt: string): Promise<string>;
}

interface AuthoritySource {
  name: string;
  url: string;
  description: string;
  category: string;
  keywords: string[];
}

/** Match relevant authority sources from our verified library based on query keywords */
export function matchAuthoritySources(
  query: string,
  maxCount: number = 20
): AuthoritySource[] {
  const q = query.toLowerCase();
  const scored = (AUTHORITY_SOURCES as AuthoritySource[]).map((s) => {
    const hits = s.keywords.filter((kw) => q.includes(kw.toLowerCase())).length;
    // Also check if query contains category name (case-insensitive)
    const catHit = q.includes(s.category.toLowerCase()) ? 2 : 0;
    return { source: s, score: hits + catHit };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .map((s) => s.source);
}

/** Build the system prompt that instructs the AI to generate a toolkit */
export function buildToolkitGenerationPrompt(userQuery: string): string {
  const matchedSources = matchAuthoritySources(userQuery);

  // Build a sources reference block for the prompt
  let sourcesBlock = '';
  if (matchedSources.length > 0) {
    sourcesBlock =
      '\n## 唯一可用的权威数据来源（URL已人工验证，真实有效）\n\n' +
      '⚠️ 以下来源库中的所有来源都必须用在ports中。不要挑选，全部使用。\n' +
      '如果超过6个，选最相关的6个。不得少于2个。\n' +
      '🚫 输出不在以下列表中的端口将被自动删除。只能使用以下来源。\n\n' +
      matchedSources
        .map(
          (s, i) =>
            `${i + 1}. **${s.name}**\n   URL: ${s.url}\n   用途: ${s.description}`
        )
        .join('\n\n') +
      '\n\n---\n';
  } else {
    sourcesBlock =
      '\n## 关于权威数据来源\n\n' +
      '用户的问题未匹配到系统内置的权威来源库。请在ports中提供你100%确认真实存在的网站URL。无法确认的url请留空字符串""，不得编造。\n\n---\n';
  }

  return `你是一个工具包生成助手。用户提出了一个问题，你需要生成一个完整的AI工具包。

用户问题：${userQuery}
${sourcesBlock}

请严格按以下JSON格式返回（不要带markdown代码块标记）：

{
  "title": "工具包标题（10字以内，中文）",
  "category": "从下方分类列表中选择最匹配的主分类",
  "subcategory": "从下方分类列表中选则最匹配的子分类（可选）",
  "description": "工具包简介（30字以内），说明这个工具包能解决什么问题",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "prompt": "专家Prompt全文（详见下方要求）",
  "response_template": "回答格式模板（详见下方要求）",
  "follow_up_chain": ["追问1", "追问2", "追问3"],
  "disclaimer": "安全提醒/免责声明",
  "example_dialogue": "示例对话（详见下方要求）",
  "search_guidance": "联网搜索指导（详见下方要求）",
  "scenarios": [
    {
      "name": "场景名",
      "icon": "对应emoji",
      "ports": ["p01"]
    }
  ],
  "ports": [
    {
      "id": "p01",
      "name": "来源名称（直接复制来源库）",
      "url": "完整URL（直接复制来源库）",
      "type": "static-data",
      "description": "该来源能查到什么（直接复制来源库）",
      "status": "verified",
      "platforms": ["web"]
    }
  ]
}

═══════════════════════════════════════
零、category 和 subcategory 可选值
═══════════════════════════════════════
主分类（24个）及子分类：health(internal/chronic/pharmacy/fitness) / mental(emotion/sleep/counseling/stress) / parenting(baby-care/pregnancy/parent-comm/early-edu) / career(interview/workplace/freelancer/career-switch) / professional(arch-design/engineering/dev-coding/biz-prof) / ai(vibe-coding/ai-writing/ai-art/ai-tools) / legal(labor/consumer/marriage-law/traffic) / finance(insurance/tax/loan/invest) / education(study/exam/abroad/language) / digital(hardware/app-guide/smart-home/repair) / home(renovation/storage/appliance/daily-tips) / cooking(recipe/baking/nutrition/world-food) / travel(trip-plan/visa-flight/hotel/local) / shopping(compare/avoid-scam/secondhand/shopping-psych) / government(social-security/visa-passport/vehicle/policy) / relationships(marriage/social/communication/conflict) / pets(cat-care/dog-care/pet-health/exotic-pets) / entertainment(hobby-model/photography/music/outdoor) / beauty(skincare/makeup/fashion/cosmetic-med) / elderly(pension/senior-health/digital-lit/estate) / startup(company-reg/finance-tax/marketing/fundraising) / safety(first-aid/fraud/cyber/disaster) / life

选择示例：工伤认定流程 → legal/labor；二手房交易 → home/renovation；退烧药怎么选 → health/pharmacy；辞职谈赔偿 → career/workplace；出国留学 → education/abroad

═══════════════════════════════════════
一、prompt 字段（专家Prompt全文）
═══════════════════════════════════════

严格按照以下四段式结构撰写，至少800字：

**1. 角色定位：** 用1-2段定义专家的职业背景、核心能力边界。"你是一位[xxx]专家..."开头。

**2. 信息来源优先级：** 列出用户在AI中粘贴后应该查询的顺序。引用上面来源库中的具体URL："当涉及[场景A]时，访问 [URL] 查询...；当涉及[场景B]时，访问 [URL] 查询..."

**3. 回答风格：** 3-5条具体规则。例如：
- 分步骤列出流程，标注关键信息（去哪里/带什么/多久好）
- 区分不同场景给出针对性建议
- 提供线上/线下/可代办三种路径
- 给出费用参考和时间节��提醒

**4. 关键知识速查：** 根据领域列出用户最关心的核心数据点或阈值。例如法律类列出法条关键数字，金融类列出交易费用/税率，医疗类列出用药禁忌。

═══════════════════════════════════════
二、response_template 字段（回答格式模板）
═══════════════════════════════════════

给AI（消费者端）的回答格式指令，让AI按此结构回复用户。用markdown标题分层。参考格式：

\`\`\`
### 📌 核心要点
（1-2句话直接回答）

### 📋 步骤/分析
1. 第一步：...
2. 第二步：...
3. 第三步：...

### 📊 关键数据/材料
- 项目1
- 项目2

### ⚠️ 注意事项/常见误区
- 坑点1及避坑方法

### 🔗 官方渠道/参考来源
- 来源名 + 网址
\`\`\`

═══════════════════════════════════════
三、follow_up_chain 字段（追问链）
═══════════════════════════════════════

AI回答完初步问题后应主动向用户追问的3-5个问题。追问目的：收集更多细节，缩小建议范围。每个追问一句话，逐步细化。例如：
- "请问你在哪个城市？（不同地区政策不同）"
- "具体涉及什么车型/年份？（规定因车型而异）"

═══════════════════════════════════════
四、disclaimer 字段（安全提醒）
═══════════════════════════════════════

1-2句话说明此AI建议的局限性。格式参考："⚠️ 本建议基于公开信息整理，[领域]政策/行情可能随时变化。涉及[重大决策/健康/法律纠纷]，请咨询[对应专业人士]。"

═══════════════════════════════════════
五、example_dialogue 字段（示例对话）
═══════════════════════════════════════

2轮对话示例，展示用户如何提问、AI如何用此工具包的模式回答。格式：
\`\`\`
用户: "[一个典型的具体问题]"
AI: "[体现回答风格的回复]"

用户: "[追问]"
AI: "[进一步回复，体现追问链逻辑]"
\`\`\`

═══════════════════════════════════════
六、search_guidance 字段（联网搜索指导）
═══════════════════════════════════════

1-2句话说清楚AI在处理本领域问题时应该联网搜索什么内容。格式："请联网搜索最新的[XXX政策/行情/指南]以及[用户具体情况相关的最新信息]"

═══════════════════════════════════════
七、ports 字段（权威数据端口）
═══════════════════════════════════════
- id: p01, p02... 编号
- name: **直接复制来源库名称**
- url: **逐字符复制来源库URL，不准修改**
- type: 固定 "static-data"
- description: **直接复制来源库用途**
- status: 固定 "verified"
- platforms: 固定 ["web"]

端口数量：**必须使用所有匹配来源**（≤6个全用，>6个选最相关6个），**至少2个**。

═══════════════════════════════════════
八、scenarios 字段（使用场景）
═══════════════════════════════════════
3-5个具体使用场景，每个包含场景名、对应emoji、关联的端口ID列表。场景覆盖该领域的常见问题类型。

═══════════════════════════════════════
⚠️ 输出前自查清单：
1. prompt是否包含角色定位、信息来源、回答风格、关键知识四个部分？字数≥800？
2. response_template是否给出了结构化输出模板？
3. follow_up_chain是否问了3-5个渐进式追问？
4. disclaimer是否有安全提醒？
5. example_dialogue是否有2轮对话示例？
6. search_guidance是否说明了联网搜索方向？
7. ports数量和URL是否完全来自来源库？是否≥2个？
8. 所有字段已填写？没有任何字段留空？
═══════════════════════════════════════
所有内容使用中文`;
}
