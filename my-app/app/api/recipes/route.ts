import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
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
        { status: 401 }
      );
    }

    const { data: recipes, error } = await supabase
      .from("recipes")
      .select(`
        recipe_id,
        user_id,
        name,
        description,
        base_servings,
        cost,
        image_url,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch recipes.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recipes.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      base_servings,
      cost,
      image_url,
      ingredients = [],
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipe name is required.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(ingredients)) {
      return NextResponse.json(
        {
          success: false,
          message: "Ingredients must be an array.",
        },
        { status: 400 }
      );
    }

    //create recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description ?? null,
        base_servings: base_servings ?? 1,
        cost: Number(cost) || 0,
        image_url: image_url ?? null,
      })
      .select()
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create recipe.",
          error: recipeError?.message,
        },
        { status: 500 }
      );
    }

    const recipeIngredientRows: {
      recipe_id: string;
      ingredient_id: string;
      quantity: number;
    }[] = [];

    for (const ingredient of ingredients) {
      const ingredientName = ingredient.name?.trim();

      if (!ingredientName) {
        continue;
      }

      const quantity = Number(ingredient.quantity);

      if (!Number.isFinite(quantity) || quantity < 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid quantity for ${ingredientName}.`,
          },
          { status: 400 }
        );
      }

      let ingredientId = ingredient.ingredient_id;

      //existing ingredient
      if (ingredientId) {
        const { data: existingIngredient, error: ingredientError } =
          await supabase
            .from("ingredients")
            .select("ingredient_id")
            .eq("ingredient_id", ingredientId)
            .eq("user_id", user.id)
            .single();

        if (ingredientError || !existingIngredient) {
          return NextResponse.json(
            {
              success: false,
              message: `Ingredient "${ingredientName}" was not found.`,
            },
            { status: 400 }
          );
        }

        await supabase
          .from("ingredients")
          .update({
            name: ingredientName,
            unit: ingredient.unit || "g",
            unit_price: Number(ingredient.unitCost) || 0,
          })
          .eq("ingredient_id", ingredientId)
          .eq("user_id", user.id);
      }

      //new ingredient
      else {
        const { data: newIngredient, error: newIngredientError } =
          await supabase
            .from("ingredients")
            .insert({
              user_id: user.id,
              name: ingredientName,
              unit: ingredient.unit || "g",
              unit_price: Number(ingredient.unitCost) || 0,
            })
            .select("ingredient_id")
            .single();

        if (newIngredientError || !newIngredient) {
          return NextResponse.json(
            {
              success: false,
              message: `Failed to create ingredient "${ingredientName}".`,
              error: newIngredientError?.message,
            },
            { status: 500 }
          );
        }

        ingredientId = newIngredient.ingredient_id;
      }

      recipeIngredientRows.push({
        recipe_id: recipe.recipe_id,
        ingredient_id: ingredientId,
        quantity,
      });
    }

    //link ingredients to recipe
    if (recipeIngredientRows.length > 0) {
      const { error: linkError } = await supabase
        .from("recipe_ingredients")
        .insert(recipeIngredientRows);

      if (linkError) {
        return NextResponse.json(
          {
            success: false,
            message: "Recipe created but ingredients could not be saved.",
            error: linkError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Recipe created successfully.",
        recipe,
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