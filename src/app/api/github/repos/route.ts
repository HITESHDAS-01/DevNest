import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOctokit } from '@/lib/github';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('github-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not connected' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    const octokit = getOctokit(token);

    if (query) {
      // Search user's repos
      const { data } = await octokit.search.repos({
        q: `${query} user:@me`,
        sort: 'updated',
        per_page: 20,
      });
      return NextResponse.json({
        repos: data.items.map((r) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          htmlUrl: r.html_url,
          language: r.language,
          stargazersCount: r.stargazers_count,
          updatedAt: r.updated_at,
        })),
      });
    }

    // List user's repos
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 30,
      type: 'all',
    });

    return NextResponse.json({
      repos: data.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        htmlUrl: r.html_url,
        language: r.language,
        stargazersCount: r.stargazers_count,
        updatedAt: r.updated_at,
      })),
    });
  } catch (err) {
    console.error('GitHub repos fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 });
  }
}
