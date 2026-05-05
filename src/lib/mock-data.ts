import { generateRiskTags } from './rules-engine';
import type { AISuggestion, InterviewNote, Job, Material, TimelineEvent } from './types';

export const sampleJD = `B站 AI 产品实习生

岗位职责
1. 参与 AI 产品需求梳理、原型讨论和方案输出。
2. 协助分析用户内容消费、创作和互动链路中的机会点。
3. 跟进功能落地，与设计、研发和算法同学协作推进。

岗位要求
1. 对 AI 产品、内容平台和用户体验有兴趣。
2. 具备良好的结构化表达和学习能力。
3. 有 AI 产品、产品经理或相关项目经历优先。

加分项
1. 有作品集、项目复盘或数据分析经验。
2. 熟悉 B站社区生态。`;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function shiftDate(base: Date, offsetMs: number): string {
  return new Date(base.getTime() + offsetMs).toISOString();
}

function startOfToday(base: Date): Date {
  const next = new Date(base);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfToday(base: Date): Date {
  const next = new Date(base);
  next.setHours(23, 59, 0, 0);
  return next;
}

function tomorrowAt(base: Date, hour: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + 1);
  next.setHours(hour, 0, 0, 0);
  return next;
}

function createSuggestion(id: string, action: string, reason: string, priority: AISuggestion['priority'], actionType: AISuggestion['actionType']): AISuggestion {
  return {
    id,
    action,
    reason,
    priority,
    actionType,
    completed: false,
  };
}

function createTimelineEvent(date: string, stage: Job['stage'], description: string): TimelineEvent {
  return { date, stage, description };
}

function createInterviewNote(round: string, date: string, questions: string[], reflection: string, result: InterviewNote['result']): InterviewNote {
  return { round, date, questions, reflection, result };
}

const PARSED_JD_ID_PREFIX = 'bilibili-jd';
let parsedJDIdFallbackCounter = 0;

function createParsedJDJobId(now: Date): string {
  const cryptoId = globalThis.crypto?.randomUUID?.();
  if (cryptoId) {
    return `${PARSED_JD_ID_PREFIX}-${now.getTime()}-${cryptoId}`;
  }

  parsedJDIdFallbackCounter += 1;
  return `${PARSED_JD_ID_PREFIX}-${now.getTime()}-${parsedJDIdFallbackCounter}`;
}

export function createMockMaterials(now: Date = new Date()): Material[] {

  return [
    {
      id: 'resume-pm',
      name: '产品经理简历',
      type: 'resume',
      targetDirection: '产品经理',
      version: 'v2.3',
      lastUpdated: shiftDate(now, -2 * DAY),
      boundJobIds: ['tencent', 'bytedance', 'xiaohongshu', 'meituan', 'alibaba', 'netease', 'jd', 'kuaishou', 'baidu', 'ant', 'bilibili', 'tme', 'mihoyo'],
    },
    {
      id: 'resume-ai-pm',
      name: 'AI 产品经理简历',
      type: 'resume',
      targetDirection: 'AI 产品经理',
      version: 'v2.1',
      lastUpdated: shiftDate(now, -3 * DAY),
      boundJobIds: ['bytedance', 'xiaohongshu', 'baidu', 'ant', 'bilibili', 'tme', 'mihoyo'],
    },
    {
      id: 'portfolio-ai',
      name: 'AI 产品作品集',
      type: 'portfolio',
      targetDirection: 'AI 产品经理',
      version: 'v1.2',
      lastUpdated: shiftDate(now, -4 * DAY),
      boundJobIds: ['bytedance', 'meituan', 'alibaba', 'kuaishou', 'baidu', 'bilibili', 'tme'],
    },
    {
      id: 'transcript',
      name: '本科成绩单',
      type: 'transcript',
      targetDirection: '通用',
      version: '2025 春',
      lastUpdated: shiftDate(now, -1 * DAY),
      boundJobIds: ['tencent', 'bytedance', 'xiaohongshu', 'meituan', 'alibaba', 'netease', 'jd', 'kuaishou', 'baidu', 'ant', 'bilibili', 'tme', 'mihoyo'],
    },
    {
      id: 'case-ai-assistant',
      name: 'AI 助手项目说明书',
      type: 'portfolio',
      targetDirection: 'AI 产品经理',
      version: 'v1.1',
      lastUpdated: shiftDate(now, -5 * DAY),
      boundJobIds: ['netease', 'mihoyo'],
    },
    {
      id: 'cet6',
      name: 'CET-6 证书',
      type: 'certificate',
      targetDirection: '通用',
      version: '2025',
      lastUpdated: shiftDate(now, -6 * DAY),
      boundJobIds: ['bytedance', 'xiaohongshu', 'meituan', 'alibaba', 'netease', 'jd', 'kuaishou', 'baidu', 'ant', 'tme', 'mihoyo'],
    },
    {
      id: 'cover-letter-ai-pm',
      name: 'AI 产品经理求职信',
      type: 'cover_letter',
      targetDirection: 'AI 产品经理',
      version: 'v1.0',
      lastUpdated: shiftDate(now, -2 * DAY),
      boundJobIds: ['ant', 'bilibili'],
    },
    {
      id: 'internship-proof',
      name: '产品实习证明',
      type: 'certificate',
      targetDirection: 'AI 产品经理',
      version: '2026',
      lastUpdated: shiftDate(now, -8 * DAY),
      boundJobIds: ['baidu', 'tme'],
    },
  ];
}

