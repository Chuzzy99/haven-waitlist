import { NextRequest, NextResponse } from "next/server";

// Import supabase with error handling
let supabase: any;
try {
  supabase = require("@/lib/supabase").supabase;
} catch (error) {
  console.error("Supabase not configured:", error);
  supabase = null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, faith, name } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { 
          error: "Database not configured. Please set up Supabase and update your environment variables.",
          setupRequired: true
        },
        { status: 503 }
      );
    }

    // Check if already signed up
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id, position")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        position: existing.position,
        alreadySignedUp: true,
        message: "You're already on the waitlist!",
      });
    }

    // Add to waitlist
    const { data, error } = await supabase
      .from("waitlist")
      .insert({
        email: email.toLowerCase().trim(),
        faith: faith || "christian",
        name: name || null,
      })
      .select("position")
      .single();

    if (error) throw error;

    const position = data?.position || 1;

    // Get total count
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      position,
      total: count,
      message: "You're on the waitlist!",
    });
  } catch (error: any) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ 
      count: 0,
      error: "Database not configured.",
      setupRequired: true
    });
  }

  try {
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Failed to get waitlist count:", error);
    return NextResponse.json({ count: 0 });
  }
}
