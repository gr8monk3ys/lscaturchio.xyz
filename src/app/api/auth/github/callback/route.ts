import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, fetchGitHubUser } from '@/lib/github-auth';
import { logError, logInfo } from '@/lib/logger';

/**
 * GET /api/auth/github/callback
 * Handle GitHub OAuth callback - exchange code for token and redirect
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Handle OAuth errors from GitHub
  if (error) {
    logError('GitHub OAuth: Error from GitHub', new Error(error), {
      component: 'github-auth',
      action: 'callback',
      error_description: searchParams.get('error_description'),
    });
    return NextResponse.redirect(`${siteUrl}/guestbook?error=oauth_denied`);
  }

  // Validate required parameters
  if (!code) {
    return NextResponse.redirect(`${siteUrl}/guestbook?error=missing_code`);
  }

  // Note: In production, you should validate the state parameter against a stored value
  // to prevent CSRF attacks. For this implementation, we rely on CSRF protection in the
  // guestbook POST endpoint.

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code);

    if (!accessToken) {
      logError('GitHub OAuth: Failed to exchange code', null, {
        component: 'github-auth',
        action: 'callback',
      });
      return NextResponse.redirect(`${siteUrl}/guestbook?error=token_exchange_failed`);
    }

    // Verify the token works by fetching user info
    const user = await fetchGitHubUser(accessToken);

    if (!user) {
      logError('GitHub OAuth: Failed to fetch user', null, {
        component: 'github-auth',
        action: 'callback',
      });
      return NextResponse.redirect(`${siteUrl}/guestbook?error=user_fetch_failed`);
    }

    logInfo('GitHub OAuth: Successful authentication', {
      component: 'github-auth',
      action: 'callback',
      github_username: user.login,
    });

    // Redirect back to guestbook with token
    // The token is passed via URL fragment (hash) so it stays client-side
    // and is not logged by servers
    const redirectUrl = new URL(`${siteUrl}/guestbook`);
    redirectUrl.hash = `access_token=${accessToken}`;

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    logError('GitHub OAuth: Unexpected error', err, {
      component: 'github-auth',
      action: 'callback',
    });
    return NextResponse.redirect(`${siteUrl}/guestbook?error=unexpected_error`);
  }
}
