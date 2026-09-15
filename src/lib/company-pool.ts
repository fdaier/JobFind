import type { Job } from "./types";

export type CompanyPoolView = "city" | "tier";
export type CompanyTier = "tier_1" | "tier_2" | "tier_3" | "foreign";
export type CompanyCity = "beijing" | "shanghai" | "shenzhen" | "guangzhou" | "hangzhou" | "xian" | "chengdu" | "suzhou" | "nanjing";

export interface Company {
  id: string;
  name: string;
  aliases: string[];
  /** Generic tag storage keeps the entity extensible beyond city and tier. */
  tags: Record<string, string[]>;
  archived?: boolean;
}

export const COMPANY_CITY_LABELS: Record<CompanyCity, string> = {
  beijing: "北京", shanghai: "上海", shenzhen: "深圳", guangzhou: "广州", hangzhou: "杭州",
  xian: "西安", chengdu: "成都", suzhou: "苏州", nanjing: "南京",
};

export const COMPANY_TIER_LABELS: Record<CompanyTier, string> = {
  tier_1: "第一梯队", tier_2: "第二梯队", tier_3: "第三梯队", foreign: "外企",
};

const TIER_RANK: Record<CompanyTier, number> = { tier_1: 1, tier_2: 2, tier_3: 3, foreign: 4 };

type SourceList = Record<CompanyCity, Partial<Record<CompanyTier, string[]>>>;

// “等”与“系列”不写成虚假的公司；以下仅保留用户明确列出的名称。
const SOURCE_LIST: SourceList = {
  beijing: {
    tier_1: ["字节跳动", "腾讯", "阿里巴巴", "美团", "百度", "京东", "华为"],
    tier_2: ["联想", "滴滴", "新浪", "快手", "网易", "搜狐", "360", "小米", "搜狗"],
    tier_3: ["爱奇艺", "去哪儿", "豆瓣", "当当网", "58同城", "陌陌", "优酷", "用友", "金山软件", "昆仑万维", "好未来", "每日优鲜", "汽车之家", "完美世界", "商汤", "旷视科技", "第四范式", "地平线", "寒武纪", "猿辅导", "高途", "雪球", "得到", "猎豹移动"],
    foreign: ["微软", "亚马逊"],
  },
  shanghai: {
    tier_1: ["阿里巴巴", "腾讯", "字节跳动", "蚂蚁金服", "百度", "拼多多", "华为"],
    tier_2: ["B站", "滴滴", "携程", "饿了么", "阅文集团", "美团", "快手", "京东", "网易", "盒马", "爱奇艺", "唯品会"],
    tier_3: ["小红书", "PPTV", "微盟", "巨人网络", "盛大", "得物", "叮咚买菜", "趣头条", "哈啰出行", "喜马拉雅", "陆金所", "UCloud", "七牛云", "米哈游", "达达集团", "安邦保险", "蔚来", "Soul", "途虎养车", "莉莉丝", "依图科技", "东方财富"],
    foreign: ["谷歌", "微软"],
  },
  shenzhen: {
    tier_1: ["腾讯", "华为", "字节跳动", "阿里巴巴", "百度"],
    tier_2: ["中兴", "OPPO", "vivo", "大疆", "深信服", "顺丰", "快手", "京东"],
    tier_3: ["微众银行", "金蝶", "迅雷", "富途证券", "优必选", "商汤", "招银科技", "海能达", "一加", "丰巢", "货拉拉", "有赞", "随手记", "编程猫", "小鹅通"],
  },
  guangzhou: {
    tier_1: ["微信", "网易", "阿里巴巴", "字节跳动", "华为"],
    tier_2: ["京东", "唯品会", "欢聚时代", "UC", "酷狗", "小鹏汽车"],
    tier_3: ["多益网络", "猎豹移动", "4399", "CVTE", "荔枝FM", "爱范儿", "超级课程表", "云从科技", "机智云", "爱拍", "ZAKER", "趣丸网络", "映客直播", "深海游戏", "三七互娱"],
  },
  hangzhou: {
    tier_1: ["阿里巴巴", "蚂蚁金服", "网易", "字节跳动", "阿里", "华为"],
    tier_2: ["滴滴", "快手", "海康威视", "vivo", "OPPO", "浙江大华", "宇视", "菜鸟网络", "口碑"],
    tier_3: ["蘑菇街", "有赞", "兑吧", "微店", "商汤", "旷视科技", "花瓣网", "51信用卡", "同花顺", "曹操出行", "丁香园", "大搜车", "婚礼纪", "淘粉吧"],
  },
  xian: {
    tier_1: ["华为", "阿里云", "荣耀"],
    tier_2: ["腾讯云", "360", "小米", "中兴", "京东", "大疆", "vivo", "OPPO"],
    tier_3: ["科大讯飞", "广联达", "奇安信", "海康威视", "大华", "宇视科技", "极客移动", "绿盟", "当当网", "寒武纪", "暴走漫画", "蒜泥科技", "诺瓦科技", "南瑞"],
  },
  chengdu: {
    tier_1: ["腾讯", "阿里", "蚂蚁金服", "字节跳动", "华为"],
    tier_2: ["百度", "京东", "美团", "携程", "新浪", "爱奇艺", "OPPO", "滴滴"],
    tier_3: ["陌陌", "聚美优品", "完美世界", "科大讯飞", "商汤", "Tap4Fun", "趣乐", "天上友嘉", "三七互娱", "咕咚", "百词斩", "晓多科技", "萌想科技", "医联", "Camera360", "小明太极", "小鸡叫叫", "NAVER 中国"],
  },
  suzhou: {
    tier_1: ["华为"],
    tier_2: ["科沃斯", "同程网", "360"],
    tier_3: ["蜗牛游戏", "灵石网络", "国泰新点", "科大讯飞", "思必驰", "友谊时光", "大禹网络", "凌志软件", "山石网科", "苏州科达", "Momenta", "智慧芽", "云堂", "盖雅工场", "企查查"],
    foreign: ["微软", "Zoom"],
  },
  nanjing: {
    tier_1: ["阿里巴巴", "字节跳动", "京东", "华为", "荣耀"],
    tier_2: ["小米", "苏宁", "途牛", "360", "vivo", "OPPO", "中兴"],
    tier_3: ["焦点科技", "领添", "三祠胡同", "乐酷科技", "趋势科技", "亚信安全", "满帮集团", "零浩网络", "汇通达", "扇贝网", "美篇", "千米网", "三六五网", "育儿网", "Yoho"],
    foreign: ["三星", "SAP", "IBM"],
  },
};

