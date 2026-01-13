import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import crypto from 'crypto';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import { newsletterSubscribeSchema, parseBody } from '@/lib/validations';
import { sendWelcomeEmail } from '@/lib/email';

const handlePost = async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Zod validation (email is normalized/trimmed by schema transform)
    const parsed = parseBody(newsletterSubscribeSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email;

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    const supabase = getSupabase();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('email, is_active')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { message: 'Already subscribed', alreadySubscribed: true },
          { status: 200 }
        );
      } else {
        // Reactivate subscription
        const { error } = await supabase
          .from('newsletter_subscribers')
          .update({
            is_active: true,
            subscribed_at: new Date().toISOString(),
            unsubscribe_token: unsubscribeToken,
          })
          .eq('email', normalizedEmail);

        if (error) throw error;

        // Send welcome back email (non-blocking)
        sendWelcomeEmail(normalizedEmail, unsubscribeToken).catch(() => {});

        return NextResponse.json(
          { message: 'Successfully resubscribed!', resubscribed: true },
          { status: 200 }
        );
      }
    }

    // Insert new subscriber (no IP/user-agent for GDPR compliance)
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: normalizedEmail,
        unsubscribe_token: unsubscribeToken,
      });

    if (error) throw error;

    // Send welcome email (non-blocking - don't fail subscription if email fails)
    sendWelcomeEmail(normalizedEmail, unsubscribeToken).catch(() => {});

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter!' },
      { status: 201 }
    );
  } catch (error) {
    logError('Newsletter Subscribe: Unexpected error', error, { component: 'newsletter/subscribe', action: 'POST' });
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (3 requests per 5 minutes to prevent spam)
export const POST = withRateLimit(handlePost, RATE_LIMITS.NEWSLETTER);
