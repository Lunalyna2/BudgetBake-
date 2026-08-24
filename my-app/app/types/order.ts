export interface CustomerOrder {
  id: string;
  customerName: string;
  quantity: number;
  completed: boolean;
}

export interface OrderCategory {
  id: string;
  orderName: string;
  date: string;
  priority: boolean;
  customers: CustomerOrder[];
}
