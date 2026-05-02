# ADR 0002: CSS Styling Approach — Tailwind CSS

**Status:** Accepted  
**Date:** May 2026  
**Deciders:** Tribe_X_arch_design  
**Owner:** Tribe_X_arch_design

## Context

The tribe must choose a CSS methodology that allows:

- Fast iteration and shared design tokens (colors, spacing, typography)
- Minimal CSS file size and no naming conflicts across teams
- Accessibility compliance (WCAG AA contrast, focus states)
- Team independence (each team can style without touching others' CSS)

## Decision

**Adopt Tailwind CSS v4** as the sole CSS framework for all components.

## Rationale

1. **Utility-first workflow** — teams can style in JSX without context-switching to `.css` files
2. **Built-in constraints** — color palette, spacing scale, and breakpoints enforce consistency
3. **No naming conflicts** — class names are auto-generated, eliminating CSS scoping issues
4. **Shared tokens** — tribe defines team colors once in `tailwind.config.ts`; all components inherit
5. **Smaller bundles** — Tailwind purges unused styles; no dead CSS
6. **Accessibility** — Tailwind includes focus states, contrast helpers, and semantic breakpoints
7. **Industry standard** — React ecosystem has mature Tailwind tooling and patterns

## Design Token Definition

Add to `tailwind.config.ts`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'team-red': '#D32F2F',
        'team-blue': '#1565C0',
        'team-orange': '#E65100',
        'team-yellow': '#F9A825',
      },
    },
  },
};
```

All components use utility classes like `bg-team-red`, `text-team-blue`, etc.

## Implementation Rules

1. **Prefer utility classes** over custom CSS; only use `@apply` for component abstractions
2. **No `<style>` tags** or inline `style=` props unless performance-critical (animations, dynamic values)
3. **Responsive design** — use Tailwind breakpoints (`sm:`, `md:`, `lg:`) for mobile-first layouts
4. **Dark mode (deferred)** — structure is ready for dark mode if client requests it later
5. **Accessibility** — every interactive element must have a visible focus ring (default or custom)

## Consequences

✅ **Pros:**

- Fast prototyping; teams don't wait for CSS reviews
- Single source of truth for design tokens
- Strong accessibility baseline
- Easy onboarding for new team members

❌ **Cons:**

- Tailwind class names can be verbose in JSX
- Tribe must commit to Tailwind's naming and structure

## Alternative Considered

- **CSS Modules** — would require naming conventions and per-file scoping; slower iteration
- **BEM + vanilla CSS** — conflicts across teams likely; harder to enforce consistency
