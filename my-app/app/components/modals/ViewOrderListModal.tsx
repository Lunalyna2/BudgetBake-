import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Minus, Plus, Star, Trash2, X } from "lucide-react";

import { OrderStatusBadge } from "../OrderStatusBadge";
import type { CustomerOrder, OrderCategory } from "../../types/order";

type ViewOrderListModalProps = {
  isOpen: boolean;
  category: OrderCategory | null;
  onClose: () => void;
  onToggleStatus?: (categoryId: string, customerId: string) => void;
  onUpdateQuantity?: (categoryId: string, customerId: string, change: number) => void;
  onUpdateCustomer?: (
    categoryId: string,
    customerId: string,
    updates: Partial<CustomerOrder>
  ) => void;
  onAddCustomer?: (categoryId: string) => void;
  onRequestDeleteCustomer?: (
    categoryId: string,
    customerId: string,
    customerName: string
  ) => void;
};

const bannerColorsByName: Record<string, { from: string; to: string }> = {
  cake: { from: "#B185DB", to: "#D291BC" },
  cupcakes: { from: "#D291BC", to: "#F7A9CF" },
};

const bannerColorsByPriority: { from: string; to: string } = {
  from: "#E0BD8B",
  to: "#C9A06B",
};

const refreshDuration = 450;

export default function ViewOrderListModal({
  isOpen,
  category,
  onClose,
  onToggleStatus,
  onUpdateQuantity,
  onUpdateCustomer,
  onAddCustomer,
  onRequestDeleteCustomer,
}: ViewOrderListModalProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
    };
  }, []);

  if (!isOpen || !category || !category.id) {
    return null;
  }

  const flashRefresh = (action?: () => void) => {
    setIsRefreshing(true);
    action?.();
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }
    refreshTimer.current = setTimeout(() => setIsRefreshing(false), refreshDuration);
  };

  const handleAddCustomer = () => {
    if (!category.id || !onAddCustomer) {
      return;
    }
    flashRefresh(() => onAddCustomer(category.id));
  };

  const handleRequestDelete = (customer: CustomerOrder) => {
    if (!category.id || !onRequestDeleteCustomer) {
      return;
    }
    onRequestDeleteCustomer(category.id, customer.id, customer.customerName || "Guest");
  };

  const bannerColors = category.priority
    ? bannerColorsByPriority
    : bannerColorsByName[category.orderName.toLowerCase()] ??
      { from: "#B185DB", to: "#D291BC" };

  const totalCustomers = category.customers.length;
  const completedCustomers = category.customers.filter(
    (customer) => customer.completed
  ).length;
  const isInteractive = Boolean(
    onToggleStatus &&
      onUpdateQuantity &&
      onUpdateCustomer &&
      onAddCustomer &&
      onRequestDeleteCustomer
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-order-list-title"
        className="relative flex max-h-[85vh] w-full max-w-lg animate-scale-in flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/*banner header*/}
        <div
          className="flex items-center justify-between px-6 py-5 text-white"
          style={{
            background: `linear-gradient(135deg, ${bannerColors.from}, ${bannerColors.to})`,
          }}
        >
          <div className="min-w-0">
            <h3
              id="view-order-list-title"
              className="truncate text-xl font-extrabold tracking-tight"
            >
              {category.orderName}
            </h3>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
              {category.date}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/25 text-white transition hover:bg-white/40"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/*summary row*/}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-6 py-3">
          <OrderStatusBadge category={category} />

          <div className="flex items-center gap-2">
            {category.priority && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200">
                <Star className="h-3 w-3 fill-current" />
                Priority
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5A0D36]">
              <Check className="h-3 w-3" />
              {completedCustomers}/{totalCustomers} done
            </span>
          </div>
        </div>

        {/*customer list - interactive row editing when handlers are present*/}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {totalCustomers === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-[#D291BC]">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-[#5A0D36]">No orders yet</p>
              <p className="text-xs text-zinc-400">
                This list has no customers
              </p>
              {onAddCustomer && (
                <button
                  type="button"
                  onClick={handleAddCustomer}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-dashed border-[#D291BC] bg-pink-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#5A0D36] transition hover:bg-pink-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Customer
                </button>
              )}
            </div>
          ) : (
            category.customers.map((customer) => (
              <div
                key={customer.id}
                className={`flex items-center gap-3 rounded-2xl p-3 ${
                  customer.completed ? "bg-pink-50/60" : "bg-[#FFF7FB]"
                }`}
              >
                {onToggleStatus ? (
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
                ) : (
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                      customer.completed
                        ? "border-[#5A0D36] bg-[#5A0D36] text-white"
                        : "border-[#D291BC] bg-white text-[#D291BC]"
                    }`}
                  >
                    {customer.completed ? <Check className="h-4 w-4" /> : null}
                  </span>
                )}

                {onUpdateCustomer ? (
                  <input
                    type="text"
                    value={customer.customerName}
                    onChange={(event) =>
                      onUpdateCustomer(category.id, customer.id, {
                        customerName: event.target.value,
                      })
                    }
                    placeholder="Customer name"
                    className={`min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#5A0D36] placeholder:text-zinc-400 focus:outline-none ${
                      customer.completed ? "text-zinc-400 line-through" : ""
                    }`}
                  />
                ) : (
                  <p
                    className={`min-w-0 flex-1 break-words text-sm font-semibold text-[#5A0D36] ${
                      customer.completed ? "text-zinc-400 line-through" : ""
                    }`}
                  >
                    {customer.customerName || "Guest"}
                  </p>
                )}

                {onUpdateQuantity ? (
                  <div className="flex shrink-0 items-center gap-1 rounded-full border border-pink-100 bg-white px-1.5 py-1">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        onUpdateQuantity(category.id, customer.id, -1)
                      }
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
                      onClick={() =>
                        onUpdateQuantity(category.id, customer.id, 1)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[#5A0D36] hover:bg-pink-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-pink-100 bg-white px-3 py-1.5 text-sm font-bold text-[#5A0D36]">
                    ×{customer.quantity}
                  </span>
                )}

                {onRequestDeleteCustomer && (
                  <button
                    type="button"
                    aria-label="Remove customer"
                    onClick={() => handleRequestDelete(customer)}
                    className="shrink-0 rounded-full p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/*footer action when interactive*/}
        {isInteractive && totalCustomers > 0 && (
          <div className="border-t border-zinc-100 px-6 py-4">
            <button
              type="button"
              onClick={handleAddCustomer}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#D291BC] bg-pink-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#5A0D36] transition hover:bg-pink-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Customer
            </button>
          </div>
        )}

        {/*refreshing overlay*/}
        {isRefreshing && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-[#D291BC]" />
              <p className="text-sm font-semibold text-[#5A0D36]">Updating…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}