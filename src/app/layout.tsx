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
      <body className="bg-slate-50 text-slate-950 antialiased">
        <JobFindProvider>
          <AppSidebar />
          <main className="min-h-screen md:pl-64">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <Toaster richColors />
        </JobFindProvider>
      </body>
    </html>
  );
}
