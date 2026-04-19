import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { JobFindProvider } from "@/hooks/use-jobfind-store";

import { TodayTasks } from "./today-tasks";

describe("TodayTasks", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("surfaces an Agent explanation above the task list", () => {
    render(
      <JobFindProvider>
        <TodayTasks />
      </JobFindProvider>,
    );

    expect(screen.getByRole("heading", { name: "Agent 今日指挥" })).toBeInTheDocument();
    expect(
      screen.getByText("JobFind-Agent 已按风险和时间窗口排好今日优先级，先处理最容易影响结果的动作！"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Agent 判断：为什么现在先做这件事：字节跳动 AI 产品经理实习生已经进入临近面试窗口，准备质量会直接影响下一轮。",
      ),
    ).toBeInTheDocument();
    expect(screen.getByAltText("JobFind Agent")).toHaveAttribute("src", "/agent/agent-logo.png");
    expect(screen.queryByText("晨间 brief 已生成，先处理最影响结果的动作。")).not.toBeInTheDocument();
  });
});
