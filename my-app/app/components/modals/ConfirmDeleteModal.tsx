import { useEffect } from "react";
import { Trash2, X } from "lucide-react";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  categoryName: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDeleteModal({
  isOpen,
  categoryName,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="w-full max-w-sm animate-fade-in-up rounded-[30px] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-red-100 to-pink-100 text-red-500">
            <Trash2 className="h-6 w-6" />
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

        <h3
          id="confirm-delete-title"
          className="mt-5 text-2xl font-black text-[#5A0D36]"
        >
          Delete this list?
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Are you sure you want to delete{" "}
          <span className="font-bold text-[#5A0D36]">{categoryName}</span>? This
          action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-gradient-to-r from-[#E85D75] to-[#F47B8F] px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md transition hover:opacity-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
