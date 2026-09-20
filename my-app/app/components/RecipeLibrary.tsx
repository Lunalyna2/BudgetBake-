"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import GreetingsCard from "./GreetingsCard";
import RecipeCarousel from "./RecipeCarousel";
import RemindersCard from "./RemindersCard";
import RecipeModal from "./modals/RecipeModal";
import RemindersModal from "./modals/RemindersModal";
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";

import {
  blankRecipeForm,
  initialRecipes,
  initialReminders,
} from "../data/initialData";

import type {
  Recipe,
  RecipeFormState,
  RecipeIngredient,
  Reminder,
} from "../types/recipe";

export default function RecipeLibrary() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [reminders, setReminders] =
    useState<Reminder[]>(initialReminders);

  const [isRecipeModalOpen, setIsRecipeModalOpen] =
    useState(false);

  const [selectedRecipe, setSelectedRecipe] =
    useState<Recipe | null>(null);

  const [recipeForm, setRecipeForm] =
    useState<RecipeFormState>(blankRecipeForm);

  // user name state
  const [userName, setUserName] = useState("");

  // ingredient state
  const [recipeIngredients, setRecipeIngredients] =
    useState<RecipeIngredient[]>([]);

  const [isSavingRecipe, setIsSavingRecipe] =
    useState(false);

  //reminder state
  const [isRemindersModalOpen, setIsRemindersModalOpen] =
    useState(false);

  const [newReminderText, setNewReminderText] =
    useState("");

  //carousel state
  const [canScrollPrev, setCanScrollPrev] =
    useState(false);

  const [canScrollNext, setCanScrollNext] =
    useState(false);

  // delete recipe state
  const [isDeleteMode, setIsDeleteMode] =
    useState(false);

  const [recipeToDelete, setRecipeToDelete] =
    useState<Recipe | null>(null);

  const carouselRef =
    useRef<HTMLDivElement | null>(null);

  // fetch user name
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("users")
          .select("name")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error(
            "Failed to load user name:",
            error
          );
          return;
        }

        setUserName(data?.name ?? "");
      } catch (error) {
        console.error(
          "Error loading user name:",
          error
        );
      }
    };

    loadUserName();
  }, []);

  // fetch recipes state
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("/api/recipes");

        if (!response.ok) {
          throw new Error("Failed to fetch recipes.");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch recipes."
          );
        }

        const formattedRecipes: Recipe[] =
          data.recipes.map(
            (recipe: {
              recipe_id: string;
              name: string;
              description: string | null;
              cost: number;
              image_url: string | null;
            }) => ({
              id: recipe.recipe_id,
              title: recipe.name,
              cost: Number(recipe.cost) || 0,
              notes: recipe.description ?? "",
              imageUrl: recipe.image_url ?? "",
            })
          );

        setRecipes(formattedRecipes);
      } catch (error) {
        console.error(
          "Error fetching recipes:",
          error
        );
      }
    };

    fetchRecipes();
  }, []);

  // fetch reminders state
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch(
          "/api/reminders"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch reminders."
          );
        }

        const data =
          await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Failed to fetch reminders."
          );
        }

        const formattedReminders: Reminder[] =
          (data.reminders ?? []).map(
            (reminder: {
              reminder_id: string;
              text: string;
              completed: boolean;
            }) => ({
              id:
                reminder.reminder_id,
              text:
                reminder.text,
              completed:
                reminder.completed,
            })
          );

        setReminders(
          formattedReminders
        );
      } catch (error) {
        console.error(
          "Error fetching reminders:",
          error
        );
      }
    };

    fetchReminders();
  }, []);

  //carousel scroll buttons state
  useEffect(() => {
    const updateCarouselButtons = () => {
      const container = carouselRef.current;

      if (!container) return;

      setCanScrollPrev(
        container.scrollLeft > 5
      );

      setCanScrollNext(
        container.scrollLeft <
          container.scrollWidth -
            container.clientWidth -
            5
      );
    };

    updateCarouselButtons();

    const container = carouselRef.current;

    container?.addEventListener(
      "scroll",
      updateCarouselButtons
    );

    window.addEventListener(
      "resize",
      updateCarouselButtons
    );

    return () => {
      container?.removeEventListener(
        "scroll",
        updateCarouselButtons
      );

      window.removeEventListener(
        "resize",
        updateCarouselButtons
      );
    };
  }, [recipes]);

  //add ingredient
  const handleAddIngredient = () => {
    setRecipeIngredients((current) => [
      ...current,
      {
        id: `new-${Date.now()}-${Math.random()}`,
        name: "",
        quantity: "0",
        unit: "g",
        unitCost: 0,
      },
    ]);
  };

  //remove ingredient
  const handleRemoveIngredient = (
    id: string
  ) => {
    setRecipeIngredients((current) =>
      current.filter(
        (ingredient) =>
          ingredient.id !== id
      )
    );
  };

  //edit ingredient
  const handleIngredientChange = (
    id: string,
    field: keyof RecipeIngredient,
    value: string
  ) => {
    setRecipeIngredients((current) =>
      current.map((ingredient) => {
        if (ingredient.id !== id) {
          return ingredient;
        }

        if (field === "unitCost") {
          return {
            ...ingredient,
            unitCost:
              Number(value) || 0,
          };
        }

        return {
          ...ingredient,
          [field]: value,
        };
      })
    );
  };

  //open new recipe modal
  const openNewRecipeModal = () => {
    setSelectedRecipe(null);

    setRecipeForm(blankRecipeForm);

    setRecipeIngredients([
      {
        id: `new-${Date.now()}`,
        name: "",
        quantity: "0",
        unit: "g",
        unitCost: 0,
      },
    ]);

    setIsRecipeModalOpen(true);
  };

  //open edit recipe modal
  const openEditRecipeModal = async (
    recipe: Recipe
  ) => {
    setSelectedRecipe(recipe);

    setRecipeForm({
      title: recipe.title,
      cost: String(recipe.cost),
      notes: recipe.notes,
      imageUrl: recipe.imageUrl,
    });

    setRecipeIngredients([]);

    setIsRecipeModalOpen(true);

    try {
      const response = await fetch(
        `/api/recipes/${recipe.id}`
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to fetch recipe."
        );
      }

      const formattedIngredients:
        RecipeIngredient[] =
        (data.recipe.ingredients ?? []).map(
          (item: {
            recipe_ingredient_id?: string;
            ingredient_id?: string;
            name?: string;
            quantity?: number;
            unit?: string;
            unit_price?: number;
          }) => ({
            id:
              item.recipe_ingredient_id ??
              item.ingredient_id ??
              `ingredient-${Date.now()}-${Math.random()}`,
            ingredient_id:
              item.ingredient_id,
            name:
              item.name ?? "",
            quantity:
              String(
                item.quantity ?? 0
              ),
            unit:
              item.unit ?? "g",
            unitCost:
              Number(
                item.unit_price
              ) || 0,
          })
        );

      setRecipeIngredients(
        formattedIngredients
      );
    } catch (error) {
      console.error(
        "Failed to load recipe ingredients:",
        error
      );

      alert(
        "Failed to load recipe ingredients."
      );
    }
  };

  //recipe form change handler
  const handleRecipeFormChange = (
    field: keyof RecipeFormState,
    value: string
  ) => {
    setRecipeForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  //save recipe handler
  const handleSaveRecipe = async () => {
    if (!recipeForm.title.trim()) {
      alert(
        "Please enter a recipe name."
      );

      return;
    }

    try {
      setIsSavingRecipe(true);

      const sanitizedCost =
        Number(
          recipeForm.cost.replace(
            /[^0-9.]/g,
            ""
          )
        ) || 0;

      const recipeData = {
        name:
          recipeForm.title.trim(),

        description:
          recipeForm.notes,

        cost:
          sanitizedCost,

        image_url:
          recipeForm.imageUrl ||
          null,

        base_servings: 1,

        ingredients:
          recipeIngredients
            .filter(
              (ingredient) =>
                ingredient.name.trim() !== ""
            )
            .map((ingredient) => ({
              ingredient_id:
                ingredient.ingredient_id,

              name:
                ingredient.name.trim(),

              quantity:
                Number(
                  ingredient.quantity
                ) || 0,

              unit:
                ingredient.unit,

              unitCost:
                Number(
                  ingredient.unitCost
                ) || 0,
            })),
      };

      //create/update recipe API call
      const url = selectedRecipe
        ? `/api/recipes/${selectedRecipe.id}`
        : "/api/recipes";

      const method = selectedRecipe
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify(
              recipeData
            ),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to save recipe."
        );
      }

      //refresh recipes list after saving
      const recipesResponse =
        await fetch("/api/recipes");

      const recipesData =
        await recipesResponse.json();

      if (
        recipesResponse.ok &&
        recipesData.success
      ) {
        const formattedRecipes:
          Recipe[] =
          recipesData.recipes.map(
            (recipe: {
              recipe_id: string;
              name: string;
              description:
                string | null;
              cost: number;
              image_url:
                string | null;
            }) => ({
              id:
                recipe.recipe_id,

              title:
                recipe.name,

              cost:
                Number(
                  recipe.cost
                ) || 0,

              notes:
                recipe.description ??
                "",

              imageUrl:
                recipe.image_url ??
                "",
            })
          );

        setRecipes(
          formattedRecipes
        );
      }

      //reset modal and form state after saving
      setIsRecipeModalOpen(false);

      setSelectedRecipe(null);

      setRecipeIngredients([]);

      setRecipeForm(
        blankRecipeForm
      );
    } catch (error) {
      console.error(
        "Failed to save recipe:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save recipe."
      );
    } finally {
      setIsSavingRecipe(false);
    }
  };

  // image upload handler
  const handleUploadImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        handleRecipeFormChange(
          "imageUrl",
          reader.result
        );
      }
    };

    reader.onerror = () => {
      console.error(
        "Failed to read image file."
      );

      alert(
        "Failed to load the selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  //reminders
  const toggleReminder = async (
    id: string
  ) => {
    const reminder =
      reminders.find(
        (item) =>
          item.id === id
      );

    if (!reminder) return;

    const newCompleted =
      !reminder.completed;

    // update UI immediately
    setReminders((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              completed:
                newCompleted,
            }
          : item
      )
    );

    try {
      const response = await fetch(
        `/api/reminders/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
              completed:
                newCompleted,
            }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update reminder."
        );
      }
    } catch (error) {
      console.error(
        "Failed to update reminder:",
        error
      );

      //revert UI if saving failed
      setReminders((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                completed:
                  !newCompleted,
              }
            : item
        )
      );
    }
  };

  const handleAddReminder =
    async () => {
      const trimmedTask =
        newReminderText.trim();

      if (!trimmedTask) return;

      try {
        const response =
          await fetch(
            "/api/reminders",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  text:
                    trimmedTask,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to create reminder."
          );
        }

        const newReminder:
          Reminder = {
          id:
            data.reminder.reminder_id,

          text:
            data.reminder.text,

          completed:
            data.reminder.completed,
        };

        setReminders((current) => [
          ...current,
          newReminder,
        ]);

        setNewReminderText("");
      } catch (error) {
        console.error(
          "Failed to add reminder:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Failed to add reminder."
        );
      }
    };

  const handleDeleteReminder =
    async (
      id: string
    ) => {
      try {
        const response =
          await fetch(
            `/api/reminders/${id}`,
            {
              method: "DELETE",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to delete reminder."
          );
        }

        setReminders((current) =>
          current.filter(
            (reminder) =>
              reminder.id !== id
          )
        );
      } catch (error) {
        console.error(
          "Failed to delete reminder:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Failed to delete reminder."
        );
      }
    };

  //carousel scroll handler
  const scrollCarousel = (
    direction: "left" | "right"
  ) => {
    const container =
      carouselRef.current;

    if (!container) return;

    const distance = 300;

    container.scrollBy({
      left:
        direction === "left"
          ? -distance
          : distance,
      behavior: "smooth",
    });
  };

  // delete recipe handlers
  const handleDeleteRecipe = (
    recipe: Recipe
  ) => {
    setRecipeToDelete(recipe);
  };

  const confirmDeleteRecipe = async () => {
    if (!recipeToDelete) return;

    const recipeId =
      recipeToDelete.id;

    try {
      const response =
        await fetch(
          `/api/recipes/${recipeId}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete recipe."
        );
      }

      setRecipes((current) =>
        current.filter(
          (recipe) =>
            recipe.id !== recipeId
        )
      );

      setRecipeToDelete(null);
      setIsDeleteMode(false);
    } catch (error) {
      console.error(
        "Failed to delete recipe:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete recipe."
      );
    }
  };

  const cancelDeleteRecipe = () => {
    setRecipeToDelete(null);
  };

  return (
    <div className="bg-white text-zinc-800 antialiased">
      <main className="mx-auto max-w-7xl px-10 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#5A0D36] sm:text-4xl">
              Recipe Library
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-[#D291BC]">
              Recipe Collection
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
              Browse, create, and manage your recipes. Track ingredients,
              costs, and nutritional information all in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsDeleteMode(
                (prev) => !prev
              )
            }
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
          <GreetingsCard
            userName={userName}
            recipeCount={recipes.length}
            onAddRecipe={
              openNewRecipeModal
            }
          />

          <RemindersCard
            reminders={reminders}
            onToggleReminder={
              toggleReminder
            }
            onOpenModal={() =>
              setIsRemindersModalOpen(
                true
              )
            }
          />
        </div>

        <RecipeCarousel
          recipes={recipes}
          canScrollPrev={
            canScrollPrev
          }
          canScrollNext={
            canScrollNext
          }
          onEditRecipe={
            openEditRecipeModal
          }
          onScroll={
            scrollCarousel
          }
          carouselRef={
            carouselRef
          }
          isDeleteMode={
            isDeleteMode
          }
          onDeleteRecipe={
            handleDeleteRecipe
          }
        />
      </main>

      {/*recipe modal*/}
      <RecipeModal
        isOpen={
          isRecipeModalOpen
        }
        selectedRecipe={
          selectedRecipe
        }
        recipeForm={
          recipeForm
        }
        ingredients={
          recipeIngredients
        }
        isSaving={
          isSavingRecipe
        }
        onClose={() =>
          setIsRecipeModalOpen(
            false
          )
        }
        onFormChange={
          handleRecipeFormChange
        }
        onUploadImage={
          handleUploadImage
        }
        onIngredientChange={
          handleIngredientChange
        }
        onAddIngredient={
          handleAddIngredient
        }
        onRemoveIngredient={
          handleRemoveIngredient
        }
        onSave={
          handleSaveRecipe
        }
      />

      {/*reminders modal*/}
      <RemindersModal
        isOpen={
          isRemindersModalOpen
        }
        reminders={
          reminders
        }
        newReminderText={
          newReminderText
        }
        onClose={() =>
          setIsRemindersModalOpen(
            false
          )
        }
        onToggleReminder={
          toggleReminder
        }
        onDeleteReminder={
          handleDeleteReminder
        }
        onNewReminderTextChange={
          setNewReminderText
        }
        onAddReminder={
          handleAddReminder
        }
      />

      {/*delete confirmation modal*/}
      <DeleteConfirmationModal
        isOpen={
          recipeToDelete !== null
        }
        recipeTitle={
          recipeToDelete?.title ??
          ""
        }
        onClose={
          cancelDeleteRecipe
        }
        onConfirm={
          confirmDeleteRecipe
        }
      />
    </div>
  );
}