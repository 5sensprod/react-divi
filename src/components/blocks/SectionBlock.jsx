import React from "react";
import { Box } from "lucide-react";
import { Input } from "../ui";

const SectionBlock = {
  type: "section",
  label: "Section",
  icon: Box,
  defaultData: () => ({ padding: "py-12", bg: "bg-white" }),
  render: (data, ctx) => (
    <div className={`${data.bg} ${data.padding}`}>
      <div className="max-w-5xl mx-auto">
        {/* Placeholder - les enfants seront gérés par le système parent */}
        <div className="space-y-3">
          {ctx.node.children && ctx.node.children.length > 0 && (
            <div className="text-sm text-gray-500 p-4 border-2 border-dashed rounded">
              Section avec {ctx.node.children.length} élément(s)
            </div>
          )}
        </div>
      </div>
    </div>
  ),
  inspector: (data, onChange) => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-neutral-500 block mb-1">
          Padding (classes Tailwind)
        </label>
        <Input
          value={data.padding || ""}
          onChange={(e) => onChange({ padding: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">
          Fond (classes Tailwind)
        </label>
        <Input
          value={data.bg || ""}
          onChange={(e) => onChange({ bg: e.target.value })}
        />
      </div>
    </div>
  ),
};

export default SectionBlock;
