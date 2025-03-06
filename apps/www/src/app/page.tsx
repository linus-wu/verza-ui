import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { registry } from "@/registry";

export default function Home() {
  console.log("registry:", registry);

  return (
    <div className="flex h-screen w-screen flex-col gap-5 bg-slate-900">
      <h1 className="p-4 text-3xl">Verza UI</h1>
      <div className="flex max-w-md items-center gap-5 px-4">
        <Input />
        <Button className="whitespace-nowrap">Click me</Button>
      </div>
    </div>
  );
}
