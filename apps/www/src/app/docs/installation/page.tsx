import { PackageManagerTabs } from "@/components/common/PackageManagerTabs";
import CodeArea from "@/components/common/CodeArea";

export default function InstallationPage() {
  return (
    <div className="max-w-4xl text-slate-300">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-white">Installation</h1>
        <p className="text-lg">
          Learn how to integrate Verza UI into your React project.
        </p>
      </div>

      {/* Installation */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Install</h2>
        <p className="mb-4">
          You can install Verza UI using your preferred package manager:
        </p>
        <PackageManagerTabs
          commands={{
            npm: "npm install verza-ui",
            pnpm: "pnpm add verza-ui",
            yarn: "yarn add verza-ui",
          }}
        />
      </div>

      {/* Configuration */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Configure Tailwind CSS
        </h2>
        <p className="mb-4">
          Verza UI requires Tailwind CSS. If you haven't configured Tailwind in
          your project yet, follow these steps:
        </p>
        <div className="mb-4">
          <h3 className="mb-2 text-xl font-medium text-white">
            1. Install Tailwind CSS
          </h3>
          <PackageManagerTabs
            commands={{
              npm: "npm install -D tailwindcss postcss autoprefixer\nnpx tailwindcss init -p",
              pnpm: "pnpm add -D tailwindcss postcss autoprefixer\npnpx tailwindcss init -p",
              yarn: "yarn add -D tailwindcss postcss autoprefixer\nyarn tailwindcss init -p",
            }}
          />
        </div>
        <div className="mb-4">
          <h3 className="mb-2 text-xl font-medium text-white">
            2. Configure Tailwind CSS
          </h3>
          <p className="mb-2">
            Add the following to your tailwind.config.js file:
          </p>
          <CodeArea
            code={`/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/verza-ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`}
            language="js"
          />
        </div>
        <div className="mb-4">
          <h3 className="mb-2 text-xl font-medium text-white">
            3. Add Tailwind Directives to CSS
          </h3>
          <p className="mb-2">
            Add Tailwind directives to your global CSS file:
          </p>
          <CodeArea
            code={`@tailwind base;
@tailwind components;
@tailwind utilities;`}
            language="css"
          />
        </div>
      </div>

      {/* Usage */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Basic Usage</h2>
        <p className="mb-4">
          After installation, you can import and use Verza UI components in your
          React components:
        </p>
        <CodeArea
          code={`import { Button, Input, Select } from 'verza-ui';

function App() {
  return (
    <div>
      <h1>My Application</h1>
      <Input placeholder="Enter your name" />
      <Select 
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ]}
        placeholder="Select an option"
      />
      <Button>Submit</Button>
    </div>
  );
}`}
          language="jsx"
        />
      </div>

      {/* Per-component Import */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Per-component Import (Recommended)
        </h2>
        <p className="mb-4">
          To optimize your application's bundle size, you can import only the
          components you need:
        </p>
        <CodeArea
          code={`// Only import the components you need
import { Button } from 'verza-ui/button';
import { Input } from 'verza-ui/input';

function App() {
  return (
    <div>
      <Input placeholder="Search..." />
      <Button>Search</Button>
    </div>
  );
}`}
          language="jsx"
        />
      </div>

      {/* CLI Tool */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Using the CLI Tool
        </h2>
        <p className="mb-4">
          Verza UI provides a CLI tool to help you quickly add components to
          your project:
        </p>
        <PackageManagerTabs
          commands={{
            npm: "npx verza-ui@latest add Button\nnpx verza-ui@latest add Input",
            pnpm: "pnpx verza-ui@latest add Button\npnpx verza-ui@latest add Input",
            yarn: "yarn dlx verza-ui@latest add Button\nyarn dlx verza-ui@latest add Input",
          }}
        />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Next Steps</h2>
        <p className="mb-4">
          After installation, explore the documentation for each component to
          learn about their usage and APIs:
        </p>
        <ul className="list-inside list-disc space-y-2 pl-4">
          <li>
            <a
              href="/docs/components/button"
              className="text-blue-400 hover:underline"
            >
              Button
            </a>
          </li>
          <li>
            <a
              href="/docs/components/input"
              className="text-blue-400 hover:underline"
            >
              Input
            </a>
          </li>
          <li>
            <a
              href="/docs/components/select"
              className="text-blue-400 hover:underline"
            >
              Select
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
