import { describe, expect, it } from "vitest";

import { classifyMail, sanitizeSnippet } from "./analysis";

describe("mail reconnaissance", () => {
  it("separates recruitment events from ordinary messages", () => {
    expect(classifyMail("腾讯招聘 - 测评邀请", "请于明晚完成测评")).toBe("assessment");
    expect(classifyMail("感谢参与面试", "很遗憾，您未能进入下一轮")).toBe("rejection");
    expect(classifyMail("您的岗位申请已提交", "我们已经收到简历")).toBe("application");
    expect(classifyMail("本月账单", "感谢您的使用")).toBe("other");
  });

  it("removes links, email addresses and phone numbers from short evidence", () => {
    expect(sanitizeSnippet("访问 https://example.com/a 联系 me@example.com 或 13812345678"))
      .toBe("访问 [链接] 联系 [邮箱] 或 [手机号]");
  });
});
