import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the JobFind label, title, description, and action", () => {
    render(
      <PageHeader
        title="今日作战台"
        description="把今天的申请节奏排清楚。"
        action={<button type="button">新建任务</button>}
      />,
    );

    expect(screen.getByText("JobFind")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "今日作战台" })).toBeInTheDocument();
    expect(screen.getByText("把今天的申请节奏排清楚。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新建任务" })).toBeInTheDocument();
  });
});
