export type Recipe = {
  id: string;
  title: string;
  cost: number;
  notes: string;
  imageUrl: string;
};

export type Reminder = {
  id: string;
  text: string;
  completed: boolean;
};

export type RecipeFormState = {
  title: string;
  cost: string;
  notes: string;
  imageUrl: string;
};
