import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOctokit } from '@/lib/github';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('github-token')?.value;

  if (!token) {
    return NextResponse.json({ connected: false });
  }

  try {
    const octokit = getOctokit(token);
    const { data: user } = await octokit.users.getAuthenticated();
    return NextResponse.json({
      connected: true,
      user: {
        login: user.login,
        name: user.name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
