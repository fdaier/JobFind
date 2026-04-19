import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobFindProvider, useJobfindStore } from "../../hooks/use-jobfind-store";
import { createMockJobs, createMockMaterials } from "../../lib/mock-data";
import { JobCard } from "./job-card";

function SelectedJobProbe() {
  const { selectedJobId } = useJobfindStore();
  return <output data-testid="selected-job-id">{selectedJobId ?? "none"}</output>;
}

describe("JobCard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows material completeness and risk info and updates the selected job", () => {
    const jobs = createMockJobs();
    const materials = createMockMaterials();
    const tencent = jobs.find((job) => job.id === "tencent");

    expect(tencent).toBeTruthy();

    render(
      <JobFindProvider>
        <SelectedJobProbe />
        <JobCard job={tencent!} materials={materials} />
      </JobFindProvider>,
    );

    expect(screen.getByTestId("job-card")).toBeInTheDocument();
    expect(screen.getByText("材料完成度")).toBeInTheDocument();
    expect(screen.getByText(/%/)).toBeInTheDocument();
    expect(screen.getByText("风险")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("job-card"));

    expect(screen.getByTestId("selected-job-id")).toHaveTextContent("tencent");
  });

  it("does not label an overdue milestone as the next time", () => {
    const materials = createMockMaterials();
    const overdueJob = {
      ...createMockJobs()[0],
      id: "overdue",
      company: "测试公司",
      position: "测试岗位",
      stage: "applied" as const,
      applicationDeadline: "2026-04-18T09:00:00.000Z",
      writtenTestDate: null,
      interviewDate: null,
    };

    render(
      <JobFindProvider>
        <JobCard job={overdueJob} materials={materials} now={new Date("2026-04-19T08:00:00.000Z")} />
      </JobFindProvider>,
    );

    expect(screen.getByText("已过期")).toBeInTheDocument();
    expect(screen.queryByText("关键下一时间")).not.toBeInTheDocument();
  });

  it("uses the current time when now is omitted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-21T08:00:00.000Z"));

    try {
      const materials = createMockMaterials(new Date("2026-04-19T08:00:00.000Z"));
      const overdueJob = {
        ...createMockJobs(new Date("2026-04-19T08:00:00.000Z"))[0],
        id: "default-now-overdue",
        company: "测试公司",
        position: "默认时间岗位",
        stage: "applied" as const,
        applicationDeadline: "2026-04-20T09:00:00.000Z",
        writtenTestDate: null,
        interviewDate: null,
      };

      render(
        <JobFindProvider>
          <JobCard job={overdueJob} materials={materials} />
        </JobFindProvider>,
      );

      expect(screen.getByText("已过期")).toBeInTheDocument();
      expect(screen.queryByText("关键下一时间")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
