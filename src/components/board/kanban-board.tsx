"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { useJobfindStore } from "../../hooks/use-jobfind-store";
import { JOB_STAGE_LABELS, JOB_STAGE_ORDER } from "../../lib/job-stages";
import type { JobStage } from "../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { type BoardFilter, type BoardSort, matchesBoardFilter, matchesBoardQuery, sortBoardJobs } from "./board-view";
import { KanbanColumn } from "./kanban-column";

const STAGES: Array<{ stage: JobStage; title: string }> = JOB_STAGE_ORDER.map((stage) => ({ stage, title: JOB_STAGE_LABELS[stage] }));

export function KanbanBoard() {
  const { jobs, materials } = useJobfindStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BoardFilter>("all");
  const [sort, setSort] = useState<BoardSort>("priority");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape" && query) {
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query]);

  const jobsByStage = useMemo(() => {
    const grouped = new Map<JobStage, typeof jobs>();
    for (const { stage } of STAGES) {
      grouped.set(stage, []);
    }

    for (const job of jobs) {
      grouped.get(job.stage)?.push(job);
    }

    return grouped;
  }, [jobs]);

  const visibleJobsByStage = useMemo(() => {
    const grouped = new Map<JobStage, typeof jobs>();
    for (const { stage } of STAGES) {
      const stageJobs = jobsByStage.get(stage) ?? [];
      const matched = stageJobs.filter(
        (job) => matchesBoardQuery(job, query) && matchesBoardFilter(job, filter, materials, now),
      );
      grouped.set(stage, sortBoardJobs(matched, sort, materials, now));
    }
    return grouped;
  }, [filter, jobsByStage, materials, now, query, sort]);

  const visibleCount = useMemo(
    () => Array.from(visibleJobsByStage.values()).reduce((count, stageJobs) => count + stageJobs.length, 0),
    [visibleJobsByStage],
  );
  const hasActiveView = Boolean(query.trim()) || filter !== "all";

  return (
    <section aria-label="申请看板" className="space-y-3">
      <div className="editorial-panel flex flex-col gap-3 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={searchInputRef}
              aria-label="搜索公司、岗位或备注"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("");
              }}
              placeholder="搜索公司、岗位或备注"
              className="h-10 border-white/60 bg-white/45 pl-9 pr-10 shadow-none focus-visible:bg-white/70"
            />
            {query ? (
              <Button type="button" variant="ghost" size="icon-xs" aria-label="清除搜索" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                <X className="size-3.5" />
              </Button>
            ) : null}
          </div>

          <div role="group" aria-label="岗位筛选" className="flex w-full rounded-lg border border-white/60 bg-white/30 p-1 xl:w-auto">
            {([
              ["all", "全部"],
              ["attention", "需要处理"],
              ["milestone", "有关键时间"],
            ] as const).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={filter === value ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(value)}
                className={filter === value ? "flex-1 rounded-md bg-slate-950 shadow-none hover:bg-slate-800 xl:flex-none" : "flex-1 rounded-md text-slate-600 hover:bg-white/60 hover:text-slate-950 xl:flex-none"}
              >
                {label}
              </Button>
            ))}
          </div>

          <select
            aria-label="排序方式"
            value={sort}
            onChange={(event) => setSort(event.target.value as BoardSort)}
            className="h-10 rounded-lg border border-white/60 bg-white/45 px-3 text-sm text-slate-700 shadow-none outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="priority">优先处理</option>
            <option value="updated">最近更新</option>
            <option value="company">公司名</option>
          </select>
        </div>
        <p aria-live="polite" className="text-xs text-slate-500">
          {hasActiveView ? `当前显示 ${visibleCount} / ${jobs.length} 个岗位` : `共 ${jobs.length} 个岗位`}
          <span className="ml-2 text-slate-400">按 / 可快速搜索</span>
        </p>
      </div>

      <div className="editorial-panel w-full rounded-lg p-3">
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-color:#b7c0cc_transparent]">
        {STAGES.map(({ stage, title }) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            title={title}
            jobs={visibleJobsByStage.get(stage) ?? []}
            totalJobs={jobsByStage.get(stage) ?? []}
            hasActiveView={hasActiveView}
            materials={materials}
          />
        ))}
      </div>
      </div>
    </section>
  );
}
