import { PackageManagerTabs } from "@/components/common/PackageManagerTabs";
import CodeArea from "@/components/common/CodeArea";

export default function DocsPage() {
  return (
    <div className="max-w-4xl text-slate-300">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-white">Verza UI</h1>
        <p className="text-lg">
          A modern UI component library providing beautiful and feature-rich
          interface elements for your applications.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Features</h2>
        <ul className="list-inside list-disc space-y-2 pl-4">
          <li>Written in TypeScript with complete type support</li>
          <li>Built on React and Tailwind CSS</li>
          <li>Flexible component API design</li>
          <li>Themeable and customizable styles</li>
          <li>Full accessibility support</li>
          <li>Responsive design, compatible with all screen sizes</li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Quick Start</h2>
        <PackageManagerTabs
          commands={{
            npm: "npm install verza-ui",
            pnpm: "pnpm add verza-ui",
            yarn: "yarn add verza-ui",
          }}
        />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Basic Usage</h2>
        <CodeArea
          code={`import { Button, Input } from 'verza-ui';

function App() {
  return (
    <div>
      <Input placeholder="Enter text..." />
      <Button>Click me</Button>
    </div>
  );
}`}
          language="jsx"
        />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Explore Components
        </h2>
        <p className="mb-4">
          Click on the sidebar navigation to explore all available components,
          hooks, and utilities.
        </p>
        <a
          href="/docs/components/button"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Browse Components
        </a>
      </div>
    </div>
  );
}
