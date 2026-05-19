# ADR 0003: Shared Components — UserCard Pattern

**Status:** Accepted  
**Date:** May 2026  
**Deciders:** Tribe_X_arch_design  
**Owner:** Tribe_X_arch_design

## Context

Each team's component must display team members (picture, name, email). Teams have two options:

1. **Shared UserCard** — one component, all teams reuse it
2. **Team-specific rendering** — each team builds its own member display logic

This decision affects code reuse, maintenance burden, and team autonomy.

## Decision

**Create a shared `UserCard` component** in `src/components/UserCard/` owned by `Tribe_X_arch_design`.

All team components (`RedTeam`, `BlueTeam`, etc.) import and use `UserCard` to display members.

## Rationale

1. **DRY** — member display logic (picture, name, email link) is identical across teams
2. **Consistency** — all users are styled and behave the same way tribe-wide
3. **Maintainability** — accessibility fixes, styling updates apply everywhere without duplication
4. **Shared ownership** — `Tribe_X_arch_design` owns the contract; teams own composition
5. **Scalability** — when features (e.g., profile modal) are added, one PR updates all teams

## Implementation

### `src/components/UserCard/UserCard.tsx`

```typescript
export interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps): JSX.Element {
  return (
    <div className="flex flex-col items-center rounded-lg p-4 bg-white shadow-md">
      <img
        alt={user.displayName}
        className="h-24 w-24 rounded-full object-cover"
      />
      <h3 className="mt-2 text-lg font-semibold">{user.displayName}</h3>
      <a
        href={`mailto:${user.email}`}
        className="text-team-blue hover:underline focus:outline focus:outline-2 focus:outline-offset-2"
      >
        {user.email}
      </a>
    </div>
  );
}
```

### Team Components Call UserCard

```typescript
// src/components/red-team/RedTeam.tsx
export function RedTeam({ users }: TeamProps): JSX.Element {
  const redMembers = users.filter((u) => u.team === 'red');
  return (
    <section className="bg-team-red p-8">
      <h2 className="text-white text-2xl font-bold mb-4">Red Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {redMembers.map((user) => (
          <UserCard key={user.uid} user={user} />
        ))}
      </div>
    </section>
  );
}
```

## Rules for `UserCard` Maintenance

1. **Changes require approval** from `Tribe_X_arch_design` in PR
2. **Props must be backward compatible** — add new props as optional, deprecate old ones in a PR before removal
3. **Tests are mandatory** — any change to `UserCard` must include updated tests
4. **Version in JSDoc** if breaking changes occur (rare)

## Team Autonomy

Teams retain full autonomy over:

- Layout and grouping of members (`grid`, `flex`, custom spacing)
- Section styling, color, typography
- Additional context or metadata displayed alongside UserCard

Example: Blue Team could wrap UserCard in a modal trigger; Red Team could add member bios.

## Consequences

✅ **Pros:**

- Single source of truth for user display
- Easier to add tribe-wide features (profile, settings, etc.)
- Tests and accessibility fixes benefit all teams

❌ **Cons:**

- Teams depend on `Tribe_X_arch_design` for UserCard updates
- If teams need very different styling, they must negotiate in ADR

## Alternative Considered

- **No shared component** — each team owns its display logic
  - ❌ Code duplication; accessibility bugs in one team don't fix others
  - ❌ Harder to add tribe-wide features (profile modal, settings)
  - ✅ Maximum team autonomy; less coordination
