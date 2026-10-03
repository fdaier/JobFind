import { describe, expect, it } from "vitest";

import { classifyMail, evidenceForMail, sanitizeSnippet } from "./analysis";

describe("mail reconnaissance", () => {
  it("separates recruitment events from ordinary messages", () => {
    expect(classifyMail("腾讯招聘 - 测评邀请", "请于明晚完成测评")).toBe("assessment");
    expect(classifyMail("感谢参与面试", "很遗憾，您未能进入下一轮")).toBe("rejection");
    expect(classifyMail("您的岗位申请已提交", "我们已经收到简历")).toBe("application");
    expect(classifyMail("本月账单", "感谢您的使用")).toBe("other");
  });

  it("uses explicit outcomes and the subject rather than boilerplate keywords", () => {
    expect(classifyMail("【阿里巴巴校园招聘】感谢投递", "很遗憾地通知您，对于此次应聘，我们将不做下一步安排。"))
      .toBe("rejection");
    expect(classifyMail("【快手校园招聘】在线人才测评邀请", "请参加测评。若未通过，流程可能结束。"))
      .toBe("assessment");
    expect(classifyMail("【蚂蚁集团校园招聘在线笔试】", "考试说明也提到人才测评和面试。"))
      .toBe("written_test");
    expect(classifyMail("【滴滴】面试邀请函", "请参加面试。如未通过，请关注其他岗位。"))
      .toBe("interview");
  });

  it("does not mistake campaigns, referrals or surveys for application stages", () => {
    expect(classifyMail("宣讲会报名邀请", "可与面试官交流和投递简历。"))
      .toBe("recruitment_other");
    expect(classifyMail("小红书校园招聘（内推版）", "笔试与面试机会等你来。"))
      .toBe("recruitment_other");
    expect(classifyMail("内部推荐邀请", "请先确认推荐并完成投递。"))
      .toBe("recruitment_other");
    expect(classifyMail("面试体验问卷", "问卷不与面试结果关联。"))
      .toBe("recruitment_other");
  });

  it("recognizes receipts using the real sender wording", () => {
    expect(classifyMail("【滴滴招聘】简历成功投递通知", "您的简历已成功投递。"))
      .toBe("application");
    expect(classifyMail("感谢你投递作业帮 AI 产品经理职位", "您的简历已顺利抵达招聘系统。"))
      .toBe("application");
  });

  it("removes links, email addresses and phone numbers from short evidence", () => {
    expect(sanitizeSnippet("访问 https://example.com/a 联系 me@example.com 或 13812345678"))
      .toBe("访问 [链接] 联系 [邮箱] 或 [手机号]");
    expect(sanitizeSnippet("测评地址 3.cn/333z-6G8，会议号：6aabbf6e8a4d800f90bf9fbd"))
      .toBe("测评地址 [链接]，会议号：[已隐藏]");
  });

  it("shows the decisive sentence rather than a generic greeting", () => {
    expect(evidenceForMail("感谢投递", "同学你好。感谢关注。很遗憾地通知您，本次应聘将不做下一步安排。", "rejection"))
      .toContain("很遗憾地通知您");
  });
});
