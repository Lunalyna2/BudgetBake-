"use client";

import { useMemo, useState } from "react";

type Ingredient = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  unitCost: number;
};

const ingredientTemplates: Ingredient[] = [
  { id: 1, name: "Flour", quantity: "300", unit: "g", unitCost: 0.05 },
  { id: 2, name: "Sugar", quantity: "150", unit: "g", unitCost: 0.06 },
  { id: 3, name: "Butter", quantity: "100", unit: "g", unitCost: 0.12 },
  { id: 4, name: "Chocolate Chips", quantity: "150", unit: "g", unitCost: 0.2 },
];

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function CostCalculator() {
  const [recipeName, setRecipeName] = useState("Chocolate Chip Cookies");
  const [batchSize, setBatchSize] = useState("12");
  const [markup, setMarkup] = useState(50);
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [batchScaled, setBatchScaled] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>(ingredientTemplates);

  const totals = useMemo(() => {
    const numericBatchSize = Number(batchSize) || 0;
    const totalRecipeCost = ingredients.reduce(
      (sum, ingredient) => sum + Number(ingredient.quantity || 0) * ingredient.unitCost,
      0,
    );

    const costPerCookie = numericBatchSize > 0 ? totalRecipeCost / numericBatchSize : 0;
    const sellingPricePerCookie = costPerCookie * (1 + markup / 100);
    const totalSellingPrice = sellingPricePerCookie * numericBatchSize;
    const estimatedProfit = totalSellingPrice - totalRecipeCost;

    return {
      totalRecipeCost,
      costPerCookie,
      sellingPricePerCookie,
      totalSellingPrice,
      estimatedProfit,
    };
  }, [batchSize, ingredients, markup]);

  const handleAddIngredient = () => {
    setIngredients((current) => [
      ...current,
      {
        id: Date.now(),
        name: "New Ingredient",
        quantity: "0",
        unit: "g",
        unitCost: 0,
      },
    ]);
    setSummaryGenerated(false);
  };

  const handleIngredientChange = (id: number, field: keyof Ingredient, value: string | number) => {
    setIngredients((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
    setSummaryGenerated(false);
  };

  const handleScaleBatch = () => {
    setBatchSize((current) => {
      const numericValue = Number(current) || 0;
      return String(Math.max(1, numericValue));
    });
    setBatchScaled(true);
    setSummaryGenerated(false);
  };

  const normalizeNumericValue = (value: string) => {
    if (value === "") return "";

    const trimmed = value.trim();
    if (trimmed === "") return "";

    const cleaned = trimmed.replace(/^0+(?=\d)/, "");
    if (cleaned === "") return "0";

    return cleaned;
  };

  const handlePrintPdf = () => {
    if (typeof window === "undefined") return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const summary = `
      <html>
        <head>
          <title>${recipeName} Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #3c2b2f; }
            h1 { color: #d65b8d; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; }
            .total { font-weight: bold; margin-top: 18px; }
          </style>
        </head>
        <body>
          <h1>${recipeName}</h1>
          <div class="row"><span>Batch Size</span><span>${batchSize}</span></div>
          <div class="row"><span>Total Recipe Cost</span><span>${currency.format(totals.totalRecipeCost)}</span></div>
          <div class="row"><span>Cost per Cookie</span><span>${currency.format(totals.costPerCookie)}</span></div>
          <div class="row"><span>Selling Price per Cookie</span><span>${currency.format(totals.sellingPricePerCookie)}</span></div>
          <div class="row total"><span>Estimated Profit</span><span>${currency.format(totals.estimatedProfit)}</span></div>
        </body>
      </html>
    `;

    printWindow.document.write(summary);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <main className="min-h-screen bg-[#fdf6f7] px-5 py-6 text-[#5d4a52]">
      <div className="mx-auto flex max-w-340 flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-[22px] border border-[#f2d4df] bg-[#fffdfd] p-5 shadow-[0_5px_18px_rgba(240,154,188,0.08)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f9dfe9] text-2xl">
              🍪
            </div>
            <div>
              <h1 className="text-[2.15rem] font-black uppercase tracking-[0.08em] text-[#e96ca8]">
                Cost Calculator
              </h1>
              <p className="text-[0.95rem] text-[#9a7182]">
                Calculate the total cost, pricing, and profit for your recipe.
              </p>
            </div>
          </div>

          <div className="mb-5 rounded-[18px] border border-[#f1d3de] bg-[#fff6fa] p-4">
            <div className="mb-4 flex items-center gap-3 text-[#e96ca8]">
              <span className="text-lg">📋</span>
              <h2 className="text-[1.05rem] font-black uppercase tracking-[0.08em]">
                Recipe Details
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.7fr_1.2fr]">
              <label className="block text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[#b4778e]">
                Recipe Name
                <input
                  value={recipeName}
                  onChange={(e) => {
                    setRecipeName(e.target.value);
                    setSummaryGenerated(false);
                  }}
                  className="mt-2 w-full rounded-xl border border-[#f0d3df] bg-white px-3 py-2.5 text-base font-medium text-[#4f3d44] outline-none focus:border-[#e96ca8]"
                />
              </label>

              <label className="block text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[#b4778e]">
                Batch Size
                <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-[#f0d3df] bg-white px-3 py-2.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={batchSize}
                    onChange={(e) => {
                      const cleaned = normalizeNumericValue(e.target.value);
                      setBatchSize(cleaned === "" ? "" : cleaned);
                      setBatchScaled(false);
                      setSummaryGenerated(false);
                    }}
                    className="w-full bg-transparent text-base font-medium text-[#4f3d44] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleScaleBatch}
                    className="rounded-lg bg-linear-to-r from-[#ea7bb3] to-[#e65aa0] px-3 py-2 text-sm font-bold text-white shadow-sm"
                  >
                    Scale Batch
                  </button>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#f1d3de] bg-[#fff6fa] p-4">
            <div className="mb-4 flex items-center gap-3 text-[#e96ca8]">
              <span className="text-lg">🥣</span>
              <h2 className="text-[1.05rem] font-black uppercase tracking-[0.08em]">
                Ingredient Breakdown
              </h2>
            </div>

            <div className="overflow-hidden rounded-[14px] border border-[#f4d8e2] bg-white">
              <div className="grid grid-cols-[1.3fr_0.9fr_0.7fr_1fr_0.7fr] bg-[#f7dfe9] px-4 py-3 text-[0.76rem] font-black uppercase tracking-[0.08em] text-[#cc6d96]">
                <div>Ingredient</div>
                <div>Quantity</div>
                <div>Unit</div>
                <div>Unit Cost</div>
                <div>Total Cost</div>
              </div>

              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="grid grid-cols-[1.3fr_0.9fr_0.7fr_1fr_0.7fr] items-center gap-2 border-t border-[#f6dfe8] px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-[#4a3b41]">
                    <span className="text-lg">{ingredient.name.includes("Flour") ? "🌾" : ingredient.name.includes("Sugar") ? "🥄" : ingredient.name.includes("Butter") ? "🧈" : ingredient.name.includes("Chocolate") ? "🍫" : "✨"}</span>
                    <input
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(ingredient.id, "name", e.target.value)}
                      className="w-full bg-transparent font-medium text-[#4f3d44] outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const sanitized = normalizeNumericValue(e.target.value);
                      handleIngredientChange(ingredient.id, "quantity", sanitized);
                    }}
                    className="w-full rounded-lg border border-[#f0d3df] bg-[#fff9fb] px-2 py-1.5 text-sm text-[#4f3d44] outline-none"
                  />

                  <input
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(ingredient.id, "unit", e.target.value)}
                    className="w-full rounded-lg border border-[#f0d3df] bg-[#fff9fb] px-2 py-1.5 text-sm text-[#4f3d44] outline-none"
                  />

                  <div className="flex items-center rounded-lg border border-[#f0d3df] bg-[#fff9fb] px-2 py-1.5 text-sm text-[#4f3d44]">
                    <span className="mr-1">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      value={ingredient.unitCost}
                      onChange={(e) => handleIngredientChange(ingredient.id, "unitCost", Number(e.target.value) || 0)}
                      className="w-full bg-transparent outline-none"
                    />
                    <span className="ml-1">/g</span>
                  </div>

                  <div className="text-right font-semibold text-[#4f3d44]">
                    {currency.format(Number(ingredient.quantity) * ingredient.unitCost)}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddIngredient}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-[#e9a9c3] bg-[#fff1f7] px-4 py-2.5 text-sm font-bold text-[#d96aa2]"
            >
              <span>＋</span>
              Add Ingredient
            </button>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[18px] border border-[#f1d3de] bg-[#fff6fa] p-4">
              <div className="mb-3 flex items-center gap-3 text-[#e96ca8]">
                <span className="text-lg">🧾</span>
                <h3 className="text-[1rem] font-black uppercase tracking-[0.08em]">Order Summary</h3>
              </div>

              <div className="space-y-3 text-[0.92rem]">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fff9fb] px-3 py-2">
                  <span className="text-[#7b5b67]">Total Recipe Cost</span>
                  <span className="font-bold text-[#4f3d44]">{currency.format(totals.totalRecipeCost)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fff9fb] px-3 py-2">
                  <span className="text-[#7b5b67]">Cost per Cookie</span>
                  <span className="font-bold text-[#4f3d44]">{currency.format(totals.costPerCookie)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fff9fb] px-3 py-2">
                  <span className="text-[#7b5b67]">Selling Price per Cookie</span>
                  <span className="font-bold text-[#4f3d44]">{currency.format(totals.sellingPricePerCookie)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fff9fb] px-3 py-2">
                  <span className="text-[#7b5b67]">Total Selling Price</span>
                  <span className="font-bold text-[#4f3d44]">{currency.format(totals.totalSellingPrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fff9fb] px-3 py-2">
                  <span className="text-[#7b5b67]">Total Profit</span>
                  <span className="font-bold text-[#16a34a]">{currency.format(totals.estimatedProfit)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#f1d3de] bg-[#fff6fa] p-4">
              <div className="mb-3 flex items-center gap-3 text-[#e96ca8]">
                <span className="text-lg">💰</span>
                <h3 className="text-[1rem] font-black uppercase tracking-[0.08em]">Pricing & Profit</h3>
              </div>

              <div className="space-y-3 text-[0.92rem]">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fff9fb] px-3 py-2">
                  <span className="text-[#7b5b67]">Markup</span>
                  <span className="font-bold text-[#4f3d44]">{markup}%</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fff9fb] px-3 py-2">
                  <span className="text-[#7b5b67]">Estimated Profit</span>
                  <span className="font-bold text-[#16a34a]">{currency.format(totals.estimatedProfit)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fff9fb] px-3 py-2">
                  <span className="text-[#7b5b67]">Suggested Selling Price</span>
                  <span className="font-bold text-[#4f3d44]">{currency.format(totals.sellingPricePerCookie)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-[18px] bg-linear-to-r from-[#f8dfe9] to-[#f8d5e5] p-3 text-center text-[#c95b8d] shadow-inner">
                <div className="text-[1.7rem] font-black">₱{totals.sellingPricePerCookie.toFixed(2)}</div>
                <div className="text-sm font-semibold">per Cookie</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full max-w-90 rounded-[22px] border border-[#f1d3de] bg-[#fffafc] p-4 shadow-[0_5px_18px_rgba(240,154,188,0.08)]">
          <div className="mb-4 rounded-[14px] bg-[#fdf0f5] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#e96ca8]">
                <span className="text-lg">📄</span>
                <span className="text-[0.8rem] font-black uppercase tracking-[0.08em]">Recipe Summary</span>
              </div>
            </div>
            <p className="text-[0.78rem] text-[#9a7182]">Get a summary of this recipe</p>
          </div>

          <div className="mb-4 border-b border-[#f0d7e1] pb-3">
            <h2 className="text-[1.2rem] font-black text-[#e96ca8]">{recipeName}</h2>
            <p className="mt-1 text-[0.9rem] text-[#7a5868]">Batch Size: {Number(batchSize) || 0} Cookies</p>
          </div>

          <div className="mb-4">
            <h3 className="mb-3 text-[0.8rem] font-black uppercase tracking-[0.08em] text-[#e96ca8]">Cost Summary</h3>
            <div className="space-y-2 text-[0.9rem] text-[#54434d]">
              <div className="flex items-center justify-between gap-3">
                <span>Total Recipe Cost</span>
                <span className="font-bold">{currency.format(totals.totalRecipeCost)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Cost per Cookie</span>
                <span className="font-bold">{currency.format(totals.costPerCookie)}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-3 text-[0.8rem] font-black uppercase tracking-[0.08em] text-[#e96ca8]">Pricing Summary</h3>
            <div className="space-y-2 text-[0.9rem] text-[#54434d]">
              <div className="flex items-center justify-between gap-3">
                <span>Markup</span>
                <span className="font-bold">{markup}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Selling Price per Cookie</span>
                <span className="font-bold">{currency.format(totals.sellingPricePerCookie)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Total Selling Price</span>
                <span className="font-bold">{currency.format(totals.totalSellingPrice)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Estimated Profit</span>
                <span className="font-bold text-[#16a34a]">{currency.format(totals.estimatedProfit)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!batchScaled) return;
              setSummaryGenerated(true);
            }}
            disabled={!batchScaled}
            className={`mb-4 w-full rounded-[14px] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm ${
              batchScaled
                ? "bg-linear-to-r from-[#ea78b3] to-[#e55ea4]"
                : "cursor-not-allowed bg-[#e8c7d7]"
            }`}
          >
            Generate Summary
          </button>

          <p className="mb-4 text-center text-[0.78rem] text-[#8a6a75]">
            Create a printable summary or export this recipe.
          </p>

          <div className="grid grid-cols-3 gap-3 text-center text-[0.7rem] font-semibold text-[#d96aa2]">
            <button type="button" onClick={handlePrintPdf} className="rounded-xl border border-[#f0d3df] bg-white p-3">
              <div className="mb-2 text-2xl">📄</div>
              Download PDF
            </button>
            <button type="button" onClick={handlePrintPdf} className="rounded-xl border border-[#f0d3df] bg-white p-3">
              <div className="mb-2 text-2xl">🖨️</div>
              Print
            </button>
            <button type="button" className="rounded-xl border border-[#f0d3df] bg-white p-3">
              <div className="mb-2 text-2xl">💾</div>
              Save Recipe
            </button>
          </div>

          {summaryGenerated && (
            <div className="mt-4 rounded-[14px] border border-[#f3d9e5] bg-[#fff6fa] p-3 text-[0.8rem] text-[#5d4a52]">
              <strong className="block text-[#e96ca8]">Summary</strong>
              <p className="mt-2">
                {recipeName} produces a total recipe cost of {currency.format(totals.totalRecipeCost)} and an estimated profit of {currency.format(totals.estimatedProfit)}.
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
