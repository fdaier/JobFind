"use client";

import React from "react";

import { BarChart3, BriefcaseBusiness, FileStack, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "../../lib/utils";
import { AgentAvatar } from "./agent-avatar";

const navItems = [
  {
    href: "/",
    label: "今日作战台",
    icon: LayoutDashboard,
  },
  {
    href: "/board",
    label: "申请看板",
    icon: BriefcaseBusiness,
  },
  {
    href: "/materials",
    label: "材料中心",
    icon: FileStack,
  },
  {
    href: "/review",
    label: "复盘中心",
    icon: BarChart3,
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200/70 bg-white/45 backdrop-blur-2xl md:flex md:flex-col">
      <div className="flex h-full flex-col px-4 py-5">
        <div className="border-b border-slate-200/70 pb-5">
          <div className="flex items-center gap-3">
            <AgentAvatar className="size-12 shrink-0" />
            <div className="min-w-0">
              <div className="text-lg font-semibold tracking-tight text-slate-950">JobFind</div>
              <p className="text-xs leading-5 text-slate-500">学生的 AI 求职项目经理</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-slate-200/75 bg-white/52 px-3 py-2 text-xs leading-5 text-slate-600 shadow-[0_12px_30px_rgba(71,78,100,0.05)]">
            Agent 正在整理今日优先级、材料缺口和面试窗口。
          </div>
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-[0_12px_28px_rgba(22,28,40,0.16)]"
                    : "text-slate-600 hover:bg-white/72 hover:text-slate-950",
                )}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-[#d9d7ff]" : "text-slate-400 group-hover:text-slate-700")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
