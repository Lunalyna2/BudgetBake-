export type Ingredient = {
  name?: string;
  quantity?: number;
  amount?: number;
  unit?: string;
  unitPrice?: number;
  price?: number;
  unitCost?: number;
  cost?: number;
  [key: string]: unknown;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const getQuantityKey = (ingredient: Ingredient): 'quantity' | 'amount' =>
  Object.prototype.hasOwnProperty.call(ingredient, 'quantity') ? 'quantity' : 'amount';

const getQuantity = (ingredient: Ingredient): number =>
  toNumber(ingredient.quantity ?? ingredient.amount ?? 1);


const getUnitPrice = (ingredient: Ingredient): number =>
  toNumber(ingredient.unitPrice ?? ingredient.price ?? ingredient.unitCost ?? 0);


export const scaleIngredient = (ingredient: Ingredient, factor: number): Ingredient => {
  const quantityKey = getQuantityKey(ingredient);
  const scaledQuantity = getQuantity(ingredient) * factor;

  const hasUnitPrice =
    ingredient.unitPrice !== undefined ||
    ingredient.price !== undefined ||
    ingredient.unitCost !== undefined;

  const scaledCost =
    !hasUnitPrice && ingredient.cost !== undefined
      ? toNumber(ingredient.cost) * factor
      : ingredient.cost;

  return {
    ...ingredient,
    quantity: scaledQuantity,
    amount: scaledQuantity,
    ...(scaledCost !== undefined ? { cost: scaledCost } : {}),
    // keep whichever key was originally present as the "canonical" one too
    [quantityKey]: scaledQuantity,
  };
};


export const getIngredientCost = (ingredient: Ingredient): number => {
  const hasUnitPrice =
    ingredient.unitPrice !== undefined ||
    ingredient.price !== undefined ||
    ingredient.unitCost !== undefined;

  if (!hasUnitPrice && ingredient.cost !== undefined) {
    return toNumber(ingredient.cost);
  }

  return getQuantity(ingredient) * getUnitPrice(ingredient);
};

export const calculateTotalCost = (ingredients: Ingredient[], factor: number): number =>
  ingredients
    .map((ingredient) => scaleIngredient(ingredient, factor))
    .reduce((total, ingredient) => total + getIngredientCost(ingredient), 0);