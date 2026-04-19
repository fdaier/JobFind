"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { JDParserResult } from "@/components/ai/jd-parser-result";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { createParsedJDJob, sampleJD } from "@/lib/mock-data";

type ParserState = "input" | "parsing" | "preview";

export function JDParserDialog() {
  const { isJDParserOpen, setJDParserOpen, addJob } = useJobfindStore();
  const [mode, setMode] = useState<ParserState>("input");
  const [jdText, setJDText] = useState(sampleJD);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const parsedAtRef = useRef<Date | null>(null);
  const saveGuardRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetToInput = useCallback(() => {
    clearTimer();
    parsedAtRef.current = null;
    saveGuardRef.current = false;
    setIsSaving(false);
    setMode("input");
    setJDText(sampleJD);
  }, [clearTimer]);

  useEffect(() => {
    if (!isJDParserOpen) {
      resetToInput();
    }
  }, [isJDParserOpen, resetToInput]);

  useEffect(() => clearTimer, [clearTimer]);

  const parsedJob = (() => {
    if (!parsedAtRef.current) {
      return null;
    }

    return createParsedJDJob(parsedAtRef.current);
  })();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetToInput();
    }

    setJDParserOpen(open);
  };

  const handleParse = () => {
    if (mode === "parsing") {
      return;
    }

    clearTimer();
    parsedAtRef.current = new Date();
    setMode("parsing");
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setMode("preview");
    }, 800);
  };

  const handleSave = () => {
    if (saveGuardRef.current) {
      return;
    }

    saveGuardRef.current = true;
    setIsSaving(true);
    const parsedAt = parsedAtRef.current ?? new Date();
    addJob(createParsedJDJob(parsedAt));
    toast.success("岗位已添加到看板");
    setJDParserOpen(false);
  };

  return (
    <Dialog open={isJDParserOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>粘贴 JD 添加岗位</DialogTitle>
          <DialogDescription>这是本地解析预览，不连接真实后端或 AI 接口。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "input" ? (
            <>
              <div className="space-y-2">
                <label htmlFor="jd-parser-input" className="text-sm font-medium text-slate-950">
                  JD
                </label>
                <Textarea
                  id="jd-parser-input"
                  value={jdText}
                  onChange={(event) => setJDText(event.target.value)}
                  rows={12}
                  className="min-h-[18rem] rounded-md"
                />
              </div>

              <Separator />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  取消
                </Button>
                <Button type="button" onClick={handleParse}>
                  解析 JD
                </Button>
              </DialogFooter>
            </>
          ) : null}

          {mode === "parsing" ? (
            <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="size-4 animate-spin text-slate-600" />
                <p className="text-sm font-medium text-slate-950">正在解析 JD</p>
              </div>
              <p className="text-sm leading-6 text-slate-600">正在识别公司、岗位、DDL、关键词和材料要求。</p>
            </div>
          ) : null}

          {mode === "preview" && parsedJob ? (
            <JDParserResult job={parsedJob} onSave={handleSave} isSaving={isSaving} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
