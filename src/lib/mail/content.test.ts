import { describe, expect, it } from "vitest";

import { mailBodyText } from "./content";

describe("mailBodyText", () => {
  it("extracts HTML-only recruitment mail", () => {
    expect(mailBodyText(undefined, "<p>请在今晚完成在线测评</p>")).toContain("在线测评");
  });

  it("uses meaningful plain text instead of duplicate HTML", () => {
    const plain = "面试邀请。".repeat(20);
    expect(mailBodyText(plain, "<p>宣传内容</p>")).toBe(plain);
  });

  it("uses HTML when the plain text is only a short stub", () => {
    expect(mailBodyText("新面试", "<p>面试时间：明天上午十点</p>")).toContain("面试时间");
  });
});
