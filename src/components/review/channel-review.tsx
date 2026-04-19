"use client";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { buildChannelInsights } from "@/lib/review-insights";

export function ChannelReview() {
  const { jobs, materials } = useJobfindStore();
  const { channels, recommendedChannel, recommendation } = buildChannelInsights(jobs, materials);

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-950">渠道复盘</h2>
            <p className="text-sm leading-6 text-slate-600">{recommendation}</p>
          </div>
          {recommendedChannel ? (
            <Badge variant="outline" className="rounded-md border-slate-200 text-slate-700">
              优先 {recommendedChannel.label}
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-3">
          {channels.map((channel) => (
            <article key={channel.channel} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-950">{channel.label}</h3>
                <span className="text-xs text-slate-500">风险 {channel.riskCount}</span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-sm text-slate-700">
                <div>
                  <dt className="text-xs text-slate-500">岗位</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{channel.totalJobs}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">推进</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{channel.advancedJobs}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Offer</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{channel.offerJobs}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
