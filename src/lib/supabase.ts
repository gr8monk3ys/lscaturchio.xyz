import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared Supabase client for server-side operations
 * Uses service key for full database access
 */

// Lazy initialization to avoid build-time errors with missing env vars
let supabase: SupabaseClient | null = null;

/**
 * Get or create Supabase client instance
 * @returns Configured Supabase client with service key
 * @throws Error if Supabase credentials are not configured
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }
  return supabase;
}
