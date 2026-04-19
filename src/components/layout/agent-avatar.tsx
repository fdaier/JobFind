import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type AgentAvatarProps = {
  className?: string;
  imageClassName?: string;
};

export function AgentAvatar({ className, imageClassName }: AgentAvatarProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/70 bg-[#f8f3ea] shadow-[0_18px_50px_rgba(42,49,67,0.12)]",
        className,
      )}
    >
      <Image
        src="/agent/agent-logo.png"
        alt="JobFind Agent"
        fill
        sizes="96px"
        unoptimized
        priority
        className={cn("object-cover object-[50%_28%]", imageClassName)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_50%,rgba(248,244,236,0.45)_100%)]" />
    </div>
  );
}
