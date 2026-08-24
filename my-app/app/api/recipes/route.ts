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
      .insert({
        user_id: user.id,
        name,
        description: description ?? null,
        base_servings: base_servings ?? 1,
        cost: cost ?? 0,
        image_url: image_url ?? null,
      })
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