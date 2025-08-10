import React from "react";
import { Type as TextIcon } from "lucide-react";

const TextBlock = {
  type: "text",
  label: "Texte",
  icon: TextIcon,
  defaultData: () => ({ value: "Éditez ce texte…", size: "base" }),
  render: (data) => (
    <p className={`leading-relaxed text-${data.size}`}>{data.value}</p>
  ),
  inspector: (data, onChange) => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-neutral-500 block mb-1">Texte</label>
        <textarea
          value={data.value || ""}
          onChange={(e) => onChange({ value: e.target.value })}
          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          rows={3}
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">Taille</label>
        <select
          value={data.size || "base"}
          onChange={(e) => onChange({ size: e.target.value })}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="sm">Petit</option>
          <option value="base">Normal</option>
          <option value="lg">Grand</option>
          <option value="xl">Très grand</option>
        </select>
      </div>
    </div>
  ),
};

export default TextBlock;
