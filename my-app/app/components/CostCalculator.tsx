"use client";

import { useMemo, useState } from "react";

type Ingredient = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
};

const ingredientTemplates: Ingredient[] = [
  { id: 1, name: "Flour", quantity: 300, unit: "g", unitCost: 0.05 },
  { id: 2, name: "Sugar", quantity: 150, unit: "g", unitCost: 0.06 },
  { id: 3, name: "Butter", quantity: 100, unit: "g", unitCost: 0.12 },
  { id: 4, name: "Chocolate Chips", quantity: 150, unit: "g", unitCost: 0.2 },
];

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
});

export default function CostCalculator() {
  const [recipeName, setRecipeName] = useState("Chocolate Chip Cookies");
  const [batchSize, setBatchSize] = useState(12);
  const [markup, setMarkup] = useState(50);
  const [ingredients, setIngredients] = useState<Ingredient[]>(ingredientTemplates);

  const totals = useMemo(() => {
    const totalRecipeCost = ingredients.reduce(
      (sum, ingredient) => sum + ingredient.quantity * ingredient.unitCost,
      0,
    );

    const costPerCookie = batchSize > 0 ? totalRecipeCost / batchSize : 0;
    const sellingPricePerCookie = costPerCookie * (1 + markup / 100);
    const totalSellingPrice = sellingPricePerCookie * batchSize;
    const estimatedProfit = totalSellingPrice - totalRecipeCost;

    return {
      totalRecipeCost,
      costPerCookie,
      sellingPricePerCookie,
      totalSellingPrice,
      estimatedProfit,
    };
  }, [batchSize, markup, ingredients]);

  const addIngredient = () => {
    setIngredients((current) => [
      ...current,
      {
        id: Date.now(),
        name: "New Ingredient",
        quantity: 0,
        unit: "g",
        unitCost: 0,
      },
    ]);
  };

  const updateIngredient = (id: number, field: keyof Ingredient, value: string | number) => {
    setIngredients((current) =>
      current.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,220,240,0.9),transparent_25%),linear-gradient(180deg,#fffafc_0%,#fff6fb_50%,#ffffff_100%)] px-4 py-6 text-slate-700">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-pink-100 bg-white/90 p-4 shadow-[0_25px_80px_rgba(236,72,153,0.12)] backdrop-blur-md">
        <header className="mb-5 rounded-[22px] bg-gradient-to-r from-rose-50 to-pink-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-500">
                BudgetBake
              </p>
              <h1 className="text-2xl font-black uppercase tracking-wide text-pink-500">
                Cost Calculator
              </h1>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-pink-500 shadow-sm">
              Recipe Dashboard
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[22px] border border-pink-100 bg-white p-4 shadow-sm">
            <div className="mb-4 grid gap-4 md:grid-cols-[1.5fr_1fr_120px]">
              <label className="block text-sm font-semibold text-slate-600">
                Recipe name
                <input
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-pink-200 bg-rose-50 px-3 py-2 text-base text-slate-700 outline-none focus:border-pink-400"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Batch size
                <input
                  type="number"
                  min={1}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded-xl border border-pink-200 bg-rose-50 px-3 py-2 text-base text-slate-700 outline-none focus:border-pink-400"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Markup %
                <input
                  type="number"
                  min={0}
                  value={markup}
                  onChange={(e) => setMarkup(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-pink-200 bg-rose-50 px-3 py-2 text-base text-slate-700 outline-none focus:border-pink-400"
                />
              </label>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-bold uppercase tracking-wide text-pink-500">
                Ingredients
              </h2>
              <button
                type="button"
                onClick={addIngredient}
                className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-pink-500 transition hover:bg-pink-100"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="grid gap-2 rounded-2xl border border-pink-100 bg-rose-50/60 p-3 md:grid-cols-[1.5fr_0.8fr_0.7fr_1fr]"
                >
                  <input
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(ingredient.id, "name", e.target.value)}
                    className="rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-pink-400"
                  />

                  <input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      updateIngredient(ingredient.id, "quantity", Number(e.target.value) || 0)
                    }
                    className="rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-pink-400"
                  />

                  <input
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(ingredient.id, "unit", e.target.value)}
                    className="rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-pink-400"
                  />

                  <input
                    type="number"
                    step="0.01"
                    value={ingredient.unitCost}
                    onChange={(e) =>
                      updateIngredient(ingredient.id, "unitCost", Number(e.target.value) || 0)
                    }
                    className="rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-pink-400"
                  />
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[22px] border border-pink-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-wide text-pink-500">
              Summary
            </h2>

            <div className="space-y-3 rounded-2xl bg-rose-50 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Recipe</span>
                <span className="font-semibold text-slate-700">{recipeName}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Batch size</span>
                <span className="font-semibold text-slate-700">{batchSize}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Total cost</span>
                <span className="font-semibold text-slate-700">
                  {currency.format(totals.totalRecipeCost)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Cost per cookie</span>
                <span className="font-semibold text-slate-700">
                  {currency.format(totals.costPerCookie)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Selling price</span>
                <span className="font-semibold text-slate-700">
                  {currency.format(totals.sellingPricePerCookie)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Estimated profit</span>
                <span className="font-semibold text-emerald-600">
                  {currency.format(totals.estimatedProfit)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
