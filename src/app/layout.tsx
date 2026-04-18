import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
