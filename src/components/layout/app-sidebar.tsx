"use client";

import React from "react";

import { BriefcaseBusiness, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "../../lib/utils";

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
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="flex h-full flex-col px-4 py-5">
        <div className="space-y-1 border-b border-slate-200 pb-5">
          <div className="text-lg font-semibold tracking-tight text-slate-950">
            JobFind
          </div>
          <p className="text-sm leading-6 text-slate-500">学生的 AI 求职项目经理</p>
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
