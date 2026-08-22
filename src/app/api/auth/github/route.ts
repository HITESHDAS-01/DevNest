import { NextResponse } from 'next/server';
import { getGitHubOAuthUrl } from '@/lib/github';

export async function GET() {
  const state = crypto.randomUUID();
  const url = getGitHubOAuthUrl(state);
  const response = NextResponse.redirect(url);
  response.cookies.set('github-oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });
  return response;
}
