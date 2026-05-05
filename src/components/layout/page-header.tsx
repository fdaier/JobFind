import React from "react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
  variant?: "surface" | "ambient";
};

export function PageHeader({
  title,
  description,
  action,
  variant = "surface",
}: PageHeaderProps) {
  const isAmbient = variant === "ambient";

  return (
    <header
      className={[
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        isAmbient
          ? "px-1 pb-1 pt-3 sm:px-2 sm:pt-4"
          : "premium-surface rounded-lg px-5 py-5 sm:px-6",
      ].join(" ")}
    >
      <div className="space-y-3">
        <div
          className={[
            "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-slate-500",
            isAmbient
              ? "border border-white/45 bg-white/30 shadow-[0_12px_30px_rgba(70,63,90,0.05)] backdrop-blur-sm"
              : "border border-slate-200/80 bg-white/70",
          ].join(" ")}
        >
          <span className="text-slate-700">JobFind</span>
          <span className="h-1 w-1 rounded-full bg-[#a7a2df]" aria-hidden="true" />
          <span>Command Surface</span>
        </div>
        <div className={isAmbient ? "space-y-4" : "space-y-1"}>
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
