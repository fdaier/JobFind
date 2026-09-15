"use client";

import React, { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateTimeParts {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

function splitDateTime(value: string): DateTimeParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  return match
    ? { year: match[1], month: match[2], day: match[3], hour: match[4], minute: match[5] }
    : { year: "", month: "", day: "", hour: "", minute: "" };
}

function toDateValue(parts: DateTimeParts): string {
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

function toDateTimeValue(parts: DateTimeParts): string {
  const date = toDateValue(parts);
  if (!date || !/^\d{1,2}$/.test(parts.hour) || !/^\d{1,2}$/.test(parts.minute)) {
    return "";
  }

  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  if (hour > 23 || minute > 59) {
    return "";
  }

  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function digitsOnly(value: string, length: number): string {
  return value.replace(/\D/g, "").slice(0, length);
}

export function DateTimeInput({
  id,
  label,
  ariaLabel,
  value,
  onChange,
}: {
  id: string;
  label: React.ReactNode;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [parts, setParts] = useState<DateTimeParts>(() => splitDateTime(value));
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setParts(splitDateTime(value));
  }, [value]);

  const updatePart = (part: keyof DateTimeParts, nextValue: string) => {
    const nextParts = {
      ...parts,
      [part]: digitsOnly(nextValue, part === "year" ? 4 : 2),
    };
    setParts(nextParts);
    onChange(toDateTimeValue(nextParts));
  };

  const updateDateFromPicker = (nextDate: string) => {
    const dateParts = splitDateTime(`${nextDate}T00:00`);
    const nextParts = { ...parts, year: dateParts.year, month: dateParts.month, day: dateParts.day };
    setParts(nextParts);
    onChange(toDateTimeValue(nextParts));
  };

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") {
      picker.showPicker();
      return;
    }
    picker.focus();
    picker.click();
  };

  const dateValue = toDateValue(parts);

  return (
    <div className="space-y-2">
      <label id={`${id}-label`} className="text-sm font-medium text-slate-800">{label}</label>
      <div role="group" aria-labelledby={`${id}-label`} className="flex flex-wrap items-center gap-2">
        <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white/70 px-1 shadow-sm transition-[border-color,box-shadow] focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/10">
          <Input id={`${id}-year`} aria-label={`${ariaLabel}年份`} inputMode="numeric" autoComplete="off" maxLength={4} value={parts.year} onChange={(event) => updatePart("year", event.target.value)} placeholder="年" className="h-8 w-16 !border-0 bg-transparent px-1 text-center tabular-nums shadow-none focus-visible:ring-0" />
          <span aria-hidden="true" className="select-none text-sm text-slate-300">—</span>
          <Input id={`${id}-month`} aria-label={`${ariaLabel}月份`} inputMode="numeric" autoComplete="off" maxLength={2} value={parts.month} onChange={(event) => updatePart("month", event.target.value)} placeholder="月" className="h-8 w-10 !border-0 bg-transparent px-1 text-center tabular-nums shadow-none focus-visible:ring-0" />
          <span aria-hidden="true" className="select-none text-sm text-slate-300">—</span>
          <Input id={`${id}-day`} aria-label={`${ariaLabel}日期`} inputMode="numeric" autoComplete="off" maxLength={2} value={parts.day} onChange={(event) => updatePart("day", event.target.value)} placeholder="日" className="h-8 w-10 !border-0 bg-transparent px-1 text-center tabular-nums shadow-none focus-visible:ring-0" />
        </div>
        <Button type="button" variant="outline" size="icon-sm" aria-label={`选择${ariaLabel}日期`} onClick={openPicker} className="size-10 rounded-lg border-slate-200 bg-white/70 text-slate-600 shadow-sm hover:bg-white hover:text-slate-950"><CalendarDays className="size-4" /></Button>
        <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white/70 px-1 shadow-sm transition-[border-color,box-shadow] focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/10">
          <Input id={`${id}-hour`} aria-label={`${ariaLabel}小时`} inputMode="numeric" autoComplete="off" maxLength={2} value={parts.hour} onChange={(event) => updatePart("hour", event.target.value)} placeholder="时" className="h-8 w-10 !border-0 bg-transparent px-1 text-center tabular-nums shadow-none focus-visible:ring-0" />
          <span aria-hidden="true" className="select-none text-sm text-slate-300">:</span>
          <Input id={`${id}-minute`} aria-label={`${ariaLabel}分钟`} inputMode="numeric" autoComplete="off" maxLength={2} value={parts.minute} onChange={(event) => updatePart("minute", event.target.value)} placeholder="分" className="h-8 w-10 !border-0 bg-transparent px-1 text-center tabular-nums shadow-none focus-visible:ring-0" />
        </div>
        <input ref={pickerRef} type="date" tabIndex={-1} aria-hidden="true" value={dateValue} onChange={(event) => updateDateFromPicker(event.target.value)} className="sr-only" />
      </div>
    </div>
  );
}
