import React from "react";
import { Rocket } from "lucide-react";
import { Input, Button } from "../ui";

const HeroBlock = {
  type: "hero",
  label: "Hero",
  icon: Rocket,
  defaultData: () => ({
    title: "Un starter Divi-like",
    subtitle: "Architecture modulaire prête pour votre métier",
    cta: "Démarrer",
    align: "center",
  }),
  render: (data) => (
    <div className={`py-16 text-${data.align}`}>
      <h1 className="text-3xl md:text-5xl font-bold">{data.title}</h1>
      <p className="mt-2 text-neutral-600 text-lg">{data.subtitle}</p>
      <div className="mt-6">
        <Button size="lg">{data.cta}</Button>
      </div>
    </div>
  ),
  inspector: (data, onChange) => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-neutral-500 block mb-1">Titre</label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">
          Sous-titre
        </label>
        <Input
          value={data.subtitle || ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">CTA</label>
        <Input
          value={data.cta || ""}
          onChange={(e) => onChange({ cta: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">
          Alignement
        </label>
        <select
          value={data.align || "center"}
          onChange={(e) => onChange({ align: e.target.value })}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="left">Gauche</option>
          <option value="center">Centre</option>
          <option value="right">Droite</option>
        </select>
      </div>
    </div>
  ),
};

export default HeroBlock;
