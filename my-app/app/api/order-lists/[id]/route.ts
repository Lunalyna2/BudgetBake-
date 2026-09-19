import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const { data, error } = await supabase
      .from("order_lists")
      .select(`
        order_list_id,
        user_id,
        recipe_id,
        order_name,
        date,
        priority,
        created_at,
        order_list_customers (
          order_customer_id,
          customer_name,
          quantity,
          completed,
          created_at
        )
      `)
      .eq("order_list_id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error(
        "GET /api/order-lists/[id] error:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(
      "GET /api/order-lists/[id] unexpected error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const {
      order_name,
      date,
      priority,
      recipe_id,
      customers,
    } = body;

    const { data: existingOrder, error: existingError } =
      await supabase
        .from("order_lists")
        .select("order_list_id")
        .eq("order_list_id", id)
        .eq("user_id", user.id)
        .single();

    if (existingError || !existingOrder) {
      return NextResponse.json(
        { error: "Order list not found" },
        { status: 404 }
      );
    }

    const orderUpdates: Record<string, unknown> = {};

    if (typeof order_name === "string") {
      orderUpdates.order_name = order_name.trim();
    }

    if (typeof date === "string") {
      orderUpdates.date = date;
    }

    if (typeof priority === "boolean") {
      orderUpdates.priority = priority;
    }

    if (recipe_id !== undefined) {
      orderUpdates.recipe_id = recipe_id;
    }

    if (Object.keys(orderUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from("order_lists")
        .update(orderUpdates)
        .eq("order_list_id", id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error(
          "PUT /api/order-lists/[id] order error:",
          updateError
        );

        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }

    if (Array.isArray(customers)) {
      const { error: deleteCustomersError } = await supabase
        .from("order_list_customers")
        .delete()
        .eq("order_list_id", id);

      if (deleteCustomersError) {
        console.error(
          "PUT /api/order-lists/[id] customer delete error:",
          deleteCustomersError
        );

        return NextResponse.json(
          { error: deleteCustomersError.message },
          { status: 500 }
        );
      }

      const customerRows = customers
        .filter(
          (customer: any) =>
            customer &&
            typeof customer.customerName === "string" &&
            customer.customerName.trim().length > 0
        )
        .map((customer: any) => ({
          order_list_id: id,
          customer_name: customer.customerName.trim(),
          quantity: Math.max(
            1,
            Number(customer.quantity) || 1
          ),
          completed: Boolean(customer.completed),
        }));

      if (customerRows.length > 0) {
        const { error: insertCustomersError } =
          await supabase
            .from("order_list_customers")
            .insert(customerRows);

        if (insertCustomersError) {
          console.error(
            "PUT /api/order-lists/[id] customer insert error:",
            insertCustomersError
          );

          return NextResponse.json(
            { error: insertCustomersError.message },
            { status: 500 }
          );
        }
      }
    }

    const { data: updatedOrder, error: fetchError } =
      await supabase
        .from("order_lists")
        .select(`
          order_list_id,
          user_id,
          recipe_id,
          order_name,
          date,
          priority,
          created_at,
          order_list_customers (
            order_customer_id,
            customer_name,
            quantity,
            completed,
            created_at
          )
        `)
        .eq("order_list_id", id)
        .eq("user_id", user.id)
        .single();

    if (fetchError) {
      console.error(
        "PUT /api/order-lists/[id] fetch error:",
        fetchError
      );

      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedOrder,
    });
  } catch (error) {
    console.error(
      "PUT /api/order-lists/[id] unexpected error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const { data, error } = await supabase
      .from("order_lists")
      .delete()
      .eq("order_list_id", id)
      .eq("user_id", user.id)
      .select("order_list_id")
      .single();

    if (error) {
      console.error(
        "DELETE /api/order-lists/[id] error:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      message: "Order list deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/order-lists/[id] unexpected error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}