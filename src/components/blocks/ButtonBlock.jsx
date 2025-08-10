import React from "react";
import { Type } from "lucide-react";
import { Button, Input } from "../ui";

const ButtonBlock = {
  type: "button",
  label: "Bouton",
  icon: Type,
  defaultData: () => ({ label: "Cliquez ici", href: "#", variant: "default" }),
  render: (data) => (
    <Button variant={data.variant || "default"}>
      {data.href && data.href !== "#" ? (
        <a href={data.href} className="no-underline">
          {data.label}
        </a>
      ) : (
        data.label
      )}
    </Button>
  ),
  inspector: (data, onChange) => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-neutral-500 block mb-1">
          Texte du bouton
        </label>
        <Input
          value={data.label || ""}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">Lien</label>
        <Input
          value={data.href || ""}
          onChange={(e) => onChange({ href: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">Style</label>
        <select
          value={data.variant || "default"}
          onChange={(e) => onChange({ variant: e.target.value })}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="default">Défaut</option>
          <option value="secondary">Secondaire</option>
          <option value="outline">Contour</option>
          <option value="ghost">Fantôme</option>
        </select>
      </div>
    </div>
  ),
};

export default ButtonBlock;
