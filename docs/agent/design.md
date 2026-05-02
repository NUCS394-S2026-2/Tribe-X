# Design Guide

Owned by **Tribe_X_arch_design**. Read before creating or modifying any component.

## Styling — Tailwind CSS

**Approach:** Utility-first with Tailwind CSS v4. See ADR 0002 for rationale.

**Color tokens** (defined in `tailwind.config.ts`):

- `bg-team-red` / `text-team-red` → #D32F2F
- `bg-team-blue` / `text-team-blue` → #1565C0

All components use these utilities; no custom CSS files for styling.

## Component Conventions

**Shared components** live in `src/components/` and are co-located with their tests:

- `UserCard/` — shared across all teams; displays member picture, name, email
- `Frame/` — root container; owned by Tribe_X_arch_design

**Team components** live in `src/components/{color}-team/`:

- `red-team/RedTeam.tsx` — render red team members using UserCard
- `blue-team/BlueTeam.tsx` — render blue team members using UserCard

Each component file is paired with a `.test.tsx` file.

**Shared component changes** (UserCard, Frame) require PR approval from Tribe_X_arch_design. See ADR 0003.

**Team component autonomy**: Teams can style and layout members however they wish; only UserCard contract is fixed.

## Accessibility Minimums

Every shipped component must have:

- Visible focus indicator on all interactive elements
- Meaningful `alt` text on images (`alt=""` for decorative)
- WCAG AA contrast (4.5:1 normal text, 3:1 large text)
- `<label>` elements associated with inputs
- ADDITIONAL_A11Y_REQUIREMENTS

## Team Color Spike (Iteration 0 only)

| Team   | Hex     | Notes                 |
| ------ | ------- | --------------------- |
| Red    | #D32F2F | Colorblind accessible |
| Orange | #E65100 | Colorblind accessible |
| Blue   | #1565C0 | Colorblind accessible |
| Yellow | #F9A825 | Colorblind accessible |
