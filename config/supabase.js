require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('ERROR: SUPABASE_URL is missing or invalid. Please set a valid HTTP/HTTPS URL in your environment variables.');
  console.error('Current value:', supabaseUrl || 'NOT SET');
}

if (!supabaseAnonKey) {
  console.error('ERROR: SUPABASE_ANON_KEY is missing. Please set it in your environment variables.');
}

if (!supabaseServiceRoleKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is missing. Please set it in your environment variables.');
}

// Only create clients if environment variables are valid
let supabase, supabaseAdmin;

if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey && supabaseServiceRoleKey) {
  // Regular client with anon key (for public operations)
  supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Admin client with service role key (for privileged operations)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.error('ERROR: Cannot initialize Supabase clients due to missing or invalid environment variables.');
}

module.exports = { supabase, supabaseAdmin };