export function createMockJobs(now: Date = new Date()): Job[] {
  const today = startOfToday(now);
  const materials = createMockMaterials(now);

  const baseJobs: Job[] = [
    {
      id: 'tencent',
      company: '腾讯',
      position: 'AI 产品实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'official_site',
      stage: 'applied',
      applicationDeadline: endOfToday(today).toISOString(),
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: shiftDate(now, -4 * DAY),
      jdText: '负责 AI 产品需求梳理、功能跟进与跨团队协作，关注内容与创作场景。',
      keywords: ['AI', '产品', '内容平台', '实习'],
      requirements: ['结构化表达', '用户理解', '项目协作'],
      requiredMaterials: ['resume', 'portfolio', 'transcript'],
      boundMaterialIds: ['resume-pm', 'transcript'],
      contactName: '张敏',
      contactInfo: 'hr@tencent.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('tencent-submit', '今天补齐作品集并提交腾讯投递', 'DDL 在今天结束前到期', 'urgent', 'submit_application'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -7 * DAY), 'interested', '收藏腾讯 AI 产品实习岗位'),
        createTimelineEvent(shiftDate(now, -4 * DAY), 'applied', '完成腾讯岗位投递'),
      ],
      interviewNotes: [],
      createdAt: shiftDate(now, -7 * DAY),
      updatedAt: shiftDate(now, -2 * HOUR),
    },
    {
      id: 'bytedance',
      company: '字节跳动',
      position: 'AI 产品经理实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'school_career',
      stage: 'interviewing',
      applicationDeadline: null,
      writtenTestDate: shiftDate(now, -6 * DAY),
      interviewDate: tomorrowAt(now, 10).toISOString(),
      appliedDate: shiftDate(now, -9 * DAY),
      jdText: '负责 AI 产品方案推进、内容策略协作和用户问题分析，支持面试官沟通。',
      keywords: ['AI', '产品经理', '面试', '内容'],
      requirements: ['产品思维', '数据分析', '快速学习'],
      requiredMaterials: ['resume', 'portfolio', 'transcript'],
      boundMaterialIds: ['resume-pm', 'portfolio-ai', 'transcript'],
      contactName: '王珊',
      contactInfo: 'interview@bytedance.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('bytedance-prepare', '明天面试前复盘 AI 产品项目', '面试安排在明天', 'urgent', 'prepare_interview'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -11 * DAY), 'interested', '关注字节 AI 产品实习岗位'),
        createTimelineEvent(shiftDate(now, -9 * DAY), 'applied', '完成字节投递'),
        createTimelineEvent(shiftDate(now, -1 * DAY), 'interviewing', '收到明天面试通知'),
      ],
      interviewNotes: [
        createInterviewNote(
          '一面',
          tomorrowAt(now, 10).toISOString(),
          ['为什么想做 AI 产品', '如何定义内容平台的 AI 能力'],
          '重点准备案例复盘与结构化表达。',
          'pending',
        ),
      ],
      createdAt: shiftDate(now, -11 * DAY),
      updatedAt: shiftDate(now, -1 * DAY),
    },
    {
      id: 'xiaohongshu',
      company: '小红书',
      position: 'AI 产品经理实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'boss',
      stage: 'applied',
      applicationDeadline: null,
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: shiftDate(now, -12 * DAY),
      jdText: '负责社区 AI 创作工具的需求分析、用户反馈归因和功能迭代推进。',
      keywords: ['AI', '产品经理', '社区', '创作工具'],
      requirements: ['产品判断', '用户洞察', '数据意识'],
      requiredMaterials: ['resume', 'portfolio', 'transcript'],
      boundMaterialIds: ['resume-ai-pm', 'transcript'],
      contactName: null,
      contactInfo: null,
      riskTags: [],
      aiSuggestions: [
        createSuggestion('xiaohongshu-followup', '跟进小红书投递反馈', '已投递 12 天但还没有回复', 'high', 'follow_up'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -14 * DAY), 'interested', '关注小红书 AI 产品经理实习'),
        createTimelineEvent(shiftDate(now, -12 * DAY), 'applied', '完成小红书投递'),
      ],
      interviewNotes: [],
      createdAt: shiftDate(now, -14 * DAY),
      updatedAt: shiftDate(now, -3 * DAY),
    },
    {
      id: 'meituan',
      company: '美团',
      position: '产品经理校招',
      jobType: 'campus',
      batch: 'autumn',
      channel: 'referral',
      stage: 'written_test',
      applicationDeadline: null,
      writtenTestDate: shiftDate(now, -2 * DAY),
      interviewDate: null,
      appliedDate: shiftDate(now, -8 * DAY),
      jdText: '负责产品方案理解、题目分析和校招流程推进。',
      keywords: ['产品经理', '校招', '笔试', '协作'],
      requirements: ['逻辑分析', '用户理解', '表达能力'],
      requiredMaterials: ['resume', 'portfolio', 'transcript'],
      boundMaterialIds: ['resume-pm', 'portfolio-ai', 'transcript', 'cet6'],
      contactName: '赵然',
      contactInfo: 'campus@meituan.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('meituan-wait', '等待美团面试通知并整理复盘笔记', '笔试已完成，当前在等待下一步安排', 'medium', 'review_interview'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -10 * DAY), 'interested', '收到美团校招信息'),
        createTimelineEvent(shiftDate(now, -8 * DAY), 'applied', '完成美团校招投递'),
        createTimelineEvent(shiftDate(now, -2 * DAY), 'written_test', '完成美团笔试'),
      ],
      interviewNotes: [],
      createdAt: shiftDate(now, -10 * DAY),
      updatedAt: shiftDate(now, -2 * DAY),
    },
    {
      id: 'alibaba',
      company: '阿里巴巴',
      position: '产品实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'official_site',
      stage: 'interested',
      applicationDeadline: shiftDate(today, 5 * DAY),
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: null,
      jdText: '负责产品方案协作、需求评审支持和项目推进。',
      keywords: ['产品', '协作', '实习'],
      requirements: ['产品思维', '执行力', '沟通能力'],
      requiredMaterials: ['resume', 'portfolio', 'transcript'],
      boundMaterialIds: ['resume-pm', 'portfolio-ai', 'transcript'],
      contactName: '陈洁',
      contactInfo: 'campus@alibaba.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('alibaba-plan', '先准备阿里投递材料，五天内完成申请', '职位还在关注阶段，但 DDL 已经明确', 'medium', 'submit_application'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -1 * DAY), 'interested', '加入阿里岗位观察列表'),
      ],
      interviewNotes: [],
      createdAt: shiftDate(now, -1 * DAY),
      updatedAt: shiftDate(now, -1 * DAY),
    },
    {
      id: 'netease',
      company: '网易',
      position: 'AI 游戏产品经理实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'nowcoder',
      stage: 'offer',
      applicationDeadline: null,
      writtenTestDate: shiftDate(now, -16 * DAY),
      interviewDate: shiftDate(now, -12 * DAY),
      appliedDate: shiftDate(now, -18 * DAY),
      jdText: '负责 AI 游戏助手场景拆解、玩家需求分析和功能方案推进。',
      keywords: ['AI', '游戏产品', '用户体验', '实习'],
      requirements: ['玩法理解', 'AI 产品判断', '协作推进'],
      requiredMaterials: ['resume', 'portfolio', 'transcript'],
      boundMaterialIds: ['resume-pm', 'case-ai-assistant', 'transcript', 'cet6'],
      contactName: '刘洋',
      contactInfo: 'offer@netease.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('netease-decide', '整理网易 Offer 的决策信息', '已经拿到 Offer，进入决策阶段', 'high', 'follow_up'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -20 * DAY), 'interested', '关注网易 AI 游戏产品经理实习岗位'),
        createTimelineEvent(shiftDate(now, -18 * DAY), 'applied', '完成网易投递'),
        createTimelineEvent(shiftDate(now, -12 * DAY), 'interviewing', '完成网易面试'),
        createTimelineEvent(shiftDate(now, -2 * DAY), 'offer', '收到网易 Offer'),
      ],
      interviewNotes: [
        createInterviewNote(
          '终面',
          shiftDate(now, -12 * DAY),
          ['为什么做 AI 游戏产品经理', '如何判断 AI 助手是否真的提升玩家体验'],
          '题目更看重 AI 场景判断、系统理解和表达完整性。',
          'passed',
        ),
      ],
      createdAt: shiftDate(now, -20 * DAY),
      updatedAt: shiftDate(now, -2 * DAY),
    },
    {
      id: 'jd',
      company: '京东',
      position: 'AI 产品经理实习生',
      jobType: 'intern',
      batch: 'spring',
      channel: 'school_career',
      stage: 'rejected',
      applicationDeadline: null,
      writtenTestDate: shiftDate(now, -18 * DAY),
      interviewDate: shiftDate(now, -15 * DAY),
      appliedDate: shiftDate(now, -22 * DAY),
      jdText: '负责智能客服与导购场景的需求拆解、体验评估和数据复盘。',
      keywords: ['AI', '产品经理', '智能客服'],
      requirements: ['用户问题拆解', '数据基础', '表达能力'],
      requiredMaterials: ['resume', 'transcript'],
      boundMaterialIds: ['resume-pm', 'transcript', 'cet6'],
      contactName: null,
      contactInfo: null,
      riskTags: [],
      aiSuggestions: [
        createSuggestion('jd-review', '把京东拒绝原因归档到复盘里', '可以作为后续投递策略参考', 'low', 'update_material'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -24 * DAY), 'interested', '关注京东 AI 产品经理岗位'),
        createTimelineEvent(shiftDate(now, -22 * DAY), 'applied', '完成京东投递'),
        createTimelineEvent(shiftDate(now, -18 * DAY), 'written_test', '完成京东笔试'),
        createTimelineEvent(shiftDate(now, -15 * DAY), 'interviewing', '完成京东面试'),
        createTimelineEvent(shiftDate(now, -1 * DAY), 'rejected', '收到京东拒绝通知'),
      ],
      interviewNotes: [
        createInterviewNote(
          '一面',
          shiftDate(now, -15 * DAY),
          ['如何拆解智能客服的用户问题', '如何看待转化率和满意度的冲突'],
          '回答里 AI 产品指标拆解不够清晰，后续需要补强问题定义和指标取舍。',
          'failed',
        ),
      ],
      createdAt: shiftDate(now, -24 * DAY),
      updatedAt: shiftDate(now, -1 * DAY),
    },
    {
      id: 'kuaishou',
      company: '快手',
      position: 'AI 产品实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'shixiseng',
      stage: 'to_apply',
      applicationDeadline: shiftDate(today, 7 * DAY),
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: null,
      jdText: '负责 AI 产品需求梳理、内容场景分析和功能推进。',
      keywords: ['AI', '产品', '实习', '内容'],
      requirements: ['产品意识', '学习能力', '协作沟通'],
      requiredMaterials: ['resume', 'portfolio', 'transcript'],
      boundMaterialIds: ['resume-pm', 'portfolio-ai', 'transcript'],
      contactName: '周婷',
      contactInfo: 'jobs@kuaishou.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('kuaishou-submit', '在七天内完成快手投递', '职位已经明确，但还没有提交申请', 'medium', 'submit_application'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -1 * DAY), 'interested', '加入快手岗位待投递清单'),
      ],
      interviewNotes: [],
      createdAt: shiftDate(now, -1 * DAY),
      updatedAt: shiftDate(now, -1 * DAY),
    },
    {
      id: 'baidu',
      company: '百度',
      position: 'AI 产品经理实习生',
      jobType: 'intern',
      batch: 'daily_intern',
      channel: 'official_site',
      stage: 'interviewing',
      applicationDeadline: null,
      writtenTestDate: shiftDate(now, -9 * DAY),
      interviewDate: shiftDate(now, 50 * HOUR),
      appliedDate: shiftDate(now, -15 * DAY),
      jdText: '负责智能搜索与问答场景的用户问题拆解、需求优先级判断和实验效果复盘。',
      keywords: ['AI', '搜索', '问答', '产品经理'],
      requirements: ['问题定义', '实验分析', '跨团队推进'],
      requiredMaterials: ['resume', 'portfolio', 'transcript', 'certificate'],
      boundMaterialIds: ['resume-ai-pm', 'portfolio-ai', 'transcript', 'cet6', 'internship-proof'],
      contactName: '林一',
      contactInfo: 'pm-interview@baidu.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('baidu-second-round', '准备百度二面：重点复盘搜索 AI 助手案例', '二面窗口在 72 小时内，需要提前沉淀回答结构', 'urgent', 'prepare_interview'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -18 * DAY), 'interested', '关注百度智能搜索 AI 产品岗位'),
        createTimelineEvent(shiftDate(now, -15 * DAY), 'applied', '完成百度投递'),
        createTimelineEvent(shiftDate(now, -9 * DAY), 'written_test', '完成百度产品分析题'),
        createTimelineEvent(shiftDate(now, -3 * DAY), 'interviewing', '通过一面并进入二面准备'),
      ],
      interviewNotes: [
        createInterviewNote(
          '一面',
          shiftDate(now, -3 * DAY),
          ['如何定义 AI 搜索的成功指标', '如何处理幻觉率与召回率的取舍'],
          '一面通过，面试官追问指标拆解，后续需要补充实验设计和灰度策略。',
          'passed',
        ),
      ],
      createdAt: shiftDate(now, -18 * DAY),
      updatedAt: shiftDate(now, -3 * HOUR),
    },
    {
      id: 'ant',
      company: '蚂蚁集团',
      position: 'AI 产品经理实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'campus_talk',
      stage: 'applied',
      applicationDeadline: shiftDate(today, 2 * DAY),
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: shiftDate(now, -6 * DAY),
      jdText: '负责智能风控助手和企业服务 AI 工具的需求梳理、场景验证和产品方案输出。',
      keywords: ['AI', '企业服务', '风控助手', '产品经理'],
      requirements: ['业务抽象', '场景验证', '方案表达'],
      requiredMaterials: ['resume', 'portfolio', 'cover_letter', 'transcript'],
      boundMaterialIds: ['resume-ai-pm', 'portfolio-ai', 'transcript'],
      contactName: '顾晨',
      contactInfo: 'campus@antgroup.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('ant-cover-letter', '为蚂蚁补齐 AI 产品经理求职信', '岗位要求说明业务理解，当前求职信还没有绑定', 'high', 'bind_material'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -9 * DAY), 'interested', '参加蚂蚁 AI 产品宣讲会'),
        createTimelineEvent(shiftDate(now, -6 * DAY), 'applied', '完成蚂蚁投递'),
      ],
      interviewNotes: [],
      createdAt: shiftDate(now, -9 * DAY),
      updatedAt: shiftDate(now, -1 * DAY),
    },
    {
      id: 'bilibili',
      company: 'B站',
      position: 'AI 产品经理实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'shixiseng',
      stage: 'to_apply',
      applicationDeadline: shiftDate(today, 3 * DAY),
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: null,
      jdText: '负责内容社区 AI 创作工具的用户需求收集、功能方案和上线效果观察。',
      keywords: ['AI', '内容社区', '创作工具', '产品经理'],
      requirements: ['内容理解', '原型表达', '数据复盘'],
      requiredMaterials: ['resume', 'portfolio', 'cover_letter'],
      boundMaterialIds: ['resume-ai-pm', 'portfolio-ai', 'cover-letter-ai-pm'],
      contactName: null,
      contactInfo: null,
      riskTags: [],
      aiSuggestions: [
        createSuggestion('bilibili-apply', '三天内提交 B站 AI 产品经理申请', '岗位与作品集匹配度高，适合尽快进入投递池', 'medium', 'submit_application'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -2 * DAY), 'interested', '从实习僧发现 B站 AI 产品岗位'),
        createTimelineEvent(shiftDate(now, -1 * DAY), 'to_apply', '已整理 JD，等待最终提交'),
      ],
      interviewNotes: [],
      createdAt: shiftDate(now, -2 * DAY),
      updatedAt: shiftDate(now, -1 * DAY),
    },
    {
      id: 'tme',
      company: '腾讯音乐',
      position: 'AI 音乐产品经理实习生',
      jobType: 'intern',
      batch: 'daily_intern',
      channel: 'referral',
      stage: 'offer',
      applicationDeadline: null,
      writtenTestDate: null,
      interviewDate: shiftDate(now, -5 * DAY),
      appliedDate: shiftDate(now, -16 * DAY),
      jdText: '负责 AI 音乐推荐、歌单生成和创作辅助场景的用户需求拆解。',
      keywords: ['AI', '音乐产品', '推荐', '产品经理'],
      requirements: ['内容产品理解', '推荐策略意识', '用户洞察'],
      requiredMaterials: ['resume', 'portfolio', 'transcript', 'certificate'],
      boundMaterialIds: ['resume-ai-pm', 'portfolio-ai', 'transcript', 'cet6', 'internship-proof'],
      contactName: '沈诺',
      contactInfo: 'offer@tme.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('tme-offer-compare', '对比腾讯音乐 Offer 与网易 Offer 的成长空间', '当前已有多个正向结果，需要进入选择和谈判阶段', 'high', 'follow_up'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -18 * DAY), 'interested', '通过内推关注腾讯音乐 AI 音乐产品岗位'),
        createTimelineEvent(shiftDate(now, -16 * DAY), 'applied', '完成腾讯音乐投递'),
        createTimelineEvent(shiftDate(now, -5 * DAY), 'interviewing', '完成腾讯音乐终面'),
        createTimelineEvent(shiftDate(now, -1 * DAY), 'offer', '收到腾讯音乐 Offer'),
      ],
      interviewNotes: [
        createInterviewNote(
          '终面',
          shiftDate(now, -5 * DAY),
          ['如何设计 AI 歌单生成的冷启动体验', '如何判断生成结果是否满足用户情绪场景'],
          '终面反馈较好，回答中“场景-指标-策略”链路清晰，可以沉淀为后续 AI 内容产品案例。',
          'passed',
        ),
      ],
      createdAt: shiftDate(now, -18 * DAY),
      updatedAt: shiftDate(now, -1 * DAY),
    },
    {
      id: 'mihoyo',
      company: '米哈游',
      position: 'AI 互动产品经理实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'nowcoder',
      stage: 'written_test',
      applicationDeadline: null,
      writtenTestDate: tomorrowAt(now, 19).toISOString(),
      interviewDate: null,
      appliedDate: shiftDate(now, -5 * DAY),
      jdText: '负责 AI 互动角色、剧情辅助和玩家体验工具的需求分析与方案推进。',
      keywords: ['AI', '互动体验', '产品经理', '游戏'],
      requirements: ['用户体验判断', 'AI 场景拆解', '文档表达'],
      requiredMaterials: ['resume', 'portfolio', 'transcript', 'certificate'],
      boundMaterialIds: ['resume-ai-pm', 'case-ai-assistant', 'transcript'],
      contactName: '苏禾',
      contactInfo: 'campus@mihoyo.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('mihoyo-test', '明晚前完成米哈游笔试准备', '笔试时间已确定，需要补齐 AI 互动体验拆解模板', 'urgent', 'take_test'),
        createSuggestion('mihoyo-certificate', '补充英语证书或实习证明到米哈游材料', '当前证书类材料还没有绑定到该岗位', 'medium', 'bind_material'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -8 * DAY), 'interested', '关注米哈游 AI 互动产品岗位'),
        createTimelineEvent(shiftDate(now, -5 * DAY), 'applied', '完成米哈游投递'),
        createTimelineEvent(shiftDate(now, -1 * DAY), 'written_test', '收到明晚笔试通知'),
      ],
      interviewNotes: [],
      createdAt: shiftDate(now, -8 * DAY),
      updatedAt: shiftDate(now, -1 * DAY),
    },
  ];

  return baseJobs.map((job) => ({
    ...job,
    riskTags: generateRiskTags(job, materials, now),
  }));
}

