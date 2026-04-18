import React from "react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-500">JobFind</div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
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
