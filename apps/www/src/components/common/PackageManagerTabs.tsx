"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";
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

export function PackageManagerTabs({
  commands,
  className,
}: PackageManagerTabsProps) {
  const [activeTab, setActiveTab] = useState<PackageManager>("npm");

  return (
    <div className={cn("overflow-hidden rounded-md", className)}>
      <div className="flex border-b border-slate-700">
        {(["npm", "pnpm", "yarn"] as const).map((manager) => (
          <button
            key={manager}
            onClick={() => setActiveTab(manager)}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === manager
                ? "bg-slate-800 text-white"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-300",
            )}
          >
            {manager}
          </button>
        ))}
      </div>
      <CodeArea code={commands[activeTab]} language="bash" copyable={true} />
    </div>
  );
}
