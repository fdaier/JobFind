import type { Metadata } from "next";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { JobFindProvider } from "@/hooks/use-jobfind-store";

import "./globals.css";

export const metadata: Metadata = {
  title: "JobFind",
  description: "学生的 AI 求职项目经理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning className="text-slate-950 antialiased">
        <JobFindProvider>
          <AppSidebar />
          <main className="min-h-screen md:pl-64">
            <div className="mx-auto flex min-h-screen w-full max-w-[90rem] flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
              {children}
            </div>
          </main>
          <Toaster richColors />
        </JobFindProvider>
      </body>
    </html>
  );
}
