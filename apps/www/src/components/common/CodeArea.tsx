"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface CodeAreaProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  copyable?: boolean;
}

export function CodeArea({
  code,
  language = "jsx",
  showLineNumbers = false,
  className,
  copyable = true,
}: CodeAreaProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-slate-950",
        className,
      )}
    >
      {copyable && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 rounded-md bg-slate-800 p-1.5 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-300 focus:ring-2 focus:ring-slate-500 focus:outline-none"
          aria-label="複製代碼"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </button>
      )}
      <div className="overflow-x-auto p-4">
        <pre
          className={cn("text-sm text-slate-300", {
            "pl-4": showLineNumbers,
          })}
        >
          {showLineNumbers && (
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 h-full w-10 border-r border-slate-700 bg-slate-900 px-2 text-right font-mono text-xs text-slate-500 select-none"
            >
              {code.split("\n").map((_, index) => (
                <div key={index} className="leading-relaxed">
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          <code className={language}>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

export default CodeArea;
