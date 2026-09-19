"use client";

import { Plus } from "lucide-react";

type GreetingsCardProps = {

  userName: string;
  recipeCount: number;
  onAddRecipe: () => void;

};

export default function GreetingsCard({

  userName,
  recipeCount,
  onAddRecipe,

}: GreetingsCardProps) {

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-4xl font-extrabold text-[#5A0D36]">
          Greetings, {userName || "there"}!
        </h2>

        <p className="mt-3 max-w-[320px] text-sm leading-relaxed text-amber-900/70 font-medium">
          Your bakery is heating up today. You currently have{" "}
          {recipeCount}{" "}
          {recipeCount === 1 ? "recipe" : "recipes"} in your recipe library.
          Keep creating something delicious!
        </p>
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={onAddRecipe}
          className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#B185DB] via-[#D291BC] to-[#FFC3D0] px-7 py-3.5 text-base font-bold uppercase tracking-wide text-white shadow-md transition hover:opacity-95"
        >
          <Plus className="h-5 w-5 stroke-3" />
          ADD NEW RECIPE
        </button>
      </div>
    </div>
  );
}