import { createClient } from "@supabase/supabase-js";

// Check if we have valid environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseKey || supabaseUrl === "your_supabase_project_url") {
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ Supabase credentials not configured. Please set them in your deployment dashboard.");
  } else {
    console.warn("⚠️ Supabase credentials not configured. Please update .env.local with actual Supabase URL and service key.");
  }
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
