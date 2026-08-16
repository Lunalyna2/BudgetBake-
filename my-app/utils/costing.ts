export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

export function calculateItemCost(item: Ingredient, batchSize: number): number {
  return item.quantity * batchSize * item.unitCost;
}

export function calculateTotalBatchCost(ingredients: Ingredient[], batchSize: number): number {
  return ingredients.reduce((total, item) => total + calculateItemCost(item, batchSize), 0);
}