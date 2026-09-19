import { X } from "lucide-react";

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  recipeTitle: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmationModal({
  isOpen,
  recipeTitle,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-[#5A0D36]">Delete Recipe</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-zinc-600">
          Are you sure you want to delete <span className="font-bold text-[#5A0D36]">{recipeTitle}</span>? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-600"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
