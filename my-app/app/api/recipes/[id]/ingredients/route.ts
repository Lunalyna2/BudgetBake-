import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: recipeId } = await params;

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { ingredients } = body;

    if (!Array.isArray(ingredients)) {
      return NextResponse.json(
        {
          success: false,
          message: "Ingredients must be an array.",
        },
        { status: 400 },
      );
    }

    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("recipe_id")
      .eq("recipe_id", recipeId)
      .eq("user_id", user.id)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipe not found.",
        },
        { status: 404 },
      );
    }

    for (const ingredient of ingredients) {
      if (!ingredient.ingredient_id) {
        continue;
      }

      const quantity = Number(ingredient.quantity);

      if (!Number.isFinite(quantity) || quantity < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Ingredient quantity must be a valid non-negative number.",
          },
          { status: 400 },
        );
      }

      const { error: updateError } = await supabase
        .from("recipe_ingredients")
        .update({
          quantity,
        })
        .eq("recipe_id", recipeId)
        .eq("ingredient_id", ingredient.ingredient_id);

      if (updateError) {
        console.error("Ingredient update error:", updateError);

        return NextResponse.json(
          {
            success: false,
            message: "Failed to save ingredient changes.",
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Recipe ingredient changes saved successfully.",
    });
  } catch (error) {
    console.error("Unexpected ingredient save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}