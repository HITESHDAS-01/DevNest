import { Octokit } from '@octokit/rest';
import { createHmac } from 'crypto';

export function getOctokit(accessToken?: string) {
  return new Octokit({
    auth: accessToken || undefined,
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

export async function verifyPAT(token: string): Promise<{ valid: boolean; user?: { login: string; avatar_url: string } }> {
  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.users.getAuthenticated();
    return { valid: true, user: { login: data.login, avatar_url: data.avatar_url } };
  } catch {
    return { valid: false };
  }
}

export async function fetchRepoIssues(
  owner: string,
  repo: string,
  accessToken?: string
) {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'all',
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
  });
  return data.filter((item) => !item.pull_request);
}

export async function fetchRepoPRs(
  owner: string,
  repo: string,
  accessToken?: string
) {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: 'all',
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
  });
  return data;
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
    isPrivate: data.private,
    updatedAt: data.updated_at,
  };
}
