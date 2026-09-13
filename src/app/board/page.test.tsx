import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import BoardPage from "./page";
import { JobFindProvider, useJobfindStore } from "../../hooks/use-jobfind-store";

function SelectedJobProbe() {
  const { selectedJobId } = useJobfindStore();

  return <output data-testid="selected-job-id">{selectedJobId ?? "none"}</output>;
}

function renderBoardPage() {
  return render(
    <JobFindProvider>
      <SelectedJobProbe />
      <BoardPage />
    </JobFindProvider>,
  );
}

function getJobCard(company: string, stage: string) {
  const column = screen.getByTestId(`kanban-column-${stage}`);
  const card = within(column).getAllByTestId("job-card").find((candidate) => candidate.textContent?.includes(company));

  if (!card) {
    throw new Error(`Expected a ${company} job card in ${stage}.`);
  }

  return card;
}

describe("BoardPage job detail sheet", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens Tencent detail sheet with Agent workspace as the first default tab", async () => {
    renderBoardPage();

    fireEvent.click(getJobCard("腾讯", "applied"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(tabs).toEqual(["Agent 作战台", "基本信息", "材料", "时间线", "面试复盘"]);
    expect(screen.getByRole("tab", { name: "Agent 作战台", selected: true })).toBeInTheDocument();

    const agentPanel = screen.getByRole("tabpanel", { name: "Agent 作战台" });
    expect(agentPanel).toHaveTextContent("Agent 岗位快照");
    expect(agentPanel).toHaveTextContent("腾讯 · AI 产品实习生 · 已投递");
    expect(agentPanel).toHaveTextContent("Agent 判断");
    expect(screen.getByText("Agent 会先判断风险和下一步，你再确认是否推进。")).toBeInTheDocument();
  });

  it("shows missing Tencent portfolio material and confirmable AI suggestions", async () => {
    renderBoardPage();

    fireEvent.click(getJobCard("腾讯", "applied"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByRole("tab", { name: "材料" }));
    fireEvent.click(screen.getByRole("tab", { name: "材料" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "材料", selected: true })).toBeInTheDocument();
    });
    const materialPanel = screen.getByRole("tabpanel", { name: "材料" });
    expect(materialPanel).toHaveTextContent("材料完成度");
    expect(materialPanel).toHaveTextContent("作品集");
    expect(materialPanel).toHaveTextContent("还缺：");

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Agent 作战台" }));
    fireEvent.click(screen.getByRole("tab", { name: "Agent 作战台" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Agent 作战台", selected: true })).toBeInTheDocument();
    });
    const aiPanel = screen.getByRole("tabpanel", { name: "Agent 作战台" });
    expect(aiPanel).toHaveTextContent("Agent 判断");
    expect(aiPanel).toHaveTextContent("为什么现在重要");
    expect(aiPanel).toHaveTextContent("下一步建议");
    expect(aiPanel).toHaveTextContent("可展开帮助");
    expect(aiPanel).toHaveTextContent("查看排序依据");
    expect(aiPanel).toHaveTextContent("查看材料补齐建议");
    expect(aiPanel).toHaveTextContent("材料补齐建议");
    expect(within(aiPanel).getAllByRole("button", { name: "确认这一步" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Agent 风险").length).toBeGreaterThan(0);
  });

  it("only shows forward progression actions for the current stage", async () => {
    renderBoardPage();

    fireEvent.click(getJobCard("腾讯", "applied"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "推进到 测评" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "调整阶段" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "调整阶段" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "标记淘汰" })).toBeInTheDocument();
  });

  it("clears the selected job when the sheet closes", async () => {
    renderBoardPage();

    fireEvent.click(getJobCard("腾讯", "applied"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "关闭详情" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("selected-job-id")).toHaveTextContent("none");
  });

  it.each([
    ["网易", "录用"],
    ["京东", "已淘汰"],
  ])("lets a %s job in the %s stage be deleted after confirmation", async (company, stage) => {
    renderBoardPage();

    fireEvent.click(getJobCard(company, stage === "录用" ? "offer" : "rejected"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByRole("dialog")).toHaveTextContent(stage);

    fireEvent.click(screen.getByRole("button", { name: "删除该岗位" }));

    expect(screen.getByRole("heading", { name: new RegExp(`删除「${company}`) })).toBeInTheDocument();
    expect(screen.getByText(/此操作无法恢复/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(getJobCard(company, stage === "录用" ? "offer" : "rejected")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "删除该岗位" }));
    fireEvent.click(screen.getByRole("button", { name: "删除岗位" }));

    await waitFor(() => {
      expect(
        within(screen.getByTestId(`kanban-column-${stage === "录用" ? "offer" : "rejected"}`)).queryAllByTestId("job-card").some(
          (card) => card.textContent?.includes(company),
        ),
      ).toBe(false);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("adds a new interview note from the detail sheet", async () => {
    renderBoardPage();

    fireEvent.click(getJobCard("腾讯", "applied"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByRole("tab", { name: "面试复盘" }));
    fireEvent.click(screen.getByRole("tab", { name: "面试复盘" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "面试复盘", selected: true })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "编辑" }));

    fireEvent.change(screen.getByPlaceholderText("轮次，例如一面"), {
      target: { value: "一面" },
    });
    fireEvent.change(screen.getByLabelText("面试日期"), {
      target: { value: "2026-04-19" },
    });
    fireEvent.change(screen.getByPlaceholderText("高频问题，每行一条"), {
      target: { value: "为什么想做 AI 产品\n你最满意的项目是什么" },
    });
    fireEvent.change(screen.getByPlaceholderText("复盘"), {
      target: { value: "表达还可以，但案例结果讲得不够具体。" },
    });
    fireEvent.change(screen.getByLabelText("结果"), {
      target: { value: "pending" },
    });

    fireEvent.click(screen.getByRole("button", { name: "添加复盘" }));

    const notesPanel = screen.getByRole("tabpanel", { name: "面试复盘" });
    expect(notesPanel).toHaveTextContent("一面");
    expect(notesPanel).toHaveTextContent("为什么想做 AI 产品");
    expect(notesPanel).toHaveTextContent("表达还可以，但案例结果讲得不够具体。");
    expect(notesPanel).toHaveTextContent("待定");
  });

  it("validates, previews, and saves the user-provided Tencent JD instead of a mock job", async () => {
    renderBoardPage();
    const toApplyColumn = screen.getByTestId("kanban-column-to_apply");
    const initialToApplyCardCount = within(toApplyColumn).getAllByTestId("job-card").length;

    fireEvent.click(screen.getByRole("button", { name: "导入 JD 添加岗位" }));

    expect(screen.getByLabelText("公司")).toHaveValue("");
    expect(screen.getByLabelText("岗位名称")).toHaveValue("");
    expect(screen.getByLabelText("JD 正文")).toHaveValue("");

    fireEvent.click(screen.getByRole("button", { name: "整理并预览" }));
    expect(screen.getByText("请填写公司名称。")).toBeInTheDocument();
    expect(screen.getByText("请填写岗位名称。")).toBeInTheDocument();
    expect(screen.getByText("请粘贴岗位描述。")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("公司"), { target: { value: "腾讯" } });
    fireEvent.change(screen.getByLabelText("岗位名称"), { target: { value: "AI 产品经理" } });
    expect(screen.queryByPlaceholderText("yyyy/mm/dd")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("截止年份"), { target: { value: "2027" } });
    fireEvent.change(screen.getByLabelText("截止月份"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("截止日期"), { target: { value: "1" } });
    expect(screen.getByRole("button", { name: "选择申请截止日期" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("JD 正文"), {
      target: { value: "岗位要求：熟悉大模型、LLM、Agent、RAG、多模态和 A/B测试；有产品项目或 AI 应用原型经验。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整理并预览" }));

    expect(screen.getByText("根据 JD 整理的建议")).toBeInTheDocument();
    expect(screen.getByDisplayValue("腾讯")).toBeInTheDocument();
    expect(screen.getByDisplayValue("AI 产品经理")).toBeInTheDocument();
    expect(screen.getByText("LLM")).toBeInTheDocument();
    expect(screen.getByText("Agent")).toBeInTheDocument();
    expect(screen.getByLabelText("作品集 / 项目材料")).toBeChecked();
    expect(within(screen.getByRole("dialog")).queryByText("B站")).not.toBeInTheDocument();
    expect(screen.queryByText(/DDL：/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "保存到看板" }));

    await waitFor(() => {
      expect(within(toApplyColumn).getAllByTestId("job-card")).toHaveLength(initialToApplyCardCount + 1);
    });
    expect(within(toApplyColumn).getByText("腾讯")).toBeInTheDocument();
    expect(within(toApplyColumn).getByText("AI 产品经理")).toBeInTheDocument();
    expect(screen.getByTestId("selected-job-id")).not.toHaveTextContent("none");

    await waitFor(() => {
      const jobs = JSON.parse(localStorage.getItem("jobfind.jobs") ?? "[]") as Array<{ company: string; position: string; applicationDeadline: string | null }>;
      const createdJob = jobs.find((job) => job.company === "腾讯" && job.position === "AI 产品经理");
      expect(createdJob).toBeDefined();
      expect(createdJob?.applicationDeadline).not.toBeNull();
      expect(new Date(createdJob!.applicationDeadline!).getFullYear()).toBe(2027);
      expect(new Date(createdJob!.applicationDeadline!).getMonth()).toBe(9);
      expect(new Date(createdJob!.applicationDeadline!).getDate()).toBe(1);
    });
  });
});
