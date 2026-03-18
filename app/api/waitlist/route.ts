import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Import supabase with error handling
let supabase: any;
try {
  supabase = require("@/lib/supabase").supabase;
} catch (error) {
  console.error("Supabase not configured:", error);
  supabase = null;
}

// Only initialize Resend if we have a valid API key
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && resendApiKey !== "your_resend_api_key" 
  ? new Resend(resendApiKey) 
  : null;

export async function POST(req: NextRequest) {
  try {
    const { email, faith, name } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Check if services are configured
    if (!supabase) {
      return NextResponse.json(
        { 
          error: "Database not configured. Please set up Supabase and update your .env.local file.",
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
        faith: faith || "both",
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

    // Send confirmation email only if Resend is configured
    if (resend) {
      try {
        await resend.emails.send({
          from: "Haven <hello@yourhaven.app>",
          to: email,
          subject: "You're on the Haven waitlist",
          html: getConfirmationEmail({
            email,
            name,
            position,
            faith,
            total: count || position,
          }),
        });
      } catch (emailError) {
        console.warn("Failed to send email:", emailError);
        // Continue even if email fails
      }
    } else {
      console.warn("Email service not configured - skipping confirmation email");
    }

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
      error: "Database not configured. Please set up Supabase and update your .env.local file.",
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

function getConfirmationEmail({
  name,
  position,
  faith,
  total,
}: {
  email: string;
  name?: string;
  position: number;
  faith?: string;
  total: number;
}) {
  const faithLabel =
    faith === "christian"
      ? "Christian"
      : faith === "muslim"
      ? "Muslim"
      : "both faiths";
  const greeting = faith === "muslim" ? "As-salamu alaykum" : "Hello";
  const displayName = name ? `, ${name}` : "";

  return `
<!DOCTYPE html>
<html>
<head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>You're on the Haven waitlist</title>
</head>
<body style="margin:0;padding:0;background:#070401;font-family:Georgia,serif;">
 <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
<!-- Logo -->
<div style="text-align:center;margin-bottom:40px;">
 <div style="display:inline-flex;align-items:center;gap:12px;">
 <span style="font-size:28px;">✦</span>
 <span style="font-size:32px;font-weight:700;color:#F0E6D0;letter-spacing:6px;">HAVEN</span>
 <span style="font-size:28px;">✦</span>
 </div>
</div>
<!-- Main card -->
<div style="background:linear-gradient(135deg,#120D05,#0E0A03);border:1px solid #C9933A33;border-radius:20px;padding:36px 32px;margin-bottom:24px;">
 <p style="font-size:14px;color:#C9933A;font-weight:700;letter-spacing:2px;margin:0 0 16px;font-family:Arial,sans-serif;">YOU'RE IN</p>
 <h1 style="font-size:32px;color:#F0E6D0;font-weight:600;margin:0 0 12px;line-height:1.2;">
 ${greeting}${displayName}. 
 </h1>
 <p style="font-size:16px;color:#8C7040;line-height:1.8;margin:0 0 28px;font-style:italic;">
 You're officially on the Haven waitlist. God placed this on your heart for a reason.
 </p>
 <!-- Position badge -->
 <div style="background:#070401;border:1px solid #C9933A44;border-radius:14px;padding:20px 24px;text-align:center;margin-bottom:24px;">
 <p style="font-size:11px;color:#3A2D15;font-weight:700;letter-spacing:2px;margin:0 0 8px;font-family:Arial,sans-serif;">YOUR POSITION</p>
 <p style="font-size:48px;font-weight:700;color:#C9933A;margin:0;line-height:1;">#${position}</p>
 <p style="font-size:12px;color:#3A2D15;margin:8px 0 0;font-family:Arial,sans-serif;">of ${total} people waiting</p>
 </div>
 <p style="font-size:14px;color:#4A3A20;line-height:1.8;margin:0;font-style:italic;">
 You signed up for the <strong style="color:#C9933A;">${faithLabel}</strong> experience.
 We'll notify you the moment Haven launches.
 </p>
</div>
<!-- What to expect -->
<div style="background:#0C0803;border:1px solid #1E1509;border-radius:16px;padding:24px;margin-bottom:24px;">
 <p style="font-size:11px;color:#3A2D15;font-weight:700;letter-spacing:2px;margin:0 0 16px;font-family:Arial,sans-serif;">WHAT HAVEN WILL GIVE YOU</p>
 ${[
 ["✦", "A space to pour out everything — no filter, no judgment"],
 ["✦", "God's Word speaking directly to your exact situation"],
 ["✦", "A personal prayer written just for what you shared"],
 ["✦", "One step to walk closer to God today"],
 ].map(([icon, text]) => `
 <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
 <span style="font-size:16px;flex-shrink:0;">${icon}</span>
 <p style="font-size:13px;color:#8C7040;line-height:1.7;margin:0;font-style:italic;">${text}</p>
 </div>
 `).join("")}
</div>
<!-- Share CTA -->
<div style="text-align:center;padding:24px 0;">
 <p style="font-size:13px;color:#4A3A20;line-height:1.8;margin:0 0 16px;font-style:italic;">
 Know someone who needs this? Share Haven with them.
 </p>
 <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#2A1C08,#C9933A);border-radius:12px;color:#F0E6D0;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:1px;">
 Share Haven →
 </a>
</div>
<!-- Footer -->
<div style="text-align:center;padding-top:24px;border-top:1px solid #1E1509;">
 <p style="font-size:12px;color:#1E1509;margin:0;font-style:italic;">
 "A Haven for your heart. Guided by your faith."
 </p>
 <p style="font-size:11px;color:#1E1509;margin:8px 0 0;font-family:Arial,sans-serif;">
 © Haven App. You're receiving this because you joined our waitlist.
 </p>
</div>
 </div>
</body>
</html>
 `;
}
