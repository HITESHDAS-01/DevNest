'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Download, User, GitBranch, Palette, FileDown, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubLoading, setGithubLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const checkGithubStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/github/status');
      const data = await res.json();
      setGithubConnected(data.connected);
      setGithubUser(data.user || null);
    } catch {
      setGithubConnected(false);
    } finally {
      setGithubLoading(false);
    }
  }, []);

  useEffect(() => {
    checkGithubStatus();
    // Check URL params for OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('github') === 'connected') {
      checkGithubStatus();
    }
  }, [checkGithubStatus]);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch('/api/github/disconnect', { method: 'POST' });
      setGithubConnected(false);
      setGithubUser(null);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="glass-card border border-white/20 dark:border-white/10">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <GitBranch className="h-3.5 w-3.5" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-3.5 w-3.5" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <FileDown className="h-3.5 w-3.5" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-6">
            <h3 className="text-sm font-semibold mb-4">Profile</h3>
            <div className="flex items-center gap-5 mb-6">
              <Avatar className="h-20 w-20 ring-4 ring-white/10 dark:ring-white/5">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <Separator className="mb-6" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input id="name" defaultValue={user?.name || ''} className="glass-card border-white/20 dark:border-white/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  defaultValue={user?.email || ''}
                  disabled
                  className="glass-card border-white/20 dark:border-white/10"
                />
              </div>
            </div>
            <Button className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20">
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">GitHub Integration</h3>
              {githubConnected && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected
                </span>
              )}
            </div>

            {githubLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking connection...
              </div>
            ) : githubConnected && githubUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <img
                    src={githubUser.avatarUrl}
                    alt={githubUser.login}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{githubUser.name || githubUser.login}</p>
                    <p className="text-xs text-muted-foreground">@{githubUser.login}</p>
                  </div>
                  <a
                    href={`https://github.com/${githubUser.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your GitHub account is connected. You can now link repositories to projects and sync issues, PRs, and blockers.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-card border-white/20 dark:border-white/10"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                  >
                    {disconnecting ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your GitHub account to sync repositories with projects. Import issues as tasks, track PRs as blockers, and get real-time updates via webhooks.
                </p>
                <a href="/api/auth/github">
                  <Button variant="outline" className="glass-card border-white/20 dark:border-white/10">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                    Connect GitHub
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground">
                  Requires a GitHub OAuth App. Set <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> in your environment.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-6">
            <h3 className="text-sm font-semibold mb-4">Theme</h3>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">
                Toggle between light and dark mode
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-6">
            <h3 className="text-sm font-semibold mb-4">Export Data</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Export all your projects and data for backup or migration.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="glass-card border-white/20 dark:border-white/10">
                <Download className="mr-2 h-4 w-4" />
                Export as JSON
              </Button>
              <Button variant="outline" className="glass-card border-white/20 dark:border-white/10">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
