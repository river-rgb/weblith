import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://roasngxauulhntzlbnwl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYXNuZ3hhdXVsaG50emxibndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTM0NTYsImV4cCI6MjA5NTUyOTQ1Nn0.VY5wHA53W-FONKxm_WtHzchNHcx1mNDa_aeZi3ElYEc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);