import type { Recipe } from "../types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
};

export default function RecipeCard({ recipe, onEdit }: RecipeCardProps) {
  return (
    <div
      onClick={() => onEdit(recipe)}
      className="group w-[210px] shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="h-44 w-full overflow-hidden bg-gray-100">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-bold text-[#5A0D36] truncate">
          {recipe.title}
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-amber-900/60">
          Cost: ₱{recipe.cost} / recipe
        </p>
      </div>
    </div>
  );
}
