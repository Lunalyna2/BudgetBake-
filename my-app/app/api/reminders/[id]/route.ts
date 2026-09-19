import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;
    const body = await request.json();

    if (typeof body.completed !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Completed must be a boolean.",
        },
        { status: 400 }
      );
    }

    const { data: reminder, error } = await supabase
      .from("reminders")
      .update({
        completed: body.completed,
      })
      .eq("reminder_id", id)
      .eq("user_id", user.id)
      .select("reminder_id, text, completed, created_at")
      .single();

    if (error) {
      console.error("Error updating reminder:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to update reminder.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reminder,
    });
  } catch (error) {
    console.error("Unexpected error updating reminder:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
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

    const { id } = await context.params;

    const { data: reminder, error } = await supabase
      .from("reminders")
      .delete()
      .eq("reminder_id", id)
      .eq("user_id", user.id)
      .select("reminder_id")
      .single();

    if (error) {
      console.error("Error deleting reminder:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete reminder.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reminder,
    });
  } catch (error) {
    console.error("Unexpected error deleting reminder:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}