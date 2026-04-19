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

    expect(screen.getByText(/Agent 判断：为什么现在先做这件事/)).toBeInTheDocument();
  });
});
