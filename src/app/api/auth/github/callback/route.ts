import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeGithubCode, getOctokit } from '@/lib/github';
import { db } from '@/lib/db';
import { githubIntegrations, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const cookieStore = await cookies();
  const savedState = cookieStore.get('github-oauth-state')?.value;

  // Clean up state cookie
  const response = NextResponse.redirect(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings`
  );
  response.cookies.delete('github-oauth-state');

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings?github=error&message=${error}`
    );
  }

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings?github=error&message=Invalid+state`
    );
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeGithubCode(code);

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings?github=error&message=${tokenData.error_description || 'Token exchange failed'}`
      );
    }

    // Store the access token in a secure cookie for later use
    response.cookies.set('github-token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Fetch user info to confirm connection
    const octokit = getOctokit(tokenData.access_token);
    const { data: user } = await octokit.users.getAuthenticated();

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings?github=connected&user=${user.login}`
    );
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings?github=error&message=Connection+failed`
    );
  }
}
