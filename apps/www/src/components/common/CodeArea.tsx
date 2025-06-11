"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { RiFileCopyLine, RiCheckLine, RiFileTextLine } from "react-icons/ri";
import { cn } from "@/utils/cn";

interface CodeAreaProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  copyable?: boolean;
  filename?: string;
}

export function CodeArea({
  code,
  language = "tsx",
  showLineNumbers = false,
  className,
  copyable = true,
  filename,
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
        "relative overflow-hidden rounded-md border border-slate-800 bg-slate-950",
        className,
      )}
    >
      {(filename || copyable) && (
        <div
          className={cn(
            "flex items-center justify-between border-slate-800 px-4 py-2.5",
            filename && "border-b bg-slate-900/50",
          )}
        >
          {filename ? (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <RiFileTextLine className="h-4 w-4 text-slate-400" />
              <span className="font-mono">{filename}</span>
            </div>
          ) : (
            <div></div>
          )}

          {copyable && (
            <button
              onClick={handleCopy}
              className="cursor-pointer rounded-md bg-slate-800/80 p-1.5 text-xs text-slate-300 backdrop-blur-sm transition-colors hover:bg-slate-700 hover:text-slate-200 focus:outline-none"
              aria-label="copy code"
            >
              {copied ? (
                <RiCheckLine className="h-4 w-4" />
              ) : (
                <RiFileCopyLine className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      )}

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: "1.8rem",
          background: "transparent",
          fontSize: "1.3rem",
          lineHeight: "1.5",
        }}
        lineNumberStyle={{
          color: "#64748b",
          backgroundColor: "transparent",
          paddingRight: "1rem",
          borderRight: "1px solid #334155",
          marginRight: "1rem",
          minWidth: "2.5rem",
          textAlign: "right",
        }}
        codeTagProps={{
          style: {
            fontSize: "inherit",
            fontFamily: "monospace",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default CodeArea;
