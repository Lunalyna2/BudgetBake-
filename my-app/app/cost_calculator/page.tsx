"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Ingredient = {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
};

const currency = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
});

const ingredientTemplates: Ingredient[] = [
    { id: 1, name: "Flour", quantity: 300, unit: "g", unitCost: 0.05 },
    { id: 2, name: "Sugar", quantity: 150, unit: "g", unitCost: 0.06 },
    { id: 3, name: "Butter", quantity: 100, unit: "g", unitCost: 0.12 },
    { id: 4, name: "Chocolate Chips", quantity: 150, unit: "g", unitCost: 0.2 },
];

function formatCurrency(value: number) {
    return currency.format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
        Number.isFinite(value) ? value : 0,
    );
}

export default function CostCalculatorPage() {
    const [recipeName, setRecipeName] = useState("Chocolate Chip Cookies");
    const [batchSizeDraft, setBatchSizeDraft] = useState(12);
    const [appliedBatchSize, setAppliedBatchSize] = useState<number | null>(null);
    const [markup, setMarkup] = useState(50);
    const [ingredients, setIngredients] = useState<Ingredient[]>(ingredientTemplates);
    const [summaryGenerated, setSummaryGenerated] = useState(false);
    const [batchScaled, setBatchScaled] = useState(false);
    const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null);
    const [activeIngredientMenuId, setActiveIngredientMenuId] = useState<number | null>(null);
    const ingredientNameRefs = useRef<Record<number, HTMLInputElement | null>>({});
    const ingredientListRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            const ingredientList = ingredientListRef.current;

            if (ingredientList && !ingredientList.contains(event.target as Node)) {
                setActiveIngredientMenuId(null);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, []);

    const totals = useMemo(() => {
        const batchSize = appliedBatchSize ?? batchSizeDraft;

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
    }, [appliedBatchSize, batchSizeDraft, ingredients, markup]);

    const calculationsReady = batchScaled && summaryGenerated;

    const addIngredient = () => {
        setSummaryGenerated(false);
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
        setSummaryGenerated(false);
        setIngredients((current) =>
            current.map((ingredient) =>
                ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
            ),
        );
    };

    const removeIngredient = (id: number) => {
        setActiveIngredientMenuId((current) => (current === id ? null : current));
        setEditingIngredientId((current) => (current === id ? null : current));
        setSummaryGenerated(false);
        setIngredients((current) => current.filter((ingredient) => ingredient.id !== id));
    };

    const focusIngredientName = (id: number) => {
        setEditingIngredientId(id);
        setActiveIngredientMenuId(null);
        window.requestAnimationFrame(() => {
            const input = ingredientNameRefs.current[id];

            input?.focus();
            input?.select();
        });
    };

    const finishIngredientEdit = (id: number) => {
        setEditingIngredientId((current) => (current === id ? null : current));
        setActiveIngredientMenuId(null);
    };

    const scaleBatch = () => {
        setAppliedBatchSize(Math.max(1, batchSizeDraft));
        setBatchScaled(true);
        setSummaryGenerated(false);
    };

    const generateSummary = () => {
        setSummaryGenerated(true);
    };

    const printReceipt = () => {
        if (!calculationsReady) {
            return;
        }

        const batchSize = appliedBatchSize ?? batchSizeDraft;
        const receiptWindow = window.open("", "_blank", "width=900,height=1200");

        if (!receiptWindow) {
            return;
        }

        const ingredientRows = ingredients
            .map(
                (ingredient) => `
                    <tr>
                        <td>${ingredient.name}</td>
                        <td>${ingredient.quantity}</td>
                        <td>${ingredient.unit}</td>
                        <td>${formatCurrency(ingredient.unitCost)}</td>
                        <td>${formatCurrency(ingredient.quantity * ingredient.unitCost)}</td>
                    </tr>`,
            )
            .join("");

        receiptWindow.document.write(`
            <!doctype html>
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>Receipt - ${recipeName}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            margin: 0;
                            padding: 32px;
                            font-family: Arial, sans-serif;
                            color: #334155;
                            background: #fff;
                        }
                        .receipt {
                            max-width: 840px;
                            margin: 0 auto;
                        }
                        h1 {
                            margin: 0 0 8px;
                            font-size: 28px;
                            color: #ec4899;
                        }
                        .meta {
                            margin-bottom: 24px;
                            font-size: 14px;
                            color: #64748b;
                        }
                        .section {
                            margin-top: 20px;
                            padding-top: 16px;
                            border-top: 1px solid #fbcfe8;
                        }
                        .grid {
                            display: grid;
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                            gap: 12px;
                        }
                        .card {
                            padding: 14px;
                            border: 1px solid #fbcfe8;
                            border-radius: 14px;
                            background: #fff1f5;
                        }
                        .card h2, .card h3 {
                            margin: 0 0 8px;
                            font-size: 14px;
                            text-transform: uppercase;
                            letter-spacing: 0.08em;
                            color: #ec4899;
                        }
                        .row {
                            display: flex;
                            justify-content: space-between;
                            gap: 12px;
                            font-size: 14px;
                            margin: 8px 0;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 12px;
                            font-size: 14px;
                        }
                        th, td {
                            padding: 10px 8px;
                            border-bottom: 1px solid #fce7f3;
                            text-align: left;
                        }
                        th {
                            color: #be185d;
                            font-size: 12px;
                            text-transform: uppercase;
                            letter-spacing: 0.08em;
                        }
                        .total {
                            color: #0f766e;
                            font-weight: 700;
                        }
                        .footer {
                            margin-top: 16px;
                            font-size: 12px;
                            color: #94a3b8;
                        }
                        @media print {
                            body { padding: 0; }
                            .receipt { max-width: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <h1>${recipeName || "Untitled Recipe"}</h1>
                        <div class="meta">Batch size: ${batchSize} | Printed from BudgetBake</div>
                        <div class="grid">
                            <div class="card">
                                <h2>Cost Summary</h2>
                                <div class="row"><span>Total Recipe Cost</span><span>${formatCurrency(totals.totalRecipeCost)}</span></div>
                                <div class="row"><span>Cost per Cookie</span><span>${formatCurrency(totals.costPerCookie)}</span></div>
                            </div>
                            <div class="card">
                                <h2>Pricing Summary</h2>
                                <div class="row"><span>Markup</span><span>${formatNumber(markup)}%</span></div>
                                <div class="row"><span>Selling Price per Cookie</span><span>${formatCurrency(totals.sellingPricePerCookie)}</span></div>
                                <div class="row"><span>Total Selling Price</span><span>${formatCurrency(totals.totalSellingPrice)}</span></div>
                                <div class="row total"><span>Estimated Profit</span><span>${formatCurrency(totals.estimatedProfit)}</span></div>
                            </div>
                        </div>
                        <div class="section">
                            <div class="card">
                                <h3>Ingredient Breakdown</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Ingredient</th>
                                            <th>Quantity</th>
                                            <th>Unit</th>
                                            <th>Unit Cost</th>
                                            <th>Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>${ingredientRows}</tbody>
                                </table>
                            </div>
                        </div>
                        <div class="footer">Use your browser's print dialog to save this receipt as a PDF.</div>
                    </div>
                </body>
            </html>
        `);
        receiptWindow.document.close();
        receiptWindow.focus();
        receiptWindow.print();
    };

    const printableSummary = [
        `Recipe: ${recipeName}`,
        `Batch size: ${appliedBatchSize ?? batchSizeDraft} cookies`,
        `Total recipe cost: ${formatCurrency(totals.totalRecipeCost)}`,
        `Cost per cookie: ${formatCurrency(totals.costPerCookie)}`,
        `Selling price per cookie: ${formatCurrency(totals.sellingPricePerCookie)}`,
        `Total selling price: ${formatCurrency(totals.totalSellingPrice)}`,
        `Estimated profit: ${formatCurrency(totals.estimatedProfit)}`,
    ].join("\n");

    return (
        <main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,233,240,0.9),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,218,232,0.7),transparent_24%),linear-gradient(180deg,#fffafc_0%,#fff6fb_48%,#fffdfd_100%)] px-2 py-2 text-slate-700 sm:px-4 sm:py-3 lg:px-6">
            <div className="mx-auto grid h-full w-full max-w-7xl gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_300px]">
                <section className="flex h-full min-h-0 min-w-0 flex-col rounded-[28px] border border-pink-100/70 bg-white/90 p-2.5 shadow-[0_24px_80px_rgba(244,114,182,0.14)] backdrop-blur md:p-3">
                    <header className="mb-2 flex flex-col gap-2 rounded-3xl bg-linear-to-r from-rose-50 to-pink-50 px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                                🧁
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold uppercase tracking-wide text-pink-500 sm:text-2xl">
                                    Cost Calculator
                                </h1>
                                <p className="mt-1 max-w-2xl text-xs text-slate-500 sm:text-sm">
                                    Calculate ingredient cost, price each batch, and generate a concise recipe summary.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="grid gap-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                        <div className="min-w-0 rounded-[22px] border border-pink-100 bg-white p-2 shadow-sm">
                            <div className="mb-2 flex items-center gap-3 text-pink-500">
                                <span className="text-lg">📋</span>
                                <h2 className="text-sm font-extrabold uppercase tracking-wide">Recipe Details</h2>
                            </div>
                            <div className="grid gap-2 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto]">
                                <label className="grid gap-2 text-sm font-medium text-slate-600">
                                    Recipe Name
                                    <input
                                        value={recipeName}
                                        onChange={(event) => {
                                            setRecipeName(event.target.value);
                                            setSummaryGenerated(false);
                                        }}
                                        className="h-11 rounded-xl border border-pink-100 bg-rose-50/40 px-3 text-slate-700 outline-none transition focus:border-pink-300 focus:bg-white"
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium text-slate-600">
                                    Batch Size
                                    <div className="flex h-11 items-stretch overflow-hidden rounded-xl border border-pink-100 bg-rose-50/40">
                                        <input
                                            type="number"
                                            min={1}
                                            value={batchSizeDraft}
                                            onChange={(event) => {
                                                setBatchSizeDraft(Math.max(1, Number(event.target.value) || 1));
                                                setBatchScaled(false);
                                                setSummaryGenerated(false);
                                            }}
                                            className="w-full min-w-0 bg-transparent px-3 outline-none"
                                        />
                                    </div>
                                </label>
                                <button
                                    type="button"
                                    onClick={scaleBatch}
                                    className="mt-6 h-11 rounded-xl bg-linear-to-r from-pink-500 to-rose-400 px-4 text-sm font-semibold text-white shadow-md shadow-pink-200 transition hover:brightness-105"
                                >
                                    Scale Batch
                                </button>
                            </div>
                        </div>

                        <div className="min-w-0 rounded-[22px] border border-pink-100 bg-white p-2 shadow-sm">
                            <div className="mb-2 flex items-center gap-3 text-pink-500">
                                <span className="text-lg">🪄</span>
                                <h2 className="text-sm font-extrabold uppercase tracking-wide">Pricing & Profit</h2>
                            </div>
                            <div className="grid gap-2 md:grid-cols-3">
                                <label className="grid gap-2 text-sm font-medium text-slate-600">
                                    Markup
                                    <div className="flex h-11 items-center overflow-hidden rounded-xl border border-pink-100 bg-rose-50/40 px-3">
                                        <input
                                            type="number"
                                            min={0}
                                            value={markup}
                                            onChange={(event) => {
                                                setMarkup(Math.max(0, Number(event.target.value) || 0));
                                                setSummaryGenerated(false);
                                            }}
                                            className="w-full bg-transparent outline-none"
                                        />
                                        <span className="text-pink-300">%</span>
                                    </div>
                                </label>
                                <div className="grid gap-2 text-sm font-medium text-slate-600">
                                    Estimated Profit
                                    <div className="flex h-11 items-center rounded-xl border border-pink-100 bg-emerald-50/60 px-3 font-semibold text-emerald-600">
                                        {formatCurrency(totals.estimatedProfit)}
                                    </div>
                                </div>
                                <div className="grid gap-2 text-sm font-medium text-slate-600">
                                    Suggested Selling Price
                                    <div className="flex h-11 items-center rounded-xl border border-pink-100 bg-rose-50/60 px-3 font-semibold text-pink-500">
                                        {formatCurrency(totals.sellingPricePerCookie)} / cookie
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="mt-2 flex min-h-0 flex-1 flex-col rounded-[22px] border border-pink-100 bg-white p-2.5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 text-pink-500">
                                <span className="text-lg">🧾</span>
                                <h2 className="text-sm font-extrabold uppercase tracking-wide">Ingredient Breakdown</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="rounded-full border border-pink-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-pink-500 transition hover:bg-rose-100"
                            >
                                + Add Ingredient
                            </button>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-pink-100">
                            <div className="hidden bg-linear-to-r from-rose-100 to-pink-100 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-pink-400 md:grid md:grid-cols-[minmax(0,2fr)_72px_56px_82px_88px_28px]">
                                <span>Ingredient</span>
                                <span>Quantity</span>
                                <span>Unit</span>
                                <span>Unit Cost</span>
                                <span>Total Cost</span>
                                <span />
                            </div>

                            <div ref={ingredientListRef} className="flex-1 min-h-0 divide-y divide-pink-100 overflow-y-auto bg-white">
                                {ingredients.map((ingredient) => {
                                    const totalCost = ingredient.quantity * ingredient.unitCost;

                                    return (
                                        <div key={ingredient.id} className="relative grid min-w-0 gap-2 px-3 py-3 text-sm md:grid-cols-[minmax(0,2fr)_72px_56px_82px_88px_28px] md:items-center md:gap-2 md:py-2">
                                            <div className="grid gap-2 md:contents">
                                                <div className="min-w-0 md:col-span-1">
                                                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-pink-400 md:hidden">Ingredient</div>
                                                    <input
                                                        ref={(element) => {
                                                            ingredientNameRefs.current[ingredient.id] = element;
                                                        }}
                                                        value={ingredient.name}
                                                        onChange={(event) => updateIngredient(ingredient.id, "name", event.target.value)}
                                                        readOnly={editingIngredientId !== ingredient.id}
                                                        className={`h-10 min-w-0 w-full rounded-lg border border-transparent px-2 outline-none transition ${
                                                            editingIngredientId === ingredient.id
                                                                ? "bg-white focus:border-pink-200"
                                                                : "bg-rose-50/60 text-slate-600"
                                                        }`}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-pink-400 md:hidden">Quantity</div>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={ingredient.quantity}
                                                        onChange={(event) => updateIngredient(ingredient.id, "quantity", Number(event.target.value) || 0)}
                                                        readOnly={editingIngredientId !== ingredient.id}
                                                        className={`h-10 w-full min-w-0 rounded-lg border border-transparent px-2 outline-none transition ${
                                                            editingIngredientId === ingredient.id
                                                                ? "bg-white focus:border-pink-200"
                                                                : "bg-rose-50/60 text-slate-600"
                                                        }`}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-pink-400 md:hidden">Unit</div>
                                                    <input
                                                        value={ingredient.unit}
                                                        onChange={(event) => updateIngredient(ingredient.id, "unit", event.target.value)}
                                                        readOnly={editingIngredientId !== ingredient.id}
                                                        className={`h-10 w-full min-w-0 rounded-lg border border-transparent px-2 outline-none transition ${
                                                            editingIngredientId === ingredient.id
                                                                ? "bg-white focus:border-pink-200"
                                                                : "bg-rose-50/60 text-slate-600"
                                                        }`}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-pink-400 md:hidden">Unit Cost</div>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={ingredient.unitCost}
                                                        onChange={(event) => updateIngredient(ingredient.id, "unitCost", Number(event.target.value) || 0)}
                                                        readOnly={editingIngredientId !== ingredient.id}
                                                        className={`h-10 w-full min-w-0 rounded-lg border border-transparent px-2 outline-none transition ${
                                                            editingIngredientId === ingredient.id
                                                                ? "bg-white focus:border-pink-200"
                                                                : "bg-rose-50/60 text-slate-600"
                                                        }`}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-pink-400 md:hidden">Total Cost</div>
                                                    <div className="min-w-0 font-semibold text-slate-700">{formatCurrency(totalCost)}</div>
                                                </div>
                                                <div className="relative justify-self-start md:justify-self-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveIngredientMenuId((current) => (current === ingredient.id ? null : ingredient.id))}
                                                        className="text-base text-pink-300 transition hover:text-pink-500"
                                                        aria-label={`Actions for ${ingredient.name}`}
                                                        aria-haspopup="menu"
                                                        aria-expanded={activeIngredientMenuId === ingredient.id}
                                                    >
                                                        ⋮
                                                    </button>
                                                    {activeIngredientMenuId === ingredient.id ? (
                                                        <div className="absolute right-0 top-full z-20 mt-2 w-32 overflow-hidden rounded-xl border border-pink-100 bg-white shadow-lg">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (editingIngredientId === ingredient.id) {
                                                                        finishIngredientEdit(ingredient.id);
                                                                    } else {
                                                                        focusIngredientName(ingredient.id);
                                                                    }
                                                                }}
                                                                className="block w-full px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-rose-50"
                                                            >
                                                                {editingIngredientId === ingredient.id ? "Done" : "Edit"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeIngredient(ingredient.id)}
                                                                className="block w-full px-3 py-2 text-left text-sm text-rose-500 transition hover:bg-rose-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </section>

                <aside className="flex h-full min-h-0 flex-col gap-3 overflow-hidden rounded-[28px] border border-pink-100/70 bg-white/90 p-3 shadow-[0_24px_80px_rgba(244,114,182,0.14)] backdrop-blur lg:self-start lg:sticky lg:top-3">
                    <section className="rounded-[22px] border border-pink-100 bg-white p-3 shadow-sm">
                        <div className="mb-2 flex items-center gap-3 text-pink-500">
                            <span className="text-lg">📄</span>
                            <h2 className="text-sm font-extrabold uppercase tracking-wide">Recipe Summary</h2>
                        </div>
                        <div className="rounded-2xl bg-rose-50/80 p-3">
                            <h3 className="text-base font-semibold text-slate-700">{recipeName || "Untitled Recipe"}</h3>
                            <p className="mt-1.5 text-sm text-slate-500">
                                Batch Size: <span className="font-semibold text-pink-500">{batchScaled ? `${appliedBatchSize ?? batchSizeDraft} Cookies` : "Press Scale Batch"}</span>
                            </p>
                        </div>

                        <div className="mt-4 space-y-3 border-t border-pink-100 pt-4">
                            <div>
                                <h4 className="text-xs font-extrabold uppercase tracking-wide text-pink-500">Cost Summary</h4>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>Total Recipe Cost</span>
                                        <span className="font-semibold">{calculationsReady ? formatCurrency(totals.totalRecipeCost) : "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Cost per Cookie</span>
                                        <span className="font-semibold">{calculationsReady ? formatCurrency(totals.costPerCookie) : "—"}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-extrabold uppercase tracking-wide text-pink-500">Pricing Summary</h4>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>Markup</span>
                                        <span className="font-semibold">{calculationsReady ? `${formatNumber(markup)}%` : "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Selling Price per Cookie</span>
                                        <span className="font-semibold">{calculationsReady ? formatCurrency(totals.sellingPricePerCookie) : "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Total Selling Price</span>
                                        <span className="font-semibold">{calculationsReady ? formatCurrency(totals.totalSellingPrice) : "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-emerald-600">
                                        <span className="font-semibold">Estimated Profit</span>
                                        <span className="font-semibold">{calculationsReady ? formatCurrency(totals.estimatedProfit) : "—"}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={generateSummary}
                                disabled={!batchScaled}
                                className="w-full rounded-2xl bg-linear-to-r from-pink-500 to-rose-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Generate Summary
                            </button>
                            <button
                                type="button"
                                onClick={printReceipt}
                                disabled={!calculationsReady}
                                className="mt-2 w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 text-sm font-semibold text-pink-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Print PDF Receipt
                            </button>
                            <p className="text-center text-xs text-slate-400">
                                {calculationsReady ? "Create a printable summary or export this recipe." : "Press Scale Batch and Generate Summary first."}
                            </p>
                        </div>
                    </section>

                    <section className="rounded-[22px] border border-pink-100 bg-rose-50/70 p-3 text-sm text-slate-500 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <p>
                                Tip: Adjust your markup to find the balance between profit and affordability.
                            </p>
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    );
}
