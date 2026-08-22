import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Layers,
  Zap,
  Target,
  BarChart3,
  Clock,
  Search,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'DevNest — Developer Project Operating System',
  description:
    'The central command center for all your software projects. Track lifecycle, milestones, tasks, blockers, and maintenance in one place. Built for solo developers and small teams.',
  keywords: [
    'project management',
    'developer tools',
    'software projects',
    'project lifecycle',
    'task management',
    'milestone tracking',
    'maintenance tracking',
    'solo developer',
    'indie hacker',
    'side projects',
  ],
  openGraph: {
    title: 'DevNest — Developer Project Operating System',
    description:
      'The central command center for all your software projects. Track lifecycle, milestones, tasks, blockers, and maintenance.',
    url: 'https://devnest.app',
    siteName: 'DevNest',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevNest — Developer Project Operating System',
    description:
      'The central command center for all your software projects.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const features = [
  {
    icon: Layers,
    title: 'Full Lifecycle Tracking',
    description:
      'Idea → Planning → Development → Testing → Launch → Maintenance. Every project moves through clear stages.',
  },
  {
    icon: Target,
    title: 'Milestones & Tasks',
    description:
      'Break projects into milestones and tasks. Kanban board, priorities, estimates, and time tracking built in.',
  },
  {
    icon: Zap,
    title: 'Smart Recommendations',
    description:
      '"What should I work on next?" powered by priority, blockers, deadlines, and project health.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard at a Glance',
    description:
      'See all projects, progress, health, and blockers in one view. Know what needs attention in seconds.',
  },
  {
    icon: Clock,
    title: 'Maintenance Never Ends',
    description:
      'Post-launch tracking for bugs, improvements, tech debt, docs, and updates. Projects don\'t just "complete".',
  },
  {
    icon: Search,
    title: 'Project Memory',
    description:
      'Preserve decisions, context, known issues, and future plans. Open any project after months and instantly understand it.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create Your Project',
    description:
      'Give it a name, description, color, and priority. Set the target launch date.',
  },
  {
    number: '02',
    title: 'Plan & Track',
    description:
      'Add milestones, break into tasks, log decisions, track blockers. Everything in one workspace.',
  },
  {
    number: '03',
    title: 'Ship & Maintain',
    description:
      'Move to maintenance after launch. Track bugs, improvements, and technical debt forever.',
  },
];

