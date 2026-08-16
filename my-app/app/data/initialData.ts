import type { Recipe, Reminder, RecipeFormState } from "../types/recipe";

export const initialRecipes: Recipe[] = [
  {
    id: "pretzel-cookies",
    title: "Pretzel Cookies",
    cost: 472,
    notes: "Soft pretzel cookie dough shaped into savory-sweet bites with sea salt finish.",
    imageUrl:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cinnamon-roll-cookies",
    title: "Cinnamon Roll Cookies",
    cost: 535,
    notes: "Warm cinnamon sugar swirls turned into tender cookies with cream cheese drizzle.",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cupcakes",
    title: "Cupcakes",
    cost: 300,
    notes: "Mini vanilla cupcakes topped with swirls of pastel buttercream frosting.",
    imageUrl:
      "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "croissant",
    title: "Croissant",
    cost: 700,
    notes: "Golden laminated croissants with crisp layers and a tender, airy crumb.",
    imageUrl:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "chocolate-cake",
    title: "Chocolate Cake",
    cost: 720,
    notes: "Decadent rich chocolate layers finished with silky ganache and crisp pearls.",
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
  },
];

export const initialReminders: Reminder[] = [
  { id: "reminder-1", text: "Low stocks for baking powder.", completed: false },
  { id: "reminder-2", text: "Buy more parchment paper.", completed: false },
  { id: "reminder-3", text: "Schedule for gas maintenance.", completed: false },
];

export const blankRecipeForm: RecipeFormState = {
  title: "",
  cost: "",
  notes: "",
  imageUrl: "",
};
