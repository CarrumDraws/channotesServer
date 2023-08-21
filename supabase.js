// SUPABASE -----
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config(); // Reading .env files

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  { auth: { persistSession: false } } // Prevents "No storage option exists to persist the session" error- May cause issues later...?
);
module.exports = supabase;
