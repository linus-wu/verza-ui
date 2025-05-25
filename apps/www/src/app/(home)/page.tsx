"use client";

import { registry } from "@/registry";
import { Button } from "@/registry/components/button/Button";
import { Input } from "@/registry/components/input/Input";
import { Select } from "@/registry/components/select/Select";
import { PackageManagerTabs } from "@/components/common/PackageManagerTabs";

export default function HomePage() {
  console.log("registry:", registry);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-white">Verza UI</h1>
          <p className="mb-8 text-xl text-slate-300">
            A modern React UI component library providing beautiful and
            feature-rich interface elements.
          </p>
          <div className="mb-12 flex justify-center gap-4">
            <a
              href="/docs"
              className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              View Documentation
            </a>
            <a
              href="https://github.com/your-username/verza-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-slate-600 px-6 py-3 font-medium text-white hover:bg-slate-800"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-semibold text-white">
            Component Showcase
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <h3 className="mb-4 text-xl font-medium text-white">
                Button Component
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button size="sm">Small</Button>
                <Button loading>Loading</Button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <h3 className="mb-4 text-xl font-medium text-white">
                Input & Select
              </h3>
              <div className="space-y-4">
                <Input placeholder="Enter your text..." label="Input Field" />
                <Select
                  label="Select Country"
                  placeholder="Choose a country"
                  options={[
                    { value: "us", label: "United States" },
                    { value: "uk", label: "United Kingdom" },
                    { value: "ca", label: "Canada" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800 p-6">
            <h3 className="mb-4 text-xl font-medium text-white">
              Package Manager Tabs
            </h3>
            <p className="mb-4 text-slate-300">
              Switch between different package managers to see installation
              instructions:
            </p>
            <PackageManagerTabs
              commands={{
                npm: "npm install verza-ui",
                pnpm: "pnpm add verza-ui",
                yarn: "yarn add verza-ui",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
