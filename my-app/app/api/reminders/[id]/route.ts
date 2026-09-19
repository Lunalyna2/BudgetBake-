import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { text, completed } = body;
    const updateData: {
      text?: string;
      completed?: boolean;
    } = {};

    if (typeof text === "string") {
      updateData.text = text.trim();
    }

    if (typeof completed === "boolean") {
      updateData.completed = completed;
    }

    const { data, error } = await supabase
      .from("reminders")
      .update(updateData)
      .eq("reminder_id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update reminder:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reminder: data,
    });
  } catch (error) {
    console.error("Update reminder error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update reminder.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Reminder ID is required.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("reminder_id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete reminder:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminder deleted successfully.",
    });
  } catch (error) {
    console.error("Delete reminder error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete reminder.",
      },
      { status: 500 }
    );
  }
}