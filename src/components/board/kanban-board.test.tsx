import React from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { JobFindProvider } from "../../hooks/use-jobfind-store";
import { KanbanBoard } from "./kanban-board";

describe("KanbanBoard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the seven stages in order with the seeded job counts", () => {
    render(
      <JobFindProvider>
        <KanbanBoard />
      </JobFindProvider>,
    );

    expect(screen.getByRole("heading", { name: "关注中" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "待投递" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "已投递" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "笔试" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "面试" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "录用" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "已淘汰" })).toBeInTheDocument();

    expect(screen.getAllByTestId("job-card")).toHaveLength(8);
    expect(within(screen.getByTestId("kanban-column-interested")).getByTestId("kanban-count-interested")).toHaveTextContent("1");
    expect(within(screen.getByTestId("kanban-column-to_apply")).getByTestId("kanban-count-to_apply")).toHaveTextContent("1");
    expect(within(screen.getByTestId("kanban-column-applied")).getByTestId("kanban-count-applied")).toHaveTextContent("2");
    expect(within(screen.getByTestId("kanban-column-written_test")).getByTestId("kanban-count-written_test")).toHaveTextContent("1");
    expect(within(screen.getByTestId("kanban-column-interviewing")).getByTestId("kanban-count-interviewing")).toHaveTextContent("1");
    expect(within(screen.getByTestId("kanban-column-offer")).getByTestId("kanban-count-offer")).toHaveTextContent("1");
    expect(within(screen.getByTestId("kanban-column-rejected")).getByTestId("kanban-count-rejected")).toHaveTextContent("1");
  });
});
