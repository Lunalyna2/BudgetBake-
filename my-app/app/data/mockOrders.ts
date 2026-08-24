import type { OrderCategory } from "../types/order";

export const mockOrders: OrderCategory[] = [
  {
    id: "cake-category",
    orderName: "Cake",
    date: "2026-08-17",
    priority: true,
    customers: [
      { id: "cake-neil", customerName: "Neil", quantity: 2, completed: false },
      { id: "cake-yna", customerName: "Yna", quantity: 3, completed: true },
    ],
  },
  {
    id: "cupcakes-category",
    orderName: "Cupcakes",
    date: "2026-08-18",
    priority: false,
    customers: [
      { id: "cupcakes-kim", customerName: "Kim", quantity: 6, completed: false },
      { id: "cupcakes-chloe", customerName: "Chloe", quantity: 4, completed: false },
      { id: "cupcakes-julie", customerName: "Julie", quantity: 5, completed: true },
    ],
  },
];
