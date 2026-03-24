import { createClient } from "@supabase/supabase-js";

// Check if we have valid environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseKey || supabaseUrl === "your_supabase_project_url") {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in Vercel. Please check Project Settings -> Environment Variables.");
  } else {
    console.warn("⚠️ Supabase credentials not configured in .env.local.");
  }
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase client initialized.");
  } catch (err) {
    console.error("❌ Failed to initialize Supabase client:", err);
  }
}

export { supabase };
