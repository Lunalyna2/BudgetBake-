import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Recipe } from "../types/recipe";
import RecipeCard from "./RecipeCard";

type RecipeCarouselProps = {
  recipes: Recipe[];
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onEditRecipe: (recipe: Recipe) => void;
  onScroll: (direction: "left" | "right") => void;
  carouselRef: React.RefObject<HTMLDivElement | null>;
};

export default function RecipeCarousel({
  recipes,
  canScrollPrev,
  canScrollNext,
  onEditRecipe,
  onScroll,
  carouselRef,
}: RecipeCarouselProps) {
  return (
    <div className="relative mt-8">
      {recipes.length > 5 && canScrollPrev && (
        <button
          type="button"
          onClick={() => onScroll("left")}
          className="absolute -left-5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-300 bg-white p-2.5 text-zinc-800 shadow-md hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {recipes.length > 5 && canScrollNext && (
        <button
          type="button"
          onClick={() => onScroll("right")}
          className="absolute -right-5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-300 bg-white p-2.5 text-zinc-800 shadow-md hover:bg-gray-50 transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <div
        ref={carouselRef}
        className="flex gap-5 overflow-x-auto py-2 scroll-smooth scrollbar-hide"
      >
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onEdit={onEditRecipe} />
        ))}
      </div>
    </div>
  );
}
