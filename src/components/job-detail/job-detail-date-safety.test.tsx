import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobFindProvider } from "@/hooks/use-jobfind-store";

import { createMockJobs } from "../../lib/mock-data";
import { JobInterviewNotes } from "./job-interview-notes";
import { JobTimeline } from "./job-timeline";

describe("job detail date safety", () => {
  it("renders a fallback when a timeline entry has an invalid date", () => {
    const job = {
      ...createMockJobs()[0],
      timeline: [
        {
          date: "not-a-real-date",
          stage: "applied" as const,
          description: "Submitted application",
        },
      ],
    };

    render(<JobTimeline job={job} />);

    expect(screen.getByText("日期待确认")).toBeInTheDocument();
  });

  it("renders a fallback when an interview note has an invalid date", () => {
    const job = {
      ...createMockJobs()[0],
      interviewNotes: [
        {
          round: "First round",
          date: "still-not-a-date",
          questions: ["Tell me about yourself"],
          reflection: "Need to prepare better",
          result: "pending" as const,
        },
      ],
    };

    render(
      <JobFindProvider>
        <JobInterviewNotes job={job} />
      </JobFindProvider>,
    );

    expect(screen.getByText("日期待确认")).toBeInTheDocument();
  });
});
