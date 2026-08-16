import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      user_id,
      name,
      description,
      base_servings,
      ingredients,
    } = body;

    // Validate required recipe fields
    if (!user_id || !name || !base_servings) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required recipe fields.",
        },
        { status: 400 }
      );
    }

    // Validate ingredients array
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Ingredients must be a non-empty array.",
        },
        { status: 400 }
      );
    }

    // Insert the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id,
        name,
        description: description ?? null,
        base_servings,
      })
      .select("recipe_id")
      .single();

    if (recipeError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create recipe.",
          error: recipeError.message,
        },
        { status: 500 }
      );
    }

    // Convert the ingredients array into recipe_ingredients rows
    const recipeIngredients = ingredients.map(
      (ingredient: {
        ingredient_id: string;
        quantity: number;
      }) => ({
        recipe_id: recipe.recipe_id,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
      })
    );

    // Insert the recipe's ingredients
    const { error: ingredientError } = await supabase
      .from("recipe_ingredients")
      .insert(recipeIngredients);

    if (ingredientError) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipe was created, but its ingredients could not be added.",
          error: ingredientError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Recipe created successfully.",
        recipe_id: recipe.recipe_id,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}