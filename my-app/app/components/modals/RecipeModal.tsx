import { ImagePlus, X } from "lucide-react";

import type { Recipe, RecipeFormState } from "../../types/recipe";

type RecipeModalProps = {
  isOpen: boolean;
  selectedRecipe: Recipe | null;
  recipeForm: RecipeFormState;
  onClose: () => void;
  onFormChange: (field: keyof RecipeFormState, value: string) => void;
  onUploadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
};

export default function RecipeModal({
  isOpen,
  selectedRecipe,
  recipeForm,
  onClose,
  onFormChange,
  onUploadImage,
  onSave,
}: RecipeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-[#5A0D36]">
            {selectedRecipe ? "Edit Recipe" : "Add New Recipe"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-zinc-600">
              Recipe Name
            </label>
            <input
              type="text"
              value={recipeForm.title}
              onChange={(event) => onFormChange("title", event.target.value)}
              placeholder="e.g. Cinnamon Roll Cookies"
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-600">
              Cost in Pesos (₱)
            </label>
            <input
              type="number"
              value={recipeForm.cost}
              onChange={(event) => onFormChange("cost", event.target.value)}
              placeholder="e.g. 535"
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-600">
              Image
            </label>
            <div className="mt-1 flex items-center gap-3">
              {recipeForm.imageUrl && (
                <img
                  src={recipeForm.imageUrl}
                  alt="Preview"
                  className="h-14 w-14 rounded-lg object-cover"
                />
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-gray-100">
                <ImagePlus className="h-4 w-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUploadImage}
                  className="sr-only"
                />
              </label>
              {recipeForm.imageUrl && (
                <button
                  type="button"
                  onClick={() => onFormChange("imageUrl", "")}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-600">
              Recipe Notes
            </label>
            <textarea
              rows={5}
              value={recipeForm.notes}
              onChange={(event) => onFormChange("notes", event.target.value)}
              placeholder="Type your recipe steps or notes here..."
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
            />
          </div>
        </div>

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
            onClick={onSave}
            className="rounded-full bg-[#E94E77] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#d43f67]"
          >
            SAVE RECIPE
          </button>
        </div>
      </div>
    </div>
  );
}
