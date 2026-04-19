"use client";

import React from "react";

import { KanbanBoard } from "@/components/board/kanban-board";
import { JobDetailSheet } from "@/components/job-detail/job-detail-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useJobfindStore } from "@/hooks/use-jobfind-store";

export default function BoardPage() {
  const { setJDParserOpen } = useJobfindStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="申请看板"
        description="按阶段查看岗位，跟着申请进度把待投递、已投递、笔试和面试安排理顺。"
        action={
          <Button type="button" onClick={() => setJDParserOpen(true)}>
            粘贴 JD 添加岗位
          </Button>
        }
      />
      <KanbanBoard />
      <JobDetailSheet />
    </div>
  );
}
