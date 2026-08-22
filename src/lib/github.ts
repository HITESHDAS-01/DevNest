import { Octokit } from '@octokit/rest';
import { createHmac } from 'crypto';

export function getOctokit(accessToken?: string) {
  return new Octokit({
    auth: accessToken || process.env.GITHUB_TOKEN,
  });
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1].replace('.git', '') };
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex');
  return signature === expected;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: { name: string; color: string }[];
  created_at: string;
  updated_at: string;
  html_url: string;
  user: { login: string; avatar_url: string } | null;
}

export interface GitHubPR {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  head: { ref: string };
  base: { ref: string };
  created_at: string;
  updated_at: string;
  html_url: string;
  user: { login: string; avatar_url: string } | null;
}

export interface GitHubRelease {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  html_url: string;
}

export async function fetchRepoIssues(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<GitHubIssue[]> {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'all',
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
  });
  return data.filter((item) => !item.pull_request) as GitHubIssue[];
}

export async function fetchRepoPRs(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<GitHubPR[]> {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: 'all',
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
  });
  return data as unknown as GitHubPR[];
}

export async function fetchRepoReleases(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<GitHubRelease[]> {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.repos.listReleases({
    owner,
    repo,
    per_page: 20,
  });
  return data as GitHubRelease[];
}

export async function fetchRepoInfo(
  owner: string,
  repo: string,
  accessToken?: string
) {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.repos.get({ owner, repo });
  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    htmlUrl: data.html_url,
    defaultBranch: data.default_branch,
    language: data.language,
    stargazersCount: data.stargazers_count,
    forksCount: data.forks_count,
    openIssuesCount: data.open_issues_count,
    updatedAt: data.updated_at,
  };
}

export function getGitHubOAuthUrl(state: string) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/github/callback`;
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user&state=${state}`;
}

export async function exchangeGithubCode(code: string) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const data = await response.json();
  return data as { access_token?: string; error?: string; error_description?: string };
}
