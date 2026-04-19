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
    expect(screen.getByText(/Agent 已按风险和时间窗口排好今日优先级/)).toBeInTheDocument();
    expect(screen.getByText(/Agent 判断：为什么现在先做这件事/)).toBeInTheDocument();
  });
});
