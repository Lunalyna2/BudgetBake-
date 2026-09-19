import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("reminders")
      .select(
        "reminder_id, text, completed, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Failed to fetch reminders:",
        error
      );

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
      reminders: data ?? [],
    });
  } catch (error) {
    console.error(
      "Error fetching reminders:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reminders.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Reminder text is required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reminders")
      .insert({
        user_id: user.id,
        text,
        completed: false,
      })
      .select(
        "reminder_id, text, completed, created_at"
      )
      .single();

    if (error) {
      console.error(
        "Failed to create reminder:",
        error
      );

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
    console.error(
      "Error creating reminder:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create reminder.",
      },
      { status: 500 }
    );
  }
}