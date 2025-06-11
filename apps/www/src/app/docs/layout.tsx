import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <aside className="fixed hidden min-h-screen border-r border-slate-800 bg-slate-950 md:block md:w-64 md:flex-shrink-0">
        <nav className="flex h-full flex-col gap-5 p-4">
          <div className="">
            <h3 className="mb-2 text-sm font-medium text-slate-400 uppercase">
              Getting Started
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/docs/getting-started/introduction"
                  className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Introduction
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/getting-started/installation"
                  className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Installation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/getting-started/cli"
                  className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  CLI
                </Link>
              </li>
            </ul>
          </div>

          <div className="">
            <h3 className="mb-2 text-sm font-medium text-slate-400 uppercase">
              Components
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/docs/components/button"
                  className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Button
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/components/input"
                  className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Input
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/components/select"
                  className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Select
                </Link>
              </li>
            </ul>
          </div>

          <div className="">
            <h3 className="mb-2 text-sm font-medium text-slate-400 uppercase">
              Hooks
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/docs/hooks/useToggle"
                  className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  useToggle
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
      <div className="h-full md:w-64" />

      {/* Main Content Area */}
      <div className="p-6 md:ml-64 md:p-8">{children}</div>
    </div>
  );
}