const CANONICAL_NAMES: Record<string, string> = {
  "阿里": "阿里巴巴", "蚂蚁金服": "蚂蚁集团", "B站": "哔哩哔哩", "360": "三六零",
  "大华": "浙江大华", "宇视科技": "宇视", "阿里巴巴": "阿里巴巴",
};

const EXPLICIT_ALIASES: Record<string, string[]> = {
  "阿里巴巴": ["阿里", "Alibaba"], "蚂蚁集团": ["蚂蚁金服", "蚂蚁"], "哔哩哔哩": ["B站", "bilibili"],
  "三六零": ["360"], "浙江大华": ["大华"], "宇视": ["宇视科技"],
};

function stableId(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) hash = (hash * 31 + name.charCodeAt(index)) | 0;
  return `company-${Math.abs(hash)}`;
}

function canonicalName(name: string): string { return CANONICAL_NAMES[name] ?? name; }

export function normalizeCompanyName(name: string): string {
  return name.trim().toLocaleLowerCase("zh-CN").replace(/[\s\-—_（）()·.]/g, "");
}

export function createSeedCompanies(): Company[] {
  const result = new Map<string, { cities: Set<CompanyCity>; tiers: Set<CompanyTier>; aliases: Set<string> }>();
  for (const [city, tiers] of Object.entries(SOURCE_LIST) as Array<[CompanyCity, Partial<Record<CompanyTier, string[]>>]>) {
    for (const [tier, names] of Object.entries(tiers) as Array<[CompanyTier, string[]]>) {
      for (const sourceName of names) {
        const name = canonicalName(sourceName);
        const current = result.get(name) ?? { cities: new Set<CompanyCity>(), tiers: new Set<CompanyTier>(), aliases: new Set<string>() };
        current.cities.add(city);
        current.tiers.add(tier);
        if (sourceName !== name) current.aliases.add(sourceName);
        result.set(name, current);
      }
    }
  }

  return Array.from(result.entries()).map(([name, value]) => {
    const rankedTiers = Array.from(value.tiers).sort((left, right) => TIER_RANK[left] - TIER_RANK[right]);
    return {
      id: stableId(name),
      name,
      aliases: Array.from(new Set([...value.aliases, ...(EXPLICIT_ALIASES[name] ?? [])])).sort((left, right) => left.localeCompare(right, "zh-CN")),
      tags: { city: Array.from(value.cities).sort(), tier: [rankedTiers[0]] },
    };
  }).sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
}

export function getCompanyCities(company: Company): CompanyCity[] {
  return (company.tags.city ?? []).filter((city): city is CompanyCity => city in COMPANY_CITY_LABELS);
}

export function getCompanyTier(company: Company): CompanyTier {
  const tier = company.tags.tier?.[0];
  return tier && tier in COMPANY_TIER_LABELS ? tier as CompanyTier : "tier_3";
}

export function resolveCompanyId(name: string, companies: Company[]): string | null {
  const normalized = normalizeCompanyName(name);
  if (!normalized) return null;
  const matched = companies.filter((company) => !company.archived && [company.name, ...company.aliases].some((candidate) => normalizeCompanyName(candidate) === normalized));
  return matched.length === 1 ? matched[0].id : null;
}

export function isJobApplied(job: Job): boolean {
  return Boolean(job.appliedDate) || job.stage !== "to_apply";
}
