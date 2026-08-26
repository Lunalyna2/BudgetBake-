import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RecipeRouteContext = {
  params: Promise<{ id: string }>;
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
      cost: recipe.cost,
      image_url: recipe.image_url,
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
    } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipe name is required.",
        },
        { status: 400 }
      );
    }

    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .update({
        name,
        description: description ?? null,
        base_servings: base_servings ?? 1,
        cost: cost ?? 0,
        image_url: image_url ?? null,
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
          message: "Failed to update recipe.",
          error: recipeError.message,
        },
        { status: 500 }
      );
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
        error: error instanceof Error ? error.message : "Unknown error",
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

    const { data: recipe, error: deleteError } = await supabase
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
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}