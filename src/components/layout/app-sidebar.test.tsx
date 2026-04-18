import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/board",
}));

import { AppSidebar } from "./app-sidebar";

describe("AppSidebar", () => {
  it("renders the brand and navigation links", () => {
    render(<AppSidebar />);

    expect(screen.getByText("JobFind")).toBeInTheDocument();
    expect(screen.getByText("学生的 AI 求职项目经理")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "今日作战台" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "申请看板" })).toHaveAttribute("href", "/board");
    expect(screen.getByRole("link", { name: "申请看板" })).toHaveAttribute("aria-current", "page");
  });
});
