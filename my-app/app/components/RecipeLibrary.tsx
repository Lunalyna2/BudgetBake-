"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

import GreetingsCard from "./GreetingsCard";
import RecipeCarousel from "./RecipeCarousel";
import RemindersCard from "./RemindersCard";
import RecipeModal from "./modals/RecipeModal";
import RemindersModal from "./modals/RemindersModal";
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";
import { blankRecipeForm, initialRecipes, initialReminders } from "../data/initialData";
import type { Recipe, Reminder, RecipeFormState } from "../types/recipe";

export default function RecipeLibrary() {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeForm, setRecipeForm] = useState<RecipeFormState>(blankRecipeForm);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [newReminderText, setNewReminderText] = useState("");
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateCarouselButtons = () => {
      const container = carouselRef.current;
      if (!container) return;
      setCanScrollPrev(container.scrollLeft > 5);
      setCanScrollNext(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 5
      );
    };

    updateCarouselButtons();
    const container = carouselRef.current;
    container?.addEventListener("scroll", updateCarouselButtons);
    window.addEventListener("resize", updateCarouselButtons);

    return () => {
      container?.removeEventListener("scroll", updateCarouselButtons);
      window.removeEventListener("resize", updateCarouselButtons);
    };
  }, [recipes]);

  const openNewRecipeModal = () => {
    setSelectedRecipe(null);
    setRecipeForm(blankRecipeForm);
    setIsRecipeModalOpen(true);
  };

  const openEditRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setRecipeForm({
      title: recipe.title,
      cost: String(recipe.cost),
      notes: recipe.notes,
      imageUrl: recipe.imageUrl,
    });
    setIsRecipeModalOpen(true);
  };

  const handleRecipeFormChange = (field: keyof RecipeFormState, value: string) => {
    setRecipeForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveRecipe = () => {
    const sanitizedCost = Number(recipeForm.cost.replace(/[^0-9.]/g, "")) || 0;
    const normalizedRecipe: Recipe = {
      id: selectedRecipe?.id ?? `recipe-${Date.now()}`,
      title: recipeForm.title || "Untitled Recipe",
      cost: sanitizedCost,
      notes: recipeForm.notes,
      imageUrl: recipeForm.imageUrl || "",
    };

    setRecipes((current) => {
      if (selectedRecipe) {
        return current.map((recipe) =>
          recipe.id === selectedRecipe.id ? normalizedRecipe : recipe
        );
      }
      return [normalizedRecipe, ...current];
    });
    setIsRecipeModalOpen(false);
  };

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleRecipeFormChange("imageUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleReminder = (id: string) => {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
  };

  const handleAddReminder = () => {
    const trimmedTask = newReminderText.trim();
    if (!trimmedTask) return;
    setReminders((current) => [
      ...current,
      { id: `task-${Date.now()}`, text: trimmedTask, completed: false },
    ]);
    setNewReminderText("");
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((current) => current.filter((reminder) => reminder.id !== id));
  };

  const scrollCarousel = (direction: "left" | "right") => {
    const container = carouselRef.current;
    if (!container) return;
    const distance = 300;
    container.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
  };

  const confirmDeleteRecipe = () => {
    if (!recipeToDelete) return;
    setRecipes((current) => current.filter((recipe) => recipe.id !== recipeToDelete.id));
    setRecipeToDelete(null);
    setIsDeleteMode(false);
  };

  const cancelDeleteRecipe = () => {
    setRecipeToDelete(null);
  };

  return (
    <div className="bg-white text-zinc-800 antialiased">
      <main className="mx-auto max-w-7xl px-10 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1.5 bg-[#800040] rounded-full" />
            <h1 className="text-lg font-bold uppercase tracking-wider text-[#800040]">
              RECIPE LIBRARY
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteMode((prev) => !prev)}
            className={`rounded-full p-2 transition-colors ${
              isDeleteMode
                ? "bg-[#800040] text-white"
                : "text-[#800040] hover:bg-[#800040]/10"
            }`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <GreetingsCard onAddRecipe={openNewRecipeModal} />
          <RemindersCard
            reminders={reminders}
            onToggleReminder={toggleReminder}
            onOpenModal={() => setIsRemindersModalOpen(true)}
          />
        </div>

        <RecipeCarousel
          recipes={recipes}
          canScrollPrev={canScrollPrev}
          canScrollNext={canScrollNext}
          onEditRecipe={openEditRecipeModal}
          onScroll={scrollCarousel}
          carouselRef={carouselRef}
          isDeleteMode={isDeleteMode}
          onDeleteRecipe={handleDeleteRecipe}
        />
      </main>

      <RecipeModal
        isOpen={isRecipeModalOpen}
        selectedRecipe={selectedRecipe}
        recipeForm={recipeForm}
        onClose={() => setIsRecipeModalOpen(false)}
        onFormChange={handleRecipeFormChange}
        onUploadImage={handleUploadImage}
        onSave={handleSaveRecipe}
      />

      <RemindersModal
        isOpen={isRemindersModalOpen}
        reminders={reminders}
        newReminderText={newReminderText}
        onClose={() => setIsRemindersModalOpen(false)}
        onToggleReminder={toggleReminder}
        onDeleteReminder={handleDeleteReminder}
        onNewReminderTextChange={setNewReminderText}
        onAddReminder={handleAddReminder}
      />

      <DeleteConfirmationModal
        isOpen={recipeToDelete !== null}
        recipeTitle={recipeToDelete?.title ?? ""}
        onClose={cancelDeleteRecipe}
        onConfirm={confirmDeleteRecipe}
      />
    </div>
  );
}