export function createParsedJDJob(now: Date = new Date(), id?: string): Job {
  const materials = createMockMaterials(now);
  const createdAt = now.toISOString();
  const updatedAt = createdAt;
  const applicationDeadline = new Date(now.getTime() + 3 * DAY).toISOString();

  const job: Job = {
    id: id ?? createParsedJDJobId(now),
    company: 'B站',
    position: 'AI 产品实习生',
    jobType: 'intern',
    batch: 'summer_intern',
    channel: 'official_site',
    stage: 'to_apply',
    applicationDeadline,
    writtenTestDate: null,
    interviewDate: null,
    appliedDate: null,
    jdText: sampleJD,
    keywords: ['推荐系统', '内容社区', '用户增长'],
    requirements: ['熟悉内容产品流程', '能整理需求和方案', '有 AI 产品作品更好'],
    requiredMaterials: ['resume', 'portfolio'],
    boundMaterialIds: ['resume-pm'],
    contactName: null,
    contactInfo: null,
    riskTags: [],
    aiSuggestions: [
      createSuggestion(
        'bilibili-jd-next-step',
        '保存到看板后补齐 AI 产品作品集',
        '当前是待投递状态，先把作品集和岗位材料对齐，再推进申请更稳。',
        'high',
        'bind_material',
      ),
    ],
    timeline: [createTimelineEvent(createdAt, 'to_apply', 'JD 解析生成待投递岗位')],
    interviewNotes: [],
    createdAt,
    updatedAt,
  };

  return {
    ...job,
    riskTags: generateRiskTags(job, materials, now),
  };
}
