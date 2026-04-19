import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobFindProvider } from "@/hooks/use-jobfind-store";

import MaterialsPage from "./page";

describe("MaterialsPage", () => {
  it("shows Agent material dispatch and material versions", () => {
    render(
      <JobFindProvider>
        <MaterialsPage />
      </JobFindProvider>,
    );

    expect(screen.getByRole("heading", { name: "材料中心" })).toBeInTheDocument();
    expect(screen.getByText(/Agent 会把材料版本、绑定岗位和缺口放在一起看/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent 材料调度" })).toBeInTheDocument();
    expect(screen.getByText(/优先补齐作品集/)).toBeInTheDocument();
    expect(screen.getAllByText("本科成绩单").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/覆盖 8 个岗位/).length).toBeGreaterThan(0);
  });
});
