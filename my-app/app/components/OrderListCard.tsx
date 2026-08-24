import { Check, Maximize2, Minus, Plus, Star, X } from "lucide-react";

import type { CustomerOrder, OrderCategory } from "../types/order";

type OrderListCardProps = {
  category: OrderCategory;
  isDeleteMode: boolean;
  isPriorityMode: boolean;
  onDelete: (categoryId: string) => void;
  onView: (categoryId: string) => void;
  onTogglePriority: (categoryId: string) => void;
  onAddCustomer: (categoryId: string) => void;
  onRemoveCustomer: (categoryId: string, customerId: string) => void;
  onUpdateCustomer: (
    categoryId: string,
    customerId: string,
    updates: Partial<CustomerOrder>
  ) => void;
  onToggleStatus: (categoryId: string, customerId: string) => void;
  onUpdateQuantity: (categoryId: string, customerId: string, change: number) => void;
};

const bannerColorsByName: Record<string, { from: string; to: string }> = {
  cake: { from: "#B185DB", to: "#D291BC" },
  cupcakes: { from: "#D291BC", to: "#F7A9CF" },
};

const bannerColorsByPriority: { from: string; to: string } = {
  from: "#E0BD8B",
  to: "#C9A06B",
};

export default function OrderListCard({
  category,
  isDeleteMode,
  isPriorityMode,
  onDelete,
  onView,
  onTogglePriority,
  onAddCustomer,
  onRemoveCustomer,
  onUpdateCustomer,
  onToggleStatus,
  onUpdateQuantity,
}: OrderListCardProps) {
  const bannerColors = category.priority
    ? bannerColorsByPriority
    : bannerColorsByName[category.orderName.toLowerCase()] ??
      { from: "#B185DB", to: "#D291BC" };

  const totalCustomers = category.customers.length;
  const completedCustomers = category.customers.filter(
    (customer) => customer.completed
  ).length;
  const progress =
    totalCustomers > 0 ? Math.round((completedCustomers / totalCustomers) * 100) : 0;

  return (
    <div
      onClick={(event) => {
        if (isDeleteMode) {
          return;
        }
        if ((event.target as HTMLElement).closest("button, input")) {
          return;
        }
        if (isPriorityMode) {
          onTogglePriority(category.id);
          return;
        }
        onView(category.id);
      }}
      className={`group relative flex h-[26rem] w-80 shrink-0 flex-col overflow-hidden rounded-[28px] border bg-white shadow-sm transition-shadow hover:shadow-lg ${
        category.priority
          ? "border-[#C9A06B] ring-4 ring-[#C9A06B]/30"
          : "border-pink-100 ring-1 ring-pink-50"
      } ${isDeleteMode ? "animate-shake cursor-pointer" : "cursor-pointer"}`}
    >
      {isDeleteMode && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Delete ${category.orderName} order list`}
          onClick={() => onDelete(category.id)}
          className="absolute inset-0 z-20 flex items-start justify-end p-3"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 shadow-sm">
            <X className="h-4 w-4" />
          </span>
        </div>
      )}

      {(isPriorityMode || category.priority) && (
        <button
          type="button"
          aria-label={
            category.priority
              ? `Remove priority from ${category.orderName}`
              : `Add priority to ${category.orderName}`
          }
          onClick={(event) => {
            event.stopPropagation();
            onTogglePriority(category.id);
          }}
          className={`absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition hover:scale-105 ${
            category.priority
              ? "border-[#C9A06B] bg-[#C9A06B] text-white"
              : "border-[#D291BC] bg-white text-[#D291BC]"
          }`}
        >
          <Star className={`h-4 w-4 ${category.priority ? "fill-current" : ""}`} />
        </button>
      )}

      <div
        className="flex items-center justify-between px-5 py-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${bannerColors.from}, ${bannerColors.to})`,
        }}
      >
        <div className="min-w-0">
          <span className="block truncate text-lg font-black tracking-[0.22em] text-white/95">
            {category.orderName.toUpperCase()}
          </span>
          <span className="mt-0.5 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-[0.18em] text-white/90">
            {category.date}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            <Check className="h-3 w-3" />
            {completedCustomers}/{totalCustomers}
          </span>

          {!isDeleteMode && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
              <Maximize2 className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>

      {/*progress bar*/}
      <div className="h-1.5 w-full bg-[#FFF0F6]">
        <div
          className="h-full rounded-r-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${bannerColors.from}, ${bannerColors.to})`,
          }}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {totalCustomers === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0F6] text-[#D291BC]">
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-[#5A0D36]">No orders yet</p>
            <p className="text-xs text-zinc-400">
              Add a customer to start this list
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {category.customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center gap-3 rounded-2xl bg-[#FFF7FB] p-3 transition hover:bg-[#FFF0F6]"
              >
                <button
                  type="button"
                  aria-label={`Toggle order for ${customer.customerName || "customer"}`}
                  onClick={() => onToggleStatus(category.id, customer.id)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
                    customer.completed
                      ? "border-[#5A0D36] bg-[#5A0D36] text-white"
                      : "border-[#D291BC] bg-white text-[#D291BC]"
                  }`}
                >
                  {customer.completed ? <Check className="h-4 w-4" /> : null}
                </button>

                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={customer.customerName}
                    onChange={(event) =>
                      onUpdateCustomer(category.id, customer.id, {
                        customerName: event.target.value,
                      })
                    }
                    placeholder="Customer name"
                    className={`w-full bg-transparent text-sm font-semibold text-[#5A0D36] placeholder:text-zinc-400 focus:outline-none ${
                      customer.completed ? "text-zinc-400 line-through" : ""
                    }`}
                  />
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full border border-pink-100 bg-white px-2 py-1">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => onUpdateQuantity(category.id, customer.id, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[#5A0D36] hover:bg-pink-50"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="min-w-4 text-center text-sm font-bold text-[#5A0D36]">
                    {customer.quantity}
                  </span>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => onUpdateQuantity(category.id, customer.id, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[#5A0D36] hover:bg-pink-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  aria-label="Remove customer"
                  onClick={() => onRemoveCustomer(category.id, customer.id)}
                  className="shrink-0 text-xs font-semibold text-zinc-400 transition hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-pink-50 p-4">
        <button
          type="button"
          onClick={() => onAddCustomer(category.id)}
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#D291BC] bg-pink-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#5A0D36] transition hover:bg-pink-100"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Customer
        </button>
      </div>
    </div>
  );
}
