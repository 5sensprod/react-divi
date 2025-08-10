import React from "react";
import { Type as TextIcon } from "lucide-react";
import { Input } from "../ui";

const ImageBlock = {
  type: "image",
  label: "Image",
  icon: TextIcon,
  defaultData: () => ({
    src: "https://via.placeholder.com/400x200",
    alt: "Image placeholder",
    width: "w-full",
    height: "h-48",
  }),
  render: (data) => (
    <div className="flex justify-center">
      <img
        src={data.src || "https://via.placeholder.com/400x200"}
        alt={data.alt || "Image"}
        className={`${data.width || "w-full"} ${
          data.height || "h-48"
        } object-cover rounded-lg`}
      />
    </div>
  ),
  inspector: (data, onChange) => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-neutral-500 block mb-1">
          URL de l'image
        </label>
        <Input
          value={data.src || ""}
          onChange={(e) => onChange({ src: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">
          Texte alternatif
        </label>
        <Input
          value={data.alt || ""}
          onChange={(e) => onChange({ alt: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">Largeur</label>
        <select
          value={data.width || "w-full"}
          onChange={(e) => onChange({ width: e.target.value })}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="w-1/4">25%</option>
          <option value="w-1/2">50%</option>
          <option value="w-3/4">75%</option>
          <option value="w-full">100%</option>
        </select>
      </div>
    </div>
  ),
};

export default ImageBlock;
