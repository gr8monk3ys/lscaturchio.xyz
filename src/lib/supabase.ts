import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared Supabase client for server-side operations
 * Uses service key for full database access
 */

// Lazy initialization to avoid build-time errors with missing env vars
let supabase: SupabaseClient | null = null;

/**
 * PostgrestError code for "no rows found"
 * Returned when .single() finds no matching rows
 */
export const SUPABASE_NO_ROWS_ERROR = 'PGRST116';

/**
 * Check if Supabase is properly configured
 * @returns true if both URL and service key are set with valid values
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  return Boolean(supabaseUrl?.startsWith('http') && supabaseKey);
}

/**
 * Check if a Supabase error is a "no rows found" error
 * @param error - The error object from a Supabase query
 * @returns true if the error indicates no rows were found
 */
export function isNoRowsError(error: { code?: string } | null): boolean {
  return error?.code === SUPABASE_NO_ROWS_ERROR;
}

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
