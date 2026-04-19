"use client";

import React, { useEffect, useMemo, useState } from "react";

import { JobAIPanel } from "@/components/job-detail/job-ai-panel";
import { JobInfoSection } from "@/components/job-detail/job-info-section";
import { JobInterviewNotes } from "@/components/job-detail/job-interview-notes";
import { JobMaterials } from "@/components/job-detail/job-materials";
import { JobTimeline } from "@/components/job-detail/job-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import type { JobStage } from "@/lib/types";

const STAGE_LABELS: Record<JobStage, string> = {
  interested: "关注中",
  to_apply: "待投递",
  applied: "已投递",
  written_test: "笔试",
  interviewing: "面试",
  offer: "录用",
  rejected: "已淘汰",
};

const STAGE_FLOW: JobStage[] = ["to_apply", "applied", "written_test", "interviewing", "offer"];
const STAGE_ORDER: JobStage[] = ["interested", "to_apply", "applied", "written_test", "interviewing", "offer", "rejected"];

export function JobDetailSheet() {
  const { selectedJob, selectedJobId, setSelectedJobId, materials, advanceJobStage } = useJobfindStore();
  const [tabValue, setTabValue] = useState("info");

  useEffect(() => {
    if (selectedJobId) {
      setTabValue("info");
    }
  }, [selectedJobId]);

  const canAdvanceStages = useMemo(() => {
    if (!selectedJob) {
      return [];
    }

    const currentStageIndex = STAGE_ORDER.indexOf(selectedJob.stage);
    if (currentStageIndex < 0 || selectedJob.stage === "offer" || selectedJob.stage === "rejected") {
      return [];
    }

    return STAGE_FLOW.filter((stage) => STAGE_ORDER.indexOf(stage) > currentStageIndex);
  }, [selectedJob]);

  const canMarkRejected = selectedJob ? selectedJob.stage !== "offer" && selectedJob.stage !== "rejected" : false;

  return (
    <Sheet open={selectedJob !== null} onOpenChange={(open) => !open && setSelectedJobId(null)}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[72rem]">
        {selectedJob ? (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-500">{selectedJob.company}</div>
                  <SheetTitle className="text-2xl font-semibold tracking-tight text-slate-950">
                    {selectedJob.position}
                  </SheetTitle>
                </div>
                <Badge variant="outline" className="rounded-md px-3 py-1 text-sm">
                  {STAGE_LABELS[selectedJob.stage]}
                </Badge>
              </div>
              <SheetDescription className="text-sm leading-6 text-slate-600">
                先看信息，再看材料和建议，最后再推进下一步。
              </SheetDescription>
            </SheetHeader>

            <Tabs value={tabValue} onValueChange={setTabValue} className="flex min-h-0 flex-1 gap-0 px-6 py-5">
              <TabsList variant="line" className="w-full justify-start rounded-none border-b border-slate-200 pb-0">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="timeline">时间线</TabsTrigger>
                <TabsTrigger value="materials">材料</TabsTrigger>
                <TabsTrigger value="ai">AI 建议</TabsTrigger>
                <TabsTrigger value="notes">面试复盘</TabsTrigger>
              </TabsList>

              <ScrollArea className="mt-5 min-h-0 flex-1 pr-3">
                <TabsContent value="info" className="mt-0">
                  <JobInfoSection job={selectedJob} />
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  <JobTimeline job={selectedJob} />
                </TabsContent>

                <TabsContent value="materials" className="mt-0">
                  <JobMaterials job={selectedJob} materials={materials} />
                </TabsContent>

                <TabsContent value="ai" className="mt-0">
                  <JobAIPanel job={selectedJob} materials={materials} />
                </TabsContent>

                <TabsContent value="notes" className="mt-0">
                  <JobInterviewNotes job={selectedJob} />
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <SheetFooter className="border-t border-slate-200 px-6 py-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-950">推进阶段</p>
                <div className="flex flex-wrap gap-2">
                  {canAdvanceStages.map((stage) => (
                    <Button
                      key={stage}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => advanceJobStage(selectedJob.id, stage, `推进到 ${STAGE_LABELS[stage]}`)}
                    >
                      {`推进到 ${STAGE_LABELS[stage]}`}
                    </Button>
                  ))}
                  {canMarkRejected ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => advanceJobStage(selectedJob.id, "rejected", "标记淘汰")}
                    >
                      标记淘汰
                    </Button>
                  ) : null}
                </div>
              </div>
              <Separator />
              <Button type="button" variant="secondary" onClick={() => setSelectedJobId(null)}>
                关闭详情
              </Button>
            </SheetFooter>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
