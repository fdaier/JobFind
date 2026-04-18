import type { Metadata } from "next";
import "./globals.css";
import { JobFindProvider } from "@/hooks/use-jobfind-store";

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
      <body>
        <JobFindProvider>{children}</JobFindProvider>
      </body>
    </html>
  );
}
