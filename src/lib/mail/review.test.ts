import { describe, expect, it } from "vitest";
import type { Job } from "@/lib/types";
import { createMockJobs } from "@/lib/mock-data";
import { createSeedCompanies } from "@/lib/company-pool";
import { buildReviewItems, stageCanAdvance, stageFromMail, type ReviewMail } from "./review";

const base = createMockJobs(new Date("2026-09-01T00:00:00Z"))[0];
const job: Job = { ...base, id: "user-jd-ai-pm", company: "京东", position: "AI产品经理", stage: "applied" };
const mail: ReviewMail = { uidValidity: "1", uid: 10, date: "2026-09-20T00:00:00Z", sender: "noreply@jd.com", senderDomain: "jd.com", subject: "【京东】AI产品经理在线笔试邀请", snippet: "请参加京东 AI产品经理在线笔试", evidence: "邀请您参加在线笔试", category: "written_test" };

describe("mail review", () => {
  it("preselects only a unique company-and-position match", () => {
    expect(buildReviewItems([mail], [job], createSeedCompanies(), [])[0]).toMatchObject({ lane: "ready", suggestedJobId: job.id, suggestedStage: "written_test" });
    expect(buildReviewItems([mail], [{ ...job, id: "second" }, job], createSeedCompanies(), [])[0].lane).toBe("uncertain");
  });
  it("keeps relevant but ambiguous mail visible", () => {
    const item = buildReviewItems([{ ...mail, category: "recruitment_other", subject: "京东宣讲会" }], [job], createSeedCompanies(), [])[0];
    expect(item.lane).toBe("uncertain");
    expect(item.suggestedStage).toBeNull();
  });
  it("keeps unclassified mail visible without guessing a stage or matching a job", () => {
    const item = buildReviewItems([{ ...mail, category: "other", subject: "您的消息", snippet: "", evidence: "" }], [job], createSeedCompanies(), [])[0];
    expect(item).toMatchObject({ lane: "uncertain", suggestedJobId: null, suggestedStage: null, reason: expect.stringContaining("可能与求职无关") });
  });
  it("never treats seeded demo jobs as an automatic match", () => {
    expect(buildReviewItems([mail], [{ ...job, id: "jd" }], createSeedCompanies(), [])[0].suggestedJobId).toBeNull();
  });
  it("does not regress or guess interview round", () => {
    expect(stageCanAdvance("written_test", "assessment")).toBe(false);
    expect(stageCanAdvance("rejected", "offer")).toBe(false);
    expect(stageFromMail({ ...mail, category: "interview", subject: "面试邀请", evidence: "请准时参加面试" })).toBe("first_interview");
    expect(stageFromMail({ ...mail, category: "interview", subject: "第二轮面试邀请" })).toBe("second_interview");
  });
  it("recovers a locally applied suggestion when its server receipt failed", () => {
    const applied = { ...job, stage: "written_test" as const, timeline: [{ date: "2026-09-20T00:00:00Z", stage: "written_test" as const, description: "根据招聘邮件确认", sourceEventId: "1:10" }] };
    expect(buildReviewItems([mail], [applied], createSeedCompanies(), [])[0]).toMatchObject({ suggestedJobId: job.id, lane: "uncertain", reason: expect.stringContaining("回执待同步") });
  });
});