const testimonials = [
  {
    quote:
      'I had 8 side projects scattered across notes, GitHub issues, and sticky notes. DevNest brought them all together.',
    author: 'Solo Developer',
    role: 'Indie Hacker',
  },
  {
    quote:
      'The "what to work on next" feature alone is worth it. No more decision fatigue every morning.',
    author: 'Full-Stack Dev',
    role: 'Freelancer',
  },
  {
    quote:
      'Finally, a tool that treats maintenance as a first-class citizen. My projects don\'t rot after launch anymore.',
    author: 'Open Source Maintainer',
    role: '5+ projects',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for personal projects',
    features: [
      'Up to 5 projects',
      'All core features',
      'Unlimited tasks & milestones',
      'Dark & light theme',
      'Export to JSON/CSV',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$8',
    period: '/month',
    description: 'For serious developers',
    features: [
      'Unlimited projects',
      'GitHub integration',
      'Priority recommendations',
      'Advanced analytics',
      'API access',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$16',
    period: '/user/month',
    description: 'For small teams',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Role-based access',
      'Shared workspaces',
      'Audit log',
      'SSO (SAML)',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DevNest',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  description:
    'The central command center for all your software projects. Track lifecycle, milestones, tasks, blockers, and maintenance.',
  url: 'https://devnest.app',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '16',
    priceCurrency: 'USD',
    offerCount: 3,
  },
  author: {
    '@type': 'Organization',
    name: 'DevNest',
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="sticky top-0 z-50 glass-nav">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪹</span>
              <span className="text-xl font-bold">DevNest</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="sm">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-32 glass-hero">
          {/* Glow dots */}
          <div className="glow-dot bg-primary/20 top-0 left-1/4 animate-pulse-glow" />
          <div className="glow-dot bg-purple-500/15 bottom-0 right-1/4 animate-pulse-glow delay-1000" />
          <div className="glow-dot bg-pink-500/10 top-1/2 right-0 animate-pulse-glow delay-500" />

          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 mesh-gradient" />

          <div className="container relative mx-auto px-4 md:px-6 text-center">
            <div className="mx-auto max-w-3xl">
              <div className="animate-fade-in-up inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm mb-6 animate-pulse-glow">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Built for developers who build</span>
              </div>
              <h1 className="animate-fade-in-up delay-100 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Your Developer
                <br />
                <span className="text-primary">Project OS</span>
              </h1>
              <p className="animate-fade-in-up delay-200 mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                The central command center for all your software projects. Track
                lifecycle, milestones, tasks, blockers, and maintenance — so you
                always know what to work on next.
              </p>
              <div className="animate-fade-in-up delay-300 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/login">
                  <Button size="lg" className="text-base px-8 glass animate-pulse-glow">
                    Start for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="text-base px-8 glass">
                    See Features
                  </Button>
                </a>
              </div>
              <p className="animate-fade-in-up delay-400 mt-4 text-sm text-muted-foreground">
                No credit card required · Free forever for personal use
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 md:py-28 relative">
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="animate-fade-in-up text-3xl font-bold md:text-4xl">
                Everything You Need
              </h2>
              <p className="animate-fade-in-up delay-100 mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
                Stop juggling GitHub issues, Notion docs, and sticky notes.
                DevNest is the only tool you need.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className={`animate-fade-in-up delay-${(i + 1) * 100} glass-card group rounded-xl p-6 cursor-default`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 md:py-28 relative glass-hero">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="animate-fade-in-up text-3xl font-bold md:text-4xl">
                How It Works
              </h2>
              <p className="animate-fade-in-up delay-100 mt-3 text-muted-foreground text-lg">
                Three steps to total project clarity
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.number} className={`animate-fade-in-up delay-${(i + 1) * 200} text-center`}>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground animate-float">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-28 relative">
          <div className="absolute inset-0 mesh-gradient opacity-30" />
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="animate-fade-in-up text-3xl font-bold md:text-4xl">
                Loved by Developers
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`animate-fade-in-up delay-${(i + 1) * 100} glass-card rounded-xl p-6`}
                >
                  <p className="text-muted-foreground italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4">
                    <p className="font-medium">{t.author}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 md:py-28 relative glass-hero">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="animate-fade-in-up text-3xl font-bold md:text-4xl">
                Simple Pricing
              </h2>
              <p className="animate-fade-in-up delay-100 mt-3 text-muted-foreground text-lg">
                Start free, upgrade when you need more
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {pricingPlans.map((plan, i) => (
                <div
                  key={plan.name}
                  className={`animate-fade-in-up delay-${(i + 1) * 100} rounded-xl p-6 ${
                    plan.highlighted
                      ? 'glass-pricing-highlighted animate-pulse-glow'
                      : 'glass-pricing'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="mb-3 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/login" className="mt-6 block">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 glass-cta text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-30" />
          <div className="container relative mx-auto px-4 md:px-6 text-center">
            <h2 className="animate-fade-in-up text-3xl font-bold md:text-4xl">
              Ready to Take Control?
            </h2>
            <p className="animate-fade-in-up delay-100 mt-3 text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Join developers who stopped losing track of their projects. Start
              managing everything in one place.
            </p>
            <Link href="/auth/login" className="mt-8 inline-block">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8 glass animate-pulse-glow"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12 glass-hero relative">
          <div className="absolute inset-0 mesh-gradient opacity-30" />
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🪹</span>
                  <span className="font-bold">DevNest</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The developer project operating system.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Roadmap</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} DevNest. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
