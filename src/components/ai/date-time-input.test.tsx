import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateTimeInput } from "./date-time-input";

describe("DateTimeInput", () => {
  it("uses explicit date and time fields and emits a complete local date-time value", () => {
    const onChange = vi.fn();
    render(<DateTimeInput id="assessment" label="测评截止时间" ariaLabel="测评截止时间" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("测评截止时间年份"), { target: { value: "2026" } });
    fireEvent.change(screen.getByLabelText("测评截止时间月份"), { target: { value: "9" } });
    fireEvent.change(screen.getByLabelText("测评截止时间日期"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText("测评截止时间小时"), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText("测评截止时间分钟"), { target: { value: "30" } });

    expect(onChange).toHaveBeenLastCalledWith("2026-09-15T20:30");
    expect(screen.getByRole("button", { name: "选择测评截止时间日期" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("yyyy/mm/dd")).not.toBeInTheDocument();
  });

  it("renders existing date-time values back into the same fields", () => {
    render(<DateTimeInput id="interview" label="面试时间" ariaLabel="面试时间" value="2026-09-16T09:05" onChange={vi.fn()} />);

    expect(screen.getByLabelText("面试时间年份")).toHaveValue("2026");
    expect(screen.getByLabelText("面试时间月份")).toHaveValue("09");
    expect(screen.getByLabelText("面试时间日期")).toHaveValue("16");
    expect(screen.getByLabelText("面试时间小时")).toHaveValue("09");
    expect(screen.getByLabelText("面试时间分钟")).toHaveValue("05");
  });
});
