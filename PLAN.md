# DevNest Production Polish Plan

## Files to Create (11 files)
1. `src/components/theme-provider.tsx` - Theme context + provider, toggles `.dark` on `<html>`, persists to localStorage
2. `src/components/theme-toggle.tsx` - Button with Sun/Moon icon toggle
3. `src/app/(app)/dashboard/loading.tsx` - Skeleton cards for dashboard
4. `src/app/(app)/projects/loading.tsx` - Skeleton grid for projects list
5. `src/app/(app)/projects/[slug]/loading.tsx` - Skeleton for project overview
6. `src/app/error.tsx` - Global error boundary with retry
7. `src/app/not-found.tsx` - Custom 404 with "Go Home"
8. `src/app/(app)/projects/[slug]/not-found.tsx` - Project not found page

## Files to Modify (4 files)
9. `src/app/layout.tsx` - Wrap with ThemeProvider, add `suppressHydrationWarning`
10. `src/app/(app)/settings/page.tsx` - Replace static theme buttons with ThemeToggle
11. `src/app/(app)/layout.tsx` - Add gradient background + overflow handling
12. `src/app/globals.css` - Add theme transition CSS + ensure dark vars are complete

## Implementation Details

### 1. ThemeProvider (src/components/theme-provider.tsx)
- Client component with `createContext`/`useContext`
- On mount: reads `localStorage('devnest-theme')`, applies `.dark` class to `<html>`
- Toggle function: adds/removes `.dark` class, saves to localStorage
- Provides `{ theme, setTheme, toggleTheme }` to children

### 2. ThemeToggle (src/components/theme-toggle.tsx)
- Uses `useTheme()` from ThemeProvider
- Renders `<Button variant="outline" size="icon">` with Sun/Moon icon from lucide-react
- onClick calls `toggleTheme()`

### 3. Loading Skeletons
- `dashboard/loading.tsx`: Stats cards (4 skeleton boxes) + recommendation skeleton + project cards grid (4 skeletons)
- `projects/loading.tsx`: Header skeleton + project card grid (6 skeletons)
- `projects/[slug]/loading.tsx`: Header + phases + two-column layout skeletons
- All use `animate-pulse bg-muted rounded-lg` pattern

### 4. Error Handling
- `error.tsx`: Client component with `error`/`reset` props, shows error icon + message + retry button
- `not-found.tsx`: Centered 404 with illustration + "Go Home" Link
- `projects/[slug]/not-found.tsx`: Similar 404 but themed for projects with link back to /projects

### 5. Dashboard Rewrite (src/app/(app)/dashboard/page.tsx)
- Keep as `'use client'` (uses demo data inline, no real API)
- Add welcome section: "Welcome back, Developer" with current date
- Stats cards with colored icon backgrounds
- Recommendations section with priority badges
- Projects grid with filter tabs (All/Active/Blocked/Maintenance) using Tabs component
- Each project card already shows name, progress, phase, priority stars, health dot, blocker count

### 6. App Layout (src/app/(app)/layout.tsx)
- Add subtle gradient: `bg-gradient-to-br from-background via-background to-muted/30`
- Ensure `overflow-hidden` on container

### 7. Global CSS (src/app/globals.css)
- Add `transition: background-color 0.2s, color 0.2s` to html/body for smooth theme switching
- Verify all dark theme variables are properly set

### 8. Root Layout (src/app/layout.tsx)
- Wrap children with ThemeProvider
- Add `suppressHydrationWarning` to `<html>` tag (needed for dark class toggling)
- Add `className="dark"` fallback for SSR consistency

### Key Conventions
- shadcn DropdownMenuTrigger has NO asChild - wraps children directly
- Uses `@base-ui/react` primitives, NOT radix
- Button component uses `@base-ui/react/button`
- All colors via CSS variables (oklch) in globals.css
- `cn()` utility from `@/lib/utils`
