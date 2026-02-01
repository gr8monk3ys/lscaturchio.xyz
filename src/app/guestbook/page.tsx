'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/Container';
import { Heading } from '@/components/Heading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { getGitHubClientId, getCallbackUrl } from '@/lib/github-auth';
import { cn } from '@/lib/utils';

interface GuestbookEntry {
  id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
  message: string;
  github_username: string | null;
  created_at: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch guestbook entries
  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch('/api/guestbook');
      const data = await response.json();
      if (data.entries) {
        setEntries(data.entries);
      }
    } catch (err) {
      setError('Failed to load guestbook entries');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for access token in URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      const token = hash.split('access_token=')[1]?.split('&')[0];
      if (token) {
        setAccessToken(token);
        // Store in sessionStorage for persistence during session
        sessionStorage.setItem('github_access_token', token);
        // Clean up URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else {
      // Check sessionStorage for existing token
      const storedToken = sessionStorage.getItem('github_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }

    // Check for error in URL
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        oauth_denied: 'GitHub authentication was denied',
        missing_code: 'Authentication failed - missing code',
        token_exchange_failed: 'Failed to authenticate with GitHub',
        user_fetch_failed: 'Failed to get user information',
        unexpected_error: 'An unexpected error occurred',
      };
      setError(errorMessages[errorParam] || 'Authentication failed');
      // Clean up URL
      window.history.replaceState(null, '', window.location.pathname);
    }

    fetchEntries();
  }, [fetchEntries]);

  // Fetch user info when we have an access token
  useEffect(() => {
    if (accessToken && !user) {
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.login) {
            setUser({
              login: data.login,
              name: data.name,
              avatar_url: data.avatar_url,
            });
          } else {
            // Token is invalid, clear it
            setAccessToken(null);
            sessionStorage.removeItem('github_access_token');
          }
        })
        .catch(() => {
          setAccessToken(null);
          sessionStorage.removeItem('github_access_token');
        });
    }
  }, [accessToken, user]);

  // Start GitHub OAuth flow
  const handleSignIn = () => {
    const clientId = getGitHubClientId();
    if (!clientId) {
      setError('GitHub OAuth is not configured');
      return;
    }

    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getCallbackUrl(),
      scope: 'read:user user:email',
      state,
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  };

  // Sign out
  const handleSignOut = () => {
    setAccessToken(null);
    setUser(null);
    sessionStorage.removeItem('github_access_token');
  };

  // Submit new entry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !message.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit entry');
      }

      // Add new entry to the top of the list
      if (data.entry) {
        setEntries((prev) => [data.entry, ...prev]);
      }
      setMessage('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit entry');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container size="small">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Heading as="h1" className="text-4xl md:text-5xl lg:text-6xl">
            Guestbook
          </Heading>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Leave a message, share your thoughts, or just say hello. Sign in with GitHub to sign the guestbook.
          </p>
        </div>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-center"
            >
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 hover:underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign in / Form section */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            {!accessToken ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Sign in with GitHub to leave a message
                </p>
                <Button onClick={handleSignIn} variant="primary" size="lg">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sign in with GitHub
                </Button>
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} alt={user.name || user.login} />
                      <AvatarFallback>{getInitials(user.name || user.login)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || user.login}</p>
                      <p className="text-sm text-muted-foreground">@{user.login}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Leave a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    className="min-h-[100px]"
                    disabled={submitting}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {message.length}/500 characters
                    </span>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!message.trim() || submitting}
                    >
                      {submitting ? 'Signing...' : 'Sign Guestbook'}
                    </Button>
                  </div>
                  {submitError && (
                    <p className="text-destructive text-sm">{submitError}</p>
                  )}
                </form>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Loading user info...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entries list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            {entries.length} {entries.length === 1 ? 'Signature' : 'Signatures'}
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-4 w-full bg-muted rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No entries yet. Be the first to sign the guestbook!
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div className="space-y-4" layout>
              <AnimatePresence mode="popLayout">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      type: 'spring' as const,
                      stiffness: 300,
                      damping: 30,
                      delay: index * 0.05,
                    }}
                    layout
                  >
                    <Card
                      className={cn(
                        'transition-all duration-200 hover:shadow-lg',
                        index === 0 && 'ring-2 ring-primary/20'
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar className="h-10 w-10 shrink-0">
                            {entry.avatar_url ? (
                              <AvatarImage
                                src={entry.avatar_url}
                                alt={entry.name}
                              />
                            ) : null}
                            <AvatarFallback>
                              {getInitials(entry.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-foreground">
                                {entry.name}
                              </span>
                              {entry.github_username && (
                                <a
                                  href={`https://github.com/${entry.github_username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                  @{entry.github_username}
                                </a>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {formatDate(entry.created_at)}
                              </span>
                            </div>

                            {/*
                              SECURITY NOTE: entry.message is sanitized with escapeHtml()
                              on both storage (POST handler) and retrieval (GET handler)
                              in /api/guestbook/route.ts. The message only contains HTML
                              entities (&lt; &gt; &amp; etc.) at this point, making it safe
                              for rendering. We use innerHTML to preserve these entities.
                            */}
                            <p className="mt-1 text-foreground whitespace-pre-wrap break-words">
                              {entry.message}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </Container>
  );
}
