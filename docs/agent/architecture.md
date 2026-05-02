# Architecture Guide

Owned by **Tribe_X_arch_design**. Read before touching more than one file or crossing a team boundary.

## System Context

Tribe_X builds a React SPA for Robert. Firebase Auth handles identity; Cloud Firestore handles persistence. No backend services in scope for 2026 — all logic runs client-side except Firestore security rules.

## ADRs

| #                                                    | Title                      | Status   |
| ---------------------------------------------------- | -------------------------- | -------- |
| [0001](decisions/0001-use-this-harness-structure.md) | Use this harness structure | Accepted |
| NNNN                                                 | DECISION_TITLE             | STATUS   |

## File

Link back to the [Project Structure](/docs//tribe/Project-Structure.md) doc. If there are variations or autonomy per team/guild describe and/or link here.

## Team Ownership

| Team                | Owned path                  | Notes                                               |
| ------------------- | --------------------------- | --------------------------------------------------- |
| Red Team            | `src/components/red-team/`  | Render red team members; use shared UserCard        |
| Blue Team           | `src/components/blue-team/` | Render blue team members; use shared UserCard       |
| Tribe_X_arch_design | `src/components/Frame/`     | Root container; owns team composition logic         |
| Tribe_X_arch_design | `src/components/UserCard/`  | Shared member display; used by all teams            |
| Tribe_X_arch_design | `src/shared/`               | Shared types and utilities; reviewed on all changes |

**Cross-team dependencies:**

- Red Team and Blue Team both depend on UserCard and User type (owned by Tribe_X_arch_design)
- Frame depends on Red Team and Blue Team components
- See ADR 0003 for shared component rules

## Cross-Team Dependencies

Describe any shared utilities, components, or contracts here, along with who owns them and how to get approval for changes. e.g. a firebase hook.
