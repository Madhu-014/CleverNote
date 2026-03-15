"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";
import { FileText } from "lucide-react";

function WorkspaceHeader({ fileName }) {
  return (
    <div className="fade-slide-right relative flex items-center overflow-hidden border-b border-border/55 bg-gradient-to-r from-background/92 via-card/82 to-background/92 px-4 py-4 shadow-[0_14px_34px_-28px_color-mix(in_oklab,var(--foreground)_50%,transparent)] backdrop-blur-xl md:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -right-12 top-0 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
      </div>

      <div className="relative z-10 flex items-center gap-2">
        <Link href="/dashboard" className="logo-shell inline-flex lift-on-hover">
          <Image
            src="/logo.svg"
            alt="logo"
            width={140}
            height={100}
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Center: file name */}
      <div className="absolute left-1/2 z-10 hidden -translate-x-1/2 md:flex">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/82 px-4 py-1.5 shadow-[0_8px_24px_-18px_color-mix(in_oklab,var(--foreground)_45%,transparent)] backdrop-blur-sm">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <h2 className="max-w-[26rem] truncate text-sm font-semibold text-foreground">{fileName}</h2>
        </div>
      </div>

      <h2 className="relative z-10 ml-3 mr-auto truncate text-sm font-semibold md:hidden">{fileName}</h2>

      {/* Right side: user button */}
      <div className="relative z-10 ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserButton />
      </div>
    </div>
  );
}

export default WorkspaceHeader;
