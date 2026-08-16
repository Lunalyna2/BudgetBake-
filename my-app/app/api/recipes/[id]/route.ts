import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipe ID is required.",
        },
        { status: 400 }
      );
    }

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select(`
        recipe_id,
        user_id,
        name,
        description,
        base_servings,
        created_at,
        recipe_ingredients (
          recipe_ingredient_id,
          quantity,
          ingredient_id,
          ingredients (
            ingredient_id,
            name,
            unit,
            unit_price
          )
        )
      `)
      .eq("recipe_id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            message: "Recipe not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch recipe.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const formattedRecipe = {
      recipe_id: recipe.recipe_id,
      user_id: recipe.user_id,
      name: recipe.name,
      description: recipe.description,
      base_servings: recipe.base_servings,
      created_at: recipe.created_at,
      ingredients: recipe.recipe_ingredients.map((item) => {
        const ingredient = item.ingredients;

        return {
          recipe_ingredient_id: item.recipe_ingredient_id,
          ingredient_id: item.ingredient_id,
          name: ingredient?.name,
          unit: ingredient?.unit,
          unit_price: ingredient?.unit_price,
          quantity: item.quantity,
        };
      }),
    };

    return NextResponse.json({
      success: true,
      recipe: formattedRecipe,
    });
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