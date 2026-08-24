import { useEffect } from "react";
import { Check, Star, X } from "lucide-react";

import type { OrderCategory } from "../../types/order";

type ViewOrderListModalProps = {
  isOpen: boolean;
  category: OrderCategory | null;
  onClose: () => void;
};

const bannerColorsByName: Record<string, { from: string; to: string }> = {
  cake: { from: "#B185DB", to: "#D291BC" },
  cupcakes: { from: "#D291BC", to: "#F7A9CF" },
};

const bannerColorsByPriority: { from: string; to: string } = {
  from: "#E0BD8B",
  to: "#C9A06B",
};

export default function ViewOrderListModal({
  isOpen,
  category,
  onClose,
}: ViewOrderListModalProps) {
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

  if (!isOpen || !category) {
    return null;
  }

  const bannerColors = category.priority
    ? bannerColorsByPriority
    : bannerColorsByName[category.orderName.toLowerCase()] ??
      { from: "#B185DB", to: "#D291BC" };

  const totalCustomers = category.customers.length;
  const completedCustomers = category.customers.filter(
    (customer) => customer.completed
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-order-list-title"
        className="flex max-h-[85vh] w-full max-w-lg animate-fade-in-up flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl"
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
              className="truncate text-xl font-black tracking-[0.18em]"
            >
              {category.orderName.toUpperCase()}
            </h3>
            <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-white/90">
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

        {/*summary chip*/}
        <div className="flex items-center justify-between border-b border-pink-100 px-6 py-3">
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B185DB]">
              Customers
            </p>
            {category.priority && (
              <span className="flex items-center gap-1 rounded-full bg-[#F3E7D3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#A87A3E]">
                <Star className="h-3 w-3 fill-current" />
                Priority
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 rounded-full bg-[#FFF0F6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5A0D36]">
            <Check className="h-3 w-3" />
            {completedCustomers}/{totalCustomers} done
          </span>
        </div>

        {/*customer list - full names wrap, never truncated*/}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {category.customers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0F6] text-[#D291BC]">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-[#5A0D36]">No orders yet</p>
              <p className="text-xs text-zinc-400">
                This list has no customers
              </p>
            </div>
          ) : (
            category.customers.map((customer) => (
              <div
                key={customer.id}
                className={`flex items-center gap-3 rounded-2xl p-3 ${
                  customer.completed ? "bg-[#FFF0F6]" : "bg-[#FFF7FB]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    customer.completed
                      ? "border-[#5A0D36] bg-[#5A0D36] text-white"
                      : "border-[#D291BC] bg-white text-[#D291BC]"
                  }`}
                >
                  {customer.completed ? <Check className="h-4 w-4" /> : null}
                </span>

                <p
                  className={`min-w-0 flex-1 text-sm font-semibold break-words text-[#5A0D36] ${
                    customer.completed ? "text-zinc-400 line-through" : ""
                  }`}
                >
                  {customer.customerName || "Guest"}
                </p>

                <span className="flex shrink-0 items-center gap-1 rounded-full border border-pink-100 bg-white px-3 py-1.5 text-sm font-bold text-[#5A0D36]">
                  ×{customer.quantity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
