// src/lib/categories.ts
import type { Category } from '@/types';

const CATEGORIES: Category[] = [
  {
    slug: 'health', name: '健康医疗', icon: '🏥',
    description: '症状自查、体检解读、慢病管理、用药指导、运动健身',
    children: [
      { slug: 'internal', name: '内科常见病', icon: '🩺', description: '感冒发烧、消化系统、心血管、呼吸系统' },
      { slug: 'chronic', name: '慢病管理', icon: '💊', description: '高血压、糖尿病、痛风、冠心病等日常管理' },
      { slug: 'pharmacy', name: '用药安全', icon: '💉', description: '处方解读、药物相互作用、服药禁忌' },
      { slug: 'fitness', name: '运动健身', icon: '💪', description: '减肥增肌、跑步瑜伽、拉伸、私教' },
    ],
  },
  {
    slug: 'mental', name: '心理健康', icon: '🧠',
    description: '情绪管理、焦虑抑郁、睡眠问题、咨询治疗',
    children: [
      { slug: 'emotion', name: '情绪管理', icon: '🌈', description: '焦虑、抑郁、恐惧、强迫、PTSD的识别与应对' },
      { slug: 'sleep', name: '睡眠改善', icon: '😴', description: '失眠、早醒、睡眠呼吸暂停、作息调整' },
      { slug: 'counseling', name: '心理咨询', icon: '💬', description: '如何找心理咨询师、疗法选择、费用、效果预期' },
      { slug: 'stress', name: '压力疏导', icon: '🧘', description: '职场压力、学业压力、正念冥想、放松技巧' },
    ],
  },
  {
    slug: 'parenting', name: '育儿家庭', icon: '👶',
    description: '喂养发育、早教启蒙、亲子关系、孕产月子',
    children: [
      { slug: 'baby-care', name: '婴幼儿护理', icon: '🍼', description: '喂养、睡眠、辅食、疫苗、生长发育' },
      { slug: 'pregnancy', name: '孕产月子', icon: '🤰', description: '备孕、产检、分娩、产后恢复、月嫂' },
      { slug: 'parent-comm', name: '亲子沟通', icon: '👨‍👩‍👧', description: '青春期、叛逆、早恋、代沟、家庭教育' },
      { slug: 'early-edu', name: '早教启蒙', icon: '🧩', description: '绘本阅读、感统训练、专注力、学龄前准备' },
    ],
  },
  {
    slug: 'career', name: '职业发展', icon: '💼',
    description: '求职面试、职场技能、薪资谈判、自由职业',
    children: [
      { slug: 'interview', name: '求职面试', icon: '🎯', description: '简历优化、模拟面试、薪资谈判、offer选择' },
      { slug: 'workplace', name: '职场技能', icon: '📊', description: '沟通汇报、向上管理、时间管理、领导力' },
      { slug: 'freelancer', name: '自由职业', icon: '🧑‍💻', description: '接单平台、定价报价、客户管理、自我推广' },
      { slug: 'career-switch', name: '职业转型', icon: '🔄', description: '行业转换、技能重塑、副业探索、创业准备' },
    ],
  },
  {
    slug: 'professional', name: '专业工作', icon: '🛠️',
    description: '建筑设计、机械工程、软件开发、会计法务等垂直行业知识',
    children: [
      { slug: 'arch-design', name: '建筑与设计', icon: '🏗️', description: '建筑设计、室内设计、平面设计、UI/UX设计' },
      { slug: 'engineering', name: '工程与制造', icon: '⚙️', description: '机械、电子、电气、化工、土木工程' },
      { slug: 'dev-coding', name: '编程开发', icon: '💻', description: '前端后端、数据库、运维、测试、架构' },
      { slug: 'biz-prof', name: '商务与法务', icon: '📑', description: '会计审计、合同起草、知识产权、公司法务' },
    ],
  },
  {
    slug: 'ai', name: 'AI 人工智能', icon: '🤖',
    description: 'Vibe-Coding、Agent开发、AI写作/绘图/视频/音乐创作',
    children: [
      { slug: 'vibe-coding', name: 'Vibe-Coding', icon: '⚡', description: '零代码开发、MCP/Skill配置、Agent搭建' },
      { slug: 'ai-writing', name: 'AI 写作', icon: '✍️', description: 'AI辅助写作、小说创作、公文润色、翻译' },
      { slug: 'ai-art', name: 'AI 图像视频', icon: '🎨', description: 'AI绘画、海报生成、视频制作、音乐生成' },
      { slug: 'ai-tools', name: 'AI 工具应用', icon: '🔧', description: 'prompt工程、RAG知识库、自动化工作流、智能体' },
    ],
  },
  {
    slug: 'legal', name: '法律维权', icon: '⚖️',
    description: '劳动纠纷、消费维权、婚姻房产、交通事故',
    children: [
      { slug: 'labor', name: '劳动纠纷', icon: '👷', description: '辞退补偿、拖欠工资、工伤认定、竞业限制' },
      { slug: 'consumer', name: '消费维权', icon: '🛒', description: '退货退款、假货欺诈、直播购物、二手交易纠纷' },
      { slug: 'marriage-law', name: '婚姻房产', icon: '💒', description: '离婚财产分割、抚养权、婚前婚后房产、继承' },
      { slug: 'traffic', name: '交通事故', icon: '🚗', description: '事故责任认定、保险理赔、伤残鉴定、诉讼' },
    ],
  },
  {
    slug: 'finance', name: '金融理财', icon: '💰',
    description: '保险选购、税务筹划、贷款指南、投资入门',
    children: [
      { slug: 'insurance', name: '保险选购', icon: '🛡️', description: '重疾险、医疗险、车险、意外险对比与理赔' },
      { slug: 'tax', name: '税务筹划', icon: '🧾', description: '个税汇算、专项扣除、自由职业报税、增值税' },
      { slug: 'loan', name: '贷款指南', icon: '🏦', description: '房贷、车贷、消费贷、信用贷申请与对比' },
      { slug: 'invest', name: '投资入门', icon: '📈', description: '基金、股票、债券、理财产品、风险测评' },
    ],
  },
  {
    slug: 'education', name: '教育学习', icon: '📚',
    description: '学习方法、考试辅导、留学规划、语言学习',
    children: [
      { slug: 'study', name: '学习方法', icon: '✏️', description: '高效记忆、笔记方法、时间管理、考试技巧' },
      { slug: 'exam', name: '考试辅导', icon: '📝', description: '高考、考研、考公、考证、驾照理论' },
      { slug: 'abroad', name: '留学规划', icon: '✈️', description: '选校申请、语言考试、签证准备、文书写作' },
      { slug: 'language', name: '语言学习', icon: '🗣️', description: '英语日语、韩语法语、口语听力、用AI学语言' },
    ],
  },
  {
    slug: 'digital', name: '数码科技', icon: '📱',
    description: '手机电脑选购、App使用、智能家居、设备维修',
    children: [
      { slug: 'hardware', name: '数码选购', icon: '💻', description: '手机/电脑/平板/家电参数对比与推荐' },
      { slug: 'app-guide', name: 'App指南', icon: '📲', description: '实用App推荐、使用教程、效率工具、AI工具App' },
      { slug: 'smart-home', name: '智能家居', icon: '🏡', description: '全屋智能方案、设备选型、HomeKit/米家配置' },
      { slug: 'repair', name: '维修排障', icon: '🔧', description: '手机维修、电脑故障、家电故障排查' },
    ],
  },
  {
    slug: 'home', name: '居家生活', icon: '🏠',
    description: '装修指南、收纳整理、家电维修、日常技巧',
    children: [
      { slug: 'renovation', name: '装修指南', icon: '🔨', description: '预算规划、材料选择、合同审核、风格搭配' },
      { slug: 'storage', name: '收纳整理', icon: '📦', description: '断舍离、衣柜整理、空间利用、收纳神器' },
      { slug: 'appliance', name: '家电选购', icon: '🖥️', description: '空调冰箱洗衣机、洗碗机扫地机、性价比推荐' },
      { slug: 'daily-tips', name: '日常技巧', icon: '💡', description: '清洁、除味、防潮防霉、下水道疏通、节电节水' },
    ],
  },
  {
    slug: 'cooking', name: '美食烹饪', icon: '🍳',
    description: '菜谱食谱、烘焙入门、营养搭配、世界美食',
    children: [
      { slug: 'recipe', name: '菜谱食谱', icon: '🥘', description: '川菜粤菜鲁菜、家常菜、快手菜、宴客菜' },
      { slug: 'baking', name: '烘焙甜品', icon: '🍞', description: '面包、蛋糕、饼干、奶油裱花、发酵技术' },
      { slug: 'nutrition', name: '营养搭配', icon: '🥗', description: '减肥餐、增肌餐、慢性病饮食、膳食均衡' },
      { slug: 'world-food', name: '世界美食', icon: '🌍', description: '日料、韩餐、西餐、东南亚菜、意面披萨' },
    ],
  },
  {
    slug: 'travel', name: '出行旅行', icon: '✈️',
    description: '旅行攻略、签证机票、酒店住宿、目的地指南',
    children: [
      { slug: 'trip-plan', name: '旅行规划', icon: '🗺️', description: '行程安排、目的地选择、预算控制、季节推荐' },
      { slug: 'visa-flight', name: '签证机票', icon: '🎫', description: '各国签证政策、机票比价、积分兑换、延误应对' },
      { slug: 'hotel', name: '酒店住宿', icon: '🏨', description: '酒店比价、民宿预订、差旅管理、会员权益' },
      { slug: 'local', name: '目的地指南', icon: '📍', description: '当地交通、美食推荐、景点攻略、文化禁忌' },
    ],
  },
  {
    slug: 'shopping', name: '消费购物', icon: '🛒',
    description: '产品对比、避坑指南、二手交易、购物决策',
    children: [
      { slug: 'compare', name: '产品对比', icon: '📊', description: '家电、数码、汽车、美妆横向参数对比' },
      { slug: 'avoid-scam', name: '消费避坑', icon: '🚫', description: '虚假宣传识别、防骗指南、霸王条款、维权方法' },
      { slug: 'secondhand', name: '二手交易', icon: '🔄', description: '闲鱼转转、二手手机/相机/车、估价、验机' },
      { slug: 'shopping-psych', name: '购物心理', icon: '🧠', description: '冲动消费控制、极简主义、性价比思维、断舍离' },
    ],
  },
  {
    slug: 'government', name: '政务办事', icon: '🏛️',
    description: '社保公积金、护照户籍、驾照车管、政策法规',
    children: [
      { slug: 'social-security', name: '社保公积金', icon: '🏦', description: '五险一金缴纳、提取、转移、计算、断缴补救' },
      { slug: 'visa-passport', name: '户籍出入境', icon: '🛂', description: '护照办理、港澳通行证、落户政策、居住证' },
      { slug: 'vehicle', name: '驾照车管', icon: '🚗', description: '驾照考试、换证补证、违章处理、年检验车' },
      { slug: 'policy', name: '政策解读', icon: '📜', description: '人才补贴、住房补贴、创业补贴、限购限行政策' },
    ],
  },
  {
    slug: 'relationships', name: '人际关系', icon: '💬',
    description: '婚姻经营、社交技巧、沟通表达、冲突处理',
    children: [
      { slug: 'marriage', name: '婚姻经营', icon: '💑', description: '夫妻沟通、婆媳关系、离婚疏导、婚前准备' },
      { slug: 'social', name: '社交技巧', icon: '🤝', description: '破冰、聊天话题、人脉维护、聚会应酬、送礼' },
      { slug: 'communication', name: '沟通表达', icon: '🗣️', description: '公开演讲、汇报技巧、非暴力沟通、说服力' },
      { slug: 'conflict', name: '冲突处理', icon: '🕊️', description: '职场冲突、邻里纠纷、家庭矛盾化解、调停技巧' },
    ],
  },
  {
    slug: 'pets', name: '宠物养护', icon: '🐾',
    description: '养狗养猫、疾病预防、行为训练、异宠入门',
    children: [
      { slug: 'cat-care', name: '养猫指南', icon: '🐈', description: '品种选择、猫粮、猫砂、日常护理、疾病识别' },
      { slug: 'dog-care', name: '养狗指南', icon: '🐕', description: '犬种推荐、训练方法、遛狗、洗澡、常见病' },
      { slug: 'pet-health', name: '宠物医疗', icon: '🏥', description: '疫苗驱虫、绝育、宠物医院选择、保险理赔' },
      { slug: 'exotic-pets', name: '异宠入门', icon: '🦎', description: '仓鼠、兔子、龙猫、爬宠、鱼缸水族' },
    ],
  },
  {
    slug: 'entertainment', name: '兴趣娱乐', icon: '🎮',
    description: '高达模型、摄影绘画、音乐乐器、户外运动',
    children: [
      { slug: 'hobby-model', name: '模型手办', icon: '🤖', description: '高达、军模、乐高、GK、涂装和工具推荐' },
      { slug: 'photography', name: '摄影绘画', icon: '📷', description: '相机选购、拍摄技巧、修图、素描油画水彩' },
      { slug: 'music', name: '音乐乐器', icon: '🎵', description: '吉他钢琴、乐理入门、编曲制作、听歌识曲' },
      { slug: 'outdoor', name: '户外运动', icon: '🏔️', description: '露营、钓鱼、登山徒步、骑行、装备选购' },
    ],
  },
  {
    slug: 'beauty', name: '美容穿搭', icon: '💄',
    description: '护肤化妆、发型造型、穿搭搭配、医美指南',
    children: [
      { slug: 'skincare', name: '护肤指南', icon: '🧴', description: '肤质判断、护肤品选购、成分解读、防晒抗老' },
      { slug: 'makeup', name: '化妆技巧', icon: '💋', description: '日常妆、约会妆、职场妆、化妆品推荐对比' },
      { slug: 'fashion', name: '穿搭搭配', icon: '👗', description: '体型穿搭、色彩搭配、品牌推荐、衣橱规划' },
      { slug: 'cosmetic-med', name: '医美指南', icon: '✨', description: '项目科普、机构选择、风险提示、术后护理' },
    ],
  },
  {
    slug: 'elderly', name: '银发关怀', icon: '👴',
    description: '养老规划、老年健康、数字扫盲、遗产继承',
    children: [
      { slug: 'pension', name: '养老规划', icon: '🏖️', description: '养老金计算、养老院选择、居家适老化改造' },
      { slug: 'senior-health', name: '老年健康', icon: '🩺', description: '常见老年病、防跌倒、认知症照护、吞咽安全' },
      { slug: 'digital-lit', name: '数字扫盲', icon: '📲', description: '教老人用智能手机、微信、网上挂号、反诈骗' },
      { slug: 'estate', name: '遗嘱遗产', icon: '📜', description: '遗嘱怎么写、继承权、房产过户、赠与税' },
    ],
  },
  {
    slug: 'startup', name: '创业经商', icon: '🚀',
    description: '公司注册、财税管理、营销推广、融资策略',
    children: [
      { slug: 'company-reg', name: '公司注册', icon: '📋', description: '工商注册流程、公司类型选择、股权架构设计' },
      { slug: 'finance-tax', name: '财税管理', icon: '📊', description: '代理记账、发票管理、增值税、企业所得税' },
      { slug: 'marketing', name: '营销推广', icon: '📣', description: '小红书抖音运营、SEO、私域流量、广告投放' },
      { slug: 'fundraising', name: '融资策略', icon: '💸', description: 'BP撰写、估值方法、天使/VC接触、协议条款' },
    ],
  },
  {
    slug: 'safety', name: '安全应急', icon: '🛡️',
    description: '急救处置、防诈骗、网络安全、自然灾害应对',
    children: [
      { slug: 'first-aid', name: '急救处置', icon: '🚑', description: '心肺复苏、海姆立克法、外伤止血、烧烫伤处理' },
      { slug: 'fraud', name: '防骗反诈', icon: '🔍', description: '电信诈骗、网络钓鱼、投资骗局、养老诈骗识别' },
      { slug: 'cyber', name: '网络安全', icon: '🔒', description: '密码管理、WiFi安全、隐私保护、勒索软件防范' },
      { slug: 'disaster', name: '防灾避险', icon: '🌪️', description: '地震火灾、洪水台风、应急物资、避险逃生路线' },
    ],
  },
];

export function getAllCategories(): Category[] {
  return CATEGORIES;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  for (const cat of CATEGORIES) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      const child = cat.children.find((c) => c.slug === slug);
      if (child) return child;
    }
  }
  return undefined;
}
