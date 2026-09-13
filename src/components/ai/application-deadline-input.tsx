"use client";

import React, { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateParts {
  year: string;
  month: string;
  day: string;
}

function splitDate(value: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? { year: match[1], month: match[2], day: match[3] } : { year: "", month: "", day: "" };
}

function toDateValue(parts: DateParts): string {
  if (!/^\d{4}$/.test(parts.year) || !/^\d{1,2}$/.test(parts.month) || !/^\d{1,2}$/.test(parts.day)) {
    return "";
  }

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const candidate = new Date(year, month - 1, day);
  if (candidate.getFullYear() !== year || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) {
    return "";
  }

  return `${parts.year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function digitsOnly(value: string, length: number): string {
  return value.replace(/\D/g, "").slice(0, length);
}

export function ApplicationDeadlineInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  const [parts, setParts] = useState<DateParts>(() => splitDate(value));
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setParts(splitDate(value));
  }, [value]);

  const updatePart = (part: keyof DateParts, nextValue: string) => {
    const nextParts = {
      ...parts,
      [part]: digitsOnly(nextValue, part === "year" ? 4 : 2),
    };
    setParts(nextParts);
    onChange(toDateValue(nextParts));
  };

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) {
      return;
    }

    if (typeof picker.showPicker === "function") {
      picker.showPicker();
      return;
    }

    picker.focus();
    picker.click();
  };

  return (
    <div className="space-y-2">
      <label id={`${id}-label`} className="text-sm font-medium text-slate-950">
        {label}
      </label>
      <div role="group" aria-labelledby={`${id}-label`} className="flex items-center gap-2">
        <Input
          id={`${id}-year`}
          aria-label="截止年份"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={parts.year}
          onChange={(event) => updatePart("year", event.target.value)}
          placeholder="年"
          className="w-20 text-center tabular-nums"
        />
        <span aria-hidden="true" className="text-sm text-slate-400">—</span>
        <Input
          id={`${id}-month`}
          aria-label="截止月份"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          value={parts.month}
          onChange={(event) => updatePart("month", event.target.value)}
          placeholder="月"
          className="w-14 text-center tabular-nums"
        />
        <span aria-hidden="true" className="text-sm text-slate-400">—</span>
        <Input
          id={`${id}-day`}
          aria-label="截止日期"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          value={parts.day}
          onChange={(event) => updatePart("day", event.target.value)}
          placeholder="日"
          className="w-14 text-center tabular-nums"
        />
        <Button type="button" variant="ghost" size="icon-sm" aria-label="选择申请截止日期" onClick={openPicker}>
          <CalendarDays className="size-4" />
        </Button>
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="sr-only"
        />
      </div>
    </div>
  );
}
