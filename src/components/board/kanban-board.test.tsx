import React from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { JobFindProvider } from "../../hooks/use-jobfind-store";
import { createMockJobs } from "../../lib/mock-data";
import { KanbanBoard } from "./kanban-board";

describe("KanbanBoard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the ten campus-recruiting stages in order with seeded job counts", () => {
    render(
      <JobFindProvider>
        <KanbanBoard />
      </JobFindProvider>,
    );

    expect(screen.getByRole("heading", { name: "待投递" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "已投递" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "测评" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "笔试" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "一面" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "二面" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "三面" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "HR面" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "录用" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "已淘汰" })).toBeInTheDocument();

    const jobs = createMockJobs();
    expect(screen.getAllByTestId("job-card")).toHaveLength(jobs.length);

    for (const stage of ["to_apply", "applied", "assessment", "written_test", "first_interview", "second_interview", "third_interview", "hr_interview", "offer", "rejected"] as const) {
      expect(within(screen.getByTestId(`kanban-column-${stage}`)).getByTestId(`kanban-count-${stage}`)).toHaveTextContent(
        String(jobs.filter((job) => job.stage === stage).length),
      );
    }
  });
});
