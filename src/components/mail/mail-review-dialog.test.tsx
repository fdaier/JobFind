import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMockJobs } from "@/lib/mock-data";
import type { Job } from "@/lib/types";
import type { ReviewItem } from "@/lib/mail/review";
import { MailReviewDialog } from "./mail-review-dialog";

const job: Job = { ...createMockJobs()[0], id: "user-mail-test", company: "京东", position: "AI产品经理", stage: "applied" };
const mail: ReviewItem = {
  id: "1:10",
  mail: { uidValidity: "1", uid: 10, date: "2026-09-20T00:00:00Z", sender: "noreply@jd.com", senderDomain: "jd.com", subject: "京东 AI产品经理笔试邀请", snippet: "请参加笔试", evidence: "邀请您参加笔试", category: "written_test" },
  lane: "ready", suggestedJobId: job.id, suggestedStage: "written_test", reason: "公司和岗位唯一匹配", decision: null,
};

describe("MailReviewDialog", () => {
  it("requires an explicit click before applying a suggested stage", async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    render(<MailReviewDialog open onOpenChange={vi.fn()} initialId={mail.id} items={[mail]} jobs={[job]} busy={false} onApply={onApply} onIgnore={vi.fn()} />);
    expect(screen.getByText("邀请您参加笔试")).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "应用到看板" }));
    await waitFor(() => expect(onApply).toHaveBeenCalledWith(mail, job.id, "written_test", false));
  });

  it("lets an uncertain mail stay visible without changing a job", () => {
    const uncertain: ReviewItem = { ...mail, id: "1:11", mail: { ...mail.mail, uid: 11, subject: "您的消息", category: "other", evidence: "", snippet: "" }, lane: "uncertain", suggestedJobId: null, suggestedStage: null, reason: "可能与求职无关" };
    const onApply = vi.fn();
    const onOpenChange = vi.fn();
    render(<MailReviewDialog open onOpenChange={onOpenChange} initialId={uncertain.id} items={[uncertain]} jobs={[job]} busy={false} onApply={onApply} onIgnore={vi.fn()} />);
    expect(screen.getByText("可能与求职无关")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "应用到看板" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "暂不处理" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onApply).not.toHaveBeenCalled();
  });
});
