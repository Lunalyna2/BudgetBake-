"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ClipboardList,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";

import OrderListCard from "../components/OrderListCard";
import AddOrderListModal from "../components/modals/AddOrderListModal";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import ViewOrderListModal from "../components/modals/ViewOrderListModal";
import { mockOrders } from "../data/mockOrders";
import type { CustomerOrder, OrderCategory } from "../types/order";

export default function OrderListPage() {
  const [categories, setCategories] = useState<OrderCategory[]>(mockOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isPriorityMode, setIsPriorityMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<OrderCategory | null>(null);
  const [categoryToView, setCategoryToView] = useState<OrderCategory | null>(null);

  const removeCategory = (categoryId: string) => {
    setCategories((current) =>
      current.filter((category) => category.id !== categoryId)
    );
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      removeCategory(categoryToDelete.id);
    }
    setCategoryToDelete(null);
  };

  const addCustomerToCategory = (categoryId: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              customers: [
                ...category.customers,
                {
                  id: `customer-${Date.now()}`,
                  customerName: "",
                  quantity: 1,
                  completed: false,
                },
              ],
            }
          : category
      )
    );
  };

  const removeCustomerFromCategory = (categoryId: string, customerId: string) => {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        return {
          ...category,
          customers: category.customers.filter((customer) => customer.id !== customerId),
        };
      })
    );
  };

  const updateCustomerInCategory = (
    categoryId: string,
    customerId: string,
    updates: Partial<CustomerOrder>
  ) => {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        return {
          ...category,
          customers: category.customers.map((customer) =>
            customer.id === customerId ? { ...customer, ...updates } : customer
          ),
        };
      })
    );
  };

  const toggleOrderStatus = (categoryId: string, customerId: string) => {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        return {
          ...category,
          customers: category.customers.map((customer) =>
            customer.id === customerId
              ? { ...customer, completed: !customer.completed }
              : customer
          ),
        };
      })
    );
  };

  const updateCustomerQuantity = (
    categoryId: string,
    customerId: string,
    change: number
  ) => {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        return {
          ...category,
          customers: category.customers.map((customer) =>
            customer.id === customerId
              ? { ...customer, quantity: Math.max(1, customer.quantity + change) }
              : customer
          ),
        };
      })
    );
  };

  const handleAddNewCategory = (payload: {
    orderName: string;
    date: string;
    customers: Array<{ customerName: string; quantity: number }>;
  }) => {
    const nextCustomers = payload.customers
      .filter((customer) => customer.customerName.trim().length > 0)
      .map((customer, index) => ({
        id: `new-customer-${Date.now()}-${index}`,
        customerName: customer.customerName.trim(),
        quantity: Math.max(1, Number(customer.quantity) || 1),
        completed: false,
      }));

    const newCategory: OrderCategory = {
      id: `category-${Date.now()}`,
      orderName: payload.orderName || "New Order List",
      date: payload.date || new Date().toISOString().slice(0, 10),
      priority: false,
      customers: nextCustomers.length > 0 ? nextCustomers : [{
        id: `new-customer-${Date.now()}`,
        customerName: "Guest",
        quantity: 1,
        completed: false,
      }],
    };

    setCategories((current) => [newCategory, ...current]);
    setIsModalOpen(false);
  };

  const togglePriority = (categoryId: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? { ...category, priority: !category.priority }
          : category
      )
    );
  };

  const totalLists = categories.length;
  const totalCustomers = categories.reduce(
    (sum, category) => sum + category.customers.length,
    0
  );
  const totalCompleted = categories.reduce(
    (sum, category) =>
      sum + category.customers.filter((customer) => customer.completed).length,
    0
  );

  const stats = [
    {
      label: "Lists",
      value: totalLists,
      icon: ClipboardList,
    },
    {
      label: "Customers",
      value: totalCustomers,
      icon: Users,
    },
    {
      label: "Completed",
      value: totalCompleted,
      icon: CheckCircle2,
    },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCategories =
    normalizedQuery.length === 0
      ? categories
      : categories.filter(
          (category) =>
            category.orderName.toLowerCase().includes(normalizedQuery) ||
            category.customers.some((customer) =>
              customer.customerName.toLowerCase().includes(normalizedQuery)
            )
        );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FFF5FB] via-[#FFF9FC] to-[#FDF0F7] px-4 py-8 text-[#5A0D36]">
      {/*decorative blobs*/}
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#F7A9CF]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 rounded-full bg-[#B185DB]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#FFC3D0]/25 blur-3xl" />

      <div className="relative mx-auto max-w-[1760px]">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#B185DB] via-[#D291BC] to-[#FFC3D0] text-white shadow-lg shadow-pink-200/70">
              <ClipboardList className="h-8 w-8" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D291BC]">
                Weekly Orders
              </p>
              <h1 className="mt-1 text-4xl font-black tracking-tight text-[#5A0D36]">
                ORDER LIST
              </h1>
              <p className="mt-1 text-sm font-medium text-[#B185DB]">
                Manage your weekly bakes with ease
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={isPriorityMode ? "Done prioritizing" : "Toggle priority mode"}
              onClick={() => setIsPriorityMode((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] transition ${
                isPriorityMode
                  ? "border-[#C9A06B] bg-[#C9A06B] text-white shadow-md"
                  : "border-pink-100 bg-white text-[#5A0D36] shadow-sm hover:bg-pink-50"
              }`}
            >
              <Star className={`h-5 w-5 ${isPriorityMode ? "fill-current" : ""}`} />
              {isPriorityMode && <span className="hidden sm:inline">Done</span>}
            </button>

            <button
              type="button"
              aria-label={isDeleteMode ? "Done deleting" : "Toggle delete mode"}
              onClick={() => setIsDeleteMode((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] transition ${
                isDeleteMode
                  ? "border-[#5A0D36] bg-[#5A0D36] text-white shadow-md"
                  : "border-pink-100 bg-white text-[#5A0D36] shadow-sm hover:bg-pink-50"
              }`}
            >
              <Trash2 className="h-5 w-5" />
              {isDeleteMode && (
                <>
                  <span className="hidden sm:inline">Done</span>
                  <Check className="h-5 w-5" />
                </>
              )}
            </button>

            <button
              type="button"
              aria-label="Add new order list"
              onClick={() => setIsModalOpen(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#B185DB] via-[#D291BC] to-[#FFC3D0] text-white shadow-lg shadow-pink-200/80 ring-4 ring-white/60 transition hover:scale-[1.02]"
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>
        </div>

        {/*stats strip*/}
        <div className="mb-8 flex flex-wrap gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-3xl border border-pink-100/80 bg-white/80 px-5 py-3 shadow-sm backdrop-blur"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF7FB] text-[#D291BC]">
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black leading-none text-[#5A0D36]">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B185DB]">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/*search bar*/}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-pink-100/80 bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
            <Search className="h-5 w-5 shrink-0 text-[#D291BC]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by order name or customer..."
              className="w-full bg-transparent text-sm font-semibold text-[#5A0D36] placeholder:text-zinc-400 focus:outline-none"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#D291BC] transition hover:bg-pink-50"
              >
                Clear
              </button>
            )}
          </div>
          {normalizedQuery.length > 0 && (
            <span className="shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-[#B185DB]">
              {filteredCategories.length} of {categories.length}
            </span>
          )}
        </div>

        <div className="flex flex-wrap justify-start gap-6">
          {filteredCategories.map((category, index) => (
            <div key={category.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
              <OrderListCard
                category={category}
                isDeleteMode={isDeleteMode}
                isPriorityMode={isPriorityMode}
                onDelete={(id) =>
                  setCategoryToDelete(
                    categories.find((category) => category.id === id) ?? null
                  )
                }
                onView={(id) =>
                  setCategoryToView(
                    categories.find((category) => category.id === id) ?? null
                  )
                }
                onTogglePriority={togglePriority}
                onAddCustomer={addCustomerToCategory}
                onRemoveCustomer={removeCustomerFromCategory}
                onUpdateCustomer={updateCustomerInCategory}
                onToggleStatus={toggleOrderStatus}
                onUpdateQuantity={updateCustomerQuantity}
              />
            </div>
          ))}
        </div>
      </div>

      <AddOrderListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddNewCategory}
      />

      <ConfirmDeleteModal
        isOpen={categoryToDelete !== null}
        categoryName={categoryToDelete?.orderName ?? ""}
        onConfirm={handleConfirmDelete}
        onClose={() => setCategoryToDelete(null)}
      />

      <ViewOrderListModal
        isOpen={categoryToView !== null}
        category={categoryToView}
        onClose={() => setCategoryToView(null)}
      />
    </div>
  );
}
