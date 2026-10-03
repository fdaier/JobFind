export type MailCategory = "assessment" | "written_test" | "interview" | "offer" | "rejection" | "application" | "recruitment_other" | "other";

export interface MailObservation {
  uid: number;
  date: string | null;
  sender: string;
  senderDomain: string;
  subject: string;
  category: MailCategory;
  snippet: string;
  /** Short, redacted sentence that supports the classification. */
  evidence?: string;
  /** A link is supporting evidence, never proof of a stage by itself. */
  hasLink?: boolean;
}

const RECRUITMENT = /招聘|应聘|职位|岗位|校招|秋招|春招|实习|投递|申请职位|申请岗位|候选人|人才|测评|笔试|面试|录用|offer|求职|入职|简历|感谢.*申请/i;

export function classifyMail(subject: string, body: string): MailCategory {
  const combined = `${subject}\n${body.slice(0, 5000)}`;
  // A rejection can hide behind a neutral subject such as “感谢投递”, but a
  // conditional “若未通过” in an invitation is not a rejection.
  if (/未通过|不予录用|未能进入|未被选中|申请未成功|淘汰/i.test(subject) ||
      /很遗憾地?通知您|很遗憾.{0,30}未能进入|将不做下一步安排|不再继续.{0,20}(招聘|应聘|面试)流程/i.test(body.slice(0, 2500))) return "rejection";
  // Campaigns, referrals and feedback surveys mention interviews/tests in
  // their copy but do not prove that this applicant reached that stage.
  if (/宣讲会|直播|开放日|内推版|内部推荐邀请|诚邀你投递|招聘交流|体验问卷|满意度调研/i.test(subject)) return "recruitment_other";
  if (/录用通知|正式.{0,8}offer|offer letter/i.test(subject)) return "offer";
  if (/测评|在线测试|能力测试|性格测试|assessment/i.test(subject)) return "assessment";
  if (/笔试|在线考试|机考|written test/i.test(subject)) return "written_test";
  if (/面试|面谈|面邀|interview/i.test(subject)) return "interview";
  if (/投递成功|成功投递|申请成功|收到.{0,12}申请|简历已收|申请已提交|感谢你投递|感谢投递/i.test(subject)) return "application";
  if (/恭喜.{0,16}录用|发放.{0,8}offer/i.test(body.slice(0, 1000))) return "offer";
  if (/邀请您?参加.{0,30}(在线)?测评/i.test(body.slice(0, 1000))) return "assessment";
  if (/邀请您?参加.{0,30}(在线)?笔试/i.test(body.slice(0, 1000))) return "written_test";
  if (/邀请您?参加.{0,30}面试/i.test(body.slice(0, 1000))) return "interview";
  if (/简历已(成功)?(提交|投递)|简历已顺利抵达|已经收到您的投递/i.test(body.slice(0, 1000))) return "application";
  return RECRUITMENT.test(combined) ? "recruitment_other" : "other";
}

export function senderDomain(address: string): string {
  return address.trim().toLowerCase().split("@")[1]?.replace(/[^a-z0-9.-]/g, "") ?? "";
}

export function sanitizeSnippet(text: string): string {
  return text.replace(/https?:\/\/[^\s，。；;,]+/gi, "[链接]").replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, "[邮箱]")
    .replace(/\b(?:[\w-]+\.)+[a-z0-9]{2,}\/[^\s，。；;,]+/gi, "[链接]")
    .replace(/\b1[3-9]\d{9}\b/g, "[手机号]")
    .replace(/(会议号|通行证|验证码|密码)\s*[:：]\s*[a-z0-9-]{6,}/gi, "$1：[已隐藏]")
    .replace(/\s+/g, " ").trim().slice(0, 180);
}

const EVIDENCE_PATTERNS: Record<MailCategory, RegExp> = {
  rejection: /很遗憾地?通知您|将不做下一步安排|未能进入|未通过|不予录用/i,
  offer: /录用通知|正式.{0,8}offer|offer letter/i,
  assessment: /邀请.{0,30}(测评|在线测试)|测评截止|测评入口/i,
  written_test: /邀请.{0,30}(笔试|在线考试)|笔试时间|考试入口/i,
  interview: /面试邀请|预约面试|面试时间|参加.{0,20}面试/i,
  application: /投递成功|成功投递|简历已(成功)?(提交|投递)|已经收到.{0,12}(申请|投递)|简历已顺利抵达/i,
  recruitment_other: /招聘|校招|内推|宣讲|开放日|直播/i,
  other: /$^/,
};

export function evidenceForMail(subject: string, body: string, category: MailCategory): string {
  const compact = body.replace(/\s+/g, " ").trim();
  const match = EVIDENCE_PATTERNS[category].exec(compact);
  if (!match) return sanitizeSnippet(subject).slice(0, 160);
  const start = Math.max(0, match.index - 35);
  return sanitizeSnippet(compact.slice(start, match.index + Math.max(match[0].length, 60) + 75)).slice(0, 160);
}
