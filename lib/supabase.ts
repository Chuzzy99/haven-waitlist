import { createClient } from "@supabase/supabase-js";

// Check if we have valid environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === "your_supabase_project_url") {
  console.warn("⚠️ Supabase credentials not configured. Please update .env.local with actual Supabase URL and service key.");
  // Create a mock client that returns helpful errors
  throw new Error("Supabase not configured. Please update your .env.local file with actual Supabase credentials.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
