"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { SiNpm, SiPnpm, SiYarn } from "react-icons/si";
import CodeArea from "./CodeArea";

export type PackageManager = "npm" | "pnpm" | "yarn";

interface PackageManagerTabsProps {
  commands: {
    npm: string;
    pnpm: string;
    yarn: string;
  };
  className?: string;
}

const packageManagerConfig = {
  npm: {
    icon: SiNpm,
    label: "npm",
    color: "text-red-500",
  },
  pnpm: {
    icon: SiPnpm,
    label: "pnpm",
    color: "text-yellow-500",
  },
  yarn: {
    icon: SiYarn,
    label: "yarn",
    color: "text-blue-500",
  },
} as const;

export function PackageManagerTabs({
  commands,
  className,
}: PackageManagerTabsProps) {
  const [activeTab, setActiveTab] = useState<PackageManager>("npm");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-slate-800 bg-slate-950",
        className,
      )}
    >
      <div className="flex border-b border-slate-800 bg-slate-900/50">
        {(["npm", "pnpm", "yarn"] as const).map((manager) => {
          const config = packageManagerConfig[manager];
          const Icon = config.icon;
          const isActive = activeTab === manager;

          return (
            <button
              key={manager}
              onClick={() => setActiveTab(manager)}
              className={cn(
                "flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border-slate-400 bg-slate-800/80 text-slate-200 shadow-lg"
                  : "border-transparent bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-300",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? config.color : "text-slate-500",
                )}
              />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <CodeArea
          code={commands[activeTab]}
          language="bash"
          copyable={true}
          showLineNumbers={false}
          className="rounded-none border-0"
        />
      </div>
    </div>
  );
}
