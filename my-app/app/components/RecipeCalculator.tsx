'use client';

import { useState, useEffect } from 'react';
import { calculateItemCost, calculateTotalBatchCost, Ingredient } from '@/utils/costing';

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

export default function RecipeCalculator({ recipeId }: { recipeId: string }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Requirement: Default batch size factor to 1
  const [batchSize, setBatchSize] = useState<number>(1);

  // Requirement: Fetch data from /api/recipes/[id]
  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true);
        const res = await fetch(`/api/recipes/${recipeId}`);
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
      } finally {
        setLoading(false);
      }
    }

    if (recipeId) fetchRecipe();
  }, [recipeId]);

  if (loading) return <p>Loading calculator...</p>;
  if (!recipe) return <p>No recipe found.</p>;

  // Requirement: Compute values on-the-fly inside the render loop 
  // without modifying the fetched recipe.ingredients state array.
  const computedIngredients = recipe.ingredients.map((item) => ({
    ...item,
    scaledQuantity: item.quantity * batchSize,
    totalCost: calculateItemCost(item, batchSize),
  }));

  const totalCost = calculateTotalBatchCost(recipe.ingredients, batchSize);

  return (
    <div className="p-4 border rounded-lg max-w-md">
      <h2 className="text-xl font-bold mb-3">{recipe.name}</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Batch Size Factor:</label>
        <input
          type="number"
          min="1"
          value={batchSize}
          onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value)))}
          className="mt-1 border p-2 rounded w-24"
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-gray-600">Calculated Ingredients</h3>
        {computedIngredients.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.name} ({item.scaledQuantity} {item.unit})</span>
            <span>${item.totalCost.toFixed(2)}</span>
          </div>
        ))}
        <hr className="my-2" />
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}