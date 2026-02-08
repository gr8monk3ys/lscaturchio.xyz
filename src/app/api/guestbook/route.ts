import { NextRequest, NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { validateCsrf } from '@/lib/csrf';
import { withRateLimit, RATE_LIMITS } from '@/lib/with-rate-limit';
import { parseBody } from '@/lib/validations';
import { escapeHtml } from '@/lib/sanitize';
import { validateGitHubToken } from '@/lib/github-auth';
import { z } from 'zod';

/**
 * Zod schema for guestbook entry creation
 */
const guestbookEntrySchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(500, 'Message is too long (max 500 characters)')
    .transform((msg) => msg.trim()),
  accessToken: z
    .string()
    .min(1, 'GitHub access token is required'),
});

export interface GuestbookEntry {
  id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
  message: string;
  github_username: string | null;
  created_at: string;
}

/**
 * GET /api/guestbook
 * Fetch all guestbook entries ordered by created_at DESC
 */
export async function GET(): Promise<NextResponse> {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { entries: [], message: 'Guestbook not configured' },
        { status: 200 }
      );
    }

    const sql = getDb();

    const rows = await sql`
      SELECT id, name, email, avatar_url, message, github_username, created_at
      FROM guestbook
      ORDER BY created_at DESC
      LIMIT 100
    `;

    // Sanitize messages for safe display (extra precaution)
    const sanitizedEntries = rows.map((entry) => ({
      ...entry,
      message: escapeHtml(entry.message),
    }));

    return NextResponse.json({ entries: sanitizedEntries });
  } catch (error) {
    logError('Guestbook: Unexpected error', error, {
      component: 'guestbook',
      action: 'GET',
    });
    return NextResponse.json(
      { error: 'Failed to fetch guestbook entries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guestbook
 * Create a new guestbook entry (requires GitHub OAuth token)
 */
async function postHandler(req: NextRequest): Promise<NextResponse> {
  // CSRF protection
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Guestbook not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();

    // Validate input
    const parsed = parseBody(guestbookEntrySchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { message, accessToken } = parsed.data;

    // Validate GitHub token and get user info
    const githubUser = await validateGitHubToken(accessToken);
    if (!githubUser) {
      return NextResponse.json(
        { error: 'Invalid or expired GitHub access token' },
        { status: 401 }
      );
    }

    const sql = getDb();

    // Check if user has already signed (optional: limit entries per user)
    const existingEntries = await sql`
      SELECT id FROM guestbook
      WHERE github_username = ${githubUser.login}
      LIMIT 5
    `;

    if (existingEntries.length >= 5) {
      return NextResponse.json(
        { error: 'You have reached the maximum number of guestbook entries (5)' },
        { status: 429 }
      );
    }

    // Sanitize message before storing
    const sanitizedMessage = escapeHtml(message);

    const name = githubUser.name || githubUser.login;
    const email = githubUser.email;
    const avatar_url = githubUser.avatar_url;

    // Insert new guestbook entry
    const rows = await sql`
      INSERT INTO guestbook (name, email, avatar_url, message, github_username)
      VALUES (${name}, ${email}, ${avatar_url}, ${sanitizedMessage}, ${githubUser.login})
      RETURNING *
    `;

    const data = rows[0];

    logInfo('Guestbook: New entry created', {
      component: 'guestbook',
      action: 'POST',
      github_username: githubUser.login,
    });

    return NextResponse.json({
      success: true,
      entry: {
        ...data,
        message: escapeHtml(data.message),
      },
    });
  } catch (error) {
    logError('Guestbook: Unexpected error', error, {
      component: 'guestbook',
      action: 'POST',
    });
    return NextResponse.json(
      { error: 'Failed to create guestbook entry' },
      { status: 500 }
    );
  }
}

// Apply rate limiting to POST handler
export const POST = withRateLimit(postHandler, RATE_LIMITS.STANDARD);
