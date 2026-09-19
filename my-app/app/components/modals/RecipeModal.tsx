"use client";

import React from "react";
import { Trash2 } from "lucide-react";

import type {
  Recipe,
  RecipeFormState,
  RecipeIngredient,
} from "../../types/recipe";

type RecipeModalProps = {
  isOpen: boolean;
  selectedRecipe: Recipe | null;
  recipeForm: RecipeFormState;

  ingredients: RecipeIngredient[];
  isSaving?: boolean;

  onClose: () => void;

  onFormChange: (
    field: keyof RecipeFormState,
    value: string
  ) => void;

  onUploadImage: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;

  onIngredientChange: (
    id: string,
    field: keyof RecipeIngredient,
    value: string
  ) => void;

  onAddIngredient: () => void;

  onRemoveIngredient: (id: string) => void;

  onSave: () => void;
};

export default function RecipeModal({
  isOpen,
  selectedRecipe,
  recipeForm,
  ingredients,
  isSaving = false,
  onClose,
  onFormChange,
  onUploadImage,
  onIngredientChange,
  onAddIngredient,
  onRemoveIngredient,
  onSave,
}: RecipeModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-xl">
        {/*header */}
        <div className="flex items-center justify-between border-b border-pink-100 px-6 py-5">
          <h2 className="text-2xl font-extrabold text-[#5A0D36]">
            {selectedRecipe ? "Edit Recipe" : "Add New Recipe"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-2xl font-medium text-gray-400 transition-colors hover:text-[#D291BC] disabled:opacity-50"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/*recipe name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#5A0D36]">
              Recipe Name
            </label>

            <input
              type="text"
              value={recipeForm.title}
              onChange={(e) =>
                onFormChange("title", e.target.value)
              }
              placeholder="e.g. Blueberry Cake"
              className="
                w-full
                rounded-xl
                border
                border-pink-100
                bg-white
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-[#D291BC]
                focus:ring-2
                focus:ring-[#FFC3D0]/40
              "
            />
          </div>

          {/*cost*/}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#5A0D36]">
              Cost in Pesos
            </label>

            <input
              type="text"
              value={recipeForm.cost}
              onChange={(e) =>
                onFormChange("cost", e.target.value)
              }
              placeholder="0.00"
              className="
                w-full
                rounded-xl
                border
                border-pink-100
                bg-white
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-[#D291BC]
                focus:ring-2
                focus:ring-[#FFC3D0]/40
              "
            />
          </div>

          {/*recipe image */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#5A0D36]">
              Recipe Image
            </label>

            <div className="flex items-center gap-3">
              {/*upload Button */}
              <label
                htmlFor="recipe-image-upload"
                className="
                  inline-flex
                  cursor-pointer
                  items-center
                  rounded-full
                  bg-linear-to-r
                  from-[#B185DB]
                  via-[#D291BC]
                  to-[#FFC3D0]
                  px-6
                  py-3
                  text-sm
                  font-bold
                  uppercase
                  tracking-wide
                  text-white
                  shadow-md
                  transition
                  hover:opacity-95
                "
              >
                + Add Picture
              </label>

              {/*hidden file input */}
              <input
                id="recipe-image-upload"
                type="file"
                accept="image/*"
                onChange={onUploadImage}
                className="hidden"
              />

              {/*selected image indicator */}
              {recipeForm.imageUrl && (
                <span className="text-sm font-medium text-[#D291BC]">
                  Image selected
                </span>
              )}
            </div>

            {/*image preview */}
            {recipeForm.imageUrl && (
              <div className="mt-3">
                <img
                  src={recipeForm.imageUrl}
                  alt="Recipe preview"
                  className="h-32 w-32 rounded-2xl border border-pink-100 object-cover shadow-sm"
                />
              </div>
            )}
          </div>

          {/*ingredients*/}
          <div>
            {/*ingredients header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-[#5A0D36]">
                  Ingredients
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add the ingredients used in this recipe.
                </p>
              </div>

              <button
                type="button"
                onClick={onAddIngredient}
                disabled={isSaving}
                className="
                  rounded-full
                  bg-linear-to-r
                  from-[#B185DB]
                  via-[#D291BC]
                  to-[#FFC3D0]
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  uppercase
                  tracking-wide
                  text-white
                  shadow-md
                  transition
                  hover:opacity-95
                  disabled:opacity-50
                "
              >
                + Add Ingredient
              </button>
            </div>

            {/*no ingredients */}
            {ingredients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 p-6 text-center text-sm text-gray-500">
                No ingredients added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="
                      rounded-2xl
                      border
                      border-pink-100
                      bg-linear-to-r
                      from-[#FFF8FC]
                      to-[#FFF1F7]
                      p-4
                      shadow-sm
                    "
                  >
                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-3
                        sm:grid-cols-2
                        lg:grid-cols-[minmax(180px,1.5fr)_minmax(100px,0.7fr)_minmax(100px,0.7fr)_minmax(130px,0.9fr)_40px]
                      "
                    >
                      {/*ingredient name */}
                      <div>
                        <label className="mb-1 block text-xs font-bold text-[#5A0D36]">
                          Ingredient
                        </label>

                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) =>
                            onIngredientChange(
                              ingredient.id,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Flour"
                          disabled={isSaving}
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-pink-100
                            bg-white
                            px-3
                            text-sm
                            text-gray-800
                            outline-none
                            transition
                            focus:border-[#D291BC]
                            focus:ring-2
                            focus:ring-[#FFC3D0]/30
                            disabled:bg-gray-100
                          "
                        />
                      </div>

                      {/*quantity */}
                      <div>
                        <label className="mb-1 block text-xs font-bold text-[#5A0D36]">
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={ingredient.quantity}
                          onChange={(e) =>
                            onIngredientChange(
                              ingredient.id,
                              "quantity",
                              e.target.value
                            )
                          }
                          disabled={isSaving}
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-pink-100
                            bg-white
                            px-3
                            text-sm
                            text-gray-800
                            outline-none
                            transition
                            focus:border-[#D291BC]
                            focus:ring-2
                            focus:ring-[#FFC3D0]/30
                            disabled:bg-gray-100
                          "
                        />
                      </div>

                      {/*unit */}
                      <div>
                        <label className="mb-1 block text-xs font-bold text-[#5A0D36]">
                          Unit
                        </label>

                        <select
                          value={ingredient.unit}
                          onChange={(e) =>
                            onIngredientChange(
                              ingredient.id,
                              "unit",
                              e.target.value
                            )
                          }
                          disabled={isSaving}
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-pink-100
                            bg-white
                            px-3
                            text-sm
                            text-gray-800
                            outline-none
                            transition
                            focus:border-[#D291BC]
                            focus:ring-2
                            focus:ring-[#FFC3D0]/30
                            disabled:bg-gray-100
                          "
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="L">L</option>
                          <option value="pcs">pcs</option>
                          <option value="tbsp">tbsp</option>
                          <option value="tsp">tsp</option>
                          <option value="cup">cup</option>
                        </select>
                      </div>

                      {/*unit cost */}
                      <div>
                        <label className="mb-1 block text-xs font-bold text-[#5A0D36]">
                          Unit Cost (₱)
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ingredient.unitCost}
                          onChange={(e) =>
                            onIngredientChange(
                              ingredient.id,
                              "unitCost",
                              e.target.value
                            )
                          }
                          disabled={isSaving}
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-pink-100
                            bg-white
                            px-3
                            text-sm
                            text-gray-800
                            outline-none
                            transition
                            focus:border-[#D291BC]
                            focus:ring-2
                            focus:ring-[#FFC3D0]/30
                            disabled:bg-gray-100
                          "
                        />
                      </div>

                      {/*delete ingredient */}
                      <div className="flex items-end justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            onRemoveIngredient(ingredient.id)
                          }
                          disabled={isSaving}
                          title="Remove ingredient"
                          aria-label={`Remove ${
                            ingredient.name || "ingredient"
                          }`}
                          className="
                            flex
                            h-11
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            text-[#D291BC]
                            transition
                            hover:bg-[#FFC3D0]/30
                            hover:text-[#B185DB]
                            disabled:opacity-50
                          "
                        >
                          <Trash2
                            size={17}
                            strokeWidth={1.8}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/*recipe notes */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#5A0D36]">
              Recipe Notes
            </label>

            <textarea
              value={recipeForm.notes}
              onChange={(e) =>
                onFormChange("notes", e.target.value)
              }
              placeholder="Add recipe notes..."
              rows={4}
              disabled={isSaving}
              className="
                w-full
                rounded-xl
                border
                border-pink-100
                bg-white
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-[#D291BC]
                focus:ring-2
                focus:ring-[#FFC3D0]/40
                disabled:bg-gray-100
              "
            />
          </div>
        </div>

        {/*footer*/}
        <div className="flex justify-end gap-3 border-t border-pink-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="
              rounded-full
              border-2
              border-[#D291BC]
              bg-white
              px-6
              py-3
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-[#B185DB]
              transition
              hover:bg-[#FFC3D0]/20
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="
              rounded-full
              bg-linear-to-r
              from-[#B185DB]
              via-[#D291BC]
              to-[#FFC3D0]
              px-7
              py-3
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-white
              shadow-md
              transition
              hover:opacity-95
              disabled:opacity-50
            "
          >
            {isSaving
              ? "Saving..."
              : selectedRecipe
                ? "Save Changes"
                : "Add Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}