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
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
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
    setIsSummaryModalOpen(false);
  };

  const handleIngredientChange = (id: number, field: keyof Ingredient, value: string | number) => {
    setIngredients((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
    setSummaryGenerated(false);
    setIsSummaryModalOpen(false);
  };

  const handleScaleBatch = () => {
    setBatchSize((current) => {
      const numericValue = Number(current) || 0;
      return String(Math.max(1, numericValue));
    });
    setBatchScaled(true);
    setSummaryGenerated(false);
    setIsSummaryModalOpen(false);
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

  const handleGenerateSummary = () => {
    if (!batchScaled) return;

    setSummaryGenerated(true);
    setIsSummaryModalOpen(true);
  };

  const handleCloseSummaryModal = () => {
    setIsSummaryModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#fdf6f7] px-5 py-6 text-[#5d4a52]">
      <div className="mx-auto flex max-w-340 flex-col gap-6">
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
                    {currency.format((Number(ingredient.quantity) || 0) * ingredient.unitCost)}
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

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={!batchScaled}
              className={`inline-flex min-w-65 items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(233,106,162,0.28)] transition ${
                batchScaled
                  ? "bg-linear-to-r from-[#ea78b3] to-[#e55ea4]"
                  : "cursor-not-allowed bg-[#e8c7d7]"
              }`}
            >
              <span>🧾</span>
              Generate Summary
            </button>
          </div>
        </div>

      </div>

      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-[#fffdfd] p-6 shadow-[0_24px_80px_rgba(141,75,103,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#f2d8e3] pb-4">
              <div>
                <div className="flex items-center gap-3 text-[#e96ca8]">
                  <span className="text-2xl">🧾</span>
                  <h2 className="text-[1.4rem] font-black uppercase tracking-[0.08em]">Recipe Summary</h2>
                </div>
                <p className="mt-1 text-sm text-[#8f6b79]">Here’s your generated receipt-style summary.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseSummaryModal}
                className="rounded-full border border-[#f1d3de] bg-white px-3 py-2 text-sm font-bold text-[#e96ca8] hover:bg-[#fff4f8]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-[22px] border border-[#f3d9e5] bg-[#fff8fb] p-5">
              <div className="flex flex-col gap-4 border-b border-dashed border-[#f2d8e3] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-[1.25rem] font-black text-[#5d4a52]">{recipeName}</h3>
                  <p className="mt-1 text-sm text-[#8f6b79]">Batch Size: {Number(batchSize) || 0} Cookies</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#c96f96]">Suggested Price</p>
                  <p className="text-2xl font-black text-[#e64d8d]">{currency.format(totals.sellingPricePerCookie)}</p>
                  <p className="text-xs font-semibold text-[#8f6b79]">per cookie</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-[0.95rem]">
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-[#7b5b67]">Total Recipe Cost</span>
                  <span className="font-bold text-[#4f3d44]">{currency.format(totals.totalRecipeCost)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-[#7b5b67]">Cost per Cookie</span>
                  <span className="font-bold text-[#4f3d44]">{currency.format(totals.costPerCookie)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-[#7b5b67]">Selling Price per Cookie</span>
                  <span className="font-bold text-[#4f3d44]">{currency.format(totals.sellingPricePerCookie)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#f6fff2] px-4 py-3 shadow-sm">
                  <span className="font-semibold text-[#4f6a3f]">Estimated Profit</span>
                  <span className="font-black text-[#16a34a]">{currency.format(totals.estimatedProfit)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#fff1f7] px-4 py-3 shadow-sm">
                  <span className="text-[#7b5b67]">Markup</span>
                  <span className="font-bold text-[#4f3d44]">{markup}%</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handlePrintPdf}
                className="rounded-2xl border border-[#f0d3df] bg-white px-4 py-3 text-sm font-bold text-[#d96aa2] hover:bg-[#fff5f9]"
              >
                Print
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="rounded-2xl border border-[#f0d3df] bg-white px-4 py-3 text-sm font-bold text-[#d96aa2] hover:bg-[#fff5f9]"
              >
                Save PDF
              </button>
              <button
                type="button"
                onClick={handleCloseSummaryModal}
                className="rounded-2xl bg-linear-to-r from-[#ea78b3] to-[#e55ea4] px-4 py-3 text-sm font-black text-white shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
