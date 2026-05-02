# Story: Walking Skeleton / Architectural Spike

**Slug:** `0001-walking-skeleton`  
**Epic:** Iteration 0 — Foundation  
**Points:** 13 (spike)

## User Story

As a tribe member, I want a working application skeleton deployed on Firebase Hosting so that we can establish team communication practices, component architecture, and cross-team collaboration patterns.

## Acceptance Criteria

### Given the application is loaded:

- **When** I view the Frame component,
- **Then** I see a container displaying all tribe members organized by team color (Red #D32F2F, Blue #1565C0)

### Given the Frame displays team sections:

- **When** I look at the Red Team section,
- **Then** I see only Red Team members with their picture, name, and clickable email link
- **And When** I look at the Blue Team section,
- **Then** I see only Blue Team members with their picture, name, and clickable email link

### Given a UserCard displays a team member:

- **When** I click on their email link,
- **Then** my email client opens with their address in the To field

### Given the application is deployed:

- **When** the deployment completes,
- **Then** the live URL is added to the Client Project Information Sheet

## Technical Approach

### File Changes

| Path                                             | Action | Owner               | Notes                                                         |
| ------------------------------------------------ | ------ | ------------------- | ------------------------------------------------------------- |
| `src/shared/types/User.ts`                       | Create | Tribe_X_arch_design | Shared `User` type with uid, email, displayName, photoUrl     |
| `docs/agent/data-model.md`                       | Update | Tribe_X_arch_design | Add User type definition and state mgmt rules                 |
| `docs/agent/architecture.md`                     | Update | Tribe_X_arch_design | Document Red/Blue team ownership in `src/components/`         |
| `docs/agent/decisions/0002-css-styling.md`       | Create | Tribe_X_arch_design | ADR: Tailwind CSS approach + color tokens                     |
| `docs/agent/decisions/0003-shared-components.md` | Create | Tribe_X_arch_design | ADR: UserCard as shared component, team-specific rendering    |
| `src/components/UserCard/UserCard.tsx`           | Create | Shared              | Displays user picture, name, email link; styled with Tailwind |
| `src/components/UserCard/UserCard.test.tsx`      | Create | Shared              | Test rendering and email link behavior                        |
| `src/components/Frame/Frame.tsx`                 | Create | Tribe_X_arch_design | Root container; receives static team data, renders by team    |
| `src/components/Frame/Frame.test.tsx`            | Create | Tribe_X_arch_design | Test Frame structure and team filtering                       |
| `src/components/red-team/RedTeam.tsx`            | Create | Red Team            | Renders Red Team section using UserCard                       |
| `src/components/red-team/RedTeam.test.tsx`       | Create | Red Team            | Test Red Team rendering                                       |
| `src/components/blue-team/BlueTeam.tsx`          | Create | Blue Team           | Renders Blue Team section using UserCard                      |
| `src/components/blue-team/BlueTeam.test.tsx`     | Create | Blue Team           | Test Blue Team rendering                                      |
| `src/App.tsx`                                    | Update | Shared              | Replace placeholder with Frame component                      |
| `.firebaserc`                                    | Create | DevOps              | Firebase project config                                       |
| `firebase.json`                                  | Create | DevOps              | Firebase Hosting config                                       |

### TypeScript Interfaces

```typescript
// src/shared/types/User.ts
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string;
  team: 'red' | 'blue';
}

// Frame receives static data
export interface FrameProps {
  users: User[];
}
```

### Component Hierarchy

```
Frame
├── RedTeam (team='red')
│   └── UserCard (for each red user)
└── BlueTeam (team='blue')
    └── UserCard (for each blue user)
```

### Design Decisions to Finalize

1. **CSS**: Tailwind CSS with team color tokens defined in `docs/agent/design.md`
2. **Data**: Static `User[]` array passed down; no Firestore call yet
3. **Shared components**: `UserCard` is the only shared component; team components render it
4. **Styling**: Frame uses Tailwind grid/flex; team sections are distinctly colored backgrounds
5. **Accessibility**: All components follow WCAG AA; images have alt text; email links are keyboard accessible

## Deployment

- Deploy to Firebase Hosting
- Add live URL to the Client Project Information Sheet (Google Sheet linked in `docs/tribe/Client-Information.md`)

## Done Criteria

1. ✅ All story code builds with `npm run build` (TypeScript strict + Vite)
2. ✅ All tests pass: `npm test`
3. ✅ All linting passes: `npm run lint`
4. ✅ Frame component renders Red and Blue team sections
5. ✅ UserCard displays picture, name, and clickable email
6. ✅ Deployed on Firebase Hosting
7. ✅ Live URL recorded in Client Information Sheet
8. ✅ ADRs and data-model updates reviewed by tribe

## Notes for Teams

- **Red Team**: Create `src/components/red-team/RedTeam.tsx` and accompanying test
- **Blue Team**: Create `src/components/blue-team/BlueTeam.tsx` and accompanying test
- **Tribe_X_arch_design**: Create Frame, UserCard, types, and ADRs
- **All teams**: Provide list of team members with email and photo URL by end of spike
