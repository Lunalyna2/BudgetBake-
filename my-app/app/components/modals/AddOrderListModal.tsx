import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";

type CustomerFormRow = {
  id: string;
  customerName: string;
  quantity: number;
};

type AddOrderListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    orderName: string;
    date: string;
    customers: Array<{ customerName: string; quantity: number }>;
  }) => void;
};

const createCustomerRow = (): CustomerFormRow => ({
  id: `customer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  customerName: "",
  quantity: 1,
});

export default function AddOrderListModal({
  isOpen,
  onClose,
  onSubmit,
}: AddOrderListModalProps) {
  const [orderName, setOrderName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerRows, setCustomerRows] = useState<CustomerFormRow[]>([createCustomerRow()]);

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

  if (!isOpen) {
    return null;
  }

  const updateRow = (
    rowId: string,
    field: "customerName" | "quantity",
    value: string | number
  ) => {
    setCustomerRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: field === "quantity" ? Math.max(1, Number(value) || 1) : value,
            }
          : row
      )
    );
  };

  const addRow = () => setCustomerRows((current) => [...current, createCustomerRow()]);

  const removeRow = (rowId: string) => {
    setCustomerRows((current) => {
      if (current.length === 1) {
        return [createCustomerRow()];
      }
      return current.filter((row) => row.id !== rowId);
    });
  };

  const handleEnter = () => {
    onSubmit({
      orderName: orderName.trim() || "New Order",
      date,
      customers: customerRows
        .filter((row) => row.customerName.trim().length > 0)
        .map((row) => ({
          customerName: row.customerName.trim(),
          quantity: Math.max(1, Number(row.quantity) || 1),
        })),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-order-list-title"
        className="w-full max-w-xl animate-fade-in-up rounded-[30px] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-pink-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B185DB] via-[#D291BC] to-[#FFC3D0] text-white">
              <Plus className="h-5 w-5" />
            </span>
            <h3
              id="add-order-list-title"
              className="text-2xl font-black text-[#5A0D36]"
            >
              ADD NEW LIST
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#5A0D36] transition hover:bg-pink-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
              Order Name
            </label>
            <input
              type="text"
              value={orderName}
              onChange={(event) => setOrderName(event.target.value)}
              placeholder="e.g. Birthday Cake"
              className="w-full rounded-2xl border border-pink-100 bg-[#FFF7FB] px-4 py-3 text-sm text-[#5A0D36] placeholder:text-zinc-400 focus:border-[#D291BC] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-2xl border border-pink-100 bg-[#FFF7FB] px-4 py-3 text-sm text-[#5A0D36] focus:border-[#D291BC] focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                Input Orders
              </label>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B185DB] via-[#D291BC] to-[#FFC3D0] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm"
              >
                <Plus className="h-3 w-3" />
                Add Customer
              </button>
            </div>

            <div className="space-y-3">
              {customerRows.map((row, index) => (
                <div key={row.id} className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-[#FFF7FB] p-3">
                  <input
                    type="text"
                    value={row.customerName}
                    onChange={(event) => updateRow(row.id, "customerName", event.target.value)}
                    placeholder={`Customer ${index + 1}`}
                    className="flex-1 rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm text-[#5A0D36] placeholder:text-zinc-400 focus:border-[#D291BC] focus:outline-none"
                  />

                  <div className="flex items-center gap-2 rounded-full border border-pink-100 bg-white px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => updateRow(row.id, "quantity", Math.max(1, row.quantity - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[#5A0D36] hover:bg-pink-50"
                      aria-label="Decrease quantity for customer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-4 text-center text-sm font-bold text-[#5A0D36]">
                      {row.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateRow(row.id, "quantity", row.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[#5A0D36] hover:bg-pink-50"
                      aria-label="Increase quantity for customer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="rounded-full p-2 text-zinc-400 transition hover:bg-white hover:text-red-500"
                    aria-label="Remove customer row"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-pink-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleEnter}
            className="rounded-full bg-gradient-to-r from-[#B185DB] via-[#D291BC] to-[#FFC3D0] px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md transition hover:opacity-95"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
