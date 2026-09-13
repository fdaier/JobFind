"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { JobAIPanel } from "@/components/job-detail/job-ai-panel";
import { JobInfoSection } from "@/components/job-detail/job-info-section";
import { JobInterviewNotes } from "@/components/job-detail/job-interview-notes";
import { JobMaterials } from "@/components/job-detail/job-materials";
import { JobTimeline } from "@/components/job-detail/job-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getNextStage, JOB_STAGE_LABELS, JOB_STAGE_ORDER } from "@/lib/job-stages";
import type { JobStage } from "@/lib/types";

export function JobDetailSheet() {
  const { selectedJob, selectedJobId, setSelectedJobId, materials, advanceJobStage, deleteJob } = useJobfindStore();
  const [tabValue, setTabValue] = useState("ai");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adjustStage, setAdjustStage] = useState<JobStage>("to_apply");
  const cancelDeleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedJobId) {
      setTabValue("ai");
    }

    setIsDeleteDialogOpen(false);
    setAdjustStage(selectedJob?.stage ?? "to_apply");
  }, [selectedJob?.stage, selectedJobId]);

  const nextStage = useMemo(() => selectedJob ? getNextStage(selectedJob.stage) : null, [selectedJob]);

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
                  {JOB_STAGE_LABELS[selectedJob.stage]}
                </Badge>
              </div>
              <SheetDescription className="text-sm leading-6 text-slate-600">
                Agent 会先判断风险和下一步，你再确认是否推进。
              </SheetDescription>
            </SheetHeader>

            <Tabs value={tabValue} onValueChange={setTabValue} className="flex min-h-0 flex-1 gap-0 px-6 py-5">
              <TabsList variant="line" className="w-full justify-start rounded-none border-b border-slate-200 pb-0">
                <TabsTrigger value="ai">Agent 作战台</TabsTrigger>
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="materials">材料</TabsTrigger>
                <TabsTrigger value="timeline">时间线</TabsTrigger>
                <TabsTrigger value="notes">面试复盘</TabsTrigger>
              </TabsList>

              <ScrollArea className="mt-5 min-h-0 flex-1 pr-3">
                <TabsContent value="ai" className="mt-0">
                  <JobAIPanel job={selectedJob} materials={materials} />
                </TabsContent>

                <TabsContent value="info" className="mt-0">
                  <JobInfoSection job={selectedJob} />
                </TabsContent>

                <TabsContent value="materials" className="mt-0">
                  <JobMaterials job={selectedJob} materials={materials} />
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  <JobTimeline job={selectedJob} />
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
                  {nextStage ? (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => advanceJobStage(selectedJob.id, nextStage, `推进到 ${JOB_STAGE_LABELS[nextStage]}`)}
                    >
                      {`推进到 ${JOB_STAGE_LABELS[nextStage]}`}
                    </Button>
                  ) : null}
                  {canMarkRejected ? (
                    <>
                      <select aria-label="调整阶段" value={adjustStage} onChange={(event) => setAdjustStage(event.target.value as JobStage)} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm">
                        {JOB_STAGE_ORDER.filter((stage) => stage !== "rejected").map((stage) => <option key={stage} value={stage}>{JOB_STAGE_LABELS[stage]}</option>)}
                      </select>
                      <Button type="button" variant="outline" size="sm" disabled={adjustStage === selectedJob.stage} onClick={() => advanceJobStage(selectedJob.id, adjustStage, `调整到 ${JOB_STAGE_LABELS[adjustStage]}`)}>调整阶段</Button>
                    </>
                  ) : null}
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
              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="secondary" onClick={() => setSelectedJobId(null)}>
                  关闭详情
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  删除该岗位
                </Button>
              </div>
            </SheetFooter>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent
                onOpenAutoFocus={(event) => {
                  event.preventDefault();
                  cancelDeleteButtonRef.current?.focus();
                }}
              >
                <DialogHeader>
                  <DialogTitle>{`删除「${selectedJob.company} · ${selectedJob.position}」？`}</DialogTitle>
                  <DialogDescription>
                    将永久删除该岗位、申请时间线和面试复盘，并解除关联材料中的岗位引用。此操作无法恢复。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button ref={cancelDeleteButtonRef} type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => deleteJob(selectedJob.id)}>
                    删除岗位
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
