import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobFindProvider } from "@/hooks/use-jobfind-store";
import ReviewPage from "./page";

describe("ReviewPage", () => {
  it("shows Agent strategy review across channel, memory, and interview notes", () => {
    render(
      <JobFindProvider>
        <ReviewPage />
      </JobFindProvider>,
    );

    expect(screen.getByRole("heading", { name: "复盘中心" })).toBeInTheDocument();
    expect(
      screen.getByText(/Agent 会把阶段、渠道、材料和面试记录沉淀成下一轮投递策略/),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent 策略记忆" })).toBeInTheDocument();
    expect(screen.getByText(/Agent 记忆：渠道策略/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "渠道复盘" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "面试复盘沉淀" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "转化漏斗" })).toBeInTheDocument();
  });
});
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobFindProvider } from "@/hooks/use-jobfind-store";
import ReviewPage from "./page";

describe("ReviewPage", () => {
  it("shows Agent strategy review across channel, memory, and interview notes", () => {
    render(
      <JobFindProvider>
        <ReviewPage />
      </JobFindProvider>,
    );

    expect(screen.getByRole("heading", { name: "复盘中心" })).toBeInTheDocument();
    expect(
      screen.getByText(/Agent 会把阶段、渠道、材料和面试记录沉淀成下一轮投递策略/),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent 策略记忆" })).toBeInTheDocument();
    expect(screen.getByText(/Agent 记忆：渠道策略/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "渠道复盘" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "面试复盘沉淀" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "转化漏斗" })).toBeInTheDocument();
  });
});
