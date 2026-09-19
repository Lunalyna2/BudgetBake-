import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/order-lists error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/order-lists unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const {
      order_name,
      date,
      priority = false,
      recipe_id = null,
      customers = [],
    } = body;

    if (!order_name || typeof order_name !== "string") {
      return NextResponse.json(
        { error: "order_name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(customers)) {
      return NextResponse.json(
        { error: "customers must be an array" },
        { status: 400 }
      );
    }

    const { data: orderList, error: orderListError } = await supabase
      .from("order_lists")
      .insert({
        user_id: user.id,
        recipe_id,
        order_name: order_name.trim(),
        date: date || new Date().toISOString().slice(0, 10),
        priority: Boolean(priority),
      })
      .select()
      .single();

    if (orderListError) {
      console.error("POST /api/order-lists order error:", orderListError);

      return NextResponse.json(
        { error: orderListError.message },
        { status: 500 }
      );
    }

    if (customers.length > 0) {
      const customerRows = customers
        .filter(
          (customer: any) =>
            customer &&
            typeof customer.customer_name === "string" &&
            customer.customer_name.trim().length > 0
        )
        .map((customer: any) => ({
          order_list_id: orderList.order_list_id,
          customer_name: customer.customer_name.trim(),
          quantity: Math.max(1, Number(customer.quantity) || 1),
          completed: Boolean(customer.completed),
        }));

      if (customerRows.length > 0) {
        const { error: customersError } = await supabase
          .from("order_list_customers")
          .insert(customerRows);

        if (customersError) {
          console.error(
            "POST /api/order-lists customer error:",
            customersError
          );

          // Clean up the order list if customer insertion fails.
          await supabase
            .from("order_lists")
            .delete()
            .eq("order_list_id", orderList.order_list_id)
            .eq("user_id", user.id);

          return NextResponse.json(
            { error: customersError.message },
            { status: 500 }
          );
        }
      }
    }

    const { data: createdOrderList, error: fetchError } = await supabase
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
      .eq("order_list_id", orderList.order_list_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error(
        "POST /api/order-lists fetch error:",
        fetchError
      );

      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: createdOrderList },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/order-lists unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}