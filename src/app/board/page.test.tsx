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
    expect(aiPanel).toHaveTextContent("Action");
    expect(aiPanel).toHaveTextContent("Reason");
    expect(aiPanel).toHaveTextContent("Priority");
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
});
