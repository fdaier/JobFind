import React from "react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="premium-surface flex flex-col gap-4 rounded-lg px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div className="space-y-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-slate-500">
          <span className="text-slate-700">JobFind</span>
          <span className="h-1 w-1 rounded-full bg-[#c9a24c]" aria-hidden="true" />
          <span>Command Surface</span>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
            {description}
          </p>
        </div>
      </div>
      {action ? (
        <div className="flex shrink-0 items-start sm:pt-1">{action}</div>
      ) : null}
    </header>
  );
}
