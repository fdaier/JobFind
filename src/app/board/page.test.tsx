import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BoardPage from "./page";
import { JobFindProvider, useJobfindStore } from "../../hooks/use-jobfind-store";
import { sampleJD } from "../../lib/mock-data";

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

describe("BoardPage job detail sheet", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens Tencent detail sheet with five tabs after clicking the card", async () => {
    renderBoardPage();

    fireEvent.click(screen.getByRole("button", { name: /腾讯/ }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByRole("tab", { name: "基本信息" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "时间线" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "材料" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "AI 建议" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "面试复盘" })).toBeInTheDocument();
  });

  it("shows missing Tencent portfolio material and confirmable AI suggestions", async () => {
    renderBoardPage();

    fireEvent.click(screen.getByRole("button", { name: /腾讯/ }));

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
    expect(materialPanel).toHaveTextContent("缺少的材料");

    fireEvent.mouseDown(screen.getByRole("tab", { name: "AI 建议" }));
    fireEvent.click(screen.getByRole("tab", { name: "AI 建议" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "AI 建议", selected: true })).toBeInTheDocument();
    });
    const aiPanel = screen.getByRole("tabpanel", { name: "AI 建议" });
    expect(aiPanel).toHaveTextContent("动作");
    expect(aiPanel).toHaveTextContent("原因");
    expect(aiPanel).toHaveTextContent("优先级");
    expect(within(aiPanel).getAllByRole("button", { name: "确认这一步" }).length).toBeGreaterThan(0);
  });

  it("only shows forward progression actions for the current stage", async () => {
    renderBoardPage();

    fireEvent.click(screen.getByRole("button", { name: /腾讯/ }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: "推进到 关注中" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "推进到 待投递" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "推进到 笔试" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "推进到 面试" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "推进到 录用" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "推进到 已淘汰" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "标记淘汰" })).toBeInTheDocument();
  });

  it("clears the selected job when the sheet closes", async () => {
    renderBoardPage();

    fireEvent.click(screen.getByRole("button", { name: /腾讯/ }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "关闭详情" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("selected-job-id")).toHaveTextContent("none");
  });

  it("opens the JD parser, previews the parsed job, and saves it to the board", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-19T08:00:00.000Z"));

    try {
      renderBoardPage();

      fireEvent.click(screen.getByRole("button", { name: "粘贴 JD 添加岗位" }));

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(screen.getByLabelText("JD")).toHaveValue(sampleJD);

      fireEvent.click(screen.getByRole("button", { name: "解析 JD" }));
      expect(screen.getByText("正在解析 JD")).toBeInTheDocument();
      expect(screen.queryByText("B站")).not.toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      const preview = within(dialog);
      expect(preview.getByText("B站")).toBeInTheDocument();
      expect(preview.getAllByText("AI 产品实习生").length).toBeGreaterThan(0);
      expect(preview.getByText("简历（resume）")).toBeInTheDocument();
      expect(preview.getByText("作品集（portfolio）")).toBeInTheDocument();

      const saveButton = screen.getByRole("button", { name: "保存到看板" });
      await act(async () => {
        fireEvent.click(saveButton);
        fireEvent.click(saveButton);
      });

      expect(screen.queryByLabelText("JD")).not.toBeInTheDocument();

      const toApplyColumn = screen.getByTestId("kanban-column-to_apply");
      expect(within(toApplyColumn).getAllByTestId("job-card")).toHaveLength(2);
      expect(within(toApplyColumn).getByText("B站")).toBeInTheDocument();
      expect(screen.getByTestId("selected-job-id")).not.toHaveTextContent("none");
    } finally {
      vi.useRealTimers();
    }
  });
});
