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
3. 有产品、运营或相关项目经历优先。

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

export function createMockMaterials(): Material[] {
  const now = new Date();

  return [
    {
      id: 'resume-pm',
      name: '产品经理简历',
      type: 'resume',
      targetDirection: '产品经理',
      version: 'v2.3',
      lastUpdated: shiftDate(now, -2 * DAY),
      boundJobIds: ['tencent', 'bytedance', 'meituan', 'alibaba', 'kuaishou'],
    },
    {
      id: 'resume-ops',
      name: '产品运营简历',
      type: 'resume',
      targetDirection: '产品运营',
      version: 'v1.8',
      lastUpdated: shiftDate(now, -3 * DAY),
      boundJobIds: ['xiaohongshu', 'jd'],
    },
    {
      id: 'portfolio-ai',
      name: 'AI 产品作品集',
      type: 'portfolio',
      targetDirection: 'AI 产品',
      version: 'v1.2',
      lastUpdated: shiftDate(now, -4 * DAY),
      boundJobIds: ['bytedance', 'meituan', 'alibaba', 'kuaishou'],
    },
    {
      id: 'transcript',
      name: '本科成绩单',
      type: 'transcript',
      targetDirection: '通用',
      version: '2025 春',
      lastUpdated: shiftDate(now, -1 * DAY),
      boundJobIds: ['tencent', 'bytedance', 'xiaohongshu', 'meituan', 'alibaba', 'netease', 'jd', 'kuaishou'],
    },
    {
      id: 'portfolio-game',
      name: '游戏策划作品集',
      type: 'portfolio',
      targetDirection: '游戏策划',
      version: 'v1.0',
      lastUpdated: shiftDate(now, -5 * DAY),
      boundJobIds: ['netease'],
    },
    {
      id: 'cet6',
      name: 'CET-6 证书',
      type: 'certificate',
      targetDirection: '通用',
      version: '2025',
      lastUpdated: shiftDate(now, -6 * DAY),
      boundJobIds: ['bytedance', 'xiaohongshu', 'meituan', 'alibaba', 'netease', 'jd', 'kuaishou'],
    },
  ];
}

export function createMockJobs(): Job[] {
  const now = new Date();
  const today = startOfToday(now);
  const materials = createMockMaterials();

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
      position: '产品运营实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'boss',
      stage: 'applied',
      applicationDeadline: null,
      writtenTestDate: null,
      interviewDate: null,
      appliedDate: shiftDate(now, -12 * DAY),
      jdText: '负责产品运营活动协同、内容运营支持和基础数据观察。',
      keywords: ['产品运营', '内容', '社区', '实习'],
      requirements: ['运营感知', '沟通协作', '数据意识'],
      requiredMaterials: ['resume', 'transcript'],
      boundMaterialIds: ['resume-ops', 'transcript'],
      contactName: null,
      contactInfo: null,
      riskTags: [],
      aiSuggestions: [
        createSuggestion('xiaohongshu-followup', '跟进小红书投递反馈', '已投递 12 天但还没有回复', 'high', 'follow_up'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -14 * DAY), 'interested', '关注小红书产品运营实习'),
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
      position: '游戏策划实习生',
      jobType: 'intern',
      batch: 'summer_intern',
      channel: 'nowcoder',
      stage: 'offer',
      applicationDeadline: null,
      writtenTestDate: shiftDate(now, -16 * DAY),
      interviewDate: shiftDate(now, -12 * DAY),
      appliedDate: shiftDate(now, -18 * DAY),
      jdText: '负责游戏系统设计、玩法拆解和策划文档支持。',
      keywords: ['游戏策划', '系统设计', '实习'],
      requirements: ['玩法理解', '文档表达', '协作推进'],
      requiredMaterials: ['resume', 'portfolio', 'transcript'],
      boundMaterialIds: ['resume-pm', 'portfolio-game', 'transcript', 'cet6'],
      contactName: '刘洋',
      contactInfo: 'offer@netease.com',
      riskTags: [],
      aiSuggestions: [
        createSuggestion('netease-decide', '整理网易 Offer 的决策信息', '已经拿到 Offer，进入决策阶段', 'high', 'follow_up'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -20 * DAY), 'interested', '关注网易游戏策划实习岗位'),
        createTimelineEvent(shiftDate(now, -18 * DAY), 'applied', '完成网易投递'),
        createTimelineEvent(shiftDate(now, -12 * DAY), 'interviewing', '完成网易面试'),
        createTimelineEvent(shiftDate(now, -2 * DAY), 'offer', '收到网易 Offer'),
      ],
      interviewNotes: [
        createInterviewNote(
          '终面',
          shiftDate(now, -12 * DAY),
          ['为什么做游戏策划', '如何看待数值与体验平衡'],
          '题目更看重系统理解和表达的完整性。',
          'passed',
        ),
      ],
      createdAt: shiftDate(now, -20 * DAY),
      updatedAt: shiftDate(now, -2 * DAY),
    },
    {
      id: 'jd',
      company: '京东',
      position: '产品运营实习生',
      jobType: 'intern',
      batch: 'spring',
      channel: 'school_career',
      stage: 'rejected',
      applicationDeadline: null,
      writtenTestDate: shiftDate(now, -18 * DAY),
      interviewDate: shiftDate(now, -15 * DAY),
      appliedDate: shiftDate(now, -22 * DAY),
      jdText: '负责产品运营支持、内容维护和活动数据整理。',
      keywords: ['产品运营', '校招', '内容'],
      requirements: ['沟通能力', '数据基础', '执行力'],
      requiredMaterials: ['resume', 'transcript'],
      boundMaterialIds: ['resume-ops', 'transcript', 'cet6'],
      contactName: null,
      contactInfo: null,
      riskTags: [],
      aiSuggestions: [
        createSuggestion('jd-review', '把京东拒绝原因归档到复盘里', '可以作为后续投递策略参考', 'low', 'update_material'),
      ],
      timeline: [
        createTimelineEvent(shiftDate(now, -24 * DAY), 'interested', '关注京东产品运营岗位'),
        createTimelineEvent(shiftDate(now, -22 * DAY), 'applied', '完成京东投递'),
        createTimelineEvent(shiftDate(now, -18 * DAY), 'written_test', '完成京东笔试'),
        createTimelineEvent(shiftDate(now, -15 * DAY), 'interviewing', '完成京东面试'),
        createTimelineEvent(shiftDate(now, -1 * DAY), 'rejected', '收到京东拒绝通知'),
      ],
      interviewNotes: [
        createInterviewNote(
          '一面',
          shiftDate(now, -15 * DAY),
          ['如何做活动复盘', '如何看待留存指标'],
          '问答偏实操，结果最终未通过。',
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
  ];

  return baseJobs.map((job) => ({
    ...job,
    riskTags: generateRiskTags(job, materials, now),
  }));
}
