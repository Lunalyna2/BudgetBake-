import {
  ClipboardList,
  Eye,
  Star,
  Trash2,
} from "lucide-react";

import { OrderStatusBadge } from "./OrderStatusBadge";
import type { OrderCategory } from "../types/order";

type OrderListTableProps = {
  categories: OrderCategory[];
  isDeleteMode: boolean;
  isPriorityMode: boolean;
  onDelete: (categoryId: string) => void;
  onView: (categoryId: string) => void;
  onTogglePriority: (categoryId: string) => void;
};

function formatDate(raw: string): string {
  if (!raw) {
    return "—";
  }
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CompletionProgress({ category }: { category: OrderCategory }) {
  const total = category.customers.length;
  const completed = category.customers.filter((customer) => customer.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-pink-100">
        <div
          className="animate-progress-grow h-full rounded-full bg-gradient-to-r from-[#B185DB] to-[#D291BC]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 text-sm font-semibold tabular-nums text-[#5A0D36]">
        {completed}/{total}
        <span className="text-zinc-400"> · {pct}%</span>
      </span>
    </div>
  );
}

function RowActions({
  category,
  isDeleteMode,
  onDelete,
  onView,
  onTogglePriority,
}: {
  category: OrderCategory;
  isDeleteMode: boolean;
  onDelete: (categoryId: string) => void;
  onView: (categoryId: string) => void;
  onTogglePriority: (categoryId: string) => void;
}) {
  return (
    <div className="relative flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onView(category.id)}
        className="relative z-20 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#5A0D36] ring-1 ring-inset ring-zinc-200 transition hover:bg-pink-50 hover:ring-pink-200"
      >
        <Eye className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">View</span>
      </button>

      <button
        type="button"
        aria-label={category.priority ? "Remove priority" : "Mark as priority"}
        aria-pressed={category.priority}
        title={category.priority ? "Remove priority" : "Mark as priority"}
        onClick={() => onTogglePriority(category.id)}
        className={`relative z-20 inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset transition ${
          category.priority
            ? "bg-amber-100 text-amber-600 ring-amber-200"
            : "text-zinc-400 ring-zinc-200 hover:bg-amber-50 hover:text-amber-500 hover:ring-amber-200"
        }`}
      >
        <Star className={`h-4 w-4 ${category.priority ? "fill-current" : ""}`} />
      </button>

      {isDeleteMode && (
        <button
          type="button"
          aria-label={`Delete ${category.orderName} order list`}
          onClick={() => onDelete(category.id)}
          className="relative z-20 rounded-lg bg-red-50 p-2 text-red-600 ring-1 ring-inset ring-red-200 transition hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function OrderListTable({
  categories,
  isDeleteMode,
  isPriorityMode,
  onDelete,
  onView,
  onTogglePriority,
}: OrderListTableProps) {
  const hasPriority = categories.some((category) => category.priority);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Order
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Date
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Customers
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </th>
              {hasPriority && (
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Priority
                </th>
              )}
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-50">
            {categories.map((category) => (
              <tr
                key={category.id}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button")) {
                    return;
                  }
                  if (isDeleteMode) {
                    return;
                  }
                  if (isPriorityMode) {
                    onTogglePriority(category.id);
                    return;
                  }
                  onView(category.id);
                }}
                className={`animate-fade-in cursor-pointer transition-colors hover:bg-pink-50/40 ${
                  isDeleteMode ? "animate-shake" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        category.priority
                          ? "bg-amber-100 text-amber-700"
                          : "bg-pink-100 text-[#D291BC]"
                      }`}
                    >
                      <ClipboardList className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#5A0D36]">
                        {category.orderName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {category.customers.length} customer
                        {category.customers.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-600">
                  {formatDate(category.date)}
                </td>

                <td className="px-6 py-4">
                  <CompletionProgress category={category} />
                </td>

                <td className="px-6 py-4">
                  <OrderStatusBadge category={category} />
                </td>

                {hasPriority && (
                  <td className="px-6 py-4">
                    {category.priority ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                        <Star className="h-3 w-3 fill-current" />
                        Priority
                      </span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                )}

                <td className="px-6 py-4">
                  <RowActions
                    category={category}
                    isDeleteMode={isDeleteMode}
                    onDelete={onDelete}
                    onView={onView}
                    onTogglePriority={onTogglePriority}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-6 py-3.5">
        <p className="text-sm text-zinc-500">
          Showing{" "}
          <span className="font-semibold text-[#5A0D36]">{categories.length}</span>{" "}
          order list{categories.length === 1 ? "" : "s"}
        </p>
        {isDeleteMode && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
            <Trash2 className="h-3.5 w-3.5" />
            Click a list to delete, or use the actions menu
          </span>
        )}
      </div>
    </div>
  );
}
