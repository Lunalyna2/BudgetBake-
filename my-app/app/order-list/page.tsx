"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  ClipboardList,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";

import OrderListTable from "../components/OrderListCard";
import AddOrderListModal from "../components/modals/AddOrderListModal";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import ConfirmDeleteCustomerModal from "../components/modals/ConfirmDeleteCustomerModal";
import ViewOrderListModal from "../components/modals/ViewOrderListModal";
import type { CustomerOrder, OrderCategory } from "../types/order";

export default function OrderListPage() {
  const [categories, setCategories] = useState<OrderCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isPriorityMode, setIsPriorityMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<OrderCategory | null>(null);
  const [categoryToViewId, setCategoryToViewId] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<{
    categoryId: string;
    customerId: string;
    customerName: string;
  } | null>(null);

  const categoryToView =
    categories.find((category) => category.id === categoryToViewId) ?? null;

  useEffect(() => {
    const loadOrderLists = async () => {
      try {
        const response = await fetch("/api/order-lists");

        if (!response.ok) {
          throw new Error("Failed to load order lists");
        }

        const result = await response.json();

        const mappedCategories: OrderCategory[] = (result.data ?? []).map(
          (orderList: any) => ({
            id: orderList.order_list_id,
            orderName: orderList.order_name,
            date: orderList.date,
            priority: orderList.priority,
            customers: (orderList.order_list_customers ?? []).map(
              (customer: any) => ({
                id: customer.order_customer_id,
                customerName: customer.customer_name,
                quantity: customer.quantity,
                completed: customer.completed,
              })
            ),
          })
        );

        setCategories(mappedCategories);
      } catch (error) {
        console.error("Failed to load order lists:", error);
      }
    };

    loadOrderLists();
  }, []);

  const removeCategory = async (categoryId: string) => {
    try {
      const response = await fetch(
        `/api/order-lists/${categoryId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.error || "Failed to delete order list"
        );
      }

      setCategories((current) =>
        current.filter(
          (category) => category.id !== categoryId
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete order list:",
        error
      );
    }
  };


  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      removeCategory(categoryToDelete.id);
    }

    setCategoryToDelete(null);
  };

  const handleConfirmDeleteCustomer = () => {
    if (customerToDelete) {
      removeCustomerFromCategory(
        customerToDelete.categoryId,
        customerToDelete.customerId
      );
    }
    setCustomerToDelete(null);
  };

  const saveOrderListChanges = async (
    category: OrderCategory
  ) => {
    try {
      const response = await fetch(
        `/api/order-lists/${category.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customers: category.customers,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || "Failed to save order list"
        );
      }

      const result = await response.json();

      return result.data;
    } catch (error) {
      console.error(
        "Failed to save order list changes:",
        error
      );

      return null;
    }
  };

  const addCustomerToCategory = async (
    categoryId: string
  ) => {
    const category = categories.find(
      (category) => category.id === categoryId
    );

    if (!category) {
      return;
    }

    const updatedCategory: OrderCategory = {
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
    };

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? updatedCategory
          : category
      )
    );

    const saved = await saveOrderListChanges(
      updatedCategory
    );

    if (saved) {
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId
            ? {
              ...category,
              customers: (
                saved.order_list_customers ?? []
              ).map((customer: any) => ({
                id: customer.order_customer_id,
                customerName: customer.customer_name,
                quantity: customer.quantity,
                completed: customer.completed,
              })),
            }
            : category
        )
      );
    } else {
      console.error("Failed to persist added customer");
    }
  };

  const removeCustomerFromCategory = async (
    categoryId: string,
    customerId: string
  ) => {
    const category = categories.find(
      (category) => category.id === categoryId
    );

    if (!category) {
      return;
    }

    const updatedCategory: OrderCategory = {
      ...category,
      customers: category.customers.filter(
        (customer) => customer.id !== customerId
      ),
    };

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? updatedCategory
          : category
      )
    );

    const saved = await saveOrderListChanges(
      updatedCategory
    );

    if (saved) {
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId
            ? {
              ...category,
              customers: (
                saved.order_list_customers ?? []
              ).map((customer: any) => ({
                id: customer.order_customer_id,
                customerName: customer.customer_name,
                quantity: customer.quantity,
                completed: customer.completed,
              })),
            }
            : category
        )
      );
    } else {
      console.error(
        "Failed to persist removed customer"
      );
    }
  };

  const updateCustomerInCategory = async (
    categoryId: string,
    customerId: string,
    updates: Partial<CustomerOrder>
  ) => {
    const category = categories.find(
      (category) => category.id === categoryId
    );

    if (!category) {
      return;
    }

    const updatedCategory: OrderCategory = {
      ...category,
      customers: category.customers.map((customer) =>
        customer.id === customerId
          ? { ...customer, ...updates }
          : customer
      ),
    };

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? updatedCategory
          : category
      )
    );

    const saved = await saveOrderListChanges(
      updatedCategory
    );

    if (saved) {
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId
            ? {
              ...category,
              customers: (
                saved.order_list_customers ?? []
              ).map((customer: any) => ({
                id: customer.order_customer_id,
                customerName: customer.customer_name,
                quantity: customer.quantity,
                completed: customer.completed,
              })),
            }
            : category
        )
      );
    } else {
      console.error(
        "Failed to persist customer update"
      );
    }
  };

  const toggleOrderStatus = async (
    categoryId: string,
    customerId: string
  ) => {
    const category = categories.find(
      (category) => category.id === categoryId
    );

    if (!category) {
      return;
    }

    const updatedCategory: OrderCategory = {
      ...category,
      customers: category.customers.map((customer) =>
        customer.id === customerId
          ? {
            ...customer,
            completed: !customer.completed,
          }
          : customer
      ),
    };

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? updatedCategory
          : category
      )
    );

    const saved = await saveOrderListChanges(
      updatedCategory
    );

    if (saved) {
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId
            ? {
              ...category,
              customers: (
                saved.order_list_customers ?? []
              ).map((customer: any) => ({
                id: customer.order_customer_id,
                customerName: customer.customer_name,
                quantity: customer.quantity,
                completed: customer.completed,
              })),
            }
            : category
        )
      );
    } else {
      console.error(
        "Failed to persist customer completion status"
      );
    }
  };

  const updateCustomerQuantity = async (
    categoryId: string,
    customerId: string,
    change: number
  ) => {
    const category = categories.find(
      (category) => category.id === categoryId
    );

    if (!category) {
      return;
    }

    const updatedCategory: OrderCategory = {
      ...category,
      customers: category.customers.map((customer) =>
        customer.id === customerId
          ? {
            ...customer,
            quantity: Math.max(
              1,
              customer.quantity + change
            ),
          }
          : customer
      ),
    };

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? updatedCategory
          : category
      )
    );

    const saved = await saveOrderListChanges(
      updatedCategory
    );

    if (saved) {
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId
            ? {
              ...category,
              customers: (
                saved.order_list_customers ?? []
              ).map((customer: any) => ({
                id: customer.order_customer_id,
                customerName: customer.customer_name,
                quantity: customer.quantity,
                completed: customer.completed,
              })),
            }
            : category
        )
      );
    } else {
      console.error(
        "Failed to persist customer quantity"
      );
    }
  };

  const handleAddNewCategory = async (payload: {
    recipeId: string;
    orderName: string;
    date: string;
    customers: Array<{
      customerName: string;
      quantity: number;
    }>;
  }) => {
    try {
      const response = await fetch("/api/order-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_name:
            payload.orderName || "New Order List",
          date:
            payload.date ||
            new Date().toISOString().slice(0, 10),
          priority: false,
          recipe_id: payload.recipeId,
          customers: payload.customers
            .filter(
              (customer) =>
                customer.customerName.trim().length > 0
            )
            .map((customer) => ({
              customer_name:
                customer.customerName.trim(),
              quantity: Math.max(
                1,
                Number(customer.quantity) || 1
              ),
              completed: false,
            })),
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.error ||
          "Failed to create order list"
        );
      }

      const result = await response.json();
      const createdOrder = result.data;

      const newCategory: OrderCategory = {
        id: createdOrder.order_list_id,
        orderName: createdOrder.order_name,
        date: createdOrder.date,
        priority: createdOrder.priority,
        customers: (
          createdOrder.order_list_customers ?? []
        ).map((customer: any) => ({
          id: customer.order_customer_id,
          customerName: customer.customer_name,
          quantity: customer.quantity,
          completed: customer.completed,
        })),
      };

      setCategories((current) => [
        newCategory,
        ...current,
      ]);

      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Failed to create order list:",
        error
      );
    }
  };

  const togglePriority = async (categoryId: string) => {
    const category = categories.find(
      (category) => category.id === categoryId
    );

    if (!category) {
      return;
    }

    const updatedCategory: OrderCategory = {
      ...category,
      priority: !category.priority,
    };

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? updatedCategory
          : category
      )
    );

    try {
      const response = await fetch(
        `/api/order-lists/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priority: updatedCategory.priority,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.error ||
          "Failed to save priority"
        );
      }
    } catch (error) {
      console.error(
        "Failed to persist priority:",
        error
      );
    }
  };

  const totalLists = categories.length;

  const totalCustomers = categories.reduce(
    (sum, category) =>
      sum + category.customers.length,
    0
  );

  const totalCompleted = categories.reduce(
    (sum, category) =>
      sum +
      category.customers.filter(
        (customer) => customer.completed
      ).length,
    0
  );
  const totalPending = Math.max(0, totalCustomers - totalCompleted);

  const stats = [
    {
      label: "Order Lists",
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
    {
      label: "Pending",
      value: totalPending,
      icon: Star,
    },
  ];

  const normalizedQuery =
    searchQuery.trim().toLowerCase();

  const filteredCategories =
    normalizedQuery.length === 0
      ? categories
      : categories.filter(
        (category) =>
          category.orderName
            .toLowerCase()
            .includes(normalizedQuery) ||
          category.customers.some((customer) =>
            customer.customerName
              .toLowerCase()
              .includes(normalizedQuery)
          )
      );

  const isSearching = normalizedQuery.length > 0;

  return (
    <div className="min-h-screen bg-[#FDFCFB] px-4 py-8 text-[#5A0D36] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/*page header*/}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D291BC]">
              Weekly Orders
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#5A0D36] sm:text-4xl">
              Order List
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
              Keep track of every bake list and its customers. Search, prioritize,
              and manage orders all in one place.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label={isPriorityMode ? "Done prioritizing" : "Toggle priority mode"}
                onClick={() => setIsPriorityMode((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  isPriorityMode
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-[#5A0D36] ring-1 ring-inset ring-zinc-200 hover:bg-amber-50"
                }`}
              >
                <Star className={`h-4 w-4 ${isPriorityMode ? "fill-current" : ""}`} />
                {isPriorityMode ? "Done prioritizing" : "Prioritize"}
              </button>

              <button
                type="button"
                aria-label={isDeleteMode ? "Done deleting" : "Toggle delete mode"}
                onClick={() => setIsDeleteMode((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  isDeleteMode
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-[#5A0D36] ring-1 ring-inset ring-zinc-200 hover:bg-red-50"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                {isDeleteMode ? (
                  <>
                    Done deleting
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B185DB] via-[#D291BC] to-[#FFC3D0] px-5 py-3 text-sm font-bold text-white shadow-md shadow-pink-200/60 transition hover:opacity-95"
          >
            <Plus className="h-5 w-5" />
            New Order List
          </button>
        </div>

        {/*stats strip*/}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3.5 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF7FB] text-[#D291BC]">
                <stat.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold leading-none text-[#5A0D36]">
                  {stat.value}
                </p>
                <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/*search + filters*/}
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by order name or customer..."
                className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-12 pr-12 text-sm font-medium text-[#5A0D36] placeholder:text-zinc-400 shadow-sm focus:border-[#D291BC] focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-400 transition hover:bg-pink-50 hover:text-[#5A0D36]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isSearching && (
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-zinc-500 shadow-sm">
                <span className="font-semibold text-[#5A0D36]">
                  {filteredCategories.length}
                </span>
                of {categories.length} result
                {filteredCategories.length === 1 ? "" : "s"}
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ml-1 text-xs font-semibold text-[#D291BC] hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/*table / list*/}
        <div className="mt-6">
          {categories.length === 0 ? (
            <div className="animate-fade-in rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7FB] text-[#D291BC]">
                <ClipboardList className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#5A0D36]">
                No order lists yet
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                Create your first order list to start tracking customers and their
                bakes for the week.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#B185DB] via-[#D291BC] to-[#FFC3D0] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-200/60 transition hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                New Order List
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="animate-fade-in rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7FB] text-[#D291BC]">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#5A0D36]">
                No results for &ldquo;{searchQuery.trim()}&rdquo;
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                Try a different order name or customer, or clear the search to see
                all your order lists.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#5A0D36] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                Clear search
              </button>
            </div>
          ) : (
            <OrderListTable
              categories={filteredCategories}
              isDeleteMode={isDeleteMode}
              isPriorityMode={isPriorityMode}
              onDelete={(id) =>
                setCategoryToDelete(
                  categories.find((category) => category.id === id) ?? null
                )
              }
              onView={(id) => setCategoryToViewId(id)}
              onTogglePriority={togglePriority}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddOrderListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddNewCategory}
        />
      )}

      <ConfirmDeleteModal
        isOpen={categoryToDelete !== null}
        categoryName={
          categoryToDelete?.orderName ?? ""
        }
        onConfirm={handleConfirmDelete}
        onClose={() => setCategoryToDelete(null)}
      />

      <ViewOrderListModal
        isOpen={categoryToView !== null}
        category={categoryToView}
        onClose={() => setCategoryToViewId(null)}
        onToggleStatus={toggleOrderStatus}
        onUpdateQuantity={updateCustomerQuantity}
        onUpdateCustomer={updateCustomerInCategory}
        onAddCustomer={addCustomerToCategory}
        onRequestDeleteCustomer={(categoryId, customerId, customerName) =>
          setCustomerToDelete({ categoryId, customerId, customerName })
        }
      />

      <ConfirmDeleteCustomerModal
        isOpen={customerToDelete !== null}
        customerName={customerToDelete?.customerName ?? ""}
        onConfirm={handleConfirmDeleteCustomer}
        onClose={() => setCustomerToDelete(null)}
      />
    </div>
  );
}