import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

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
});
