import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type RecipeRouteContext = {
  params: Promise<{ id: string }>;
};

type IngredientInput = {
  ingredient_id?: string;
  name?: string;
  quantity?: number | string;
  unit?: string;
  unitCost?: number | string;
};

export async function GET(
  request: Request,
  { params }: RecipeRouteContext
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

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select(`
        recipe_id,
        user_id,
        name,
        description,
        base_servings,
        cost,
        image_url,
        created_at,
        recipe_ingredients (
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
      .eq("user_id", user.id)
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
      cost: Number(recipe.cost) || 0,
      image_url: recipe.image_url,
      created_at: recipe.created_at,

      ingredients: recipe.recipe_ingredients.map((item) => {
        const ingredient = Array.isArray(item.ingredients)
          ? item.ingredients[0]
          : item.ingredients;

        return {
          ingredient_id: item.ingredient_id,
          name: ingredient?.name ?? "",
          unit: ingredient?.unit ?? "g",
          unit_price: Number(ingredient?.unit_price) || 0,
          quantity: Number(item.quantity) || 0,
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
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 400 }
    );
  }
}

/*
 * UPDATE ONLY THE RECIPE COST
 *
 * This is used by the Cost Calculator after
 * generating a new recipe cost.
 *
 * It does not touch:
 * - recipe name
 * - description
 * - image
 * - ingredients
 * - base servings
 */
export async function PATCH(
  request: Request,
  { params }: RecipeRouteContext
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

    const cost = Number(body.cost);

    if (!Number.isFinite(cost) || cost < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid recipe cost.",
        },
        { status: 400 }
      );
    }

    const {
      data: recipe,
      error: recipeError,
    } = await supabase
      .from("recipes")
      .update({
        cost,
      })
      .eq("recipe_id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (recipeError) {
      if (recipeError.code === "PGRST116") {
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
          message: "Failed to update recipe cost.",
          error: recipeError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recipe cost updated successfully.",
      recipe,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RecipeRouteContext
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
    } = body as {
      name: string;
      description?: string;
      base_servings?: number;
      cost?: number;
      image_url?: string | null;
      ingredients?: IngredientInput[];
    };

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

    //check recipe ownership
    const {
      data: existingRecipe,
      error: existingRecipeError,
    } = await supabase
      .from("recipes")
      .select("recipe_id")
      .eq("recipe_id", id)
      .eq("user_id", user.id)
      .single();

    if (existingRecipeError || !existingRecipe) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipe not found.",
        },
        { status: 404 }
      );
    }

    //update recipe
    const recipeUpdate: {
      name: string;
      description: string | null;
      base_servings: number;
      cost: number;
      image_url?: string | null;
    } = {
      name: name.trim(),
      description: description ?? null,
      base_servings: base_servings ?? 1,
      cost: Number(cost) || 0,
    };

    // IMPORTANT:
    // Only update image_url when it is actually supplied.
    // This prevents Cost Calculator updates from removing the recipe photo.
    if (image_url !== undefined) {
      recipeUpdate.image_url = image_url;
    }

    const {
      data: recipe,
      error: recipeError,
    } = await supabase
      .from("recipes")
      .update(recipeUpdate)
      .eq("recipe_id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (recipeError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update recipe.",
          error: recipeError.message,
        },
        { status: 500 }
      );
    }

    //remove existing ingredient links
    const { error: deleteError } = await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", id);

    if (deleteError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update recipe ingredients.",
          error: deleteError.message,
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

      //skip empty ingredient rows
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

      let ingredientId: string | undefined =
        ingredient.ingredient_id;

      //existing ingredient
      if (ingredientId) {
        const {
          data: existingIngredient,
          error: ingredientError,
        } = await supabase
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

        //update master ingredient information
        const { error: updateIngredientError } =
          await supabase
            .from("ingredients")
            .update({
              name: ingredientName,
              unit: ingredient.unit || "g",
              unit_price:
                Number(ingredient.unitCost) || 0,
            })
            .eq("ingredient_id", ingredientId)
            .eq("user_id", user.id);

        if (updateIngredientError) {
          return NextResponse.json(
            {
              success: false,
              message: `Failed to update ingredient "${ingredientName}".`,
              error: updateIngredientError.message,
            },
            { status: 500 }
          );
        }
      }

      //new ingredient
      else {
        const {
          data: newIngredient,
          error: newIngredientError,
        } = await supabase
          .from("ingredients")
          .insert({
            user_id: user.id,
            name: ingredientName,
            unit: ingredient.unit || "g",
            unit_price:
              Number(ingredient.unitCost) || 0,
          })
          .select("ingredient_id")
          .single();

        if (
          newIngredientError ||
          !newIngredient
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Failed to create ingredient "${ingredientName}".`,
              error:
                newIngredientError?.message,
            },
            { status: 500 }
          );
        }

        ingredientId =
          newIngredient.ingredient_id;
      }

      //ensure we have a valid ingredient ID at this point
      const finalIngredientId = ingredientId;

      if (!finalIngredientId) {
        return NextResponse.json(
          {
            success: false,
            message: `Failed to determine ingredient ID for "${ingredientName}".`,
          },
          { status: 500 }
        );
      }

      recipeIngredientRows.push({
        recipe_id: id,
        ingredient_id: finalIngredientId,
        quantity,
      });
    }

    //insert recipe ingredient links
    if (recipeIngredientRows.length > 0) {
      const { error: insertError } =
        await supabase
          .from("recipe_ingredients")
          .insert(recipeIngredientRows);

      if (insertError) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Failed to save recipe ingredients.",
            error: insertError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Recipe updated successfully.",
      recipe,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RecipeRouteContext
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

    //remove recipe ingredient links first
    const { error: recipeIngredientsError } =
      await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", id);

    if (recipeIngredientsError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete recipe ingredients.",
          error: recipeIngredientsError.message,
        },
        { status: 500 }
      );
    }

    const {
      data: recipe,
      error: deleteError,
    } = await supabase
      .from("recipes")
      .delete()
      .eq("recipe_id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (deleteError) {
      if (deleteError.code === "PGRST116") {
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
          message: "Failed to delete recipe.",
          error: deleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recipe deleted successfully.",
      recipe,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 400 }
    );
  }
}