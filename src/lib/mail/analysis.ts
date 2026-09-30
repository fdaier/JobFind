export type MailCategory = "assessment" | "written_test" | "interview" | "offer" | "rejection" | "application" | "recruitment_other" | "other";

export interface MailObservation {
  uid: number;
  date: string | null;
  sender: string;
  senderDomain: string;
  subject: string;
  category: MailCategory;
  snippet: string;
}

const RECRUITMENT = /招聘|应聘|职位|岗位|校招|秋招|春招|实习|投递|申请职位|申请岗位|候选人|人才|测评|笔试|面试|录用|offer|求职|入职|简历|感谢.*申请/i;

export function classifyMail(subject: string, body: string): MailCategory {
  const combined = `${subject}\n${body.slice(0, 5000)}`;
  if (/很遗憾|未通过|不予录用|未能进入|不再继续|未被选中|申请未成功|淘汰/i.test(combined)) return "rejection";
  if (/录用通知|发放.{0,8}offer|恭喜.{0,16}录用|正式.{0,8}offer/i.test(combined)) return "offer";
  if (/测评|在线测试|能力测试|性格测试|人才测评|assessment/i.test(combined)) return "assessment";
  if (/笔试|在线考试|机考|written test/i.test(combined)) return "written_test";
  if (/面试|面谈|面邀|interview/i.test(combined)) return "interview";
  if (/投递成功|申请成功|收到.{0,12}简历|简历已收|申请已提交/i.test(combined)) return "application";
  return RECRUITMENT.test(combined) ? "recruitment_other" : "other";
}

export function senderDomain(address: string): string {
  return address.trim().toLowerCase().split("@")[1]?.replace(/[^a-z0-9.-]/g, "") ?? "";
}

export function sanitizeSnippet(text: string): string {
  return text.replace(/https?:\/\/\S+/gi, "[链接]").replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, "[邮箱]")
    .replace(/\b1[3-9]\d{9}\b/g, "[手机号]").replace(/\s+/g, " ").trim().slice(0, 180);
}
