import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
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
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const recipeId = searchParams.get("recipe_id");

        if (!recipeId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Recipe is required.",
                },
                { status: 400 },
            );
        }

        const { data: calculation, error: calculationError } = await supabase
            .from("recipe_cost_calculations")
            .select(`
        calculation_id,
        recipe_id,
        batch_size,
        markup,
        total_recipe_cost,
        cost_per_unit,
        suggested_price_per_unit,
        estimated_profit,
        created_at,
        recipe_cost_calculation_ingredients (
          calculation_ingredient_id,
          ingredient_id,
          name,
          quantity,
          unit,
          unit_cost,
          total_cost
        )
      `)
            .eq("recipe_id", recipeId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (calculationError) {
            console.error(
                "Cost calculation fetch error:",
                calculationError,
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to fetch saved cost calculation.",
                },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            calculation: calculation ?? null,
        });
    } catch (error) {
        console.error("Cost calculation GET error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred.",
            },
            { status: 500 },
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
                { status: 401 },
            );
        }

        const body = await request.json();

        const {
            recipe_id,
            batch_size,
            markup,
            total_recipe_cost,
            cost_per_unit,
            suggested_price_per_unit,
            estimated_profit,
            ingredients,
        } = body;

        if (!recipe_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Recipe is required.",
                },
                { status: 400 },
            );
        }

        if (!Number.isFinite(Number(batch_size)) || Number(batch_size) <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Batch size must be greater than 0.",
                },
                { status: 400 },
            );
        }

        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "At least one ingredient is required.",
                },
                { status: 400 },
            );
        }

        // Make sure the recipe belongs to the logged-in user.
        const { data: recipe, error: recipeError } = await supabase
            .from("recipes")
            .select("recipe_id")
            .eq("recipe_id", recipe_id)
            .eq("user_id", user.id)
            .single();

        if (recipeError || !recipe) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Recipe not found or does not belong to this user.",
                },
                { status: 404 },
            );
        }

        // Check whether this recipe already has a saved calculation.
        const { data: existingCalculation, error: existingCalculationError } =
            await supabase
                .from("recipe_cost_calculations")
                .select("calculation_id")
                .eq("recipe_id", recipe_id)
                .eq("user_id", user.id)
                .maybeSingle();

        if (existingCalculationError) {
            console.error(
                "Existing calculation lookup error:",
                existingCalculationError,
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to check existing cost calculation.",
                },
                { status: 500 },
            );
        }

        let calculation;

        if (existingCalculation) {
            // Update the existing calculation for this recipe.
            const { data: updatedCalculation, error: updateError } = await supabase
                .from("recipe_cost_calculations")
                .update({
                    batch_size: Number(batch_size),
                    markup: Number(markup) || 0,
                    total_recipe_cost: Number(total_recipe_cost) || 0,
                    cost_per_unit: Number(cost_per_unit) || 0,
                    suggested_price_per_unit:
                        Number(suggested_price_per_unit) || 0,
                    estimated_profit: Number(estimated_profit) || 0,
                    created_at: new Date().toISOString(),
                })
                .eq("calculation_id", existingCalculation.calculation_id)
                .select()
                .single();

            if (updateError || !updatedCalculation) {
                console.error("Cost calculation update error:", updateError);

                return NextResponse.json(
                    {
                        success: false,
                        message: "Failed to update cost calculation.",
                    },
                    { status: 500 },
                );
            }

            calculation = updatedCalculation;

            // Remove the old ingredient snapshot.
            const { error: deleteIngredientsError } = await supabase
                .from("recipe_cost_calculation_ingredients")
                .delete()
                .eq("calculation_id", calculation.calculation_id);

            if (deleteIngredientsError) {
                console.error(
                    "Old ingredient snapshot delete error:",
                    deleteIngredientsError,
                );

                return NextResponse.json(
                    {
                        success: false,
                        message: "Failed to update saved ingredients.",
                    },
                    { status: 500 },
                );
            }
        } else {
            // No calculation exists yet, so create one.
            const { data: newCalculation, error: calculationError } = await supabase
                .from("recipe_cost_calculations")
                .insert({
                    user_id: user.id,
                    recipe_id,
                    batch_size: Number(batch_size),
                    markup: Number(markup) || 0,
                    total_recipe_cost: Number(total_recipe_cost) || 0,
                    cost_per_unit: Number(cost_per_unit) || 0,
                    suggested_price_per_unit:
                        Number(suggested_price_per_unit) || 0,
                    estimated_profit: Number(estimated_profit) || 0,
                })
                .select()
                .single();

            if (calculationError || !newCalculation) {
                console.error(
                    "Cost calculation insert error:",
                    calculationError,
                );

                return NextResponse.json(
                    {
                        success: false,
                        message: "Failed to save cost calculation.",
                    },
                    { status: 500 },
                );
            }

            calculation = newCalculation;
        }

        // Save the current ingredient snapshot.
        const ingredientRows = ingredients.map(
            (ingredient: {
                ingredient_id?: string;
                name: string;
                quantity: string | number;
                unit: string;
                unitCost: string | number;
            }) => ({
                calculation_id: calculation.calculation_id,
                ingredient_id: ingredient.ingredient_id || null,
                name: ingredient.name,
                quantity: Number(ingredient.quantity) || 0,
                unit: ingredient.unit,
                unit_cost: Number(ingredient.unitCost) || 0,
                total_cost:
                    (Number(ingredient.quantity) || 0) *
                    (Number(ingredient.unitCost) || 0),
            }),
        );

        const { error: ingredientError } = await supabase
            .from("recipe_cost_calculation_ingredients")
            .insert(ingredientRows);

        if (ingredientError) {
            console.error(
                "Cost calculation ingredient insert error:",
                ingredientError,
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to save calculation ingredients.",
                },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            calculation,
        });
    } catch (error) {
        console.error("Cost calculation API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred.",
            },
            { status: 500 },
        );
    }
}