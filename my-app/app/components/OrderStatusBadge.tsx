import type { OrderCategory } from "../types/order";

type OrderStatus = {
  label: "Completed" | "In Progress" | "Pending" | "No orders";
  className: string;
  dotClassName: string;
};

export function getOrderStatus(category: OrderCategory): OrderStatus {
  const total = category.customers.length;
  if (total === 0) {
    return {
      label: "No orders",
      className: "bg-zinc-100 text-zinc-500 ring-zinc-200",
      dotClassName: "bg-zinc-400",
    };
  }

  const completed = category.customers.filter(
    (customer) => customer.completed
  ).length;

  if (completed === total) {
    return {
      label: "Completed",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      dotClassName: "bg-emerald-500",
    };
  }

  if (completed === 0) {
    return {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 ring-amber-200",
      dotClassName: "bg-amber-500",
    };
  }

  return {
    label: "In Progress",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
    dotClassName: "bg-sky-500",
  };
}

export function OrderStatusBadge({ category }: { category: OrderCategory }) {
  const status = getOrderStatus(category);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`} />
      {status.label}
    </span>
  );
}
