import { Button } from "@/registry/components/button/Button";
import CodeArea from "@/components/common/CodeArea";

export default function ButtonDocsPage() {
  return (
    <div className="max-w-4xl text-slate-300">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-white">Button</h1>
        <p className="text-lg">
          Buttons are used to trigger actions like submitting forms, opening
          dialogs, etc.
        </p>
      </div>

      {/* Import Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Import</h2>
        <CodeArea code={`import { Button } from 'verza-ui';`} language="jsx" />
      </div>

      {/* Basic Usage */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Basic Usage</h2>
        <div className="mb-4 rounded-md border border-slate-700 bg-slate-800 p-6">
          <div className="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </div>
        <CodeArea
          code={`<Button>Default Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Danger Button</Button>`}
          language="jsx"
        />
      </div>

      {/* Button Sizes */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Button Sizes</h2>
        <div className="mb-4 rounded-md border border-slate-700 bg-slate-800 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button</Button>
            <Button size="lg">Large Button</Button>
          </div>
        </div>
        <CodeArea
          code={`<Button size="sm">Small Button</Button>
<Button size="md">Medium Button</Button>
<Button size="lg">Large Button</Button>`}
          language="jsx"
        />
      </div>

      {/* Disabled State */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Disabled State
        </h2>
        <div className="mb-4 rounded-md border border-slate-700 bg-slate-800 p-6">
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled Button</Button>
            <Button variant="secondary" disabled>
              Disabled Secondary
            </Button>
          </div>
        </div>
        <CodeArea
          code={`<Button disabled>Disabled Button</Button>
<Button variant="secondary" disabled>Disabled Secondary</Button>`}
          language="jsx"
        />
      </div>

      {/* Loading State */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Loading State
        </h2>
        <div className="mb-4 rounded-md border border-slate-700 bg-slate-800 p-6">
          <div className="flex flex-wrap gap-4">
            <Button loading>Loading</Button>
            <Button variant="secondary" loading>
              Loading
            </Button>
          </div>
        </div>
        <CodeArea
          code={`<Button loading>Loading</Button>
<Button variant="secondary" loading>Loading</Button>`}
          language="jsx"
        />
      </div>

      {/* API Reference */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">API</h2>
        <div className="overflow-hidden rounded-md border border-slate-700">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                <th className="px-4 py-3 font-medium text-slate-300">
                  Property
                </th>
                <th className="px-4 py-3 font-medium text-slate-300">Type</th>
                <th className="px-4 py-3 font-medium text-slate-300">
                  Default
                </th>
                <th className="px-4 py-3 font-medium text-slate-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700">
                <td className="px-4 py-3 font-mono text-sm">variant</td>
                <td className="px-4 py-3 font-mono text-sm">
                  'primary' | 'secondary' | 'danger'
                </td>
                <td className="px-4 py-3 font-mono text-sm">'primary'</td>
                <td className="px-4 py-3 text-sm">Button variant style</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="px-4 py-3 font-mono text-sm">size</td>
                <td className="px-4 py-3 font-mono text-sm">
                  'sm' | 'md' | 'lg'
                </td>
                <td className="px-4 py-3 font-mono text-sm">'md'</td>
                <td className="px-4 py-3 text-sm">Button size</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="px-4 py-3 font-mono text-sm">disabled</td>
                <td className="px-4 py-3 font-mono text-sm">boolean</td>
                <td className="px-4 py-3 font-mono text-sm">false</td>
                <td className="px-4 py-3 text-sm">
                  Whether the button is disabled
                </td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="px-4 py-3 font-mono text-sm">loading</td>
                <td className="px-4 py-3 font-mono text-sm">boolean</td>
                <td className="px-4 py-3 font-mono text-sm">false</td>
                <td className="px-4 py-3 text-sm">
                  Whether to show loading state
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">className</td>
                <td className="px-4 py-3 font-mono text-sm">string</td>
                <td className="px-4 py-3 font-mono text-sm">''</td>
                <td className="px-4 py-3 text-sm">Custom CSS class name</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          The Button component also accepts all native button element
          attributes.
        </p>
      </div>
    </div>
  );
}
